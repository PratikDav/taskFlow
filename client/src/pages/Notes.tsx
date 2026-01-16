import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Folder, FileText } from "lucide-react";

interface Folder {
  id: number;
  name: string;
  created_at: Date;
}

interface Note {
  id: number;
  title: string;
  content: string;
  folder_id?: number;
  folderName?: string;
  created_at: Date;
  updated_at: Date;
}

export default function Notes() {
  const [, setLocation] = useLocation();
  const [me, setMe] = useState<any | null | undefined>(undefined);
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "", folderId: "none" });
  const [newFolder, setNewFolder] = useState({ name: "" });
  const [showCreateNote, setShowCreateNote] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);

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
  }, [setLocation]);

  const loadData = async () => {
    try {
      const [notesRes, foldersRes] = await Promise.all([
        fetch("/api/notes", { credentials: "include" }),
        fetch("/api/folders", { credentials: "include" })
      ]);
      const notesData = await notesRes.json();
      const foldersData = await foldersRes.json();
      setNotes(notesData);
      setFolders(foldersData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: newNote.title,
          content: newNote.content,
          folderId: newNote.folderId !== "none" ? parseInt(newNote.folderId) : undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to create note");

      await loadData();
      setNewNote({ title: "", content: "", folderId: "" });
      setShowCreateNote(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolder.name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newFolder.name }),
      });
      if (!res.ok) throw new Error("Failed to create folder");

      await loadData();
      setNewFolder({ name: "" });
      setShowCreateFolder(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete note");

      setNotes(notes.filter(note => note.id !== noteId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFolder = async (folderId: number) => {
    if (!confirm("Are you sure you want to delete this folder? This will not delete the notes inside it.")) return;

    try {
      const res = await fetch(`/api/folders/${folderId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete folder");

      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFolderClick = (folderId: number | null) => {
    setSelectedFolderId(folderId);
  };

  if (me === undefined) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!me) {
    return null; // Will redirect to auth
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {selectedFolderId
              ? folders.find(f => f.id === selectedFolderId)?.name || "Folder"
              : "My Notes"
            }
          </h1>
          <p className="text-sm text-muted-foreground">
            {selectedFolderId ? "Notes in this folder" : "Organize your thoughts and ideas"}
          </p>
        </div>
        <div className="flex gap-2">
          {selectedFolderId && (
            <Button
              variant="outline"
              onClick={() => setSelectedFolderId(null)}
            >
              ← All Notes
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setShowCreateFolder(!showCreateFolder)}
          >
            <Folder className="h-4 w-4 mr-2" />
            New Folder
          </Button>
          <Button onClick={() => { setNewNote(prev => ({ ...prev, folderId: selectedFolderId ? selectedFolderId.toString() : "none" })); setShowCreateNote(!showCreateNote); }}>
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </div>
      </div>

      {showCreateFolder && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Folder</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <Input
                placeholder="Folder name..."
                value={newFolder.name}
                onChange={(e) => setNewFolder({ name: e.target.value })}
                disabled={loading}
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Folder"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCreateFolder(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {showCreateNote && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Note</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateNote} className="space-y-4">
              <Input
                placeholder="Note title..."
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                disabled={loading}
              />
              <Select
                value={newNote.folderId}
                onValueChange={(value) => setNewNote({ ...newNote, folderId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select folder (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No folder</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id.toString()}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Note content..."
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                rows={4}
                disabled={loading}
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Note"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCreateNote(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {selectedFolderId === null && folders.map((folder) => (
          <Card
            key={folder.id}
            className={`relative cursor-pointer transition-colors ${
              selectedFolderId === folder.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
            }`}
            onClick={() => handleFolderClick(folder.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Folder className="h-5 w-5" />
                  {folder.name}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFolder(folder.id);
                  }}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {notes.filter(note => note.folder_id === folder.id).length} notes
              </p>
            </CardContent>
          </Card>
        ))}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {folders.map((folder) => (
          <Card
            key={folder.id}
            className={`relative cursor-pointer transition-colors ${
              selectedFolderId === folder.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
            }`}
            onClick={() => handleFolderClick(folder.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Folder className="h-5 w-5" />
                  {folder.name}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFolder(folder.id);
                  }}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {notes.filter(note => note.folder_id === folder.id).length} notes
              </p>
            </CardContent>
          </Card>
        ))}

        {(() => {
          const filteredNotes = notes.filter(note => selectedFolderId === null || note.folder_id === selectedFolderId);
          return (
            <>
              {filteredNotes.map((note) => (
                <Card key={note.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{note.title}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNote(note.id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {note.folderName && (
                      <Badge variant="secondary" className="w-fit">
                        {note.folderName}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {note.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Updated {new Date(note.updated_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}

              {filteredNotes.length === 0 && (selectedFolderId === null ? folders.length === 0 : true) && (
                <div className="col-span-full text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {selectedFolderId ? "No notes in this folder" : "No notes yet"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {selectedFolderId
                      ? "Create a new note in this folder."
                      : "Create your first folder and start organizing your notes."
                    }
                  </p>
                  {!selectedFolderId && (
                    <Button onClick={() => setShowCreateFolder(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Folder
                    </Button>
                  )}
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
}