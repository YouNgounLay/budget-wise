/**
 * Tag Service
 * Handles CRUD operations for tags
 */

import { Tag, CreateTagDTO, UpdateTagDTO } from '@/app/types/tag';
import { getFromStorage, setToStorage, STORAGE_KEYS } from '@/app/utils/storage';
import { generateId, getCurrentTimestamp } from '@/app/utils/helpers';

/**
 * Get all tags from storage
 */
export function getAllTags(): Tag[] {
  return getFromStorage<Tag[]>(STORAGE_KEYS.TAGS) || [];
}

/**
 * Save all tags to storage
 */
export function saveAllTags(tags: Tag[]): boolean {
  return setToStorage(STORAGE_KEYS.TAGS, tags);
}

/**
 * Get a tag by ID
 */
export function getTagById(id: string): Tag | undefined {
  const tags = getAllTags();
  return tags.find((tag) => tag.id === id);
}

/**
 * Create a new tag
 */
export function createTag(data: CreateTagDTO): Tag {
  const tags = getAllTags();
  const now = getCurrentTimestamp();

  const newTag: Tag = {
    id: generateId(),
    name: data.name,
    color: data.color,
    customColor: data.customColor,
    createdAt: now,
    updatedAt: now,
  };

  tags.push(newTag);
  saveAllTags(tags);

  return newTag;
}

/**
 * Update an existing tag
 */
export function updateTag(id: string, data: UpdateTagDTO): Tag | null {
  const tags = getAllTags();
  const index = tags.findIndex((tag) => tag.id === id);

  if (index === -1) return null;

  const updatedTag: Tag = {
    ...tags[index],
    ...data,
    updatedAt: getCurrentTimestamp(),
  };

  tags[index] = updatedTag;
  saveAllTags(tags);

  return updatedTag;
}

/**
 * Delete a tag
 */
export function deleteTag(id: string): boolean {
  const tags = getAllTags();
  const filteredTags = tags.filter((tag) => tag.id !== id);

  if (filteredTags.length === tags.length) return false;

  saveAllTags(filteredTags);
  return true;
}

/**
 * Get tag by name (case-insensitive)
 */
export function getTagByName(name: string): Tag | undefined {
  const tags = getAllTags();
  return tags.find((tag) => tag.name.toLowerCase() === name.toLowerCase());
}
