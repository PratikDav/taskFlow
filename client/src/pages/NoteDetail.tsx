import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowLeft, MoreHorizontal } from "lucide-react";
import html2pdf from 'html2pdf.js';

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

  const downloadAsPDF = () => {
    if (!note) return;
    const element = document.createElement('div');
    element.className = 'prose max-w-none';
    element.innerHTML = `<h2 style="text-align: center;">${note.title}</h2>${note.content}`;
    html2pdf().set({
      margin: [1, 1, 2.5, 1],
      filename: note.title + '.pdf',
      html2canvas: { scale: 2, useCORS: true, height: 792, width: 612 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }).from(element).save();
  };

  const downloadAsWord = () => {
    if (!note) return;
    const blob = new Blob([note.content.replace(/<[^>]*>/g, '')], {type: 'application/msword'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = note.title + '.doc';
    a.click();
    URL.revokeObjectURL(url);
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
        <div className="flex justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => setLocation("/notes")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Action
                <MoreHorizontal className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setLocation(`/notes/${params.id}/edit`)}>
                Edit Note
              </DropdownMenuItem>
              <DropdownMenuItem onClick={downloadAsPDF}>
                Download as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={downloadAsWord}>
                Download as Word
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <h1 className="text-3xl font-bold text-center">{note.title}</h1>
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
