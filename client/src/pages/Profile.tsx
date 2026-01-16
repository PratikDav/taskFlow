import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Github, Linkedin, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  gmailAddress?: string;
  githubLink?: string;
  linkedinLink?: string;
}

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    gmailAddress: "",
    githubLink: "",
    linkedinLink: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch("/api/me", { credentials: "include" });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    console.log("Starting profile update, formData:", formData);
    setUpdating(true);
    try {
      const updateData: any = {
        name: formData.name,
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
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-4xl font-display font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your personal information and account settings.</p>
      </div>

      <form onSubmit={handleUpdateProfile} className="space-y-6">
        {/* Basic Information */}
        <Card className="rounded-2xl shadow-sm border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Update your personal details.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  className="rounded-xl"
                  disabled
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password Section */}
        <Card className="rounded-2xl shadow-sm border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-xl text-red-600">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                  className="rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange("newPassword", e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media Links */}
        <Card className="rounded-2xl shadow-sm border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>Add your social media profiles.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gmailAddress">Gmail Address</Label>
              <Input
                id="gmailAddress"
                type="text"
                value={formData.gmailAddress}
                onChange={(e) => handleInputChange("gmailAddress", e.target.value)}
                className="rounded-xl"
                placeholder="yourname@gmail.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="githubLink">GitHub Profile</Label>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="githubLink"
                  value={formData.githubLink}
                  onChange={(e) => handleInputChange("githubLink", e.target.value)}
                  className="rounded-xl pl-10"
                  placeholder="https://github.com/username"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedinLink">LinkedIn Profile</Label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="linkedinLink"
                  value={formData.linkedinLink}
                  onChange={(e) => handleInputChange("linkedinLink", e.target.value)}
                  className="rounded-xl pl-10"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={updating} className="rounded-xl">
            {updating ? "Updating..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}