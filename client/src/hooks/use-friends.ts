import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Friend {
  id: number;
  name: string;
  email: string;
}

export interface FriendRequest {
  id: number;
  name: string;
  email: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export function useFriends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchFriends = async () => {
    try {
      const res = await fetch('/api/friends', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setFriends(data);
      }
    } catch (err) {
      console.error('Failed to fetch friends:', err);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const res = await fetch('/api/friends/requests', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setFriendRequests(data);
      }
    } catch (err) {
      console.error('Failed to fetch friend requests:', err);
    }
  };

  const sendFriendRequest = async (friendId: number) => {
    setLoading(true);
    try {
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ friendId }),
      });

      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Friend request sent!',
        });
        await fetchFriendRequests();
      } else {
        const error = await res.json();
        toast({
          title: 'Error',
          description: error.message || 'Failed to send friend request',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to send friend request',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const acceptFriendRequest = async (friendId: number) => {
    setLoading(true);
    try {
      const res = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ friendId }),
      });

      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Friend request accepted!',
        });
        await Promise.all([fetchFriends(), fetchFriendRequests()]);
      } else {
        const error = await res.json();
        toast({
          title: 'Error',
          description: error.message || 'Failed to accept friend request',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to accept friend request',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const rejectFriendRequest = async (friendId: number) => {
    setLoading(true);
    try {
      const res = await fetch('/api/friends/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ friendId }),
      });

      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Friend request rejected',
        });
        await fetchFriendRequests();
      } else {
        const error = await res.json();
        toast({
          title: 'Error',
          description: error.message || 'Failed to reject friend request',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to reject friend request',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFriend = async (friendId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/friends/${friendId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Friend removed',
        });
        await fetchFriends();
      } else {
        const error = await res.json();
        toast({
          title: 'Error',
          description: error.message || 'Failed to remove friend',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to remove friend',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchFriendRequests();
  }, []);

  return {
    friends,
    friendRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    refetch: () => Promise.all([fetchFriends(), fetchFriendRequests()]),
  };
}