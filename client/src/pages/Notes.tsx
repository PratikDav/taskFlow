import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Folder as FolderIcon, FileText, MoreHorizontal } from "lucide-react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import html2pdf from 'html2pdf.js';
import JSZip from 'jszip';
import { Note, Folder } from "../../../shared/schema";

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
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [renameItem, setRenameItem] = useState<{type: 'folder' | 'note', id: number, currentName: string} | null>(null);
  const [renameValue, setRenameValue] = useState('');

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
      setNewNote({ title: "", content: "", folderId: selectedFolderId ? selectedFolderId.toString() : "none" });
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

  const downloadAsPDF = (note: Note) => {
    const element = document.createElement('div');
    element.innerHTML = note.content;
    html2pdf().set({filename: note.title + '.pdf'}).from(element).save();
  };

  const downloadAsWord = (note: Note) => {
    const blob = new Blob([note.content.replace(/<[^>]*>/g, '')], {type: 'application/msword'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = note.title + '.doc';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadFolderAsZIP = async (folder: Folder) => {
    const zip = new JSZip();
    const folderNotes = notes.filter(n => n.folderId === folder.id);
    for (const note of folderNotes) {
      zip.file(note.title + '.txt', note.content.replace(/<[^>]*>/g, ''));
    }
    const content = await zip.generateAsync({type: 'blob'});
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = folder.name + '.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRename = async () => {
    if (!renameItem) return;
    
    if (renameItem.type === 'folder') {
      const endpoint = `/api/folders/${renameItem.id}`;
      const body = { name: renameValue };
      await fetch(endpoint, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        credentials: 'include', 
        body: JSON.stringify(body) 
      });
    } else {
      // For notes, we need to preserve existing content and folderId
      const note = notes.find(n => n.id === renameItem.id);
      if (!note) return;
      
      const endpoint = `/api/notes/${renameItem.id}`;
      const body = { 
        title: renameValue, 
        content: note.content, 
        folderId: note.folderId 
      };
      await fetch(endpoint, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        credentials: 'include', 
        body: JSON.stringify(body) 
      });
    }
    
    await loadData();
    setShowRenameDialog(false);
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
          <div className="text-sm text-muted-foreground mb-2">
            <span className="cursor-pointer hover:text-primary" onClick={() => setSelectedFolderId(null)}>Notes</span>
            {selectedFolderId && (
              <>
                <span className="mx-2">&gt;</span>
                <span>{folders.find(f => f.id === selectedFolderId)?.name || "Folder"}</span>
              </>
            )}
          </div>
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
          <div className="flex gap-1 mr-4">
            <Button
              variant={layout === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLayout('grid')}
            >
              Grid
            </Button>
            <Button
              variant={layout === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLayout('list')}
            >
              List
            </Button>
          </div>
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
            <FolderIcon className="h-4 w-4 mr-2" />
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
              <Select
                value={newNote.folderId}
                onValueChange={(value) => setNewNote({ ...newNote, folderId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select folder (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="none">No folder</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id.toString()}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Note title..."
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                disabled={loading}
              />
              <ReactQuill
                theme="snow"
                value={newNote.content}
                onChange={(value) => setNewNote({ ...newNote, content: value })}
                modules={modules}
                formats={formats}
                placeholder="Note content..."
                className="mb-4"
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

      {layout === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {selectedFolderId === null && folders.map((folder) => (
            <Card
              key={folder.id}
              className={`relative cursor-pointer transition-colors ${
                selectedFolderId === folder.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
              }`}
              onClick={() => handleFolderClick(folder.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FolderIcon className="h-4 w-4" />
                    {folder.name}
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-50">
                      <DropdownMenuItem onClick={() => downloadFolderAsZIP(folder)}>Download as ZIP</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setRenameItem({type: 'folder', id: folder.id, currentName: folder.name}); setRenameValue(folder.name); setShowRenameDialog(true); }}>Rename</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => console.log('Info')}>Info</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => console.log('Share')}>Share</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }} className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">
                  {notes.filter(note => note.folderId === folder.id).length} notes
                </p>
              </CardContent>
            </Card>
          ))}

          {notes
            .filter(note => selectedFolderId === null ? !note.folderId : note.folderId === selectedFolderId)
            .map((note) => (
              <Card key={note.id} className="relative cursor-pointer hover:bg-muted/50" onClick={() => setLocation(`/notes/${note.id}`)}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{note.title}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                          onMouseDown={(e) => e.stopPropagation()}
                          onPointerDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-50">
                        <DropdownMenuItem onClick={() => downloadAsPDF(note)}>Download as PDF</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => downloadAsWord(note)}>Download as Word</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setRenameItem({type: 'note', id: note.id, currentName: note.title}); setRenameValue(note.title); setShowRenameDialog(true); }}>Rename</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => console.log('Info')}>Info</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => console.log('Share')}>Share</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }} className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
              </Card>
            ))}

          {(() => {
            const filteredNotes = notes.filter(note => selectedFolderId === null ? !note.folderId : note.folderId === selectedFolderId);
            return filteredNotes.length === 0 && (selectedFolderId === null ? folders.length === 0 : true) && (
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
            );
          })()}
        </div>
      ) : (
        <div className="space-y-2">
          {selectedFolderId === null && folders.map((folder) => (
            <div key={folder.id} className="flex items-center justify-between p-3 border rounded cursor-pointer hover:bg-muted/50" onClick={() => handleFolderClick(folder.id)}>
              <span className="text-base flex items-center gap-2">
                <FolderIcon className="h-4 w-4" />
                {folder.name} ({notes.filter(note => note.folderId === folder.id).length} notes)
              </span>
              <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-50">
                  <DropdownMenuItem onClick={() => downloadFolderAsZIP(folder)}>Download as ZIP</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setRenameItem({type: 'folder', id: folder.id, currentName: folder.name}); setRenameValue(folder.name); setShowRenameDialog(true); }}>Rename</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => console.log('Info')}>Info</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => console.log('Share')}>Share</DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }} className="text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}

          {notes
            .filter(note => selectedFolderId === null ? !note.folderId : note.folderId === selectedFolderId)
            .map((note) => (
              <div key={note.id} className="flex items-center justify-between p-3 border rounded cursor-pointer hover:bg-muted/50" onClick={() => setLocation(`/notes/${note.id}`)}>
                <span className="text-base">{note.title}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-50">
                    <DropdownMenuItem onClick={() => downloadAsPDF(note)}>Download as PDF</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => downloadAsWord(note)}>Download as Word</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setRenameItem({type: 'note', id: note.id, currentName: note.title}); setRenameValue(note.title); setShowRenameDialog(true); }}>Rename</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => console.log('Info')}>Info</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => console.log('Share')}>Share</DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }} className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}

          {(() => {
            const filteredNotes = notes.filter(note => selectedFolderId === null ? !note.folderId : note.folderId === selectedFolderId);
            return filteredNotes.length === 0 && (selectedFolderId === null ? folders.length === 0 : true) && (
              <div className="text-center py-12">
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
            );
          })()}
        </div>
      )}

      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename {renameItem?.type}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder={`Enter new ${renameItem?.type} name`}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
