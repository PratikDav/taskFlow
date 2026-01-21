import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowLeft, Search, MoreHorizontal, Trash2, BookmarkCheck, UserPlus } from "lucide-react";
import { useFriends } from "@/hooks/use-friends";
import { capitalizeFirstLetter } from "@/lib/utils";

interface SavedPost {
  id: number;
  user_id: number;
  title: string;
  content: string;
  userName: string;
  savedAt: string;
  created_at: string;
}

export default function SavedPosts() {
  const [, setLocation] = useLocation();
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"savedAt" | "created_at" | "title">("savedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { friends, sendFriendRequest } = useFriends();
  const [me, setMe] = useState<any | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [meRes, postsRes] = await Promise.all([
          fetch("/api/me", { credentials: "include" }),
          fetch("/api/saved-posts", { credentials: "include" })
        ]);

        const meData = await meRes.json();
        setMe(meData);

        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setSavedPosts(postsData);
          setFilteredPosts(postsData);
        }
      } catch (err) {
        console.error("Failed to load saved posts:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    let filtered = savedPosts.filter(post =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.userName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      if (sortBy === "savedAt") {
        aValue = new Date(a.savedAt);
        bValue = new Date(b.savedAt);
      } else if (sortBy === "created_at") {
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
      } else {
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredPosts(filtered);
  }, [savedPosts, searchQuery, sortBy, sortOrder]);

  const handleUnsavePost = async (postId: number) => {
    try {
      const res = await fetch(`/api/saved-posts/${postId}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to unsave post");

      setSavedPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      console.error(err);
      alert("Failed to unsave post");
    }
  };

  const handleAddFriend = async (userId: number) => {
    await sendFriendRequest(userId);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">Loading saved posts...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" onClick={() => setLocation("/profile")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Saved Posts</h1>
          <p className="text-muted-foreground mt-1">
            {savedPosts.length} saved post{savedPosts.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search saved posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="savedAt">Saved Date</SelectItem>
                <SelectItem value="created_at">Post Date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest</SelectItem>
                <SelectItem value="asc">Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground py-8">
                {savedPosts.length === 0 ? "No saved posts yet." : "No posts match your search."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => {
            const isFriend = friends.some(friend => friend.id === post.user_id);
            const canAddFriend = me && post.user_id !== me.id && !isFriend;

            return (
              <Card key={post.id} className="hover:shadow-md transition">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{post.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => setLocation(`/profile/${post.user_id}`)}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                        >
                          By {capitalizeFirstLetter(post.userName)}
                        </button>
                        {canAddFriend && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAddFriend(post.user_id)}
                            className="h-6 w-6 p-0 hover:bg-primary/10"
                            title="Add friend"
                          >
                            <UserPlus className="h-3 w-3" />
                          </Button>
                        )}
                        {isFriend && post.user_id !== me?.id && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded inline-block">
                            Linked up
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Saved {new Date(post.savedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32 bg-white border border-gray-200 shadow-lg">
                        <DropdownMenuItem
                          onClick={() => handleUnsavePost(post.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <BookmarkCheck className="h-4 w-4 mr-2" />
                          Unsave
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content }}></p>
                  <p className="text-xs text-muted-foreground mt-3">
                    Posted {new Date(post.created_at).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}