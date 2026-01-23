import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Trash2, RotateCcw, MoreHorizontal, FileText, Folder as FolderIcon, MessageSquare } from "lucide-react";

interface Note {
  id: number;
  user_id: number;
  folderId?: number;
  title: string;
  content: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}

interface Folder {
  id: number;
  user_id: number;
  name: string;
  created_at: Date;
  deleted_at: Date;
}

interface Post {
  id: number;
  user_id: number;
  title: string;
  content: string;
  code_block_theme?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}

export default function Trash() {
  const [deletedNotes, setDeletedNotes] = useState<Note[]>([]);
  const [deletedFolders, setDeletedFolders] = useState<Folder[]>([]);
  const [deletedPosts, setDeletedPosts] = useState<Post[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showPermanentDeleteDialog, setShowPermanentDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTrash();
  }, []);

  const loadTrash = async () => {
    try {
      const [notesRes, foldersRes, postsRes] = await Promise.all([
        fetch("/api/trash/notes", { credentials: "include" }),
        fetch("/api/trash/folders", { credentials: "include" }),
        fetch("/api/trash/posts", { credentials: "include" })
      ]);
      const notes = await notesRes.json();
      const folders = await foldersRes.json();
      const posts = await postsRes.json();
      
      // Ensure we always set arrays, even if API returns unexpected data
      setDeletedNotes(Array.isArray(notes) ? notes : []);
      setDeletedFolders(Array.isArray(folders) ? folders : []);
      setDeletedPosts(Array.isArray(posts) ? posts : []);
    } catch (err) {
      console.error("Error loading trash:", err);
      // Set empty arrays on error
      setDeletedNotes([]);
      setDeletedFolders([]);
      setDeletedPosts([]);
    }
  };

  const handleRestore = async (type: 'note' | 'folder' | 'post', id: number) => {
    try {
      const endpoint = type === 'note' ? 'notes' : type === 'folder' ? 'folders' : 'posts';
      await fetch(`/api/trash/${endpoint}/${id}/restore`, {
        method: "POST",
        credentials: "include",
      });
      await loadTrash();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePermanentDelete = async (type: 'note' | 'folder' | 'post', id: number) => {
    try {
      const endpoint = type === 'note' ? 'notes' : type === 'folder' ? 'folders' : 'posts';
      await fetch(`/api/trash/${endpoint}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      await loadTrash();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkRestore = async () => {
    setLoading(true);
    try {
      const promises = Array.from(selectedItems).map(item => {
        const [type, id] = item.split('-');
        const endpoint = type === 'note' ? 'notes' : type === 'folder' ? 'folders' : 'posts';
        return fetch(`/api/trash/${endpoint}/${id}/restore`, {
          method: "POST",
          credentials: "include",
        });
      });
      await Promise.all(promises);
      setSelectedItems(new Set());
      await loadTrash();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    setLoading(true);
    try {
      const promises = Array.from(selectedItems).map(item => {
        const [type, id] = item.split('-');
        const endpoint = type === 'note' ? 'notes' : type === 'folder' ? 'folders' : 'posts';
        return fetch(`/api/trash/${endpoint}/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
      });
      await Promise.all(promises);
      setSelectedItems(new Set());
      await loadTrash();
      setShowPermanentDeleteDialog(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (type: 'note' | 'folder' | 'post', id: number) => {
    const key = `${type}-${id}`;
    const newSelected = new Set(selectedItems);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedItems(newSelected);
  };

  const selectAll = () => {
    const allItems = new Set<string>();
    (deletedNotes || []).forEach(note => allItems.add(`note-${note.id}`));
    (deletedFolders || []).forEach(folder => allItems.add(`folder-${folder.id}`));
    (deletedPosts || []).forEach(post => allItems.add(`post-${post.id}`));
    setSelectedItems(allItems);
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  const allItems = [...(deletedNotes || []).map(n => ({ type: 'note' as const, item: n })), ...(deletedFolders || []).map(f => ({ type: 'folder' as const, item: f })), ...(deletedPosts || []).map(p => ({ type: 'post' as const, item: p }))];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Trash</h2>
          <p className="text-muted-foreground">
            Items in trash are kept for 30 days before permanent deletion.
          </p>
        </div>
        {selectedItems.size > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearSelection}>
              Clear Selection
            </Button>
            <Button variant="outline" onClick={handleBulkRestore} disabled={loading}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore Selected
            </Button>
            <Button variant="destructive" onClick={() => setShowPermanentDeleteDialog(true)} disabled={loading}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
          </div>
        )}
      </div>

      {allItems.length === 0 ? (
        <div className="text-center py-12">
          <Trash2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Trash is empty</h3>
          <p className="text-muted-foreground">Deleted items will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All
            </Button>
            <span className="text-sm text-muted-foreground">
              {selectedItems.size} of {allItems.length} selected
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {allItems.map(({ type, item }) => (
              <Card key={`${type}-${item.id}`} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedItems.has(`${type}-${item.id}`)}
                        onCheckedChange={() => toggleSelect(type, item.id)}
                      />
                      {type === 'note' ? (
                        <FileText className="h-4 w-4" />
                      ) : type === 'folder' ? (
                        <FolderIcon className="h-4 w-4" />
                      ) : (
                        <MessageSquare className="h-4 w-4" />
                      )}
                      <CardTitle className="text-sm truncate">
                        {type === 'note' ? (item as Note).title : type === 'folder' ? (item as Folder).name : (item as Post).title}
                      </CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleRestore(type, item.id)}>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Restore
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handlePermanentDelete(type, item.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Permanently
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    Deleted {new Date(item.deleted_at).toLocaleDateString()}
                  </div>
                  <Badge variant="secondary" className="mt-2">
                    {type === 'note' ? 'Note' : type === 'folder' ? 'Folder' : 'Post'}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <AlertDialog open={showPermanentDeleteDialog} onOpenChange={setShowPermanentDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Permanently</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The selected items will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground">
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}