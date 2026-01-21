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
import { Plus, Folder as FolderIcon, FileText, MoreHorizontal, Search, User } from "lucide-react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import html2pdf from 'html2pdf.js';
import JSZip from 'jszip';
import { Note, Folder } from "../../../shared/schema";
import { capitalizeFirstLetter } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

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
  const { t } = useTranslation();
  const [me, setMe] = useState<any | null | undefined>(undefined);
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolder, setNewFolder] = useState({ name: "" });
  const [showCreateNote, setShowCreateNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "", folderId: "none" });
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
  const [showCopyNoteDialog, setShowCopyNoteDialog] = useState(false);
  const [noteToCopy, setNoteToCopy] = useState<Note | null>(null);
  const [selectedFolderForCopy, setSelectedFolderForCopy] = useState<string>("none");
  const [showCopyFolderDialog, setShowCopyFolderDialog] = useState(false);
  const [folderToCopy, setFolderToCopy] = useState<Folder | null>(null);
  const [showMoveFolderDialog, setShowMoveFolderDialog] = useState(false);
  const [folderToMove, setFolderToMove] = useState<Folder | null>(null);
  const [selectedFolderForFolderMove, setSelectedFolderForFolderMove] = useState<string>("none");
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [infoItem, setInfoItem] = useState<{type: 'folder' | 'note', item: Folder | Note} | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareItem, setShareItem] = useState<{type: 'folder' | 'note', item: Folder | Note} | null>(null);
  const [shareEmail, setShareEmail] = useState("");
  const [friends, setFriends] = useState<any[]>([]);
  const [shareSearchQuery, setShareSearchQuery] = useState("");

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

  useEffect(() => {
    if (showShareDialog) {
      const loadFriends = async () => {
        try {
          const friendsRes = await fetch("/api/friends", { credentials: "include" });
          const friendsData = await friendsRes.json();
          setFriends(friendsData);
        } catch (err) {
          console.error("Failed to load friends:", err);
        }
      };
      loadFriends();
    }
  }, [showShareDialog]);

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
        body: JSON.stringify({ name: newFolder.name, parentId: selectedFolderId }),
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
    if (!confirm("Move to trash? Item will be deleted from trash after 30 days")) return;

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

  const handleCopyNote = async (noteId: number, folderId: number | null) => {
    try {
      const note = notes.find(n => n.id === noteId);
      if (!note) return;

      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: `${note.title} (Copy)`,
          content: note.content,
          folderId: folderId,
        }),
      });
      if (!res.ok) throw new Error("Failed to copy note");

      await loadData();
      setShowCopyNoteDialog(false);
      setNoteToCopy(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyFolder = async (folderId: number, parentId: number | null) => {
    try {
      const folder = folders.find(f => f.id === folderId);
      if (!folder) return;

      // First, create the new folder
      const folderRes = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: `${folder.name} (Copy)`,
          parentId: parentId,
        }),
      });
      if (!folderRes.ok) throw new Error("Failed to copy folder");

      const newFolder = await folderRes.json();

      // Then copy all notes in the folder
      const folderNotes = notes.filter(n => n.folderId === folderId);
      for (const note of folderNotes) {
        await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: note.title,
            content: note.content,
            folderId: newFolder.id,
          }),
        });
      }

      // Recursively copy subfolders
      const subFolders = folders.filter(f => f.parentId === folderId);
      for (const subFolder of subFolders) {
        await handleCopyFolder(subFolder.id, newFolder.id);
      }

      await loadData();
      setShowCopyFolderDialog(false);
      setFolderToCopy(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveFolder = async (folderId: number, parentId: number | null) => {
    try {
      const res = await fetch(`/api/folders/${folderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: undefined, // Keep existing name
          parentId: parentId,
        }),
      });
      if (!res.ok) throw new Error("Failed to move folder");

      await loadData();
      setShowMoveFolderDialog(false);
      setFolderToMove(null);
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
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );
  }

  if (!me) {
    return null; // Will redirect to auth
  }

  const renderNotesLayout = () => {
    if (layout === 'grid') {
      return (
        <div className="grid gap-1 sm:gap-1.5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {folders.filter(folder => folder.parentId === selectedFolderId).map((folder) => (
            <Card
              key={folder.id}
              className={`relative cursor-pointer transition-colors p-0.5 sm:p-1 bg-folder hover:bg-folder-hover ${
                selectedFolderId === folder.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleFolderClick(folder.id)}
            >
              <CardHeader className="pb-0.5 px-1.5 sm:px-2 pt-1.5 sm:pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-sm font-semibold flex items-center gap-1.5 truncate">
                      <FolderIcon className="h-3.5 w-3.5 sm:h-3 sm:w-3 flex-shrink-0" />
                      {folder.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {folders.filter(f => f.parentId === folder.id).length} {t('notes.folders')} | {notes.filter(note => note.folderId === folder.id).length} {t('notes.notes')}
                    </p>
                  </div>
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
                    <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setFolderToCopy(folder); setShowCopyFolderDialog(true); }}>Copy</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setFolderToMove(folder); setShowMoveFolderDialog(true); }}>Move</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDownloadFolder(folder); setDownloadFormat('pdf'); setShowDownloadDialog(true); }}>Download as ZIP</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setRenameItem({type: 'folder', id: folder.id, currentName: folder.name}); setRenameValue(folder.name); setShowRenameDialog(true); }}>Rename</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setInfoItem({ type: 'folder', item: folder }); setShowInfoDialog(true); }}>Info</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setShareItem({type: 'folder', item: folder}); setShowShareDialog(true); }}>Share</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }} className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
            </Card>
          ))}

          {notes
            .filter(note => selectedFolderId === null ? note.folderId === null : note.folderId === selectedFolderId)
            .map((note) => (
              <Card key={note.id} className="relative cursor-pointer p-0.5 sm:p-1 hover:bg-muted/50" onClick={() => setLocation(`/notes/${note.id}`)}>
                <CardHeader className="pb-0.5 px-1.5 sm:px-2 pt-1.5 sm:pt-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm sm:text-base truncate">{note.title}</CardTitle>
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
                      <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg">
                        <DropdownMenuItem onClick={() => downloadAsPDF(note)}>Download as PDF</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => downloadAsWord(note)}>Download as Word</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setNoteToCopy(note); setShowCopyNoteDialog(true); }}>Copy</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setNoteToMove(note); setShowMoveNoteDialog(true); }}>Move to folder</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setRenameItem({type: 'note', id: note.id, currentName: note.title}); setRenameValue(note.title); setShowRenameDialog(true); }}>Rename</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setInfoItem({ type: 'note', item: note }); setShowInfoDialog(true); }}>Info</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setShareItem({type: 'note', item: note}); setShowShareDialog(true); }}>Share</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }} className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="px-1.5 sm:px-2 pb-1.5 sm:pb-2">
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3">
                    {note.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                  </p>
                </CardContent>
              </Card>
            ))}

          {(() => {
            const filteredNotes = notes.filter(note => selectedFolderId === null ? note.folderId === null : note.folderId === selectedFolderId);
            return filteredNotes.length === 0 && folders.filter(folder => folder.parentId === selectedFolderId).length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {selectedFolderId ? t('notes.no_notes_folders') : t('notes.no_notes_yet')}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {selectedFolderId
                    ? t('notes.create_note_folder')
                    : t('notes.create_first_folder')
                  }
                </p>
                {!selectedFolderId && (
                  <Button onClick={() => setShowCreateFolder(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('notes.create_folder')}
                  </Button>
                )}
              </div>
            );
          })()}
        </div>
      );
    } else {
      // List layout
      return (
        <div className="space-y-2">
          {folders.filter(folder => folder.parentId === selectedFolderId).map((folder) => (
            <Card
              key={folder.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleFolderClick(folder.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FolderIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-bold text-lg">{folder.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {folders.filter(f => f.parentId === folder.id).length} {t('notes.folders')} | {notes.filter(note => note.folderId === folder.id).length} {t('notes.notes')}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setFolderToCopy(folder); setShowCopyFolderDialog(true); }}>Copy</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setFolderToMove(folder); setShowMoveFolderDialog(true); }}>Move</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDownloadFolder(folder); setDownloadFormat('pdf'); setShowDownloadDialog(true); }}>Download as ZIP</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setRenameItem({type: 'folder', id: folder.id, currentName: folder.name}); setRenameValue(folder.name); setShowRenameDialog(true); }}>Rename</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setInfoItem({ type: 'folder', item: folder }); setShowInfoDialog(true); }}>Info</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setShareItem({type: 'folder', item: folder}); setShowShareDialog(true); }}>Share</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }} className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}

          {notes
            .filter(note => selectedFolderId === null ? note.folderId === null : note.folderId === selectedFolderId)
            .map((note) => (
              <Card
                key={note.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setLocation(`/notes/${note.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">{note.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {note.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg">
                        <DropdownMenuItem onClick={() => downloadAsPDF(note)}>Download as PDF</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => downloadAsWord(note)}>Download as Word</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setNoteToCopy(note); setShowCopyNoteDialog(true); }}>Copy</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setNoteToMove(note); setShowMoveNoteDialog(true); }}>Move to folder</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setRenameItem({type: 'note', id: note.id, currentName: note.title}); setRenameValue(note.title); setShowRenameDialog(true); }}>Rename</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setInfoItem({ type: 'note', item: note }); setShowInfoDialog(true); }}>Info</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setShareItem({type: 'note', item: note}); setShowShareDialog(true); }}>Share</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }} className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}

          {(() => {
            const filteredNotes = notes.filter(note => selectedFolderId === null ? note.folderId === null : note.folderId === selectedFolderId);
            return filteredNotes.length === 0 && folders.filter(folder => folder.parentId === selectedFolderId).length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {selectedFolderId ? t('notes.no_notes_folders') : t('notes.no_notes_yet')}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {selectedFolderId
                    ? t('notes.create_note_folder')
                    : t('notes.create_first_folder')
                  }
                </p>
                {!selectedFolderId && (
                  <Button onClick={() => setShowCreateFolder(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('notes.create_folder')}
                  </Button>
                )}
              </div>
            );
          })()}
        </div>
      );
    }
  };

  const getFolderPath = (folderId: number | null): {id: number | null, name: string}[] => {
    if (!folderId) return [{id: null, name: "All Notes"}];
    const path = [];
    let currentId: number | null = folderId;
    while (currentId) {
      const folder = folders.find(f => f.id === currentId);
      if (!folder) break;
      path.unshift({id: folder.id, name: folder.name});
      currentId = folder.parentId || null;
    }
    path.unshift({id: null, name: "All Notes"});
    return path;
  };

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
            {getFolderPath(selectedFolderId).map((item, index) => (
              <span key={item.id || 'root'}>
                {index > 0 && <span className="mx-2">&gt;</span>}
                <span 
                  className="cursor-pointer hover:text-primary" 
                  onClick={() => setSelectedFolderId(item.id)}
                >
                  {item.name}
                </span>
              </span>
            ))}
          </div>
          <h1 className="text-2xl font-bold">
            {selectedFolderId
              ? folders.find(f => f.id === selectedFolderId)?.name || "Folder"
              : t('notes.all_notes')
            }
          </h1>
          <p className="text-sm text-muted-foreground">
            {selectedFolderId ? t('notes.notes_in_folder') : t('notes.all_notes_desc')}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 mr-4">
            <Button
              variant={layout === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLayout('grid')}
            >
              {t('notes.grid')}
            </Button>
            <Button
              variant={layout === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLayout('list')}
            >
              {t('notes.list')}
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
                  {loading ? t('notes.creating') : t('notes.create_folder')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCreateFolder(false)}
                >
                  {t('notes.cancel')}
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
                  {loading ? t('notes.creating') : t('notes.create_note')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCreateNote(false)}
                >
                  {t('notes.cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {renderNotesLayout()}

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

      <Dialog open={showCopyNoteDialog} onOpenChange={setShowCopyNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy Note to Folder</DialogTitle>
            <DialogDescription>
              Choose a folder to copy "{noteToCopy?.title}" to.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedFolderForCopy} onValueChange={setSelectedFolderForCopy}>
              <SelectTrigger>
                <SelectValue placeholder="Select folder" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="none">No folder (copy to root)</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id.toString()}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCopyNoteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              const folderId = selectedFolderForCopy === "none" ? null : parseInt(selectedFolderForCopy);
              if (noteToCopy) {
                handleCopyNote(noteToCopy.id, folderId);
                setShowCopyNoteDialog(false);
              }
            }}>
              Copy Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCopyFolderDialog} onOpenChange={setShowCopyFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy Folder</DialogTitle>
            <DialogDescription>
              Choose a location to copy "{folderToCopy?.name}" and all its contents to.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedFolderForCopy} onValueChange={setSelectedFolderForCopy}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="none">Root level</SelectItem>
                {folders.filter(f => f.id !== folderToCopy?.id).map((folder) => (
                  <SelectItem key={folder.id} value={folder.id.toString()}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCopyFolderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              const parentId = selectedFolderForCopy === "none" ? null : parseInt(selectedFolderForCopy);
              if (folderToCopy) {
                handleCopyFolder(folderToCopy.id, parentId);
                setShowCopyFolderDialog(false);
              }
            }}>
              Copy Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMoveFolderDialog} onOpenChange={setShowMoveFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Folder</DialogTitle>
            <DialogDescription>
              Choose a new location for "{folderToMove?.name}".
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedFolderForFolderMove} onValueChange={setSelectedFolderForFolderMove}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="none">Root level</SelectItem>
                {folders.filter(f => f.id !== folderToMove?.id).map((folder) => (
                  <SelectItem key={folder.id} value={folder.id.toString()}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoveFolderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              const parentId = selectedFolderForFolderMove === "none" ? null : parseInt(selectedFolderForFolderMove);
              if (folderToMove) {
                handleMoveFolder(folderToMove.id, parentId);
                setShowMoveFolderDialog(false);
              }
            }}>
              Move Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share {shareItem?.type === 'folder' ? 'Folder' : 'Note'}</DialogTitle>
            <DialogDescription>
              Share "{shareItem ? (shareItem.type === 'folder' ? (shareItem.item as Folder).name : (shareItem.item as Note).title) : ''}" with others.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                placeholder="Enter email address"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            
            {friends.length > 0 && (
              <div>
                <label className="text-sm font-medium">Link Ups</label>
                <div className="mt-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search link ups..."
                      value={shareSearchQuery}
                      onChange={(e) => setShareSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
                    {friends
                      .filter(friend => 
                        friend.name.toLowerCase().includes(shareSearchQuery.toLowerCase()) ||
                        friend.email.toLowerCase().includes(shareSearchQuery.toLowerCase())
                      )
                      .map((friend) => (
                        <div
                          key={friend.id}
                          className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer"
                          onClick={() => setShareEmail(friend.email)}
                        >
                          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-3 w-3 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{capitalizeFirstLetter(friend.name)}</p>
                            <p className="text-xs text-muted-foreground truncate">{friend.email}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                if (!shareEmail.trim() || !shareItem) return;
                
                try {
                  // First, find the user by email
                  const userRes = await fetch(`/api/users/search?email=${encodeURIComponent(shareEmail)}`, { 
                    credentials: "include" 
                  });
                  const userData = await userRes.json();
                  
                  if (!userData || userData.length === 0) {
                    alert("User not found with that email address");
                    return;
                  }
                  
                  const targetUser = userData[0];
                  
                  // Create the share
                  const shareRes = await fetch("/api/shares", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                      shared_with_user_id: targetUser.id,
                      item_type: shareItem.type,
                      item_id: shareItem.item.id
                    })
                  });
                  
                  if (shareRes.ok) {
                    alert(`Successfully shared with ${capitalizeFirstLetter(targetUser.name)}!`);
                    setShowShareDialog(false);
                    setShareEmail("");
                    setShareSearchQuery("");
                  } else {
                    const error = await shareRes.json();
                    alert(error.message || "Failed to share item");
                  }
                } catch (err) {
                  console.error("Share error:", err);
                  alert("Failed to share item");
                }
              }}
              disabled={!shareEmail.trim()}
            >
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Info Dialog */}
      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{infoItem?.type === 'folder' ? 'Folder Info' : 'Note Info'}</DialogTitle>
            <DialogDescription>
              {infoItem?.type === 'folder' ? infoItem?.item && (infoItem.item as any).name : infoItem?.item && (infoItem.item as any).title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {!infoItem || !infoItem.item ? (
              <div className="text-sm text-slate-500 py-4">No item data available.</div>
            ) : (
              (() => {
                const item: any = infoItem.item;
                const lines: Array<[string, string]> = [];
                lines.push(['ID', String(item?.id ?? 'N/A')]);
                if (infoItem.type === 'note') {
                  lines.push(['Created', new Date(item.created_at || item.createdAt || item.createdAt).toLocaleString()]);
                  if (item.updated_at || item.updatedAt) lines.push(['Updated', new Date(item.updated_at || item.updatedAt).toLocaleString()]);
                } else {
                  if (item.created_at || item.createdAt) lines.push(['Created', new Date(item.created_at || item.createdAt).toLocaleString()]);
                }

                // folder path
                const getPath = (folderId: number | null) => {
                  const parts: string[] = [];
                  let cur = folderId;
                  while (cur) {
                    const f = folders.find(ff => ff.id === cur);
                    if (!f) break;
                    parts.unshift(f.name);
                    cur = f.parentId ?? null;
                  }
                  return parts.length ? '/' + parts.join('/') : '/';
                };

                if (infoItem.type === 'note') {
                  lines.push(['Folder', item.folderId ? getPath(item.folderId) : 'Root']);
                  if (item.privacy) lines.push(['Privacy', item.privacy]);
                } else {
                  lines.push(['Location', item.parentId ? getPath(item.parentId) : 'Root']);
                  const childFolders = folders.filter(f => f.parentId === item.id).length;
                  const childNotes = notes.filter(n => n.folderId === item.id).length;
                  lines.push(['Contains', `${childFolders} folders, ${childNotes} notes`]);
                }

                return (
                  <div>
                    <div className="space-y-1 text-sm text-slate-700">
                      {lines.map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <div className="text-muted-foreground">{k}</div>
                          <div className="font-medium ml-2 text-right">{v}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4">
                      <h4 className="text-sm font-semibold mb-2">Move / Copy History</h4>
                      <p className="text-xs text-slate-500">
                        {item.moved_from || item.copied_from || item.original_id ? (
                          <>
                            {item.moved_from ? `Moved from ${item.moved_from}` : ''}
                            {item.copied_from ? `Copied from ${item.copied_from}` : ''}
                            {item.original_id ? `Original ID: ${item.original_id}` : ''}
                          </>
                        ) : (
                          'No move/copy history available.'
                        )}
                      </p>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInfoDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      </div>
    </div>
  );
}
