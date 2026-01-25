import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useFriends } from "@/hooks/use-friends";
import { capitalizeFirstLetter } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import { 
  UserPlus, 
  UserCheck, 
  UserX, 
  Users, 
  User,
  Search, 
  Grid3X3, 
  List, 
  ChevronLeft, 
  ChevronRight,
  SortAsc,
  SortDesc,
  Check,
  X
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FriendRequest {
  id: number;
  name: string;
  email: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export default function Friends() {
  const [me, setMe] = useState<any | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortBy, setSortBy] = useState<"name" | "email" | "recent">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  
  const { friends, friendRequests, acceptFriendRequest, rejectFriendRequest, removeFriend } = useFriends();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  // Filter and sort friends
  const filteredAndSortedFriends = useMemo(() => {
    let filtered = friends.filter(friend =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort friends
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "email":
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case "recent":
          // For now, sort by id (assuming higher id = more recent)
          aValue = a.id;
          bValue = b.id;
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [friends, searchQuery, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedFriends.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFriends = filteredAndSortedFriends.slice(startIndex, endIndex);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if user is logged in
        const meRes = await fetch("/api/me", { credentials: "include" });
        const meData = await meRes.json();
        setMe(meData);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, []);

  const handleAcceptRequest = async (friendId: number) => {
    setLoading(true);
    try {
      await acceptFriendRequest(friendId);
      toast({
        title: "Link up request accepted",
        description: "You are now linked up!",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to accept link up request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (friendId: number) => {
    setLoading(true);
    try {
      await rejectFriendRequest(friendId);
      toast({
        title: "Link up request rejected",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to reject link up request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async (friendId: number) => {
    setLoading(true);
    try {
      await removeFriend(friendId);
      toast({
        title: "Link up removed",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to remove link up",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (friendId: number) => {
    setLocation(`/user/${friendId}`);
  };

  if (me === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-8">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">Link Up Required</h2>
            <p className="text-muted-foreground mb-6">{t('friends.login_required')}</p>
            <Button 
              onClick={() => setLocation('/auth')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Sign In to Connect
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header Section */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  {t('friends.friends')}
                </h1>
                <p className="text-slate-600 mt-1">{t('friends.manage_connections')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                {friends.length} Connections
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid gap-8">
          {/* Link Up Requests */}
          <Card className="rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 border-b border-blue-200/20">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                    <UserPlus className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold text-slate-800">{t('friends.link_up_requests')}</CardTitle>
                    <p className="text-slate-600 mt-1">
                      {friendRequests.length} {friendRequests.length !== 1 ? t('friends.pending_requests') : t('friends.pending_request')}
                    </p>
                  </div>
                  {friendRequests.length > 0 && (
                    <Badge className="bg-blue-500 text-white border-0">
                      {friendRequests.length}
                    </Badge>
                  )}
                </div>
              </CardHeader>
            </div>
            <CardContent className="pt-6">
              {friendRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">{t('friends.no_pending_requests')}</p>
                  <p className="text-slate-400 text-sm mt-1">New requests will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {friendRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border border-slate-200/60 rounded-xl hover:bg-slate-50/50 transition-all duration-200 hover:shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                          {request.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{capitalizeFirstLetter(request.name)}</p>
                          <p className="text-sm text-slate-500">{request.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptRequest(request.id)}
                          disabled={loading}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-lg px-4"
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          {t('friends.accept')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectRequest(request.id)}
                          disabled={loading}
                          className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 rounded-lg px-4"
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          {t('friends.reject')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Link Ups */}
          <Card className="rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
            <div className="bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border-b border-green-200/20">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-800">{t('friends.your_link_ups')}</CardTitle>
                      <p className="text-slate-600 mt-1">
                        {filteredAndSortedFriends.length} link up{filteredAndSortedFriends.length !== 1 ? 's' : ''}
                        {searchQuery && ` (filtered from ${friends.length})`}
                      </p>
                    </div>
                  </div>
                  {friends.length > 0 && (
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-md px-3 py-1">
                      {friends.length} Active
                    </Badge>
                  )}
                </div>
              </CardHeader>
            </div>
            <CardContent className="pt-6">
              {friends.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Users className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">{t('friends.noConnectionsYet')}</h3>
                  <p className="text-slate-500 mb-6">{t('friends.no_link_ups_yet')}</p>
                  <Button 
                    onClick={() => setLocation('/friends')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {t('friends.startConnecting')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Controls */}
                  <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-200/50">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input
                        placeholder={t('friends.search_link_ups')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-11 bg-white border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>

                    {/* Sort and View Controls */}
                    <div className="flex items-center gap-3">
                      <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                        <SelectTrigger className="w-36 h-11 bg-white border-slate-200 rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name" className="cursor-pointer">
                            <div className="flex items-center gap-2">
                              <span>{t('friends.name')}</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="email" className="cursor-pointer">
                            <div className="flex items-center gap-2">
                              <span>{t('friends.email')}</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="recent" className="cursor-pointer">
                            <div className="flex items-center gap-2">
                              <span>{t('friends.recent')}</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                        className="h-11 px-3 bg-white border-slate-200 rounded-lg hover:bg-slate-50"
                      >
                        {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                      </Button>

                      <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white">
                        <Button
                          variant={viewMode === "list" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setViewMode("list")}
                          className={`h-11 px-3 rounded-none ${viewMode === "list" ? "bg-blue-500 text-white hover:bg-blue-600" : "hover:bg-slate-50"}`}
                        >
                          <List className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={viewMode === "grid" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setViewMode("grid")}
                          className={`h-11 px-3 rounded-none ${viewMode === "grid" ? "bg-blue-500 text-white hover:bg-blue-600" : "hover:bg-slate-50"}`}
                        >
                          <Grid3X3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Friends Display */}
                  {paginatedFriends.length === 0 && searchQuery ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Search className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-slate-600 font-medium">
                        {t('friends.no_link_ups_found')} "{searchQuery}"
                      </p>
                      <p className="text-slate-400 text-sm mt-1">Try adjusting your search terms</p>
                    </div>
                  ) : (
                    <>
                      <div className={
                        viewMode === "grid"
                          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                          : "space-y-4"
                      }>
                        {paginatedFriends.map((friend) => (
                          viewMode === "grid" ? (
                            <Card 
                              key={friend.id} 
                              className="group p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:bg-gradient-to-br hover:from-white hover:to-slate-50/50 border border-slate-200/60 hover:border-slate-300/60 rounded-2xl overflow-hidden"
                              onClick={() => handleViewProfile(friend.id)}
                            >
                              <div className="flex flex-col items-center text-center space-y-4">
                                <div className="relative">
                                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    {friend.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
                                </div>
                                <div>
                                  <p className="font-bold text-slate-800 text-lg">{capitalizeFirstLetter(friend.name)}</p>
                                  <p className="text-sm text-slate-500 mt-1">{friend.email}</p>
                                </div>
                                <div className="flex gap-2 w-full">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewProfile(friend.id);
                                    }}
                                    className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 rounded-lg"
                                  >
                                    <User className="h-4 w-4 mr-2" />
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveFriend(friend.id);
                                    }}
                                    disabled={loading}
                                    className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 rounded-lg"
                                  >
                                    <UserX className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ) : (
                            <div 
                              key={friend.id} 
                              className="flex items-center justify-between p-5 border border-slate-200/60 rounded-xl hover:bg-gradient-to-r hover:from-white hover:to-slate-50/50 transition-all duration-200 cursor-pointer hover:shadow-md hover:border-slate-300/60 group"
                              onClick={() => handleViewProfile(friend.id)}
                            >
                              <div className="flex items-center gap-4">
                                <div className="relative">
                                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform duration-300">
                                    {friend.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-800 text-lg">{capitalizeFirstLetter(friend.name)}</p>
                                  <p className="text-sm text-slate-500">{friend.email}</p>
                                </div>
                              </div>
                              <div className="flex gap-3">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewProfile(friend.id);
                                  }}
                                  className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 rounded-lg px-4"
                                >
                                  <User className="h-4 w-4 mr-2" />
                                  View Profile
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveFriend(friend.id);
                                  }}
                                  disabled={loading}
                                  className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 rounded-lg px-4"
                                >
                                  <UserX className="h-4 w-4 mr-2" />
                                  {t('friends.remove')}
                                </Button>
                              </div>
                            </div>
                          )
                        ))}
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-6 border-t border-slate-200/50">
                          <p className="text-sm text-slate-600 font-medium">
                            {t('friends.showing')} {startIndex + 1}-{Math.min(endIndex, filteredAndSortedFriends.length)} {t('friends.of')} {filteredAndSortedFriends.length}
                          </p>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={currentPage === 1}
                              className="h-10 px-4 bg-white border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                            >
                              <ChevronLeft className="h-4 w-4 mr-2" />
                              {t('friends.previous')}
                            </Button>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                                if (page > totalPages) return null;
                                return (
                                  <Button
                                    key={page}
                                    variant={page === currentPage ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentPage(page)}
                                    className={`h-10 w-10 ${
                                      page === currentPage 
                                        ? "bg-blue-500 text-white hover:bg-blue-600" 
                                        : "bg-white border-slate-200 hover:bg-slate-50"
                                    } rounded-lg`}
                                  >
                                    {page}
                                  </Button>
                                );
                              })}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                              disabled={currentPage === totalPages}
                              className="h-10 px-4 bg-white border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                            >
                              {t('friends.next')}
                              <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Friend Requests */}
        <Card className="rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border-b border-blue-200/20">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                    <UserPlus className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800">{t('friends.friend_requests')}</CardTitle>
                    <p className="text-slate-600 mt-1">
                      {friendRequests.length} pending request{friendRequests.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                {friendRequests.length > 0 && (
                  <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 shadow-md px-3 py-1">
                    {friendRequests.length} New
                  </Badge>
                )}
              </div>
            </CardHeader>
          </div>
          <CardContent className="pt-6">
            {friendRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No Pending Requests</h3>
                <p className="text-slate-500 mb-6">You're all caught up! No new friend requests at the moment.</p>
                <Button 
                  onClick={() => setLocation('/friends')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Find New Friends
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {friendRequests.map((request) => (
                  <div 
                    key={request.id} 
                    className="flex items-center justify-between p-5 border border-slate-200/60 rounded-xl hover:bg-gradient-to-r hover:from-white hover:to-blue-50/30 transition-all duration-200 hover:shadow-md hover:border-blue-300/60 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform duration-300">
                          {request.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-lg">{capitalizeFirstLetter(request.name)}</p>
                        <p className="text-sm text-slate-500">{request.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        size="sm"
                        onClick={() => acceptFriendRequest(request.id)}
                        disabled={loading}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-lg px-4"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        {t('friends.accept')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rejectFriendRequest(request.id)}
                        disabled={loading}
                        className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 rounded-lg px-4"
                      >
                        <X className="h-4 w-4 mr-2" />
                        {t('friends.decline')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}