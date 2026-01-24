import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserPlus, MoreHorizontal, Trash2, Bookmark, BookmarkCheck, User, Trophy, Medal, Award, MessageCircle, Plus } from "lucide-react";
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
  const [postReactions, setPostReactions] = useState<Record<number, { gold: number; silver: number; bronze: number }>>({});
  const [userReactions, setUserReactions] = useState<Record<number, string | null>>({});

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

        // Load saved posts status and reactions if logged in
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

          // Load reaction counts and user reactions
          const reactionPromises = postsData.map(async (post: any) => {
            const [countsRes, userReactionRes] = await Promise.all([
              fetch(`/api/posts/${post.id}/reactions/counts`),
              fetch(`/api/posts/${post.id}/reactions/user`, { credentials: "include" })
            ]);
            const counts = await countsRes.json();
            const userReaction = await userReactionRes.json();
            return {
              postId: post.id,
              counts,
              userReaction: userReaction?.reaction_type || null
            };
          });

          const reactionData = await Promise.all(reactionPromises);
          const reactionsMap: Record<number, { gold: number; silver: number; bronze: number }> = {};
          const userReactionsMap: Record<number, string | null> = {};

          reactionData.forEach(({ postId, counts, userReaction }) => {
            reactionsMap[postId] = counts;
            userReactionsMap[postId] = userReaction;
          });

          setPostReactions(reactionsMap);
          setUserReactions(userReactionsMap);
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

  const handleReaction = async (postId: number, reactionType: "gold" | "silver" | "bronze") => {
    if (!me) return;

    try {
      const currentReaction = userReactions[postId];
      
      if (currentReaction === reactionType) {
        // Remove reaction
        await fetch(`/api/posts/${postId}/reactions`, {
          method: "DELETE",
          credentials: "include"
        });
        
        setUserReactions(prev => ({ ...prev, [postId]: null }));
        setPostReactions(prev => ({
          ...prev,
          [postId]: {
            ...prev[postId],
            [reactionType]: prev[postId][reactionType] - 1
          }
        }));
      } else {
        // Add or change reaction
        const res = await fetch(`/api/posts/${postId}/reactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reactionType }),
          credentials: "include"
        });
        
        if (!res.ok) throw new Error("Failed to add reaction");

        // Update counts
        const newCounts = { ...postReactions[postId] };
        if (currentReaction) {
          newCounts[currentReaction as keyof typeof newCounts] -= 1;
        }
        newCounts[reactionType] += 1;

        setUserReactions(prev => ({ ...prev, [postId]: reactionType }));
        setPostReactions(prev => ({ ...prev, [postId]: newCounts }));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update reaction");
    }
  };

  const handleTitleAlignmentChange = async (postId: number, alignment: string) => {
    // Removed alignment functionality as requested
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">{t('posts.posts_feed')}</h1>
                <p className="text-slate-600 text-sm">{t('posts.all_posts')}</p>
              </div>
            </div>
            {isLoggedIn && (
              <Button
                onClick={() => setLocation("/posts/create")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6 py-2.5"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('posts.create_post')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">

        {!isLoggedIn && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 rounded-xl p-4 mb-6 text-center">
            <div className="max-w-sm mx-auto">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-3 shadow-md">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800 mb-1">{t('posts.share_thoughts')}</h2>
              <p className="text-slate-600 text-sm mb-4">{t('posts.create_post_description')}</p>
              <Button
                onClick={() => setLocation("/auth")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-lg px-6 py-2 text-sm"
              >
                {t('login')}
              </Button>
            </div>
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-6">
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200/50 p-6 animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 bg-slate-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 p-12 text-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">{t('posts.no_posts')}</h3>
              <p className="text-slate-600">{t('posts.get_started')}</p>
            </div>
          ) : (
          posts.map((post) => {
            const isOwnPost = me && post.user_id === me.id;
            const isFriend = friends.some(friend => friend.id === post.user_id);
            const canAddFriend = me && !isOwnPost && !isFriend;

            return (
                <article key={post.id} className="bg-white rounded-2xl shadow-sm border border-slate-200/50 hover:shadow-lg transition-all duration-300 overflow-hidden">
                  {/* Post Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-md overflow-hidden flex-shrink-0">
                          {post.userAvatar ? (
                            <img
                              src={post.userAvatar}
                              alt={post.userName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = '<div class="w-full h-full rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white"><svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg></div>';
                                }
                              }}
                            />
                          ) : (
                            <User className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setLocation(`/profile/${post.user_id}`)}
                              className="font-semibold text-slate-800 hover:text-blue-600 transition-colors text-sm"
                            >
                              {capitalizeFirstLetter(post.userName)}
                            </button>
                            {isFriend && !isOwnPost && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {t('posts.linked_up')}
                              </span>
                            )}
                            {isOwnPost && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {t('posts.your_post')}
                              </span>
                            )}
                            {canAddFriend && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleAddFriend(post.user_id)}
                                className="h-6 w-6 p-0 hover:bg-blue-50 rounded-full"
                                title={t('add_friend')}
                              >
                                <UserPlus className="h-3.5 w-3.5 text-blue-600" />
                              </Button>
                            )}
                            {me && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:bg-slate-100 rounded-full"
                                  >
                                    <MoreHorizontal className="h-3.5 w-3.5 text-slate-600" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-200 shadow-lg rounded-xl">
                                  {isOwnPost && (
                                    <DropdownMenuItem
                                      onClick={() => handleDeletePost(post.id)}
                                      className="text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg mx-1"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      {t('posts.delete')}
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => savedPosts.has(post.id) ? handleUnsavePost(post.id) : handleSavePost(post.id)}
                                    className="rounded-lg mx-1"
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
                          <p className="text-xs text-slate-500 mt-0.5">
                            {new Date(post.created_at).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="px-6 pb-4">
                    <h3 className="font-bold text-xl text-slate-800 mb-3 leading-tight">{post.title}</h3>
                    <div
                      className="text-slate-700 leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                  </div>

                  {/* Post Actions */}
                  {me && (
                    <div className="px-6 pb-6">
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        {/* Trophy Reactions */}
                        <div className="flex items-center gap-3">
                          {/* Gold Trophy - Position 1 */}
                          <button
                            onClick={() => handleReaction(post.id, "gold")}
                            className={`group relative p-2 rounded-xl transition-all duration-300 hover:scale-110 ${
                              userReactions[post.id] === "gold"
                                ? "bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/30"
                                : "hover:bg-yellow-50"
                            }`}
                            title="Gold Trophy - Outstanding!"
                          >
                            <Trophy
                              className={`h-5 w-5 transition-colors duration-300 ${
                                userReactions[post.id] === "gold"
                                  ? "text-white"
                                  : "text-slate-400 group-hover:text-yellow-500"
                              }`}
                            />
                            {postReactions[post.id]?.gold > 0 && (
                              <span className={`absolute -top-1 -right-1 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                                userReactions[post.id] === "gold"
                                  ? "bg-white text-yellow-600"
                                  : "bg-yellow-500 text-white"
                              }`}>
                                {postReactions[post.id].gold}
                              </span>
                            )}
                          </button>

                          {/* Bronze Trophy - Position 2 */}
                          <button
                            onClick={() => handleReaction(post.id, "bronze")}
                            className={`group relative p-2 rounded-xl transition-all duration-300 hover:scale-110 ${
                              userReactions[post.id] === "bronze"
                                ? "bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg shadow-amber-500/30"
                                : "hover:bg-amber-50"
                            }`}
                            title="Bronze Trophy - Good job!"
                          >
                            <Award
                              className={`h-5 w-5 transition-colors duration-300 ${
                                userReactions[post.id] === "bronze"
                                  ? "text-white"
                                  : "text-slate-400 group-hover:text-amber-600"
                              }`}
                            />
                            {postReactions[post.id]?.bronze > 0 && (
                              <span className={`absolute -top-1 -right-1 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                                userReactions[post.id] === "bronze"
                                  ? "bg-white text-amber-600"
                                  : "bg-amber-500 text-white"
                              }`}>
                                {postReactions[post.id].bronze}
                              </span>
                            )}
                          </button>

                          {/* Silver Trophy - Position 3 */}
                          <button
                            onClick={() => handleReaction(post.id, "silver")}
                            className={`group relative p-2 rounded-xl transition-all duration-300 hover:scale-110 ${
                              userReactions[post.id] === "silver"
                                ? "bg-gradient-to-br from-slate-400 to-slate-600 shadow-lg shadow-slate-500/30"
                                : "hover:bg-slate-50"
                            }`}
                            title="Silver Trophy - Great work!"
                          >
                            <Medal
                              className={`h-5 w-5 transition-colors duration-300 ${
                                userReactions[post.id] === "silver"
                                  ? "text-white"
                                  : "text-slate-400 group-hover:text-slate-500"
                              }`}
                            />
                            {postReactions[post.id]?.silver > 0 && (
                              <span className={`absolute -top-1 -right-1 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                                userReactions[post.id] === "silver"
                                  ? "bg-white text-slate-600"
                                  : "bg-slate-500 text-white"
                              }`}>
                                {postReactions[post.id].silver}
                              </span>
                            )}
                          </button>
                        </div>

                        {/* Save Button */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-slate-100 rounded-full opacity-60 hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-4 w-4 text-slate-600" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-200 shadow-lg rounded-xl">
                            {isOwnPost && (
                              <DropdownMenuItem
                                onClick={() => handleDeletePost(post.id)}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg mx-1"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('posts.delete')}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => savedPosts.has(post.id) ? handleUnsavePost(post.id) : handleSavePost(post.id)}
                              className="rounded-lg mx-1"
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
                      </div>
                    </div>
                  )}
                </article>
            );
          })
        )}
      </div>
    </div>
    </div>
  );
}

