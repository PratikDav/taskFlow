import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Quill from 'quill';

// Register custom fonts whitelist for Quill
const Font = Quill.import('formats/font');
Font.whitelist = ['merriweather', 'playfair', 'lora', 'times', 'bengali', 'inter', 'roboto', 'serif', 'sans'];
Quill.register(Font, true);

export default function CreatePost() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState({ title: "", content: "", codeBlockTheme: "light" });

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }, { 'font': ['merriweather','playfair','lora','times','bengali','inter','roboto','serif','sans'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'code', 'code-block', 'clean']
    ],
  };

  const formats = [
    'header', 'font',
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
          } else if (classList.contains('ql-font')) {
            button.setAttribute('title', 'Font Family');
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
          className="auto-resize-editor"
        />

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
