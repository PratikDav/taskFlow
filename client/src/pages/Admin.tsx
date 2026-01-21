import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { capitalizeFirstLetter } from "@/lib/utils";

export default function Admin() {
  const [, setLocation] = useLocation();
  const [me, setMe] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const meRes = await fetch("/api/me", { credentials: "include" });
        const meData = await meRes.json();
        if (!meData || meData.role !== "admin") {
          setLocation("/login");
          return;
        }
        setMe(meData);

        // Load posts for admin dashboard
        const postsRes = await fetch("/api/posts");
        const postsData = await postsRes.json();
        setPosts(postsData);
      } catch (err) {
        console.error(err);
        setLocation("/login");
      }
    };
    loadData();
  }, [setLocation]);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    setLocation("/login");
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm("Delete this post?")) return;
    try {
      await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      setPosts(posts.filter((p) => p.id !== postId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete post");
    }
  };

  if (!me)
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">Loading admin panel...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <div className="bg-white border-b px-8 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome, {capitalizeFirstLetter(me.name)}</p>
          </div>
          <Button variant="destructive" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-3 gap-4 p-8">
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-muted-foreground text-sm">Total Posts</p>
          <p className="text-3xl font-bold mt-2">{posts.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-muted-foreground text-sm">Your Posts</p>
          <p className="text-3xl font-bold mt-2">
            {posts.filter((p) => p.user_id === me.id).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-muted-foreground text-sm">Role</p>
          <p className="text-3xl font-bold mt-2 capitalize">{me.role}</p>
        </div>
      </div>

      {/* All Posts Management */}
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">All Posts</h2>
        <div className="space-y-4">
          {posts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No posts yet</p>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white p-4 rounded-lg border">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{post.title}</h3>
                      {post.user_id === me.id && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Your Post
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">By {post.userName}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeletePost(post.id)}
                  >
                    Delete
                  </Button>
                </div>
                <p className="mt-3 text-sm">{post.content}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

