import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useFriends } from "@/hooks/use-friends";
import { 
  UserPlus, 
  UserCheck, 
  UserX, 
  Users, 
  Search, 
  Grid3X3, 
  List, 
  ChevronLeft, 
  ChevronRight,
  SortAsc,
  SortDesc
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
    setLocation(`/profile/${friendId}`);
  };

  if (me === undefined) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Please log in to view friends.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Link Ups</h1>
        <p className="text-sm text-muted-foreground">Manage your link ups and link up requests.</p>
      </div>

      <div className="grid gap-6">
        {/* Link Up Requests */}
        <Card className="rounded-2xl shadow-sm border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Link Up Requests</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {friendRequests.length} pending request{friendRequests.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {friendRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No pending link up requests.
              </p>
            ) : (
              <div className="space-y-3">
                {friendRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{request.name}</p>
                      <p className="text-sm text-muted-foreground">{request.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptRequest(request.id)}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectRequest(request.id)}
                        disabled={loading}
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Link Ups */}
        <Card className="rounded-2xl shadow-sm border-border/50 md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-xl text-green-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>My Link Ups</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {filteredAndSortedFriends.length} link up{filteredAndSortedFriends.length !== 1 ? 's' : ''}
                    {searchQuery && ` (filtered from ${friends.length})`}
                  </p>
                </div>
              </div>
              {friends.length > 0 && (
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                  {friends.length}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {friends.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No link ups yet. Send some link up requests!
              </p>
            ) : (
              <div className="space-y-4">
                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  {/* Search */}
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search link ups..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Sort and View Controls */}
                  <div className="flex items-center gap-2">
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="recent">Recent</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    >
                      {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                    </Button>

                    <div className="flex border rounded-md">
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="rounded-r-none"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className="rounded-l-none"
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Friends Display */}
                {paginatedFriends.length === 0 && searchQuery ? (
                  <p className="text-center text-muted-foreground py-8">
                    No link ups found matching "{searchQuery}"
                  </p>
                ) : (
                  <>
                    <div className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                        : "space-y-3"
                    }>
                      {paginatedFriends.map((friend) => (
                        viewMode === "grid" ? (
                          <Card 
                            key={friend.id} 
                            className="p-4 hover:shadow-md transition-all cursor-pointer hover:bg-slate-50/50"
                            onClick={() => handleViewProfile(friend.id)}
                          >
                            <div className="flex flex-col items-center text-center space-y-3">
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                {friend.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium">{friend.name}</p>
                                <p className="text-sm text-muted-foreground">{friend.email}</p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent card click when clicking remove button
                                  handleRemoveFriend(friend.id);
                                }}
                                disabled={loading}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full"
                              >
                                <UserX className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </Card>
                        ) : (
                          <div 
                            key={friend.id} 
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-100/70 transition-all cursor-pointer"
                            onClick={() => handleViewProfile(friend.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {friend.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium">{friend.name}</p>
                                <p className="text-sm text-muted-foreground">{friend.email}</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent card click when clicking remove button
                                handleRemoveFriend(friend.id);
                              }}
                              disabled={loading}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        )
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4">
                        <p className="text-sm text-muted-foreground">
                          Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedFriends.length)} of {filteredAndSortedFriends.length}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                          </Button>
                          <span className="text-sm text-muted-foreground px-2">
                            Page {currentPage} of {totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                          >
                            Next
                            <ChevronRight className="h-4 w-4" />
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
    </div>
  );
}