import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
<<<<<<< HEAD
import { Input } from "@/components/ui/input";
=======
<<<<<<< HEAD
import { Input } from "@/components/ui/input";
=======
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
>>>>>>> e0fbc1d5f0f9aca9a16a08f28f51385ddb425180
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function CreatePost() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD
  const [post, setPost] = useState({ title: "", content: "", codeBlockTheme: "light", privacy: "public", titleAlignment: "left" });
=======
<<<<<<< HEAD
  const [post, setPost] = useState({ title: "", content: "", codeBlockTheme: "light", privacy: "public", titleAlignment: "left" });
=======
  const [post, setPost] = useState({ title: "", content: "", codeBlockTheme: "light", privacy: "public" });
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
>>>>>>> e0fbc1d5f0f9aca9a16a08f28f51385ddb425180

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'code', 'code-block', 'clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'link', 'code', 'code-block'
  ];
  const [me, setMe] = useState<any | null | undefined>(undefined);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const meRes = await fetch("/api/me", { credentials: "include" });
        const meData = await meRes.json();
        setMe(meData);
        if (!meData) {
          setLocation("/auth");
        }
      } catch (err) {
        console.error(err);
        setLocation("/auth");
      }
    };
    checkAuth();
  }, [setLocation]);

  // Add tooltips to toolbar buttons
  useEffect(() => {
    const addTooltips = () => {
      const toolbar = document.querySelector('.ql-toolbar');
      if (toolbar) {
        const buttons = toolbar.querySelectorAll('button');
        buttons.forEach(button => {
          const classList = button.classList;
          if (classList.contains('ql-bold')) {
            button.setAttribute('title', 'Bold (Ctrl+B)');
          } else if (classList.contains('ql-italic')) {
            button.setAttribute('title', 'Italic (Ctrl+I)');
          } else if (classList.contains('ql-underline')) {
            button.setAttribute('title', 'Underline (Ctrl+U)');
          } else if (classList.contains('ql-strike')) {
            button.setAttribute('title', 'Strikethrough');
          } else if (classList.contains('ql-link')) {
            button.setAttribute('title', 'Link (Ctrl+K)');
          } else if (classList.contains('ql-code')) {
            button.setAttribute('title', 'Inline Code ⟨⟩ (Ctrl+Shift+C) - for code within text');
          } else if (classList.contains('ql-code-block')) {
            button.setAttribute('title', 'Code Block {} (Ctrl+Shift+K) - for multiline code');
          } else if (classList.contains('ql-list')) {
            button.setAttribute('title', 'Ordered List');
          } else if (classList.contains('ql-bullet')) {
            button.setAttribute('title', 'Bullet List');
          } else if (classList.contains('ql-clean')) {
            button.setAttribute('title', 'Remove Formatting');
          } else if (classList.contains('ql-header')) {
            button.setAttribute('title', 'Heading');
          }
        });
      }
    };

    // Add tooltips after a short delay to ensure ReactQuill has rendered
    const timeoutId = setTimeout(addTooltips, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  if (me === undefined) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!me) {
    // This should not happen due to the useEffect redirect, but just in case
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post.title.trim() || !post.content.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create post");
      }

      // Redirect back to posts after creating
      setLocation("/posts");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create Post</h1>
        <p className="text-sm text-muted-foreground">Explain what you learn as you want.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 border rounded-lg bg-card space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Post Title</Label>
          <div className="flex gap-2">
            <Input
              id="title"
              type="text"
              placeholder="Post title..."
              value={post.title}
              onChange={(e) => setPost({ ...post, title: e.target.value })}
              className="flex-1"
              disabled={loading}
            />
            <Select value={post.titleAlignment} onValueChange={(value) => setPost({ ...post, titleAlignment: value })}>
              <SelectTrigger className="w-32 bg-slate-50 border-slate-300 hover:bg-slate-100 focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-colors">
                <SelectValue placeholder="Left" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 shadow-lg">
                <SelectItem value="left" className="hover:bg-slate-50 focus:bg-slate-50">Left</SelectItem>
                <SelectItem value="center" className="hover:bg-slate-50 focus:bg-slate-50">Center</SelectItem>
                <SelectItem value="right" className="hover:bg-slate-50 focus:bg-slate-50">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <ReactQuill
          theme="snow"
          value={post.content}
          onChange={(value) => setPost({ ...post, content: value })}
          modules={modules}
          formats={formats}
          placeholder="Write your post content here..."
          className="auto-resize-editor"
        />

        <div className="space-y-2">
          <Label htmlFor="privacy">Privacy</Label>
          <Select value={post.privacy} onValueChange={(value) => setPost({ ...post, privacy: value })}>
            <SelectTrigger className="w-full bg-slate-50 border-slate-300 hover:bg-slate-100 focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-colors">
              <SelectValue placeholder="Select privacy level" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 shadow-lg">
              <SelectItem value="public" className="hover:bg-slate-50 focus:bg-slate-50">Public - Anyone can see this post</SelectItem>
              <SelectItem value="friends" className="hover:bg-slate-50 focus:bg-slate-50">Link Ups - Only link ups can see this post</SelectItem>
              <SelectItem value="private" className="hover:bg-slate-50 focus:bg-slate-50">Private - Only you can see this post</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Publishing..." : "Publish"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setLocation("/posts")}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
