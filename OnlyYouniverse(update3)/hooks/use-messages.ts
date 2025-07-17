import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { Database } from '@/types/database';

type Message = Database['public']['Tables']['messages']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export interface MessageWithProfile extends Message {
  sender: Profile;
  receiver: Profile;
}

export interface Chat {
  participant: Profile;
  lastMessage: MessageWithProfile;
  unreadCount: number;
}

export function useMessages() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<MessageWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get all messages involving the current user
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(*),
          receiver:profiles!messages_receiver_id_fkey(*)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group messages by conversation partner
      const chatMap = new Map<string, Chat>();
      
      messagesData?.forEach((message) => {
        const isFromCurrentUser = message.sender_id === user.id;
        const partnerId = isFromCurrentUser ? message.receiver_id : message.sender_id;
        const partner = isFromCurrentUser ? message.receiver : message.sender;

        if (!chatMap.has(partnerId)) {
          chatMap.set(partnerId, {
            participant: partner,
            lastMessage: message,
            unreadCount: 0
          });
        }

        // Count unread messages from this partner
        if (!isFromCurrentUser && !message.read) {
          const chat = chatMap.get(partnerId)!;
          chat.unreadCount++;
        }
      });

      setChats(Array.from(chatMap.values()));
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessagesWithUser = async (userId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(*),
          receiver:profiles!messages_receiver_id_fkey(*)
        `)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
      
      // Mark messages as read
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('sender_id', userId)
        .eq('receiver_id', user.id)
        .eq('read', false);

    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (receiverId: string, content: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          content
        });

      if (error) throw error;

      // Create notification for receiver
      await supabase
        .from('notifications')
        .insert({
          user_id: receiverId,
          type: 'message',
          title: 'New Message',
          message: `${user.name} sent you a message`,
          related_user_id: user.id
        });

      // Refresh messages
      await fetchMessagesWithUser(receiverId);
      await fetchChats();
      
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchChats();

    // Subscribe to new messages
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `receiver_id=eq.${user?.id}`
        }, 
        () => {
          fetchChats();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return {
    chats,
    messages,
    loading,
    sendMessage,
    fetchMessagesWithUser,
    refetch: fetchChats,
  };
}