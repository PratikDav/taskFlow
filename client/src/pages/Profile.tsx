import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
<<<<<<< HEAD
import { User, Mail, Github, Linkedin, Lock, Eye, EyeOff, Users, UserPlus, UserCheck, UserX, Edit, Check, X, Bookmark } from "lucide-react";
=======
import { User, Mail, Github, Linkedin, Lock, Eye, EyeOff, Users, UserPlus, UserCheck, UserX, Edit, Check, X } from "lucide-react";
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
import { useToast } from "@/hooks/use-toast";
import { useFriends } from "@/hooks/use-friends";
import { useFriendsContent } from "@/hooks/use-friends-content";
import { Badge } from "@/components/ui/badge";
import { FloatingSkillSlots } from "@/components/FloatingSkillSlots";
import { type Skill } from "@/lib/skills";
<<<<<<< HEAD
import { type Share } from "@shared/schema";
import { capitalizeFirstLetter } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
=======
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f

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
  avatar?: string;
  avatar_original?: string;
  avatar_crop?: string;
}

export default function Profile() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [cropRect, setCropRect] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [isDragMode, setIsDragMode] = useState(true);
  const [isMoving, setIsMoving] = useState(false);
  const startMoveRef = React.useRef<{ x: number; y: number } | null>(null);
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
<<<<<<< HEAD
  const [sharedItems, setSharedItems] = useState<Share[]>([]);
  const [sharedFolders, setSharedFolders] = useState<any[]>([]);
  const [sharedNotes, setSharedNotes] = useState<any[]>([]);
  const [sharedByMe, setSharedByMe] = useState<any[]>([]);
  const [sharedWithMe, setSharedWithMe] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);

  useEffect(() => {
    if (isDragMode) {
      setCropRect({ x: 0, y: 0, w: 0, h: 0 });
    } else {
      // Set default box for box mode
      setCropRect({ x: 50, y: 50, w: 100, h: 100 });
    }
  }, [isDragMode]);
