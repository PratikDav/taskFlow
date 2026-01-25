import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { User, Mail, Github, Linkedin, UserPlus, Users, UserCheck, Calendar, MapPin, Briefcase, Award, MessageCircle, Heart, Bookmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFriends } from "@/hooks/use-friends";
import { useFriendsContent } from "@/hooks/use-friends-content";
import { capitalizeFirstLetter } from "@/lib/utils";
import { FloatingSkillSlots } from "@/components/FloatingSkillSlots";
import { type Skill } from "@/lib/skills";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  designation?: string;
  skills?: Skill[];
  avatar?: string;
  avatar_original?: string;
  avatar_crop?: string;
  gmailAddress?: string;
  githubLink?: string;
  linkedinLink?: string;
  created_at: string;
}

export default function UserProfile() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [userSkills, setUserSkills] = useState<Skill[]>([]);
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
        // Set skills if available
        if (userData.skills) {
          try {
            // Fetch full skill objects and map skill ids to skill details
            const skillsRes = await fetch('/api/skills');
            if (skillsRes.ok) {
              const allSkills = await skillsRes.json();
              // skills from API may be array of ids or strings
              const mapped: Skill[] = (userData.skills || []).map((sid: any) => {
                // skill id might be numeric or string; try to match by id or by id string
                const found = allSkills.find((s: any) => String(s.id) === String(sid) || s.id === sid || s.name === sid);
                return found ? found as Skill : ({ id: String(sid), name: String(sid), color: '#9CA3AF' } as Skill);
              });
              setUserSkills(mapped);
            } else {
              // fallback: set raw ids as names
              setUserSkills((userData.skills || []).map((s: any) => ({ id: String(s), name: String(s), color: '#9CA3AF' } as Skill)));
            }
          } catch (err) {
            console.error('Failed to map user skills:', err);
            setUserSkills((userData.skills || []).map((s: any) => ({ id: String(s), name: String(s), color: '#9CA3AF' } as Skill)));
          }
        }
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <p className="text-center text-slate-600">User not found.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative mb-8">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 rounded-3xl"></div>

          <Card className="relative shadow-2xl border-0 bg-white/90 backdrop-blur-sm overflow-visible">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-400/10 to-purple-400/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-400/10 to-orange-400/10 rounded-full translate-y-24 -translate-x-24"></div>

            <CardContent className="p-8 relative z-10">
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                {/* Profile Image with Floating Skill Slots */}
                <div className="relative flex-shrink-0">
                  <div className="relative w-40 h-40 mx-auto lg:mx-0">
                    {/* Overlay skill slots absolutely around the avatar so they're anchored to it */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-80 h-80 flex items-center justify-center">
                        <FloatingSkillSlots
                          userSkills={userSkills}
                          onUpdateSkills={() => {}} // Read-only for user profile display
                          maxSlots={6}
                          shiftLeft={true}
                          readOnly={true}
                        />
                      </div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'translateX(10px)' }}>
                      <div className="w-32 h-32 bg-gradient-to-br from-white to-slate-100 rounded-full shadow-2xl border-4 border-white overflow-hidden">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"><svg class="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>';
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <User className="h-16 w-16 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 lg:left-4 lg:translate-x-0">
                    <div className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                      {isFriend ? "Linked Up" : "Available"}
                    </div>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-4">
                    {/* Username and Details Section */}
                    <div className="flex-1">
                      <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2 lg:ml-24">
                        {capitalizeFirstLetter(user.name)}
                      </h1>
                      {user.designation && (
                      <p className="text-base text-slate-600 font-medium flex items-center justify-center lg:justify-start gap-2 lg:ml-24">
                          <Briefcase className="h-5 w-5 text-blue-600" />
                          {user.designation}
                        </p>
                      )}
                      <p className="text-slate-500 mt-1 flex items-center justify-center lg:justify-start gap-2 lg:ml-24">
                        <Calendar className="h-4 w-4" />
                        Joined {new Date(user.created_at).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>

                    {/* Social Links Section */}
                    <div className="flex flex-col gap-2 justify-center lg:justify-start lg:mr-24">
                      {user.gmailAddress && (
                        <a
                          href={`mailto:${user.gmailAddress}`}
                          className="flex items-center gap-2 px-3 py-2 bg-white/80 hover:bg-white border border-slate-200 hover:border-slate-300 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group"
                        >
                          <Mail className="h-4 w-4 text-red-500 group-hover:text-red-600" />
                          <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                            {user.gmailAddress}
                          </span>
                        </a>
                      )}
                      {user.githubLink && (
                        <a
                          href={user.githubLink.startsWith('http') ? user.githubLink : `https://github.com/${user.githubLink}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-white/80 hover:bg-white border border-slate-200 hover:border-slate-300 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group"
                        >
                          <Github className="h-4 w-4 text-slate-700 group-hover:text-slate-900" />
                          <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                            {user.githubLink.replace(/^https?:\/\/(www\.)?github\.com\//, '')}
                          </span>
                        </a>
                      )}
                      {user.linkedinLink && (
                        <a
                          href={user.linkedinLink.startsWith('http') ? user.linkedinLink : `https://linkedin.com/in/${user.linkedinLink}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-white/80 hover:bg-white border border-slate-200 hover:border-slate-300 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group"
                        >
                          <Linkedin className="h-4 w-4 text-blue-600 group-hover:text-blue-700" />
                          <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                            {user.linkedinLink.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}
                          </span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 justify-center lg:justify-start lg:ml-24">
                    {!isCurrentUser && (
                      <Button
                        onClick={handleFriendAction}
                        size="lg"
                        className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        variant={isFriend ? "outline" : "default"}
                      >
                        {isFriend ? (
                          <>
                            <UserCheck className="h-5 w-5 mr-2 text-white" />
                            <span className="text-white">Linked Up</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-5 w-5 mr-2" />
                            Link-Up
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - About & Skills */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white shadow-lg">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">About</CardTitle>
                    <CardDescription>Professional background and details</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-600" />
                        Email
                      </Label>
                      <p className="text-slate-600 mt-1">{user.email}</p>
                    </div>

                    {user.gmailAddress && (
                      <div>
                        <Label className="text-sm font-semibold text-slate-700">Gmail</Label>
                        <p className="text-slate-600 mt-1">{user.gmailAddress}</p>
                      </div>
                    )}

                    <div>
                      <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Award className="h-4 w-4 text-purple-600" />
                        Role
                      </Label>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="mt-1">
                        {user.role === 'admin' ? 'Administrator' : 'Member'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {user.githubLink && (
                      <div>
                        <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <Github className="h-4 w-4 text-slate-700" />
                          GitHub
                        </Label>
                        <a
                          href={user.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 hover:underline mt-1 block transition-colors"
                        >
                          {user.githubLink}
                        </a>
                      </div>
                    )}

                    {user.linkedinLink && (
                      <div>
                        <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <Linkedin className="h-4 w-4 text-blue-600" />
                          LinkedIn
                        </Label>
                        <a
                          href={user.linkedinLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 hover:underline mt-1 block transition-colors"
                        >
                          {user.linkedinLink}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills section intentionally removed per design request */}

            {/* Recent Activity - Show user's recent posts to everyone */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">Recent Activity</CardTitle>
                <CardDescription>Latest posts and updates</CardDescription>
              </CardHeader>
              <CardContent>
                {friendsContentLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Recent Posts */}
                    {friendsPosts.filter(p => p.user_id === user.id).slice(0, 3).map((post) => (
                      <div key={post.id} className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition-all duration-300 bg-gradient-to-r from-slate-50 to-blue-50/30">
                        <h4 className="font-semibold text-slate-800 mb-2 line-clamp-1">{post.title}</h4>
                        <p className="text-sm text-slate-600 line-clamp-2 mb-2">{post.content.replace(/<[^>]*>/g, '')}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}

                    {/* Recent Notes */}
                    {friendsNotes.filter(n => n.user_id === user.id).slice(0, 2).map((note) => (
                      <div key={note.id} className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition-all duration-300 bg-gradient-to-r from-slate-50 to-purple-50/30">
                        <h4 className="font-semibold text-slate-800 mb-2 line-clamp-1">{note.title}</h4>
                        <p className="text-sm text-slate-600 line-clamp-2 mb-2">{note.content.replace(/<[^>]*>/g, '')}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(note.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}

                    {(friendsPosts.filter(p => p.user_id === user.id).length === 0 &&
                      friendsNotes.filter(n => n.user_id === user.id).length === 0) && (
                      <div className="text-center py-8">
                        <MessageCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No recent activity.</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Activity & Stats */}
          <div className="space-y-8">
            {/* Quick Stats */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">Activity Overview</CardTitle>
                <CardDescription>Recent engagement and stats</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">Connections</p>
                      <p className="text-2xl font-bold text-blue-600">{friends.length}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <MessageCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">Posts</p>
                      <p className="text-2xl font-bold text-green-600">
                        {friendsPosts.filter(p => p.user_id === user.id).length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes stat removed per request */}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}