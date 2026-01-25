import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserPlus, Trash2, User, Trophy, Medal, Award, MessageCircle, Plus, MoreHorizontal, Bookmark, Send } from "lucide-react";
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
  const [postReactions, setPostReactions] = useState<Record<number, { gold: number; silver: number; bronze: number }>>({});
  const [userReactions, setUserReactions] = useState<Record<number, string | null>>({});
  const [savedPosts, setSavedPosts] = useState<Set<number>>(new Set());
  const [comments, setComments] = useState<Record<number, any[]>>({});
  const [newComments, setNewComments] = useState<Record<number, string>>({});
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());

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

        // Load reactions if logged in
        if (meData) {
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

          // Load saved posts
          const savedPostsRes = await fetch('/api/saved-posts', { credentials: 'include' });
          if (savedPostsRes.ok) {
            const savedPostsData = await savedPostsRes.json();
            const savedPostIds = new Set<number>(savedPostsData.map((post: any) => post.id));
            setSavedPosts(savedPostIds);
          }

          // Load comments for each post
          const commentPromises = postsData.map(async (post: any) => {
            const commentsRes = await fetch(`/api/posts/${post.id}/comments`);
            if (commentsRes.ok) {
              const commentsData = await commentsRes.json();
              return { postId: post.id, comments: commentsData };
            }
            return { postId: post.id, comments: [] };
          });

          const commentData = await Promise.all(commentPromises);
          const commentsMap: Record<number, any[]> = {};
          commentData.forEach(({ postId, comments: postComments }) => {
            commentsMap[postId] = postComments;
          });
          setComments(commentsMap);
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
    if (!me) return;

    try {
      if (savedPosts.has(postId)) {
        // Unsave the post
        const res = await fetch(`/api/posts/${postId}/save`, {
          method: "DELETE",
          credentials: "include",
        });
        
        if (res.ok) {
          setSavedPosts(prev => {
            const newSet = new Set(prev);
            newSet.delete(postId);
            return newSet;
          });
          alert("Post unsaved successfully!");
        } else {
          throw new Error("Failed to unsave post");
        }
      } else {
        // Save the post
        const res = await fetch(`/api/posts/${postId}/save`, {
          method: "POST",
          credentials: "include",
        });
        
        if (res.ok) {
          setSavedPosts(prev => new Set([...Array.from(prev), postId]));
          alert("Post saved successfully!");
        } else {
          const error = await res.json();
          if (error.message === 'Post already saved') {
            setSavedPosts(prev => new Set([...Array.from(prev), postId]));
            alert("Post was already saved!");
          } else {
            throw new Error("Failed to save post");
          }
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update saved status");
    }
  };

  const handleSharePost = async (postId: number) => {
    try {
      // Copy post URL to clipboard
      const postUrl = `${window.location.origin}/posts/${postId}`;
      await navigator.clipboard.writeText(postUrl);
      alert("Post link copied to clipboard!");
    } catch (err) {
      console.error(err);
      alert("Failed to share post");
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

  const handleCreateComment = async (postId: number, e: React.FormEvent) => {
    e.preventDefault();
    const content = newComments[postId]?.trim();
    if (!content || !me) return;

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        credentials: "include"
      });

      if (!res.ok) throw new Error("Failed to create comment");

      const newComment = await res.json();
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment]
      }));
      setNewComments(prev => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error(err);
      alert("Failed to create comment");
    }
  };

  const handleDeleteComment = async (postId: number, commentId: number) => {
    if (!confirm("Delete this comment?")) return;

    try {
      const res = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (!res.ok) throw new Error("Failed to delete comment");

      setComments(prev => ({
        ...prev,
        [postId]: prev[postId].filter(comment => comment.id !== commentId)
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to delete comment");
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
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-md overflow-hidden flex-shrink-0 cursor-pointer hover:scale-110 transition-transform duration-200" onClick={() => setLocation(`/user/${post.user_id}`)}>
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
                              onClick={() => setLocation(`/user/${post.user_id}`)}
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
                                  <DropdownMenuItem
                                    onClick={() => handleSavePost(post.id)}
                                    className="rounded-lg mx-1"
                                  >
                                    <Bookmark className={`h-4 w-4 mr-2 ${savedPosts.has(post.id) ? 'fill-current' : ''}`} />
                                    {savedPosts.has(post.id) ? t('unsavePost') || 'Unsave Post' : t('savePost')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleSharePost(post.id)}
                                    className="rounded-lg mx-1"
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    {t('sharePost')}
                                  </DropdownMenuItem>
                                  {isOwnPost && (
                                    <DropdownMenuItem
                                      onClick={() => handleDeletePost(post.id)}
                                      className="text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg mx-1"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      {t('posts.delete')}
                                    </DropdownMenuItem>
                                  )}
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
                    <h3 className={`font-bold text-xl text-slate-800 mb-3 leading-tight ${post.title_alignment === 'center' ? 'text-center' : post.title_alignment === 'right' ? 'text-right' : 'text-left'}`}>{post.title}</h3>
                    <div
                      className="text-slate-700 leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                  </div>

                  {/* Post Actions */}
                  {me && (
                    <div className="px-6 pb-6">
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        {/* Comments Section - Left Side */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setExpandedComments(prev => {
                                const newSet = new Set(prev);
                                if (newSet.has(post.id)) {
                                  newSet.delete(post.id);
                                } else {
                                  newSet.add(post.id);
                                }
                                return newSet;
                              });
                              // Focus comment input when expanding
                              if (!expandedComments.has(post.id)) {
                                setTimeout(() => {
                                  const commentInput = document.querySelector(`#comment-input-${post.id}`) as HTMLInputElement;
                                  if (commentInput) commentInput.focus();
                                }, 100);
                              }
                            }}
                            className={`group flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 hover:scale-105 ${
                              expandedComments.has(post.id) ? 'bg-blue-50 shadow-md' : 'hover:bg-blue-50'
                            }`}
                            title={expandedComments.has(post.id) ? "Hide Echoes" : "Show Echoes"}
                          >
                            <div className="relative">
                              <MessageCircle className={`h-5 w-5 transition-colors duration-300 ${
                                expandedComments.has(post.id) ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'
                              }`} />
                              {comments[post.id]?.length > 0 && (
                                <span className={`absolute -top-1 -right-1 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center transition-colors duration-300 ${
                                  expandedComments.has(post.id) ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                                }`}>
                                  {comments[post.id].length}
                                </span>
                              )}
                            </div>
                            <span className={`text-sm font-medium transition-colors duration-300 ${
                              expandedComments.has(post.id) ? 'text-blue-600' : 'text-slate-600 group-hover:text-blue-600'
                            }`}>
                              Echo
                            </span>
                          </button>
                        </div>

                        {/* Trophy Reactions - Right Side */}
                        <div className="flex items-center gap-2">
                          {/* Gold Trophy */}
                          <button
                            onClick={() => handleReaction(post.id, "gold")}
                            className={`group relative p-2.5 rounded-xl transition-all duration-300 hover:scale-110 ${
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

                          {/* Bronze Trophy */}
                          <button
                            onClick={() => handleReaction(post.id, "bronze")}
                            className={`group relative p-2.5 rounded-xl transition-all duration-300 hover:scale-110 ${
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

                          {/* Silver Trophy */}
                          <button
                            onClick={() => handleReaction(post.id, "silver")}
                            className={`group relative p-2.5 rounded-xl transition-all duration-300 hover:scale-110 ${
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
                      </div>
                    </div>
                  )}

                  {/* Expanded Comments Section */}
                  {me && expandedComments.has(post.id) && (
                    <div className="px-6 pb-6">
                      <div className="border-t border-slate-100 pt-4">
                        {/* Comments List */}
                        <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                          {comments[post.id]?.map((comment) => (
                            <div key={comment.id} className="group flex gap-3 p-4 bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-xl border border-slate-200/50 hover:shadow-md transition-all duration-300">
                              <div className="h-9 w-9 rounded-full flex-shrink-0 shadow-md overflow-hidden cursor-pointer hover:scale-110 transition-transform duration-200" onClick={() => setLocation(`/user/${comment.user_id}`)}>
                                {comment.userAvatar ? (
                                  <img
                                    src={comment.userAvatar}
                                    alt={comment.userName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      const parent = target.parentElement;
                                      if (parent) {
                                        parent.innerHTML = '<div class="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">' + (comment.userName?.charAt(0).toUpperCase() || 'U') + '</div>';
                                      }
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                                    {comment.userName?.charAt(0).toUpperCase() || 'U'}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <button
                                    onClick={() => setLocation(`/user/${comment.user_id}`)}
                                    className="text-sm font-semibold text-slate-800 hover:text-blue-600 transition-colors"
                                  >
                                    {comment.userName}
                                  </button>
                                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                                    {new Date(comment.created_at).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      hour: "numeric",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                  {comment.user_id === me.id && (
                                    <button
                                      onClick={() => handleDeleteComment(post.id, comment.id)}
                                      className="text-xs text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity ml-auto p-1 hover:bg-red-50 rounded-md"
                                      title="Delete comment"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </div>
                                <p className="text-sm text-slate-700 leading-relaxed break-words">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Compact Add Comment Form */}
                        <div className="relative">
                          <form onSubmit={(e) => handleCreateComment(post.id, e)} className="flex gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-300">
                            <div className="h-8 w-8 rounded-full flex-shrink-0 shadow-sm overflow-hidden">
                              {me.avatar ? (
                                <img
                                  src={me.avatar}
                                  alt={me.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.innerHTML = '<div class="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">' + (me.name?.charAt(0).toUpperCase() || 'U') + '</div>';
                                    }
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                                  {me.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 flex gap-2 items-center">
                              <input
                                id={`comment-input-${post.id}`}
                                type="text"
                                value={newComments[post.id] || ""}
                                onChange={(e) => setNewComments(prev => ({ ...prev, [post.id]: e.target.value }))}
                                placeholder="Share your echo..."
                                className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-slate-400 text-sm text-slate-700"
                                maxLength={500}
                              />
                              <Button
                                type="submit"
                                size="sm"
                                disabled={!newComments[post.id]?.trim()}
                                className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs font-medium rounded-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                              >
                                <Send className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </form>
                        </div>
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

