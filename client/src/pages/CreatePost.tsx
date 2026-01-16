import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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
    const style = document.createElement('style');
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
    style.id = 'code-block-theme';
    document.head.appendChild(style);

    return () => {
      const existing = document.getElementById('code-block-theme');
      if (existing) existing.remove();
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
        <ReactQuill
          theme="snow"
          value={post.content}
          onChange={(value) => setPost({ ...post, content: value })}
          modules={modules}
          formats={formats}
          placeholder="Write your post content here..."
          className="min-h-[200px]"
        />

        {/* Code Block Theme Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Code Block Theme:</label>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(codeBlockThemes).map(([theme, colors]) => (
              <button
                key={theme}
                type="button"
                onClick={() => {
                  setCodeBlockTheme(theme);
                  setPost({ ...post, codeBlockTheme: theme });
                }}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  codeBlockTheme === theme
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Preview: <code className={`px-1 py-0.5 rounded text-xs ${codeBlockThemes[codeBlockTheme as keyof typeof codeBlockThemes].bg} ${codeBlockThemes[codeBlockTheme as keyof typeof codeBlockThemes].text}`}>inline code</code> and block code below:
          </p>
          <pre className={`text-xs p-2 rounded border mt-1 ${codeBlockThemes[codeBlockTheme as keyof typeof codeBlockThemes].bg} ${codeBlockThemes[codeBlockTheme as keyof typeof codeBlockThemes].text} ${codeBlockThemes[codeBlockTheme as keyof typeof codeBlockThemes].border}`}>
            function example() {`{`}
              console.log('Hello World');
            {`}`}
          </pre>
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
