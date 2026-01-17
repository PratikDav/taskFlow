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
