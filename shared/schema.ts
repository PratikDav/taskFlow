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
=======
<<<<<<< HEAD
>>>>>>> e0fbc1d5f0f9aca9a16a08f28f51385ddb425180

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
<<<<<<< HEAD

export const insertBugReportSchema = z.object({
  type: z.enum(["bug", "feature"]),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
=======
<<<<<<< HEAD
=======

export const insertBugReportSchema = z.object({
  type: z.enum(["bug", "feature_request"]),
  message: z.string().min(1, "Message is required"),
>>>>>>> 847b20290ac654e0dd9fe8d9811ddeb0089668c2
});

export type InsertBugReport = z.infer<typeof insertBugReportSchema>;

export interface BugReport extends InsertBugReport {
  id: number;
  user_id: number;
<<<<<<< HEAD
  admin_message?: string;
  status: "open" | "in_progress" | "resolved" | "closed";
=======
  status: "open" | "in_progress" | "resolved" | "closed";
<<<<<<< HEAD
  admin_response: AdminResponse[] | null;
=======
  admin_response: string | null;
>>>>>>> d71d32f177fe4c2b8ae1b91763d41c1b8c70d04b
>>>>>>> 847b20290ac654e0dd9fe8d9811ddeb0089668c2
  created_at: Date;
  updated_at: Date;
}

<<<<<<< HEAD
export const insertPostReactionSchema = z.object({
  post_id: z.number(),
  reaction_type: z.enum(["gold", "silver", "bronze"]),
});

export type InsertPostReaction = z.infer<typeof insertPostReactionSchema>;

export interface PostReaction extends InsertPostReaction {
  id: number;
  user_id: number;
  created_at: Date;
}

export const insertCommentSchema = z.object({
  post_id: z.number(),
  content: z.string().min(1, "Content is required"),
});

export type InsertComment = z.infer<typeof insertCommentSchema>;

export interface Comment extends InsertComment {
  id: number;
  user_id: number;
  created_at: Date;
  updated_at: Date;
}
=======
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
>>>>>>> e0fbc1d5f0f9aca9a16a08f28f51385ddb425180
>>>>>>> 847b20290ac654e0dd9fe8d9811ddeb0089668c2
