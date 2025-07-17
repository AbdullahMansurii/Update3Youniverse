import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { Database } from '@/types/database';

type Post = Database['public']['Tables']['posts']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type PostLike = Database['public']['Tables']['post_likes']['Row'];
type Comment = Database['public']['Tables']['comments']['Row'];
type CommentLike = Database['public']['Tables']['comment_likes']['Row'];

export interface PostWithAuthor extends Post {
  author: Profile;
  liked: boolean;
  comments: CommentWithAuthor[];
}

export interface CommentWithAuthor extends Comment {
  author: Profile;
  liked: boolean;
  replies: CommentWithAuthor[];
}

export function usePosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      const { data: postsData, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_author_id_fkey(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user's likes if authenticated
      let userLikes: PostLike[] = [];
      let userCommentLikes: CommentLike[] = [];
      
      if (user) {
        const { data: likesData } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id);
        
        userLikes = likesData || [];

        const { data: commentLikesData } = await supabase
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', user.id);
        
        userCommentLikes = commentLikesData || [];
      }

      // Fetch comments for all posts
      const postIds = postsData?.map(post => post.id) || [];
      const { data: commentsData } = await supabase
        .from('comments')
        .select(`
          *,
          author:profiles!comments_author_id_fkey(*)
        `)
        .in('post_id', postIds)
        .order('created_at', { ascending: true });

      // Group comments by post and build reply threads
      const commentsByPost = (commentsData || []).reduce((acc, comment) => {
        if (!acc[comment.post_id]) acc[comment.post_id] = [];
        acc[comment.post_id].push({
          ...comment,
          liked: userCommentLikes.some(like => like.comment_id === comment.id),
          replies: []
        });
        return acc;
      }, {} as Record<string, CommentWithAuthor[]>);

      // Build reply threads
      Object.keys(commentsByPost).forEach(postId => {
        const comments = commentsByPost[postId];
        const topLevelComments = comments.filter(c => !c.parent_comment_id);
        const replies = comments.filter(c => c.parent_comment_id);
        
        replies.forEach(reply => {
          const parent = comments.find(c => c.id === reply.parent_comment_id);
          if (parent) {
            parent.replies.push(reply);
          }
        });
        
        commentsByPost[postId] = topLevelComments;
      });

      const postsWithData = postsData?.map(post => ({
        ...post,
        liked: userLikes.some(like => like.post_id === post.id),
        comments: commentsByPost[post.id] || []
      })) || [];

      setPosts(postsWithData);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (content: string, mediaFiles?: File[], linkUrl?: string) => {
    if (!user) return;

    try {
      let mediaUrls: string[] = [];
      let mediaTypes: string[] = [];
      let linkPreview = null;

      // Handle media uploads
      if (mediaFiles && mediaFiles.length > 0) {
        for (const file of mediaFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}.${fileExt}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('post-media')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('post-media')
            .getPublicUrl(fileName);

          mediaUrls.push(publicUrl);
          mediaTypes.push(file.type);
        }
      }

      // Handle link preview
      if (linkUrl) {
        try {
          // In a real app, you'd use a service like LinkPreview API
          linkPreview = {
            url: linkUrl,
            title: 'Link Preview',
            description: 'Click to view the link',
            image: null
          };
        } catch (error) {
          console.warn('Failed to generate link preview:', error);
        }
      }

      const { error } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          content,
          media_urls: mediaUrls.length > 0 ? mediaUrls : null,
          media_types: mediaTypes.length > 0 ? mediaTypes : null,
          link_preview: linkPreview
        });

      if (error) throw error;

      await fetchPosts();
      return true;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.liked) {
        // Unlike
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        await supabase
          .from('posts')
          .update({ likes_count: Math.max(0, post.likes_count - 1) })
          .eq('id', postId);
      } else {
        // Like
        await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        await supabase
          .from('posts')
          .update({ likes_count: post.likes_count + 1 })
          .eq('id', postId);
      }

      await fetchPosts();
      return true;
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  };

  const addComment = async (postId: string, content: string, parentCommentId?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          content,
          parent_comment_id: parentCommentId || null
        });

      if (error) throw error;

      // Update comments count
      const post = posts.find(p => p.id === postId);
      if (post) {
        await supabase
          .from('posts')
          .update({ comments_count: post.comments_count + 1 })
          .eq('id', postId);
      }

      await fetchPosts();
      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  const toggleCommentLike = async (commentId: string) => {
    if (!user) return;

    try {
      const comment = posts
        .flatMap(p => [...p.comments, ...p.comments.flatMap(c => c.replies)])
        .find(c => c.id === commentId);
      
      if (!comment) return;

      if (comment.liked) {
        // Unlike
        await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);

        await supabase
          .from('comments')
          .update({ likes_count: Math.max(0, comment.likes_count - 1) })
          .eq('id', commentId);
      } else {
        // Like
        await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id
          });

        await supabase
          .from('comments')
          .update({ likes_count: comment.likes_count + 1 })
          .eq('id', commentId);
      }

      await fetchPosts();
      return true;
    } catch (error) {
      console.error('Error toggling comment like:', error);
      throw error;
    }
  };

  const sharePost = async (postId: string, shareType: 'internal' | 'external' | 'link', platform?: string) => {
    if (!user) return;

    try {
      await supabase
        .from('shares')
        .insert({
          post_id: postId,
          user_id: user.id,
          share_type: shareType,
          platform: platform || null
        });

      // Update shares count
      const post = posts.find(p => p.id === postId);
      if (post) {
        await supabase
          .from('posts')
          .update({ shares_count: post.shares_count + 1 })
          .eq('id', postId);
      }

      await fetchPosts();
      return true;
    } catch (error) {
      console.error('Error sharing post:', error);
      throw error;
    }
  };

  const deleteComment = async (commentId: string, postId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('author_id', user.id);

      // Update comments count
      const post = posts.find(p => p.id === postId);
      if (post) {
        await supabase
          .from('posts')
          .update({ comments_count: Math.max(0, post.comments_count - 1) })
          .eq('id', postId);
      }

      await fetchPosts();
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchPosts();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('posts-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, fetchPosts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_likes' }, fetchPosts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, fetchPosts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comment_likes' }, fetchPosts)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return {
    posts,
    loading,
    createPost,
    toggleLike,
    addComment,
    toggleCommentLike,
    sharePost,
    deleteComment,
    refetch: fetchPosts,
  };
}