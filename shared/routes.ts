import { z } from 'zod';
import { insertTaskSchema, Task, insertFolderSchema, Folder, insertNoteSchema, Note, insertShareSchema, Share } from './schema';

const taskResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  status: z.enum(["todo", "in_progress", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  isFavorite: z.boolean(),
  createdAt: z.date(),
});

const folderResponseSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  name: z.string(),
  createdAt: z.date(),
});

const noteResponseSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  folder_id: z.number().optional(),
  title: z.string(),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  tasks: {
    list: {
      method: 'GET' as const,
      path: '/api/tasks',
      responses: {
        200: z.array(taskResponseSchema),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/tasks/:id',
      responses: {
        200: taskResponseSchema,
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/tasks',
      input: insertTaskSchema,
      responses: {
        201: taskResponseSchema,
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/tasks/:id',
      input: insertTaskSchema.partial(),
      responses: {
        200: taskResponseSchema,
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/tasks/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  folders: {
    list: {
      method: 'GET' as const,
      path: '/api/folders',
      responses: {
        200: z.array(z.custom<Folder>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/folders',
      input: insertFolderSchema,
      responses: {
        201: z.custom<Folder>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/folders/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  notes: {
    list: {
      method: 'GET' as const,
      path: '/api/notes',
      responses: {
        200: z.array(z.custom<Note>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/notes/:id',
      responses: {
        200: z.custom<Note>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/notes',
      input: insertNoteSchema,
      responses: {
        201: z.custom<Note>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/notes/:id',
      input: insertNoteSchema.partial(),
      responses: {
        200: z.custom<Note>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/notes/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  shares: {
    list: {
      method: 'GET' as const,
      path: '/api/shares',
      responses: {
        200: z.array(z.custom<Share>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/shares',
      input: insertShareSchema,
      responses: {
        201: z.custom<Share>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/shares/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  savedPosts: {
    list: {
      method: 'GET' as const,
      path: '/api/saved-posts',
      responses: {
        200: z.array(z.custom<any>()),
      },
    },
    save: {
      method: 'POST' as const,
      path: '/api/saved-posts',
      input: z.object({ post_id: z.number() }),
      responses: {
        201: z.custom<any>(),
        400: errorSchemas.validation,
      },
    },
    unsave: {
      method: 'DELETE' as const,
      path: '/api/saved-posts/:postId',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    check: {
      method: 'GET' as const,
      path: '/api/saved-posts/check/:postId',
      responses: {
        200: z.object({ saved: z.boolean() }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
