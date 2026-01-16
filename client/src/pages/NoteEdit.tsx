import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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

interface Note {
  id: number;
  title: string;
  content: string;
  folderId?: number;
  created_at: Date;
  updated_at: Date;
}

export default function NoteEdit() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const [me, setMe] = useState<any | null | undefined>(undefined);
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "" });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const meRes = await fetch("/api/me", { credentials: "include" });
        const meData = await meRes.json();
        setMe(meData);
        if (!meData) {
          setLocation("/auth");
          return;
        }
        await loadData();
      } catch (err) {
        console.error(err);
        setLocation("/auth");
      }
    };
    checkAuth();
  }, [setLocation, params.id]);

  const loadData = async () => {
    if (!params.id) return;
    try {
      const noteRes = await fetch(`/api/notes/${params.id}`, { credentials: "include" });
      if (!noteRes.ok) throw new Error("Note not found");
      const noteData = await noteRes.json();
      setNote(noteData);
      setFormData({
        title: noteData.title,
        content: noteData.content
      });
    } catch (err) {
      console.error(err);
      setLocation("/notes");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note || !formData.title.trim() || !formData.content.trim()) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: formData.title,
          content: formData.content
        }),
      });
      if (!res.ok) throw new Error("Failed to update note");

      setLocation(`/notes/${note.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (me === undefined || loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!me || !note) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => setLocation(`/notes/${params.id}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Note
        </Button>
        <h1 className="text-3xl font-bold">Edit Note</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          placeholder="Note title..."
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          disabled={saving}
          className="text-lg"
        />

        <ReactQuill
          theme="snow"
          value={formData.content}
          onChange={(value) => setFormData({ ...formData, content: value })}
          modules={modules}
          formats={formats}
          placeholder="Note content..."
          className="mb-4"
        />

        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setLocation(`/notes/${params.id}`)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
