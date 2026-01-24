import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Trash2, RotateCcw, MoreHorizontal, FileText, Folder as FolderIcon, MessageSquare, AlertTriangle, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useTranslation } from "@/lib/LanguageContext";

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
  const { t } = useTranslation();
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
      setDeletedNotes(notes);
      setDeletedFolders(folders);
      setDeletedPosts(posts);
    } catch (err) {
      console.error(err);
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
    deletedNotes.forEach(note => allItems.add(`note-${note.id}`));
    deletedFolders.forEach(folder => allItems.add(`folder-${folder.id}`));
    deletedPosts.forEach(post => allItems.add(`post-${post.id}`));
    setSelectedItems(allItems);
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  const allItems = [...deletedNotes.map(n => ({ type: 'note' as const, item: n })), ...deletedFolders.map(f => ({ type: 'folder' as const, item: f })), ...deletedPosts.map(p => ({ type: 'post' as const, item: p }))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header Section */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30">
                <Trash2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  {t('trash')}
                </h1>
                <p className="text-slate-600 mt-1">
                  {t('itemsInTrashKeptFor30Days')}
                </p>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedItems.size > 0 && (
              <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/50 shadow-lg">
                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  {selectedItems.size} of {allItems.length} {t('selected')}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={clearSelection}
                    className="border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400 rounded-lg"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {t('clear')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleBulkRestore}
                    disabled={loading}
                    className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 rounded-lg"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {t('restore')}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setShowPermanentDeleteDialog(true)}
                    disabled={loading}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('permanentDelete')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {allItems.length === 0 ? (
          <Card className="rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardContent className="pt-16 pb-16">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Trash2 className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-700 mb-3">{t('trashIsEmpty')}</h3>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                  {t('deletedItemsWillAppearHere')}
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                  <Clock className="h-4 w-4" />
                  <span>{t('itemsKeptFor30Days')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Selection Controls */}
            <div className="flex items-center justify-between p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAll}
                  className="border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400 rounded-lg px-4"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Select All
                </Button>
                <div className="text-sm text-slate-600 font-medium">
                  {allItems.length} item{allItems.length !== 1 ? 's' : ''} in trash
                </div>
              </div>

              {/* Item Type Summary */}
              <div className="flex gap-3">
                {deletedNotes.length > 0 && (
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                    <FileText className="h-3 w-3 mr-1" />
                    {deletedNotes.length} Notes
                  </Badge>
                )}
                {deletedFolders.length > 0 && (
                  <Badge className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
                    <FolderIcon className="h-3 w-3 mr-1" />
                    {deletedFolders.length} Folders
                  </Badge>
                )}
                {deletedPosts.length > 0 && (
                  <Badge className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    {deletedPosts.length} Posts
                  </Badge>
                )}
              </div>
            </div>

            {/* Items Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {allItems.map(({ type, item }) => (
                <Card
                  key={`${type}-${item.id}`}
                  className={`group relative hover:shadow-xl transition-all duration-300 cursor-pointer hover:bg-gradient-to-br hover:from-white hover:to-slate-50/50 border border-slate-200/60 hover:border-slate-300/60 rounded-2xl overflow-hidden ${
                    selectedItems.has(`${type}-${item.id}`) ? 'ring-2 ring-blue-500/50 bg-blue-50/30' : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`relative ${selectedItems.has(`${type}-${item.id}`) ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-300`}>
                          <Checkbox
                            checked={selectedItems.has(`${type}-${item.id}`)}
                            onCheckedChange={() => toggleSelect(type, item.id)}
                            className="border-slate-300"
                          />
                        </div>

                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
                          type === 'note'
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                            : type === 'folder'
                            ? 'bg-gradient-to-br from-green-500 to-green-600'
                            : 'bg-gradient-to-br from-purple-500 to-purple-600'
                        }`}>
                          {type === 'note' ? (
                            <FileText className="h-5 w-5 text-white" />
                          ) : type === 'folder' ? (
                            <FolderIcon className="h-5 w-5 text-white" />
                          ) : (
                            <MessageSquare className="h-5 w-5 text-white" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base font-semibold text-slate-800 truncate">
                            {type === 'note' ? (item as Note).title : type === 'folder' ? (item as Folder).name : (item as Post).title}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="secondary"
                              className={`text-xs px-2 py-0.5 ${
                                type === 'note'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : type === 'folder'
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : 'bg-purple-50 text-purple-700 border-purple-200'
                              }`}
                            >
                              {type === 'note' ? 'Note' : type === 'folder' ? 'Folder' : 'Post'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-slate-100 rounded-lg"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => handleRestore(type, item.id)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Restore Item
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handlePermanentDelete(type, item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Permanently
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Deleted {new Date(item.deleted_at).toLocaleDateString()}</span>
                      </div>
                      <div className="text-slate-400">
                        {Math.ceil((new Date().getTime() - new Date(item.deleted_at).getTime()) / (1000 * 60 * 60 * 24))} days ago
                      </div>
                    </div>

                    {/* Auto-delete warning for items older than 25 days */}
                    {Math.ceil((new Date().getTime() - new Date(item.deleted_at).getTime()) / (1000 * 60 * 60 * 24)) > 25 && (
                      <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 text-red-700 text-xs font-medium">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Will be permanently deleted soon</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Permanent Delete Confirmation Dialog */}
      <AlertDialog open={showPermanentDeleteDialog} onOpenChange={setShowPermanentDeleteDialog}>
        <AlertDialogContent className="rounded-2xl border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <AlertDialogHeader>
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-center text-slate-800">
              Delete Permanently
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-slate-600 mt-2">
              This action cannot be undone. The selected {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} will be permanently deleted and cannot be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 pt-6">
            <AlertDialogCancel className="rounded-lg border-slate-300 hover:bg-slate-50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}