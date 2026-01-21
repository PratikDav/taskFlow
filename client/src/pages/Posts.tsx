import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserPlus, MoreHorizontal, Trash2, Bookmark, BookmarkCheck, User, ChevronDown, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { useFriends } from "@/hooks/use-friends";
import { capitalizeFirstLetter } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

export default function Posts() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  // `undefined` means "not loaded yet"; `null` means guest (not logged in)
  const [me, setMe] = useState<any | null | undefined>(undefined);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const { friends, sendFriendRequest } = useFriends();
  const [savedPosts, setSavedPosts] = useState<Set<number>>(new Set());

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

        // Load saved posts status if logged in
        if (meData) {
          const savedStatuses = await Promise.all(
            postsData.map((post: any) =>
              fetch(`/api/saved-posts/check/${post.id}`, { credentials: "include" })
                .then(res => res.json())
                .then(data => ({ postId: post.id, saved: data.saved }))
                .catch(() => ({ postId: post.id, saved: false }))
            )
          );
          const savedSet = new Set(savedStatuses.filter(s => s.saved).map(s => s.postId));
          setSavedPosts(savedSet);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, [location]); // Add location dependency to refetch when navigating back

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

  const handleSavePost = async (postId: number) => {
    try {
      const res = await fetch("/api/saved-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId }),
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to save post");

      setSavedPosts(prev => new Set(Array.from(prev).concat(postId)));
    } catch (err) {
      console.error(err);
      alert("Failed to save post");
    }
  };

  const handleUnsavePost = async (postId: number) => {
    try {
      const res = await fetch(`/api/saved-posts/${postId}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to unsave post");

      setSavedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    } catch (err) {
      console.error(err);
      alert("Failed to unsave post");
    }
  };

  const handleAddFriend = async (userId: number) => {
    await sendFriendRequest(userId);
  };

  const handleTitleAlignmentChange = async (postId: number, alignment: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titleAlignment: alignment }),
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to update title alignment");

      // Update the post in the local state
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, title_alignment: alignment }
          : post
      ));
    } catch (err) {
      console.error(err);
      alert("Failed to update title alignment");
    }
  };

  const applyThemeToElement = (element: HTMLElement, theme: string) => {
    // Minimal local theme map for code blocks. If you have a shared theme map,
    // replace this with an import from the shared file.
    const codeBlockThemes: Record<string, { bg: string; text: string; border: string }> = {
      dark: { bg: "#0f172a", text: "#e6eef8", border: "#1f2937" },
      light: { bg: "#f8fafc", text: "#0f172a", border: "#e6e9ef" },
    };

    const themeColors = codeBlockThemes[theme as keyof typeof codeBlockThemes] || codeBlockThemes.dark;
    element.style.setProperty('--code-block-bg', themeColors.bg);
    element.style.setProperty('--code-block-text', themeColors.text);
    element.style.setProperty('--code-block-border', themeColors.border);
  };

  const handlePostRef = (element: HTMLDivElement | null, theme: string) => {
    if (element) {
      applyThemeToElement(element, theme);
    }
  };

  // show loading only while we haven't checked the current user
  if (me === undefined)
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto p-8">
      {/* Header with User Info */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t('posts.posts_feed')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('posts.welcome')}, {me?.name ? capitalizeFirstLetter(me.name) : 'Guest'} • {me?.role === "admin" ? "Admin" : "User"}
            {isLoggedIn && <span className="ml-2 text-green-600">✓ {t('posts.logged_in')}</span>}
          </p>
        </div>
      </div>

          {/* Create Post CTA - navigates to dedicated create page */}
          <div className="mb-8 p-6 border rounded-lg bg-card flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{t('posts.share_thoughts')}</h2>
              <p className="text-sm text-muted-foreground">Click the button to write a new post on a dedicated page.</p>
            </div>
            <div>
              <Button onClick={() => me ? setLocation("/posts/create") : setLocation("/auth")} className="ml-4">
                {t('posts.create_post')}
              </Button>
            </div>
          </div>

      {/* Posts List */}
      <div className="space-y-4">
       
        {posts.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {t('posts.no_posts')}
          </p>
        ) : (
          posts.map((post) => {
            const isOwnPost = me && post.user_id === me.id;
            const isFriend = friends.some(friend => friend.id === post.user_id);
            const canAddFriend = me && !isOwnPost && !isFriend;

            return (
              <div key={post.id} 
                   className="p-4 border rounded-lg bg-card hover:shadow-md transition">
                {/* Post Header with User Info */}
                <div className="flex items-center justify-center mb-4 pb-3 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-violet-500 to-purple-500 flex items-center justify-center text-white shadow-md overflow-hidden flex-shrink-0">
                      {post.userAvatar ? (
                        <img
                          src={post.userAvatar}
                          alt={post.userName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="w-full h-full rounded-full bg-gradient-to-tr from-violet-500 to-purple-500 flex items-center justify-center text-white"><svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg></div>';
                            }
                          }}
                        />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setLocation(`/profile/${post.user_id}`)}
                          className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer text-sm"
                        >
                          {capitalizeFirstLetter(post.userName)}
                        </button>
                        {isFriend && !isOwnPost && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded inline-block">
                            {t('posts.linked_up')}
                          </span>
                        )}
                        {isOwnPost && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded inline-block">
                            {t('posts.your_post')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold text-lg flex-1 ${post.title_alignment === 'center' ? 'text-center' : post.title_alignment === 'right' ? 'text-right' : 'text-left'}`}>{post.title}</h3>
                      {isOwnPost && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-white border border-gray-200 hover:bg-gray-50">
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg">
                            <DropdownMenuItem 
                              onClick={() => handleTitleAlignmentChange(post.id, 'left')}
                              className="hover:bg-gray-50 focus:bg-gray-50"
                            >
                              <AlignLeft className="h-4 w-4 mr-2" />
                              {t('create_post.left')}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleTitleAlignmentChange(post.id, 'center')}
                              className="hover:bg-gray-50 focus:bg-gray-50"
                            >
                              <AlignCenter className="h-4 w-4 mr-2" />
                              {t('create_post.center')}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleTitleAlignmentChange(post.id, 'right')}
                              className="hover:bg-gray-50 focus:bg-gray-50"
                            >
                              <AlignRight className="h-4 w-4 mr-2" />
                              {t('create_post.right')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
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
                    </div>
                  </div>
                  {me && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 bg-white border border-gray-200 shadow-lg">
                        {isOwnPost && (
                          <DropdownMenuItem
                            onClick={() => handleDeletePost(post.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('posts.delete')}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => savedPosts.has(post.id) ? handleUnsavePost(post.id) : handleSavePost(post.id)}
                        >
                          {savedPosts.has(post.id) ? (
                            <>
                              <BookmarkCheck className="h-4 w-4 mr-2" />
                              {t('posts.unsave')}
                            </>
                          ) : (
                            <>
                              <Bookmark className="h-4 w-4 mr-2" />
                              {t('posts.save')}
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <p className="mt-3 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content }}></p>
                
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

