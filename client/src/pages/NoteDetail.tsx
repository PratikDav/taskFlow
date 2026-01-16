import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

interface Note {
  id: number;
  title: string;
  content: string;
  folderId?: number;
  folderName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function NoteDetail() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const [me, setMe] = useState<any | null | undefined>(undefined);
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

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
        await loadNote();
      } catch (err) {
        console.error(err);
        setLocation("/auth");
      }
    };
    checkAuth();
  }, [setLocation, params.id]);

  const loadNote = async () => {
    if (!params.id) return;
    try {
      const res = await fetch(`/api/notes/${params.id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Note not found");
      const noteData = await res.json();
      setNote(noteData);
    } catch (err) {
      console.error(err);
      setLocation("/notes");
    } finally {
      setLoading(false);
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
        <div className="flex gap-2 mb-4">
          <Button
            variant="ghost"
            onClick={() => setLocation("/notes")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Notes
          </Button>
          <Button
            onClick={() => setLocation(`/notes/${params.id}/edit`)}
          >
            Edit Note
          </Button>
        </div>
        <h1 className="text-3xl font-bold">{note.title}</h1>
        {note.folderName && (
          <Badge variant="secondary" className="mt-2">
            {note.folderName}
          </Badge>
        )}
      </div>
      <div className="prose max-w-none">
        <div dangerouslySetInnerHTML={{ __html: note.content }} />
      </div>
      <p className="text-xs text-muted-foreground mt-8">
        Updated {new Date(note.updatedAt).toLocaleDateString()}
      </p>
    </div>
  );
}
