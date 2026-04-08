import { tagRepository } from '../repositories/tagRepository';
import type { Task } from '@prisma/client';

const normalizeTagName = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed || null;
};

export const tagService = {
  list() {
    return tagRepository.list();
  },

  getById(id: string) {
    return tagRepository.findById(id);
  },

  async create(name: string) {
    const normalized = normalizeTagName(name);
    if (!normalized) {
      throw new Error('Tag name is required');
    }
    return tagRepository.create(normalized);
  },

  async getOrCreate(name: string) {
    const normalized = normalizeTagName(name);
    if (!normalized) {
      throw new Error('Tag name is required');
    }
    const existing = await tagRepository.findByName(normalized);
    if (existing) return existing;
    return tagRepository.create(normalized);
  },

  async assignTag(taskId: string, tagId: string) {
    try {
      return await tagRepository.assignToTask(taskId, tagId);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return null;
      }
      throw error;
    }
  },

  removeTag(taskId: string, tagId: string) {
    return tagRepository.removeFromTask(taskId, tagId);
  },

  listTasks(tagId: string) {
    return tagRepository.listTasksByTag(tagId);
  },
};
