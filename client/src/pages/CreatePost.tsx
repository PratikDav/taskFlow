import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette } from "lucide-react";

export default function CreatePost() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState({ title: "", content: "", codeBlockTheme: "dark" });
  const [codeBlockTheme, setCodeBlockTheme] = useState('dark');

  const codeBlockThemes = {
    dark: { bg: 'bg-slate-900', text: 'text-slate-100', border: 'border-slate-700' },
    light: { bg: 'bg-gray-100', text: 'text-gray-900', border: 'border-gray-300' },
    blue: { bg: 'bg-blue-900', text: 'text-blue-100', border: 'border-blue-700' },
    green: { bg: 'bg-green-900', text: 'text-green-100', border: 'border-green-700' },
    purple: { bg: 'bg-purple-900', text: 'text-purple-100', border: 'border-purple-700' }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'code', 'code-block'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'link', 'code', 'code-block'
  ];
  const [me, setMe] = useState<any | null | undefined>(undefined);

  // Apply theme to the editor
  useEffect(() => {
    // Remove any existing dynamic styles
    const existingStyle = document.getElementById('code-block-theme');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Create new style element
    const style = document.createElement('style');
    style.id = 'code-block-theme';
    style.textContent = `
      .ql-editor pre {
        background-color: ${codeBlockTheme === 'dark' ? '#1e293b' : 
                          codeBlockTheme === 'light' ? '#f3f4f6' :
                          codeBlockTheme === 'blue' ? '#1e3a8a' :
                          codeBlockTheme === 'green' ? '#14532d' :
                          '#581c87'} !important;
        color: ${codeBlockTheme === 'dark' ? '#f1f5f9' : 
                codeBlockTheme === 'light' ? '#111827' :
                codeBlockTheme === 'blue' ? '#dbeafe' :
                codeBlockTheme === 'green' ? '#dcfce7' :
                '#faf5ff'} !important;
        border-color: ${codeBlockTheme === 'dark' ? '#475569' : 
                       codeBlockTheme === 'light' ? '#d1d5db' :
                       codeBlockTheme === 'blue' ? '#3b82f6' :
                       codeBlockTheme === 'green' ? '#16a34a' :
                       '#a855f7'} !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      const styleToRemove = document.getElementById('code-block-theme');
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, [codeBlockTheme]);

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
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create Post</h1>
        <p className="text-sm text-muted-foreground">Write and publish a new post.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 border rounded-lg bg-card space-y-4">
        <input
          type="text"
          placeholder="Post title..."
          value={post.title}
          onChange={(e) => setPost({ ...post, title: e.target.value })}
          className="w-full p-2 border rounded-md bg-background"
          disabled={loading}
        />
        <div className={`theme-${codeBlockTheme}`}>
          <ReactQuill
            theme="snow"
            value={post.content}
            onChange={(value) => setPost({ ...post, content: value })}
            modules={modules}
            formats={formats}
            placeholder="Write your post content here..."
            className="min-h-[200px]"
          />
        </div>

        {/* Code Block Theme Selector */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            <label className="text-sm font-semibold text-foreground">Code Block Theme</label>
          </div>
          <Select value={codeBlockTheme} onValueChange={(value) => {
            setCodeBlockTheme(value);
            setPost({ ...post, codeBlockTheme: value });
          }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dark">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-slate-900 border border-slate-700"></div>
                  <span>Dark Theme</span>
                </div>
              </SelectItem>
              <SelectItem value="light">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300"></div>
                  <span>Light Theme</span>
                </div>
              </SelectItem>
              <SelectItem value="blue">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-900 border border-blue-700"></div>
                  <span>Blue Theme</span>
                </div>
              </SelectItem>
              <SelectItem value="green">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-900 border border-green-700"></div>
                  <span>Green Theme</span>
                </div>
              </SelectItem>
              <SelectItem value="purple">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-purple-900 border border-purple-700"></div>
                  <span>Purple Theme</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Preview:</p>
            <code className={`px-1 py-0.5 rounded text-xs ${codeBlockThemes[codeBlockTheme as keyof typeof codeBlockThemes].bg} ${codeBlockThemes[codeBlockTheme as keyof typeof codeBlockThemes].text}`}>inline code</code>
            <pre className={`text-xs p-2 rounded border mt-1 ${codeBlockThemes[codeBlockTheme as keyof typeof codeBlockThemes].bg} ${codeBlockThemes[codeBlockTheme as keyof typeof codeBlockThemes].text} ${codeBlockThemes[codeBlockTheme as keyof typeof codeBlockThemes].border}`}>
              function example() {`{`}
                console.log('Hello World');
              {`}`}
            </pre>
          </div>
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
