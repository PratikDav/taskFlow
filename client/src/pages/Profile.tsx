import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Github, Linkedin, Lock, Eye, EyeOff, Users, UserPlus, UserCheck, UserX, Edit, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFriends } from "@/hooks/use-friends";
import { useFriendsContent } from "@/hooks/use-friends-content";
import { Badge } from "@/components/ui/badge";
import { FloatingSkillSlots } from "@/components/FloatingSkillSlots";
import { type Skill } from "@/lib/skills";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  designation?: string;
  skills?: Skill[];
  gmailAddress?: string;
  githubLink?: string;
  linkedinLink?: string;
}

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isEditingDesignation, setIsEditingDesignation] = useState(false);
  const [userSkills, setUserSkills] = useState<Skill[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    designation: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    gmailAddress: "",
    githubLink: "",
    linkedinLink: "",
  });
  const { toast } = useToast();
  const { friends, friendRequests, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend } = useFriends();
  const { posts: friendsPosts, notes: friendsNotes, loading: friendsContentLoading } = useFriendsContent();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch("/api/me", { credentials: "include" });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        setUserSkills(userData.skills || []);
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          designation: userData.designation || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
          gmailAddress: userData.gmailAddress || "",
          githubLink: userData.githubLink || "",
          linkedinLink: userData.linkedinLink || "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDesignationEdit = () => {
    setIsEditingDesignation(true);
  };

  const handleDesignationSave = async () => {
    if (!user) return;

    setUpdating(true);
    try {
      const res = await fetch("/api/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ designation: formData.designation }),
      });

      if (res.ok) {
        setUser(prev => prev ? { ...prev, designation: formData.designation } : null);
        setIsEditingDesignation(false);
        toast({
          title: "Success",
          description: "Designation updated successfully",
        });
      } else {
        throw new Error("Failed to update designation");
      }
    } catch (err) {
      console.error("Failed to update designation:", err);
      toast({
        title: "Error",
        description: "Failed to update designation",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDesignationCancel = () => {
    setFormData(prev => ({ ...prev, designation: user?.designation || "" }));
    setIsEditingDesignation(false);
  };

  const handleSkillsUpdate = async (skills: Skill[]) => {
    if (!user) return;

    try {
      const res = await fetch("/api/me/skills", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ skills: skills.map(skill => skill.id) }),
      });

      if (res.ok) {
        setUserSkills(skills);
        setUser(prev => prev ? { ...prev, skills } : null);
        toast({
          title: "Success",
          description: "Skills updated successfully",
        });
      } else {
        throw new Error("Failed to update skills");
      }
    } catch (err) {
      console.error("Failed to update skills:", err);
      toast({
        title: "Error",
        description: "Failed to update skills",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    console.log("Starting profile update, formData:", formData);
    setUpdating(true);
    try {
      const updateData: any = {
        name: formData.name,
        designation: formData.designation,
        gmailAddress: formData.gmailAddress,
        githubLink: formData.githubLink,
        linkedinLink: formData.linkedinLink,
      };

      console.log("Sending updateData:", updateData);

      // Only include password if user wants to change it
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          toast({
            title: "Error",
            description: "New passwords don't match",
            variant: "destructive",
          });
          return;
        }
        if (!formData.currentPassword) {
          toast({
            title: "Error",
            description: "Current password is required to change password",
            variant: "destructive",
          });
          return;
        }
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const res = await fetch("/api/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        fetchUserProfile(); // Refresh data
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        const error = await res.json();
        console.error("Profile update failed:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

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
            <p className="text-center text-muted-foreground">Please log in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-[90vh] bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header Section */}
        <div className="text-center mb-12">
          {/* Cover Section - Simple line evenly divided */}
          <div className="relative mb-8">
            <div className="flex items-center justify-center">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-slate-400"></div>
              <div className="mx-4"></div>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent via-slate-300 to-slate-400"></div>
            </div>
          </div>

          {/* Profile Image with Floating Skill Slots */}
          <div className="relative mb-6 flex items-center justify-center h-80">
            <FloatingSkillSlots
              userSkills={userSkills}
              onUpdateSkills={handleSkillsUpdate}
              maxSlots={8}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-xl border-4 border-white relative z-10">
                <User className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>

          {/* User Name */}
          <h1 className="text-3xl font-bold text-slate-800 mb-2">{user.name}</h1>

          {/* Designation */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {isEditingDesignation ? (
              <div className="flex items-center gap-2">
                <Input
                  value={formData.designation}
                  onChange={(e) => handleInputChange("designation", e.target.value)}
                  placeholder="Enter your designation"
                  className="w-64 text-center text-sm font-medium border-slate-300 focus:border-primary"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleDesignationSave();
                    if (e.key === "Escape") handleDesignationCancel();
                  }}
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={handleDesignationSave}
                  disabled={updating}
                  className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleDesignationCancel}
                  disabled={updating}
                  variant="outline"
                  className="h-8 w-8 p-0 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full cursor-pointer transition-colors ${
                    user.designation
                      ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                  onClick={handleDesignationEdit}
                  title="Click to edit designation"
                >
                  {user.designation || "Add designation"}
                </span>
                <Button
                  size="sm"
                  onClick={handleDesignationEdit}
                  variant="ghost"
                  className="h-6 w-6 p-0 text-slate-500 hover:text-slate-700"
                  title="Edit designation"
                >
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {/* Basic Information Card */}
              <Card className="rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Basic Information</CardTitle>
                      <CardDescription>Update your personal details</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-slate-700">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 h-11"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        className="rounded-xl border-slate-200 bg-slate-50 h-11"
                        disabled
                      />
                      <p className="text-xs text-slate-500">Email cannot be changed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Password Section */}
              <Card className="rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-100 rounded-xl text-red-600">
                      <Lock className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Change Password</CardTitle>
                      <CardDescription>Update your account password</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-sm font-medium text-slate-700">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        value={formData.currentPassword}
                        onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                        className="rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 h-11 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-sm font-medium text-slate-700">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => handleInputChange("newPassword", e.target.value)}
                        className="rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        className="rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 h-11"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media Links */}
              <Card className="rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Social Media Links</CardTitle>
                      <CardDescription>Add your social media profiles</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="gmailAddress" className="text-sm font-medium text-slate-700">Gmail Address</Label>
                    <Input
                      id="gmailAddress"
                      type="text"
                      value={formData.gmailAddress}
                      onChange={(e) => handleInputChange("gmailAddress", e.target.value)}
                      className="rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 h-11"
                      placeholder="yourname@gmail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="githubLink" className="text-sm font-medium text-slate-700">GitHub Profile</Label>
                    <div className="relative">
                      <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                      <Input
                        id="githubLink"
                        value={formData.githubLink}
                        onChange={(e) => handleInputChange("githubLink", e.target.value)}
                        className="rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 h-11 pl-12"
                        placeholder="https://github.com/username"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedinLink" className="text-sm font-medium text-slate-700">LinkedIn Profile</Label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                      <Input
                        id="linkedinLink"
                        value={formData.linkedinLink}
                        onChange={(e) => handleInputChange("linkedinLink", e.target.value)}
                        className="rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 h-11 pl-12"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end pt-6">
                <Button
                  type="submit"
                  disabled={updating}
                  className="rounded-xl px-8 py-3 bg-primary hover:bg-primary/90 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {updating ? "Updating..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>

          {/* Sidebar with Friends and Activity */}
          <div className="space-y-6">
            {/* Friends Section */}
            <Card className="rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-xl text-green-600">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Friends</CardTitle>
                    <CardDescription>{friends.length} connection{friends.length !== 1 ? 's' : ''}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              {friends.length > 0 ? (
                <CardContent className="space-y-3">
                  {friends.slice(0, 5).map((friend) => (
                    <div key={friend.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{friend.name}</p>
                        <p className="text-xs text-slate-500 truncate">{friend.email}</p>
                      </div>
                    </div>
                  ))}
                  {friends.length > 5 && (
                    <p className="text-xs text-slate-500 text-center pt-2">
                      +{friends.length - 5} more friends
                    </p>
                  )}
                </CardContent>
              ) : (
                <CardContent>
                  <p className="text-sm text-slate-500 text-center py-4">
                    No friends yet
                  </p>
                </CardContent>
              )}
            </Card>

            {/* Friend Requests */}
            {friendRequests.length > 0 && (
              <Card className="rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                      <UserPlus className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Friend Requests</CardTitle>
                      <CardDescription>{friendRequests.length} pending</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {friendRequests.slice(0, 3).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{request.name}</p>
                          <p className="text-xs text-slate-500">{request.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={() => acceptFriendRequest(request.id)}
                          className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700"
                        >
                          <UserCheck className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectFriendRequest(request.id)}
                          className="h-7 px-2 text-xs border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <UserX className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            <Card className="rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Friends' Activity</CardTitle>
                    <CardDescription>Recent posts and notes</CardDescription>
                  </div>
                </div>
              </CardHeader>
              {friendsContentLoading ? (
                <CardContent>
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  </div>
                </CardContent>
              ) : (friendsPosts.length > 0 || friendsNotes.length > 0) ? (
                <CardContent className="space-y-4">
                  {friendsPosts.slice(0, 2).map((post) => (
                    <div key={post.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">{post.userName}</Badge>
                      </div>
                      <h4 className="text-sm font-medium text-slate-800 mb-1 line-clamp-1">{post.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2">{post.content}</p>
                    </div>
                  ))}
                  {friendsNotes.slice(0, 2).map((note) => (
                    <div key={note.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">{note.userName}</Badge>
                        {note.folderName && (
                          <Badge variant="outline" className="text-xs">{note.folderName}</Badge>
                        )}
                      </div>
                      <h4 className="text-sm font-medium text-slate-800 mb-1 line-clamp-1">{note.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2">{note.content}</p>
                    </div>
                  ))}
                </CardContent>
              ) : (
                <CardContent>
                  <p className="text-sm text-slate-500 text-center py-4">
                    No recent activity
                  </p>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}