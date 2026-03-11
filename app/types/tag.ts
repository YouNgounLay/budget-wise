/**
 * Tag Types
 * Defines the structure for tags (account and transaction)
 */

import { AccountColor } from './account';

/**
 * Tag entity type - what the tag is applied to
 */
export type TagEntityType = 'account' | 'transaction';

export interface Tag {
  id: string;
  name: string;
  color: AccountColor;
  customColor?: string;
  entityType: TagEntityType; // Differentiates account tags from transaction tags
  createdAt: string;
  updatedAt: string;
}

export interface CreateTagDTO {
  name: string;
  color: AccountColor;
  customColor?: string;
  entityType: TagEntityType;
}

export interface UpdateTagDTO {
  name?: string;
  color?: AccountColor;
  customColor?: string;
}
