import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AVAILABLE_SKILLS, getSkillById, clearSkillsCache } from "@/lib/skills";
import { Upload, X, Languages, Bug } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PanelSettings() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [translations, setTranslations] = useState<any[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [editingTranslation, setEditingTranslation] = useState<any>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [savingTranslation, setSavingTranslation] = useState(false);
  const [bugReports, setBugReports] = useState<any[]>([]);
  const [updatingReport, setUpdatingReport] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        const user = await res.json();
        if (!user || user.role !== "admin") {
          setLocation("/login");
          return;
        }
        setCurrentUser(user);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setLocation("/login");
      }
    };
    fetchUser();
  }, [setLocation]);

  useEffect(() => {
    if (currentUser) {
      loadTranslations();
      loadBugReports();
    }
  }, [currentUser]);

  const loadTranslations = async () => {
    try {
      const res = await fetch("/api/admin/translations", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setTranslations(data);
      } else {
        console.error("Failed to load translations");
      }
    } catch (err) {
      console.error("Error loading translations:", err);
    }
  };

  const loadBugReports = async () => {
    try {
      const res = await fetch("/api/admin/bug-reports", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setBugReports(data);
      } else {
        console.error("Failed to load bug reports");
      }
    } catch (err) {
      console.error("Error loading bug reports:", err);
    }
  };

  const handleEditTranslation = (translation: any) => {
    setEditingTranslation(translation);
    setEditValue(translation.text_value);
  };

  const handleSaveTranslation = async () => {
    if (!editingTranslation) return;

    setSavingTranslation(true);
    try {
      const res = await fetch(`/api/admin/translations/${editingTranslation.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text_value: editValue }),
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Translation updated successfully.",
        });
        setEditingTranslation(null);
        setEditValue("");
        loadTranslations(); // Reload translations
      } else {
        toast({
          title: "Error",
          description: "Failed to update translation.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error saving translation:", err);
      toast({
        title: "Error",
        description: "Failed to update translation.",
        variant: "destructive",
      });
    } finally {
      setSavingTranslation(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingTranslation(null);
    setEditValue("");
  };

  const handleUpdateBugReport = async (reportId: number, status: string, adminResponse: string) => {
    setUpdatingReport(reportId);
    try {
      const res = await fetch(`/api/admin/bug-reports/${reportId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          status,
          admin_response: adminResponse,
        }),
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Bug report updated successfully.",
        });
        loadBugReports(); // Reload bug reports
      } else {
        toast({
          title: "Error",
          description: "Failed to update bug report.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error updating bug report:", err);
      toast({
        title: "Error",
        description: "Failed to update bug report.",
        variant: "destructive",
      });
    } finally {
      setUpdatingReport(null);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        // Maintain aspect ratio, max width/height 800px
        const maxSize = 800;
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Fallback to original
          }
        }, 'image/jpeg', 0.8); // 80% quality
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleUpload = async () => {
    if (!selectedSkill || !selectedFile) {
      toast({
        title: "Missing information",
        description: "Please select a skill and an image file.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Compress the image
      const compressedFile = await compressImage(selectedFile);

      const formData = new FormData();
      formData.append('skillId', selectedSkill);
      formData.append('logo', compressedFile);

      const response = await fetch('/api/admin/skill-logo', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Skill logo uploaded successfully.",
        });
        setSelectedSkill("");
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById('logo-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        // Clear skills cache so new logo is fetched
        clearSkillsCache();
      } else {
        let errorMessage = "Failed to upload logo.";
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch (parseErr) {
          console.error("Failed to parse error response:", parseErr);
          errorMessage = `Upload failed with status ${response.status}: ${response.statusText}`;
        }
        toast({
          title: "Upload failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      let errorMessage = "Network error occurred during upload.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Panel Settings</h1>
          <p className="text-slate-600">Manage system settings and configurations</p>
        </div>

        <div className="space-y-6">
          {/* Experience Logos Section */}
          <Card>
            <CardHeader>
              <CardTitle>Experience Logos</CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload custom logos for experience categories. Images will be optimized for web use.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="skill-select">Select Experience</Label>
                  <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900 hover:bg-gray-50 shadow-sm">
                      <SelectValue placeholder="Choose an experience..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300 text-gray-900 shadow-lg">
                      {AVAILABLE_SKILLS.map((skill) => (
                        <SelectItem 
                          key={skill.id} 
                          value={skill.id.toString()}
                          className="hover:bg-gray-100 focus:bg-gray-100 text-gray-900"
                        >
                          {skill.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo-upload">Upload Logo</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="flex-1"
                    />
                    {selectedFile && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null);
                          const fileInput = document.getElementById('logo-upload') as HTMLInputElement;
                          if (fileInput) fileInput.value = '';
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              </div>

              <Button
                onClick={handleUpload}
                disabled={!selectedSkill || !selectedFile || uploading}
                className="w-full md:w-auto"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Language Translations Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                Language Translations
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage text translations for different languages. Changes will be reflected across the website.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-center">
                <div className="space-y-2">
                  <Label htmlFor="language-select">Language</Label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-50 border-slate-200">
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="bn">বাংলা</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {translations
                  .filter((t) => t.language === selectedLanguage)
                  .sort((a, b) => a.key_name.localeCompare(b.key_name))
                  .map((translation) => (
                    <div key={translation.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-muted-foreground mb-1">
                          {translation.key_name}
                        </div>
                        {editingTranslation?.id === translation.id ? (
                          <Textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="min-h-[60px]"
                            placeholder="Enter translation text..."
                          />
                        ) : (
                          <div className="text-sm">{translation.text_value}</div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {editingTranslation?.id === translation.id ? (
                          <>
                            <Button
                              size="sm"
                              onClick={handleSaveTranslation}
                              disabled={savingTranslation}
                            >
                              {savingTranslation ? "Saving..." : "Save"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditTranslation(translation)}
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>

              {translations.filter((t) => t.language === selectedLanguage).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No translations found for {selectedLanguage === 'en' ? 'English' : 'বাংলা'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}