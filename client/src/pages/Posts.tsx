import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Posts() {
  const [, setLocation] = useLocation();
  const [me, setMe] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "" });

  // Check if user is logged in
  const isLoggedIn = !!me;

  useEffect(() => {
    const loadData = async () => {
      try {
        const meRes = await fetch("/api/me", { credentials: "include" });
        const meData = await meRes.json();
        setMe(meData); // will be null for guests

        const postsRes = await fetch("/api/posts");
        const postsData = await postsRes.json();
        setPosts(postsData);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });
      if (!res.ok) throw new Error("Failed to create post");

      const createdPost = await res.json();
      setPosts([createdPost, ...posts]);
      setNewPost({ title: "", content: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm("Delete this post?")) return;

    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete post");

      setPosts(posts.filter((p) => p.id !== postId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete post");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    // Reload to get back to default user
    window.location.reload();
  };

  const handleLoginClick = () => {
    setLocation("/login");
  };

  if (!me)
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto p-8">
      {/* Header with User Info */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Posts Feed</h1>
          <p className="text-muted-foreground mt-1">
            Welcome, {me?.name || 'Guest'} • {me?.role === "admin" ? "Admin" : "User"}
            {isLoggedIn && <span className="ml-2 text-green-600">✓ Logged In</span>}
          </p>
        </div>
        <div className="flex gap-2">
          {!isLoggedIn && (
            <Button onClick={handleLoginClick}>
              Login / Sign Up
            </Button>
          )}
          {isLoggedIn && (
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </div>
      </div>

      {/* Create Post Form - Always available */}
      <form onSubmit={handleCreatePost} className="mb-8 p-6 border rounded-lg bg-card">
        <h2 className="text-lg font-semibold mb-4">Share Your Thoughts</h2>
        <input
          type="text"
          placeholder="Post title..."
          value={newPost.title}
          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
          className="w-full p-2 mb-3 border rounded-md bg-background"
          disabled={loading}
        />
        <textarea
          placeholder="What's on your mind? Share your post content here..."
          value={newPost.content}
          onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
          className="w-full p-2 mb-3 border rounded-md min-h-[100px] bg-background"
          disabled={loading}
        />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Publishing..." : "Publish Post"}
        </Button>
      </form>

      {/* Posts List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">All Posts ({posts.length})</h2>
        {posts.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No posts yet. Be the first to share!
          </p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="p-4 border rounded-lg bg-card hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{post.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    By {post.userName}
                    {post.user_id === me.id && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded inline-block">
                        Your Post
                      </span>
                    )}
                  </p>
                </div>
                {post.user_id === me.id && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeletePost(post.id)}
                  >
                    Delete
                  </Button>
                )}
              </div>
              <p className="mt-3 text-sm leading-relaxed">{post.content}</p>
              <p className="text-xs text-muted-foreground mt-3">
                {new Date(post.created_at).toLocaleDateString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