=======
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f

  useEffect(() => {
    fetchUserProfile();
    // Load shares
    const loadShares = async () => {
      try {
        const [res1, res2, res3] = await Promise.all([
          fetch('/api/shares', { credentials: 'include' }),
          fetch('/api/shares/shared-with-me', { credentials: 'include' }),
          fetch('/api/saved-posts', { credentials: 'include' })
        ]);
        if (res1.ok) {
          const data = await res1.json();
          setSharedByMe(data);
        }
        if (res2.ok) {
          const data2 = await res2.json();
          setSharedWithMe(data2);
        }
        if (res3.ok) {
          const data3 = await res3.json();
          setSavedPosts(data3);
        }
      } catch (err) {
        console.error('Failed to load shares and saved posts:', err);
      }
    };
    loadShares();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch("/api/me", { credentials: "include" });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        setUserSkills(userData.skills || []);
<<<<<<< HEAD
        // set avatar if returned
        if (userData.avatar) {
          setAvatarPreview(userData.avatar);
        }
=======
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
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

  // Trigger file input when profile circle clicked
  const handleAvatarClick = () => {
    const el = document.getElementById('avatar-input') as HTMLInputElement | null;
    el?.click();
  };

  const handleEditAvatar = async () => {
    if (user?.avatar_original) {
      try {
        const res = await fetch(user.avatar_original);
        const blob = await res.blob();
        const file = new File([blob], 'original.jpg', { type: blob.type });
        setAvatarFile(file);
        setAvatarPreview(user.avatar_original);
        setShowAvatarModal(true);
      } catch (err) {
        console.error('Failed to load original image:', err);
        toast({ title: 'Error', description: 'Failed to load image for editing', variant: 'destructive' });
      }
    } else if (user?.avatar) {
      try {
        const res = await fetch(user.avatar);
        const blob = await res.blob();
        const file = new File([blob], 'avatar.jpg', { type: blob.type });
        setAvatarFile(file);
        setAvatarPreview(user.avatar);
        setShowAvatarModal(true);
      } catch (err) {
        console.error('Failed to load avatar image:', err);
        toast({ title: 'Error', description: 'Failed to load image for editing', variant: 'destructive' });
      }
    } else {
      // open file selector to pick a new one
      handleAvatarClick();
    }
  };

  const handleAvatarSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
    setShowAvatarModal(true);
  };

  // Draw crop from cropRect on original image and compress at original resolution
  const confirmAvatarCropAndUpload = async () => {
    if (!avatarFile) return;

    // If no crop selected or invalid, use the whole image
    let effectiveCropRect = cropRect;
    if (!effectiveCropRect || effectiveCropRect.w <= 0 || effectiveCropRect.h <= 0) {
      const previewImg = document.getElementById('avatar-preview-img') as HTMLImageElement | null;
      if (previewImg) {
        const rect = previewImg.getBoundingClientRect();
        effectiveCropRect = { x: 0, y: 0, w: rect.width, h: rect.height };
      } else {
        return;
      }
    }

    try {
      // Load original image
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = URL.createObjectURL(avatarFile);
      });

      // Compute scale between displayed preview and original image
      // Our cropRect is based on displayed preview dimensions, so convert to original coords
      const previewImg = document.getElementById('avatar-preview-img') as HTMLImageElement | null;
      if (!previewImg) return;
      const dispW = previewImg.naturalWidth || previewImg.width;
      const dispH = previewImg.naturalHeight || previewImg.height;

      // We used object URL; display may be scaled by CSS. Use bounding client rect to get displayed dims
      const rect = previewImg.getBoundingClientRect();
      const displayedW = rect.width;
      const displayedH = rect.height;

      const scaleX = img.naturalWidth / displayedW;
      const scaleY = img.naturalHeight / displayedH;

      const sx = Math.round(effectiveCropRect.x * scaleX);
      const sy = Math.round(effectiveCropRect.y * scaleY);
      const sw = Math.round(effectiveCropRect.w * scaleX);
      const sh = Math.round(effectiveCropRect.h * scaleY);

      // Create canvas at crop size (preserve resolution of crop area)
      const outCanvas = document.createElement('canvas');
      outCanvas.width = sw;
      outCanvas.height = sh;
      const ctx = outCanvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

      // Resize if too large (max 512px on longest side) to reduce file size
      let finalCanvas = outCanvas;
      const maxSize = 512;
      if (sw > maxSize || sh > maxSize) {
        const resizeCanvas = document.createElement('canvas');
        const resizeCtx = resizeCanvas.getContext('2d');
        if (!resizeCtx) throw new Error('Canvas not supported');

        let newW = sw;
        let newH = sh;
        if (sw > sh) {
          if (sw > maxSize) {
            newH = (sh * maxSize) / sw;
            newW = maxSize;
          }
        } else {
          if (sh > maxSize) {
            newW = (sw * maxSize) / sh;
            newH = maxSize;
          }
        }

        resizeCanvas.width = newW;
        resizeCanvas.height = newH;
        resizeCtx.drawImage(outCanvas, 0, 0, sw, sh, 0, 0, newW, newH);
        finalCanvas = resizeCanvas;
      }

      // Convert to blob with quality compression
      const blob: Blob | null = await new Promise(resolve => finalCanvas.toBlob(resolve as any, 'image/jpeg', 0.7));
      if (!blob) throw new Error('Failed to compress image');

      const fd = new FormData();
      fd.append('avatar', blob, avatarFile.name.replace(/\.[^.]+$/, '.jpg'));
      // also send original so user can re-crop later
      fd.append('original', avatarFile, avatarFile.name);
      fd.append('crop', JSON.stringify(cropRect));

      const res = await fetch('/api/me/avatar', {
        method: 'POST',
        body: fd,
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      // Update UI
      setUser(prev => prev ? { ...prev, avatar: data.avatarUrl, avatar_original: data.avatarOriginal, avatar_crop: data.crop } : prev);
      setAvatarPreview(data.avatarUrl || data.avatarOriginal);
      setShowAvatarModal(false);
      setAvatarFile(null);
      toast({ title: 'Success', description: 'Profile picture updated' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to upload avatar', variant: 'destructive' });
    }
  };

  // Simple crop drawing handlers for preview image
  const startCropRef = React.useRef<{ x: number; y: number } | null>(null);
  const previewContainerRef = React.useRef<HTMLDivElement | null>(null);
  const handlePreviewMouseDown = (e: React.MouseEvent) => {
    if (!isDragMode) return; // Only for drag mode
    const el = previewContainerRef.current;
    if (!el) return;
    const previewImg = document.getElementById('avatar-preview-img') as HTMLImageElement | null;
    if (!previewImg) return;
    const imgRect = previewImg.getBoundingClientRect();
    const x = e.clientX - imgRect.left;
    const y = e.clientY - imgRect.top;
    startCropRef.current = { x, y };
    setCropRect({ x, y, w: 0, h: 0 }); // Start with no size
  };
  const handlePreviewMouseMove = (e: React.MouseEvent) => {
    if (isMoving && startMoveRef.current) {
      const previewImg = document.getElementById('avatar-preview-img') as HTMLImageElement | null;
      if (!previewImg) return;
      const imgRect = previewImg.getBoundingClientRect();
      const containerRect = previewContainerRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      let newX = e.clientX - startMoveRef.current.x;
      let newY = e.clientY - startMoveRef.current.y;
      // Constrain to img bounds
      newX = Math.max(imgRect.left - containerRect.left, Math.min(newX, imgRect.right - containerRect.left - cropRect.w));
      newY = Math.max(imgRect.top - containerRect.top, Math.min(newY, imgRect.bottom - containerRect.top - cropRect.h));
      setCropRect({ ...cropRect, x: newX, y: newY });
    } else if (startCropRef.current && isDragMode) {
      const previewImg = document.getElementById('avatar-preview-img') as HTMLImageElement | null;
      if (!previewImg) return;
      const imgRect = previewImg.getBoundingClientRect();
      const x = e.clientX - imgRect.left;
      const y = e.clientY - imgRect.top;
      const sx = startCropRef.current.x;
      const sy = startCropRef.current.y;
      const minX = Math.min(sx, x);
      const minY = Math.min(sy, y);
      const w = Math.abs(x - sx);
      const h = Math.abs(y - sy);
      setCropRect({ x: minX, y: minY, w, h });
    }
  };
  const handlePreviewMouseUp = () => {
    startCropRef.current = null;
    setIsMoving(false);
    startMoveRef.current = null;
  };

  const handlePreviewTouchStart = (e: React.TouchEvent) => {
    if (!isDragMode) return; // Only for drag mode
    const el = previewContainerRef.current;
    if (!el) return;
    const previewImg = document.getElementById('avatar-preview-img') as HTMLImageElement | null;
    if (!previewImg) return;
    const touch = e.touches[0];
    const imgRect = previewImg.getBoundingClientRect();
    const x = touch.clientX - imgRect.left;
    const y = touch.clientY - imgRect.top;
    startCropRef.current = { x, y };
    setCropRect({ x, y, w: 0, h: 0 }); // Start with no size
  };
  const handlePreviewTouchMove = (e: React.TouchEvent) => {
    if (!isDragMode && !isMoving) return; // Only for drag mode or when moving in box mode
    const el = previewContainerRef.current;
    if (!el) return;
    const previewImg = document.getElementById('avatar-preview-img') as HTMLImageElement | null;
    if (!previewImg) return;
    const touch = e.touches[0];
    const imgRect = previewImg.getBoundingClientRect();
    const x = touch.clientX - imgRect.left;
    const y = touch.clientY - imgRect.top;
    if (isDragMode) {
      // In drag mode, update the rectangle size
      const start = startCropRef.current;
      if (!start) return;
      const w = Math.abs(x - start.x);
      const h = Math.abs(y - start.y);
      const newX = Math.min(start.x, x);
      const newY = Math.min(start.y, y);
      setCropRect({ x: newX, y: newY, w, h });
    } else if (isMoving) {
      // In box mode, move the rectangle
      const start = startCropRef.current;
      if (!start) return;
      const dx = x - start.x;
      const dy = y - start.y;
      const newX = Math.max(0, Math.min(cropRect.x + dx, imgRect.width - cropRect.w));
      const newY = Math.max(0, Math.min(cropRect.y + dy, imgRect.height - cropRect.h));
      setCropRect({ ...cropRect, x: newX, y: newY });
    }
  };
  const handlePreviewTouchEnd = () => {
    startCropRef.current = null;
    setIsMoving(false);
    startMoveRef.current = null;
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
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> d71d32f177fe4c2b8ae1b91763d41c1b8c70d04b
    console.log('handleSkillsUpdate called with skills:', skills);
    if (!user) return;

    try {
      console.log('Sending skills to API:', skills.map(skill => skill.id));
<<<<<<< HEAD
=======
=======
    if (!user) return;

    try {
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
>>>>>>> d71d32f177fe4c2b8ae1b91763d41c1b8c70d04b
      const res = await fetch("/api/me/skills", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ skills: skills.map(skill => skill.id) }),
      });

      if (res.ok) {
<<<<<<< HEAD
        console.log('API call successful, updating state');
=======
<<<<<<< HEAD
        console.log('API call successful, updating state');
=======
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
>>>>>>> d71d32f177fe4c2b8ae1b91763d41c1b8c70d04b
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
            <p className="text-center text-muted-foreground">{t('profile.login_required')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className="h-[90vh] bg-slate-50">
=======
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
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
<<<<<<< HEAD
          <div className="relative mb-4 flex items-center justify-center h-40">
=======
          <div className="relative mb-6">
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
            <FloatingSkillSlots
              userSkills={userSkills}
              onUpdateSkills={handleSkillsUpdate}
              maxSlots={8}
            />
<<<<<<< HEAD
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div onClick={handleAvatarClick} className="w-32 h-32 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-xl border-4 border-white relative z-10 cursor-pointer overflow-hidden">
                  {user?.avatar || avatarPreview ? (
                    <img id="profile-avatar-img" src={avatarPreview || user?.avatar} alt="avatar" className="w-full h-full object-cover rounded-full" onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector('.fallback-icon')) {
                        const fallback = document.createElement('div');
                        fallback.className = 'fallback-icon w-full h-full rounded-full bg-white/20 flex items-center justify-center';
                        fallback.innerHTML = '<svg class="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
                        parent.appendChild(fallback);
                      }
                    }} />
                  ) : (
                    <User className="h-16 w-16 text-white" />
                  )}
                </div>

                {/* Edit overlay button */}
                <button onClick={handleEditAvatar} title="Edit avatar" className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                </button>
              </div>
              <input id="avatar-input" type="file" accept="image/*" onChange={handleAvatarSelected} className="hidden" />
            </div>
          </div>

          {/* User Name */}
          <h1 className="text-3xl font-bold text-slate-800 mb-2">{capitalizeFirstLetter(user.name)}</h1>

          {/* Avatar crop modal */}
          {showAvatarModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white rounded p-4 w-[90vw] max-w-2xl">
                <h3 className="font-semibold mb-2">{t('profile.crop_picture')}</h3>              <div className="mb-2">
                <button onClick={() => setIsDragMode(!isDragMode)} className="btn btn-sm">
                  Mode: {isDragMode ? t('profile.drag_select') : t('profile.box_select')}
                </button>
              </div>                <div ref={previewContainerRef} onMouseDown={handlePreviewMouseDown} onMouseMove={handlePreviewMouseMove} onMouseUp={handlePreviewMouseUp} onTouchStart={handlePreviewTouchStart} onTouchMove={handlePreviewTouchMove} onTouchEnd={handlePreviewTouchEnd} className="relative bg-slate-100 flex items-center justify-center" style={{height: 360}}>
                  {avatarPreview && (
                    <img id="avatar-preview-img" src={avatarPreview} alt="preview" className="max-h-[340px] object-contain" />
                  )}
                  {cropRect.w > 0 && cropRect.h > 0 && (
                    <div 
                      style={{ left: cropRect.x, top: cropRect.y, width: Math.max(cropRect.w, 10), height: Math.max(cropRect.h, 10) }}
                      className={`absolute border-2 border-red-500 bg-red-500/20 ${isDragMode ? 'pointer-events-none' : 'cursor-move'}`}
                      onMouseDown={(e) => {
                        if (!isDragMode) {
                          e.stopPropagation();
                          const containerRect = previewContainerRef.current?.getBoundingClientRect();
                          if (containerRect) {
                            startMoveRef.current = { x: e.clientX - cropRect.x, y: e.clientY - cropRect.y };
                            setIsMoving(true);
                          }
                        }
                      }}
                      onTouchStart={(e) => {
                        if (!isDragMode) {
                          e.stopPropagation();
                          const containerRect = previewContainerRef.current?.getBoundingClientRect();
                          if (containerRect) {
                            const touch = e.touches[0];
                            startMoveRef.current = { x: touch.clientX - cropRect.x, y: touch.clientY - cropRect.y };
                            setIsMoving(true);
                          }
                        }
                      }}
                    />
                  )}
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <button onClick={() => { setShowAvatarModal(false); setAvatarFile(null); }} className="btn">Cancel</button>
                  <button onClick={confirmAvatarCropAndUpload} className="btn btn-primary">Save</button>
                </div>
              </div>
            </div>
          )}

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
=======
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-xl border-4 border-white relative z-10">
              <User className="h-16 w-16 text-white" />
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
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
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
<<<<<<< HEAD
                  {user.designation || t('profile.add_designation')}
=======
                  {user.designation || "Add designation"}
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
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
<<<<<<< HEAD
                      <CardTitle className="text-xl">{t('profile.basic_info')}</CardTitle>
=======
                      <CardTitle className="text-xl">Basic Information</CardTitle>
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
                      <CardDescription>Update your personal details</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
<<<<<<< HEAD
                      <Label htmlFor="name" className="text-sm font-medium text-slate-700">{t('profile.name')}</Label>
=======
                      <Label htmlFor="name" className="text-sm font-medium text-slate-700">Full Name</Label>
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 h-11"
                        required
                      />
                    </div>
                    <div className="space-y-2">
<<<<<<< HEAD
                      <Label htmlFor="email" className="text-sm font-medium text-slate-700">{t('profile.email')}</Label>
=======
                      <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</Label>
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
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
<<<<<<< HEAD
                      <CardTitle className="text-xl">{t('profile.change_password')}</CardTitle>
=======
                      <CardTitle className="text-xl">Change Password</CardTitle>
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
                      <CardDescription>Update your account password</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
<<<<<<< HEAD
                    <Label htmlFor="currentPassword" className="text-sm font-medium text-slate-700">{t('profile.current_password')}</Label>
=======
                    <Label htmlFor="currentPassword" className="text-sm font-medium text-slate-700">Current Password</Label>
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
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
<<<<<<< HEAD
                      <Label htmlFor="newPassword" className="text-sm font-medium text-slate-700">{t('profile.new_password')}</Label>
=======
                      <Label htmlFor="newPassword" className="text-sm font-medium text-slate-700">New Password</Label>
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
                      <Input
                        id="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => handleInputChange("newPassword", e.target.value)}
                        className="rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 h-11"
                      />
                    </div>
                    <div className="space-y-2">
<<<<<<< HEAD
                      <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">{t('profile.confirm_password')}</Label>
=======
                      <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">Confirm New Password</Label>
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
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
<<<<<<< HEAD
                      <CardTitle className="text-xl">{t('profile.social_links')}</CardTitle>
=======
                      <CardTitle className="text-xl">Social Media Links</CardTitle>
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
                      <CardDescription>Add your social media profiles</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
<<<<<<< HEAD
                    <Label htmlFor="gmailAddress" className="text-sm font-medium text-slate-700">{t('profile.gmail_address')}</Label>
=======
                    <Label htmlFor="gmailAddress" className="text-sm font-medium text-slate-700">Gmail Address</Label>
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
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
<<<<<<< HEAD
                    <Label htmlFor="githubLink" className="text-sm font-medium text-slate-700">{t('profile.github_link')}</Label>
=======
                    <Label htmlFor="githubLink" className="text-sm font-medium text-slate-700">GitHub Profile</Label>
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
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
<<<<<<< HEAD
                    <Label htmlFor="linkedinLink" className="text-sm font-medium text-slate-700">{t('profile.linkedin_link')}</Label>
=======
                    <Label htmlFor="linkedinLink" className="text-sm font-medium text-slate-700">LinkedIn Profile</Label>
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
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
<<<<<<< HEAD
                  {updating ? t('profile.updating') : t('profile.save_changes')}
=======
                  {updating ? "Updating..." : "Save Changes"}
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
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
<<<<<<< HEAD
                    <CardTitle className="text-lg">{t('profile.friends')}</CardTitle>
                    <CardDescription>{friends.length} {friends.length !== 1 ? t('profile.connections_plural') : t('profile.connections')}</CardDescription>
=======
                    <CardTitle className="text-lg">Friends</CardTitle>
                    <CardDescription>{friends.length} connection{friends.length !== 1 ? 's' : ''}</CardDescription>
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
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
<<<<<<< HEAD
                        <p className="text-sm font-medium text-slate-800 truncate">{capitalizeFirstLetter(friend.name)}</p>
=======
                        <p className="text-sm font-medium text-slate-800 truncate">{friend.name}</p>
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
                        <p className="text-xs text-slate-500 truncate">{friend.email}</p>
                      </div>
                    </div>
                  ))}
                  {friends.length > 5 && (
                    <p className="text-xs text-slate-500 text-center pt-2">
<<<<<<< HEAD
                      +{friends.length - 5} {t('profile.more_friends')}
=======
                      +{friends.length - 5} more friends
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
                    </p>
                  )}
                </CardContent>
              ) : (
                <CardContent>
                  <p className="text-sm text-slate-500 text-center py-4">
<<<<<<< HEAD
                    {t('profile.no_friends')}
=======
                    No friends yet
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
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
<<<<<<< HEAD
                          <p className="text-sm font-medium text-slate-800">{capitalizeFirstLetter(request.name)}</p>
=======
                          <p className="text-sm font-medium text-slate-800">{request.name}</p>
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
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
<<<<<<< HEAD
                    <CardTitle className="text-lg">{t('profile.friends_activity')}</CardTitle>
                    <CardDescription>{t('profile.recent_posts_notes')}</CardDescription>
=======
                    <CardTitle className="text-lg">Friends' Activity</CardTitle>
                    <CardDescription>Recent posts and notes</CardDescription>
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
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
<<<<<<< HEAD
                    {t('profile.no_activity')}
=======
                    No recent activity
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
                  </p>
                </CardContent>
              )}
            </Card>
