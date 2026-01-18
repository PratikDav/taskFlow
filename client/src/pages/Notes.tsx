import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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
    [{ 'align': [] }],
    ['link', 'code', 'code-block', 'clean']
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'link', 'code', 'code-block', 'align'
];

export default function Notes() {
  const [, setLocation] = useLocation();
  const [me, setMe] = useState<any | null | undefined>(undefined);
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolder, setNewFolder] = useState({ name: "" });
  const [showCreateNote, setShowCreateNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "", folderId: "none", privacy: "public" });
  const [loading, setLoading] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [renameItem, setRenameItem] = useState<{type: 'folder' | 'note', id: number, currentName: string} | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [downloadFolder, setDownloadFolder] = useState<Folder | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'word'>('pdf');
  const [downloading, setDownloading] = useState(false);
  const [showMoveNoteDialog, setShowMoveNoteDialog] = useState(false);
  const [noteToMove, setNoteToMove] = useState<Note | null>(null);
  const [selectedFolderForMove, setSelectedFolderForMove] = useState<string>("none");

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
          privacy: newNote.privacy,
        }),
      });
      if (!res.ok) throw new Error("Failed to create note");

      await loadData();
      setNewNote({ title: "", content: "", folderId: selectedFolderId ? selectedFolderId.toString() : "none", privacy: "public" });
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

  const handleMoveNote = async (noteId: number, folderId: number | null) => {
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: undefined, // Keep existing title
          content: undefined, // Keep existing content
          folderId: folderId,
        }),
      });
      if (!res.ok) throw new Error("Failed to move note");

      await loadData();
      setShowMoveNoteDialog(false);
      setNoteToMove(null);
    } catch (err) {
      console.error(err);
    }
  };

  const downloadAsPDF = (note: Note) => {
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

  const downloadAsWord = (note: Note) => {
    const blob = new Blob([note.content.replace(/<[^>]*>/g, '')], {type: 'application/msword'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = note.title + '.doc';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadFolderAsZIP = async (folder: Folder, format: 'pdf' | 'word') => {
    setDownloading(true);
    try {
      const zip = new JSZip();
      const folderNotes = notes.filter(n => n.folderId === folder.id);
      for (const note of folderNotes) {
        if (format === 'word') {
          const content = note.content.replace(/<[^>]*>/g, '');
          zip.file(note.title + '.doc', content);
        } else {
          // PDF generation using html2pdf (jsPDF) to obtain blob
          const element = document.createElement('div');
          element.className = 'prose max-w-none';
          element.innerHTML = `<h2 style="text-align: center;">${note.title}</h2>${note.content}`;
          try {
            // @ts-ignore
            const pdfObj = await html2pdf().from(element).set({
              margin: [1, 1, 2.5, 1],
              html2canvas: { scale: 2, useCORS: true, height: 792, width: 612 },
              jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            }).toPdf().get('pdf');
            const blob = pdfObj.output('blob');
            zip.file(note.title + '.pdf', blob);
          } catch (err) {
            // fallback: save plain text if PDF generation fails
            const content = note.content.replace(/<[^>]*>/g, '');
            zip.file(note.title + '.txt', content);
          }
        }
      }
      const content = await zip.generateAsync({type: 'blob'});
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = folder.name + '.zip';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
      setShowDownloadDialog(false);
    }
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
    <div className="max-w-6xl mx-auto p-2 sm:p-4 md:p-6 lg:p-8 min-h-screen max-h-screen overflow-hidden flex flex-col">
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 400px) {
          .mobile-note-btn { display: block !important; }
          .desktop-note-btn { display: none !important; }
        }
        @media (min-width: 401px) {
          .mobile-note-btn { display: none !important; }
          .desktop-note-btn { display: inline-flex !important; }
        }
      `}} />
      <div className="mb-3 sm:mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <div className="text-sm text-muted-foreground mb-2">
            <span className="cursor-pointer hover:text-primary" onClick={() => setSelectedFolderId(null)}>All Notes</span>
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
              : "All Notes"
            }
          </h1>
          <p className="text-sm text-muted-foreground">
            {selectedFolderId ? "Notes in this folder" : "All your notes and folders"}
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
          <Button className="desktop-note-btn" onClick={() => { setNewNote(prev => ({ ...prev, folderId: selectedFolderId ? selectedFolderId.toString() : "none" })); setShowCreateNote(!showCreateNote); }}>
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </div>
      </div>

      {/* Mobile New Note Button - Fixed at bottom for screens up to 400px */}
      <div className="mobile-note-btn fixed bottom-4 left-4 right-4 z-10">
        <Button 
          className="w-full shadow-lg" 
          size="lg"
          onClick={() => { setNewNote(prev => ({ ...prev, folderId: selectedFolderId ? selectedFolderId.toString() : "none" })); setShowCreateNote(!showCreateNote); }}
        >
          <Plus className="h-5 w-5 mr-2" />
          New Note
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 sm:pb-0">
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Privacy</label>
                <Select
                  value={newNote.privacy}
                  onValueChange={(value) => setNewNote({ ...newNote, privacy: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select privacy level" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="public">Public - Anyone can see this note</SelectItem>
                    <SelectItem value="friends">Friends - Only friends can see this note</SelectItem>
                    <SelectItem value="private">Private - Only you can see this note</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
        <div className="grid gap-1 sm:gap-1.5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {selectedFolderId === null && folders.map((folder) => (
            <Card
              key={folder.id}
              className={`relative cursor-pointer transition-colors p-0.5 sm:p-1 bg-folder hover:bg-folder-hover ${
                selectedFolderId === folder.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleFolderClick(folder.id)}
            >
              <CardHeader className="pb-0.5 px-1.5 sm:px-2 pt-1.5 sm:pt-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm sm:text-xs flex items-center gap-1.5 truncate">
                    <FolderIcon className="h-3.5 w-3.5 sm:h-3 sm:w-3 flex-shrink-0" />
                    {folder.name} ({notes.filter(note => note.folderId === folder.id).length})
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
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDownloadFolder(folder); setDownloadFormat('pdf'); setShowDownloadDialog(true); }}>Download as ZIP</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setRenameItem({type: 'folder', id: folder.id, currentName: folder.name}); setRenameValue(folder.name); setShowRenameDialog(true); }}>Rename</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => console.log('Info')}>Info</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => console.log('Share')}>Share</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }} className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
            </Card>
          ))}

          {notes
            .filter(note => note.folderId === selectedFolderId)
            .map((note) => (
              <Card key={note.id} className="relative cursor-pointer p-0.5 sm:p-1 hover:bg-muted/50" onClick={() => setLocation(`/notes/${note.id}`)}>
                <CardHeader className="pb-0.5 px-1.5 sm:px-2 pt-1.5 sm:pt-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm sm:text-xs truncate">{note.title}</CardTitle>
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
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setNoteToMove(note); setSelectedFolderForMove("none"); setShowMoveNoteDialog(true); }}>Move to folder</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setRenameItem({type: 'note', id: note.id, currentName: note.title}); setRenameValue(note.title); setShowRenameDialog(true); }}>Rename</DropdownMenuItem>
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
            const filteredNotes = notes.filter(note => note.folderId === selectedFolderId);
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
        <div className="space-y-1 sm:space-y-2">
          {selectedFolderId === null && folders.map((folder) => (
            <div key={folder.id} className="flex items-center justify-between p-2 sm:p-3 border rounded cursor-pointer hover:bg-muted/50" onClick={() => handleFolderClick(folder.id)}>
              <span className="text-sm sm:text-base flex items-center gap-2">
                <FolderIcon className="h-4 w-4" />
                {folder.name} ({notes.filter(note => note.folderId === folder.id).length})
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
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDownloadFolder(folder); setDownloadFormat('pdf'); setShowDownloadDialog(true); }}>Download as ZIP</DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setRenameItem({type: 'folder', id: folder.id, currentName: folder.name}); setRenameValue(folder.name); setShowRenameDialog(true); }}>Rename</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => console.log('Info')}>Info</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => console.log('Share')}>Share</DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }} className="text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}

          {notes
            .filter(note => selectedFolderId === null || note.folderId === selectedFolderId)
            .map((note) => (
              <div key={note.id} className="flex items-center justify-between p-2 sm:p-3 border rounded cursor-pointer hover:bg-muted/50" onClick={() => setLocation(`/notes/${note.id}`)}>
                <span className="text-sm sm:text-base">{note.title}</span>
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
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setNoteToMove(note); setShowMoveNoteDialog(true); }}>Move to folder</DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setRenameItem({type: 'note', id: note.id, currentName: note.title}); setRenameValue(note.title); setShowRenameDialog(true); }}>Rename</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => console.log('Info')}>Info</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => console.log('Share')}>Share</DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }} className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}

          {(() => {
            const filteredNotes = notes.filter(note => selectedFolderId === null || note.folderId === selectedFolderId);
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

      <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Download Folder as ZIP</DialogTitle>
            <DialogDescription>
              Choose the format for notes in "{downloadFolder?.name}".
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={downloadFormat} onValueChange={(value: 'pdf' | 'word') => setDownloadFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="word">Word (.doc)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDownloadDialog(false)} disabled={downloading}>
              Cancel
            </Button>
            <Button onClick={() => downloadFolder && downloadFolderAsZIP(downloadFolder, downloadFormat)} disabled={downloading}>
              {downloading ? 'Downloading...' : 'Download'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMoveNoteDialog} onOpenChange={setShowMoveNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Note to Folder</DialogTitle>
            <DialogDescription>
              Choose a folder to move "{noteToMove?.title}" to.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedFolderForMove} onValueChange={setSelectedFolderForMove}>
              <SelectTrigger>
                <SelectValue placeholder="Select folder" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="none">No folder (move to root)</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id.toString()}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoveNoteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              const folderId = selectedFolderForMove === "none" ? null : parseInt(selectedFolderForMove);
              if (noteToMove) {
                handleMoveNote(noteToMove.id, folderId);
                setShowMoveNoteDialog(false);
              }
            }}>
              Move Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
