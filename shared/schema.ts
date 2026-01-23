import { z } from "zod";

export const insertTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  status: z.enum(["todo", "in_progress", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  isFavorite: z.boolean().default(false),
});

export type InsertTask = z.infer<typeof insertTaskSchema>;

export interface Task extends InsertTask {
  id: number;
  createdAt: Date;
}

export const updateTaskSchema = insertTaskSchema.partial();

export type UpdateTaskRequest = z.infer<typeof updateTaskSchema>;

export const insertFolderSchema = z.object({
  name: z.string().min(1, "Name is required"),
  parentId: z.number().nullable(),
});

export type InsertFolder = z.infer<typeof insertFolderSchema>;

export interface Folder extends InsertFolder {
  id: number;
  user_id: number;
  createdAt: Date;
}

export const insertNoteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  folderId: z.number().optional(),
});

export type InsertNote = z.infer<typeof insertNoteSchema>;

export interface Note extends InsertNote {
  id: number;
  user_id: number;
  createdAt: Date;
  updatedAt: Date;
}

export const insertNotificationSchema = z.object({
  user_id: z.number(),
  type: z.enum([
    "friend_request",
    "friend_request_accepted",
    "friend_request_rejected",
    "admin_post",
    "admin_announcement",
    "friend_post",
    "mention",
    "comment",
    "reaction",
    "system"
  ]),
  title: z.string(),
  message: z.string(),
  data: z.record(z.any()).optional(),
  is_read: z.boolean().default(false),
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export interface Notification extends InsertNotification {
  id: number;
  created_at: Date;
}

export const updateNotificationSchema = z.object({
  is_read: z.boolean(),
});

export type UpdateNotificationRequest = z.infer<typeof updateNotificationSchema>;
<<<<<<< HEAD

export const insertShareSchema = z.object({
  shared_with_user_id: z.number(),
  item_type: z.enum(["folder", "note"]),
  item_id: z.number(),
});

export type InsertShare = z.infer<typeof insertShareSchema>;

export interface Share extends InsertShare {
  id: number;
  user_id: number;
  created_at: Date;
}

export const insertSavedPostSchema = z.object({
  post_id: z.number(),
});

export type InsertSavedPost = z.infer<typeof insertSavedPostSchema>;

export interface SavedPost extends InsertSavedPost {
  id: number;
  user_id: number;
  created_at: Date;
}

export const insertBugReportSchema = z.object({
  type: z.enum(["bug", "feature_request"]),
  message: z.string().min(1, "Message is required"),
});

export type InsertBugReport = z.infer<typeof insertBugReportSchema>;

export interface BugReport extends InsertBugReport {
  id: number;
  user_id: number;
  status: "open" | "in_progress" | "resolved" | "closed";
<<<<<<< HEAD
  admin_response: AdminResponse[] | null;
=======
  admin_response: string | null;
>>>>>>> d71d32f177fe4c2b8ae1b91763d41c1b8c70d04b
  created_at: Date;
  updated_at: Date;
}

<<<<<<< HEAD
export interface AdminResponse {
  message: string;
  timestamp: Date;
}

=======
>>>>>>> d71d32f177fe4c2b8ae1b91763d41c1b8c70d04b
export const updateBugReportSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  admin_response: z.string().optional(),
});

export type UpdateBugReportRequest = z.infer<typeof updateBugReportSchema>;
<<<<<<< HEAD
=======
=======
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
>>>>>>> d71d32f177fe4c2b8ae1b91763d41c1b8c70d04b
