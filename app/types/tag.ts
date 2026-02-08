/**
 * Tag Types
 * Defines the structure for account tags
 */

import { AccountColor } from './account';

export interface Tag {
  id: string;
  name: string;
  color: AccountColor;
  customColor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTagDTO {
  name: string;
  color: AccountColor;
  customColor?: string;
}

export interface UpdateTagDTO {
  name?: string;
  color?: AccountColor;
  customColor?: string;
}
