import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { User, Mail, Github, Linkedin, UserPlus, Users, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFriends } from "@/hooks/use-friends";
import { useFriendsContent } from "@/hooks/use-friends-content";
import { capitalizeFirstLetter } from "@/lib/utils";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  gmailAddress?: string;
  githubLink?: string;
  linkedinLink?: string;
  skills?: string[];
  created_at: string;
}

export default function UserProfile() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { friends, sendFriendRequest, acceptFriendRequest, removeFriend } = useFriends();
  const { posts: friendsPosts, notes: friendsNotes, loading: friendsContentLoading } = useFriendsContent();

  const userId = params?.id ? Number(params.id) : null;

  useEffect(() => {
    if (!userId) {
      setLocation("/");
      return;
    }
    fetchUserProfile();
    fetchCurrentUser();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`/api/users/${userId}`, { credentials: "include" });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        setLocation("/");
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      setLocation("/");
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/me", { credentials: "include" });
      if (res.ok) {
        const userData = await res.json();
        setCurrentUser(userData);
      }
    } catch (err) {
      console.error("Failed to fetch current user:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFriendAction = async () => {
    if (!user || !currentUser) return;

    // Check if already friends
    const isFriend = friends.some(friend => friend.id === user.id);

    if (isFriend) {
      // Remove friend
      await removeFriend(user.id);
    } else {
      // Send friend request
      await sendFriendRequest(user.id);
    }
  };

  const isCurrentUser = currentUser && user && currentUser.id === user.id;
  const isFriend = friends.some(friend => friend.id === user?.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">User not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground">{capitalizeFirstLetter(user.name)}'s Profile</h1>
          <p className="text-muted-foreground mt-1">View profile and connect.</p>
        </div>
        {!isCurrentUser && currentUser && (
          <Button
            onClick={handleFriendAction}
            className="rounded-xl"
            variant={isFriend ? "outline" : "default"}
          >
            {isFriend ? (
              <>
                <UserCheck className="h-4 w-4 mr-2" />
                Linked Up
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Link-Up
              </>
            )}
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Basic Information */}
        <Card className="rounded-2xl shadow-sm border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Profile details.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Full Name</Label>
              <p className="text-sm">{capitalizeFirstLetter(user.name)}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{user.email}</p>
              </div>
            </div>
            {user.gmailAddress && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Gmail</Label>
                <p className="text-sm">{user.gmailAddress}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card className="rounded-2xl shadow-sm border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>Connect on other platforms.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.githubLink && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">GitHub</Label>
                <div className="flex items-center gap-2">
                  <Github className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={user.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {user.githubLink}
                  </a>
                </div>
              </div>
            )}
            {user.linkedinLink && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">LinkedIn</Label>
                <div className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={user.linkedinLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {user.linkedinLink}
                  </a>
                </div>
              </div>
            )}
            {(!user.githubLink && !user.linkedinLink) && (
              <p className="text-sm text-muted-foreground">No social links provided.</p>
            )}
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="rounded-2xl shadow-sm border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-xl text-green-500">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div>
                <CardTitle>Skills</CardTitle>
                <CardDescription>Technical expertise.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {user.skills && user.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No skills specified.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Link Up Content - Only show if they are linked up */}
      {isFriend && (
        <>
          <Separator />
          <div>
            <h2 className="text-3xl font-display font-bold text-foreground">Shared Content</h2>
            <p className="text-muted-foreground mt-1">Posts and notes shared with link ups.</p>
          </div>

          <Card className="rounded-2xl shadow-sm border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-xl text-purple-500">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>{capitalizeFirstLetter(user.name)}'s Shared Content</CardTitle>
                  <CardDescription>Link up-only posts and notes.</CardDescription>
                </div>
              </div>
            </CardHeader>
            {friendsContentLoading ? (
              <CardContent>
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="ml-2 text-muted-foreground">Loading content...</span>
                </div>
              </CardContent>
            ) : (friendsPosts.filter(p => p.user_id === user.id).length > 0 || friendsNotes.filter(n => n.user_id === user.id).length > 0) ? (
              <CardContent className="space-y-6">
                {/* User's Posts */}
                {friendsPosts.filter(p => p.user_id === user.id).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Recent Posts</h3>
                    <div className="space-y-4">
                      {friendsPosts.filter(p => p.user_id === user.id).slice(0, 5).map((post) => (
                        <div key={post.id} className="p-4 border rounded-xl">
                          <h4 className="font-medium mb-2">{post.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-3">{post.content}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(post.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* User's Notes */}
                {friendsNotes.filter(n => n.user_id === user.id).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Recent Notes</h3>
                    <div className="space-y-4">
                      {friendsNotes.filter(n => n.user_id === user.id).slice(0, 5).map((note) => (
                        <div key={note.id} className="p-4 border rounded-xl">
                          <h4 className="font-medium mb-2">{note.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-3">{note.content}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(note.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            ) : (
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  No shared content yet.
                </p>
              </CardContent>
            )}
          </Card>
        </>
      )}
    </div>
  );
}