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
