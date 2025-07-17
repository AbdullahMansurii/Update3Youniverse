import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { Database } from '@/types/database';

type Connection = Database['public']['Tables']['connections']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export interface ConnectionWithProfile extends Connection {
  requester: Profile;
  addressee: Profile;
}

export function useConnections() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<ConnectionWithProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ConnectionWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConnections = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch accepted connections
      const { data: acceptedConnections, error: connectionsError } = await supabase
        .from('connections')
        .select(`
          *,
          requester:profiles!connections_requester_id_fkey(*),
          addressee:profiles!connections_addressee_id_fkey(*)
        `)
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (connectionsError) throw connectionsError;

      // Fetch pending requests (where current user is addressee)
      const { data: pendingData, error: pendingError } = await supabase
        .from('connections')
        .select(`
          *,
          requester:profiles!connections_requester_id_fkey(*),
          addressee:profiles!connections_addressee_id_fkey(*)
        `)
        .eq('addressee_id', user.id)
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      setConnections(acceptedConnections || []);
      setPendingRequests(pendingData || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendConnectionRequest = async (addresseeId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          addressee_id: addresseeId,
          status: 'pending'
        });

      if (error) throw error;

      // Create notification for the addressee
      await supabase
        .from('notifications')
        .insert({
          user_id: addresseeId,
          type: 'connection_request',
          title: 'New Connection Request',
          message: `${user.name} sent you a connection request`,
          related_user_id: user.id
        });

      return true;
    } catch (error) {
      console.error('Error sending connection request:', error);
      throw error;
    }
  };

  const acceptConnectionRequest = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);

      if (error) throw error;

      await fetchConnections();
      return true;
    } catch (error) {
      console.error('Error accepting connection:', error);
      throw error;
    }
  };

  const rejectConnectionRequest = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'rejected' })
        .eq('id', connectionId);

      if (error) throw error;

      await fetchConnections();
      return true;
    } catch (error) {
      console.error('Error rejecting connection:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [user]);

  return {
    connections,
    pendingRequests,
    loading,
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    refetch: fetchConnections,
  };
}