<<<<<<< HEAD

            {/* Shared Section */}
            <Card className="rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-yellow-100 rounded-xl text-yellow-600">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Shared</CardTitle>
                    <CardDescription>Folders and notes you shared and those shared with you</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Shared by you</h4>
                  {sharedByMe.length === 0 ? (
                    <p className="text-xs text-slate-500">No items shared yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {sharedByMe.map((s) => (
                        <div key={s.id} className="p-2 rounded-md bg-slate-50 flex items-center justify-between">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{s.item ? (s.item.title || s.item.name) : `${s.item_type} #${s.item_id}`}</p>
                            <p className="text-xs text-slate-500">Shared with: {s.shared_with_user ? capitalizeFirstLetter(s.shared_with_user.name) : s.shared_with_user_id}</p>
                          </div>
                          <div className="text-xs text-slate-400">{new Date(s.created_at).toLocaleDateString()}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Shared with you</h4>
                  {sharedWithMe.length === 0 ? (
                    <p className="text-xs text-slate-500">No items shared with you.</p>
                  ) : (
                    <div className="space-y-2">
                      {sharedWithMe.map((s) => (
                        <div key={s.id} className="p-2 rounded-md bg-slate-50 flex items-center justify-between">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{s.item ? (s.item.title || s.item.name) : `${s.item_type} #${s.item_id}`}</p>
                            <p className="text-xs text-slate-500">From: {s.owner ? capitalizeFirstLetter(s.owner.name) : s.user_id}</p>
                          </div>
                          <div className="text-xs text-slate-400">{new Date(s.created_at).toLocaleDateString()}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Saved Posts Section */}
            <Card className="rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                    <Bookmark className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{t('profile.saved_posts')}</CardTitle>
                    <CardDescription>{t('profile.saved_posts_desc')}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {savedPosts.length === 0 ? (
                  <p className="text-xs text-slate-500">{t('profile.no_saved_posts')}</p>
                ) : (
                  <div className="space-y-2">
                    {savedPosts.slice(0, 4).map((post) => (
                      <div key={post.id} className="p-2 rounded-md bg-slate-50 flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{post.title}</p>
                          <p className="text-xs text-slate-500">{t('profile.by')} {post.userName}</p>
                        </div>
                        <div className="text-xs text-slate-400">{new Date(post.savedAt).toLocaleDateString()}</div>
                      </div>
                    ))}
                    {savedPosts.length > 4 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLocation('/saved-posts')}
                        className="w-full mt-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                      >
                        {t('profile.view_all_saved')} {savedPosts.length} {t('profile.saved_posts').toLowerCase()}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
=======
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
          </div>
        </div>
      </div>
    </div>
  );
}