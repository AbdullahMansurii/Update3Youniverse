"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { usePosts, PostWithAuthor, CommentWithAuthor } from "@/hooks/use-posts";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  BookOpen, 
  Plus, 
  Send, 
  Image as ImageIcon, 
  Video, 
  Link as LinkIcon,
  MoreHorizontal,
  Reply,
  Trash2,
  Copy,
  ExternalLink
} from "lucide-react";
import { formatDateToNow } from "@/lib/utils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function Posts() {
  const [newPost, setNewPost] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const { posts, loading, createPost, toggleLike, addComment, toggleCommentLike, sharePost, deleteComment } = usePosts();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidImage = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
      const isValidVideo = ['video/mp4', 'video/quicktime'].includes(file.type);
      const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB
      
      if (!isValidImage && !isValidVideo) {
        toast.error(`${file.name}: Unsupported file type`);
        return false;
      }
      
      if (!isValidSize) {
        toast.error(`${file.name}: File too large (max 100MB)`);
        return false;
      }
      
      return true;
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() && selectedFiles.length === 0 && !linkUrl.trim()) {
      toast.error("Please add some content to your post");
      return;
    }

    if (newPost.length > 2000) {
      toast.error("Post content cannot exceed 2000 characters");
      return;
    }

    try {
      await createPost(newPost, selectedFiles.length > 0 ? selectedFiles : undefined, linkUrl || undefined);
      toast.success("Post created successfully!");
      setNewPost("");
      setLinkUrl("");
      setSelectedFiles([]);
      setIsCreating(false);
    } catch (error) {
      toast.error("Failed to create post");
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await toggleLike(postId);
    } catch (error) {
      toast.error("Failed to update like");
    }
  };

  const handleComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    try {
      await addComment(postId, content);
      setCommentInputs(prev => ({ ...prev, [postId]: "" }));
      toast.success("Comment added!");
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  const handleReply = async (postId: string, parentCommentId: string) => {
    const content = replyInputs[parentCommentId]?.trim();
    if (!content) return;

    try {
      await addComment(postId, content, parentCommentId);
      setReplyInputs(prev => ({ ...prev, [parentCommentId]: "" }));
      toast.success("Reply added!");
    } catch (error) {
      toast.error("Failed to add reply");
    }
  };

  const handleCommentLike = async (commentId: string) => {
    try {
      await toggleCommentLike(commentId);
    } catch (error) {
      toast.error("Failed to update comment like");
    }
  };

  const handleShare = async (postId: string, type: 'internal' | 'external' | 'link', platform?: string) => {
    try {
      await sharePost(postId, type, platform);
      
      if (type === 'link') {
        const postUrl = `${window.location.origin}/posts/${postId}`;
        await navigator.clipboard.writeText(postUrl);
        toast.success("Post link copied to clipboard!");
      } else {
        toast.success("Post shared successfully!");
      }
    } catch (error) {
      toast.error("Failed to share post");
    }
  };

  const handleDeleteComment = async (commentId: string, postId: string) => {
    try {
      await deleteComment(commentId, postId);
      toast.success("Comment deleted!");
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

  const CommentComponent = ({ comment, postId, isReply = false }: { 
    comment: CommentWithAuthor; 
    postId: string; 
    isReply?: boolean;
  }) => (
    <div className={`space-y-2 ${isReply ? 'ml-8 border-l-2 border-muted pl-4' : ''}`}>
      <div className="flex items-start space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author.image_url} />
          <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-sm">{comment.author.name}</span>
            <span className="text-xs text-muted-foreground">
              {formatDateToNow(comment.created_at)}
            </span>
          </div>
          <p className="text-sm">{comment.content}</p>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCommentLike(comment.id)}
              className={`h-6 px-2 ${comment.liked ? "text-red-500" : ""}`}
            >
              <Heart className={`h-3 w-3 mr-1 ${comment.liked ? "fill-current" : ""}`} />
              {comment.likes_count}
            </Button>
            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyInputs(prev => ({ 
                  ...prev, 
                  [comment.id]: prev[comment.id] ? "" : "Reply..." 
                }))}
                className="h-6 px-2"
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
            {comment.author_id === user?.id && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteComment(comment.id, postId)}
                className="h-6 px-2 text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          {replyInputs[comment.id] && (
            <div className="flex space-x-2 mt-2">
              <Input
                placeholder="Write a reply..."
                value={replyInputs[comment.id] || ""}
                onChange={(e) => setReplyInputs(prev => ({ 
                  ...prev, 
                  [comment.id]: e.target.value 
                }))}
                className="text-sm"
              />
              <Button
                size="sm"
                onClick={() => handleReply(postId, comment.id)}
              >
                <Send className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {comment.replies.map((reply) => (
        <CommentComponent 
          key={reply.id} 
          comment={reply} 
          postId={postId} 
          isReply={true} 
        />
      ))}
    </div>
  );

  const PostCard = ({ post }: { post: PostWithAuthor }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={post.author.image_url} />
            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold">{post.author.name}</h3>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                {formatDateToNow(post.created_at)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {post.author.university || 'University not specified'} • {post.author.country}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="whitespace-pre-wrap text-sm">{post.content}</div>
        
        {/* Media Display */}
        {post.media_urls && post.media_urls.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {post.media_urls.map((url, index) => {
              const mediaType = post.media_types?.[index] || '';
              return (
                <div key={index} className="rounded-lg overflow-hidden">
                  {mediaType.startsWith('image/') ? (
                    <img src={url} alt="Post media" className="w-full h-48 object-cover" />
                  ) : mediaType.startsWith('video/') ? (
                    <video controls className="w-full h-48 object-cover">
                      <source src={url} type={mediaType} />
                    </video>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        {/* Link Preview */}
        {post.link_preview && (
          <Card className="border">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4" />
                <a 
                  href={post.link_preview.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {post.link_preview.title || post.link_preview.url}
                </a>
              </div>
              {post.link_preview.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {post.link_preview.description}
                </p>
              )}
            </CardContent>
          </Card>
        )}
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleLike(post.id)}
            className={post.liked ? "text-red-500" : ""}
          >
            <Heart className={`mr-2 h-4 w-4 ${post.liked ? "fill-current" : ""}`} />
            {post.likes_count}
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowComments(prev => ({ 
              ...prev, 
              [post.id]: !prev[post.id] 
            }))}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            {post.comments_count}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                {post.shares_count}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleShare(post.id, 'link')}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare(post.id, 'external', 'twitter')}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Share to Twitter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare(post.id, 'external', 'linkedin')}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Share to LinkedIn
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Comments Section */}
        {showComments[post.id] && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.image} />
                <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex space-x-2">
                <Input
                  placeholder="Write a comment..."
                  value={commentInputs[post.id] || ""}
                  onChange={(e) => setCommentInputs(prev => ({ 
                    ...prev, 
                    [post.id]: e.target.value 
                  }))}
                />
                <Button
                  size="sm"
                  onClick={() => handleComment(post.id)}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              {post.comments.map((comment) => (
                <CommentComponent 
                  key={comment.id} 
                  comment={comment} 
                  postId={post.id} 
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Community Posts</h1>
            <p className="text-muted-foreground">Share your experiences and help others</p>
          </div>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Community Posts</h1>
          <p className="text-muted-foreground">Share your experiences and help others</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Post
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Create New Post
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.image} />
                <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{user?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {user?.university || 'University not specified'} • {user?.country}
                </p>
              </div>
            </div>
            
            <Textarea
              placeholder="Share your experience, tips, or ask questions..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              rows={4}
              maxLength={2000}
            />
            <div className="text-xs text-muted-foreground text-right">
              {newPost.length}/2000 characters
            </div>

            <Input
              placeholder="Add a link (optional)"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />

            <div className="flex items-center space-x-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Add Photos
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Video className="mr-2 h-4 w-4" />
                Add Video
              </Button>
            </div>

            {selectedFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative">
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Video className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => removeFile(index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex space-x-2">
              <Button onClick={handleCreatePost}>
                <Send className="mr-2 h-4 w-4" />
                Post
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No posts yet.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Be the first to share your experience!
          </p>
        </div>
      )}
    </div>
  );
}