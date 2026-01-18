import { useState, useEffect } from 'react';

export interface FriendPost {
  id: number;
  user_id: number;
  title: string;
  content: string;
  codeBlockTheme: string;
  privacy: 'public' | 'friends' | 'private';
  created_at: string;
  updated_at: string;
  userName: string;
}

export interface FriendNote {
  id: number;
  user_id: number;
  title: string;
  content: string;
  privacy: 'public' | 'friends' | 'private';
  created_at: string;
  updated_at: string;
  folderName?: string;
  userName: string;
}

export function useFriendsContent() {
  const [posts, setPosts] = useState<FriendPost[]>([]);
  const [notes, setNotes] = useState<FriendNote[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFriendsPosts = async () => {
    try {
      const res = await fetch('/api/friends/posts', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error('Failed to fetch friends posts:', err);
    }
  };

  const fetchFriendsNotes = async () => {
    try {
      const res = await fetch('/api/friends/notes', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (err) {
      console.error('Failed to fetch friends notes:', err);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchFriendsPosts(), fetchFriendsNotes()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return {
    posts,
    notes,
    loading,
    refetch: fetchAll,
  };
}