'use client';

/**
 * Tag Context
 * Global state management for tags
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
} from 'react';
import { Tag, CreateTagDTO, UpdateTagDTO, TagEntityType } from '@/app/types/tag';
import { getAllTags, saveAllTags } from '@/app/services/tagService';
import { generateId, getCurrentTimestamp } from '@/app/utils/helpers';

// State type
interface TagState {
  tags: Tag[];
  isLoading: boolean;
  error: string | null;
}

// Action types
type TagAction =
  | { type: 'SET_TAGS'; payload: Tag[] }
  | { type: 'ADD_TAG'; payload: Tag }
  | { type: 'UPDATE_TAG'; payload: Tag }
  | { type: 'DELETE_TAG'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Context type
interface TagContextType {
  state: TagState;
  createTag: (data: CreateTagDTO) => Tag;
  updateTag: (id: string, data: UpdateTagDTO) => Tag | null;
  deleteTag: (id: string) => boolean;
  getTagById: (id: string) => Tag | undefined;
  getTagsByIds: (ids: string[]) => Tag[];
  getTagsByEntityType: (entityType: TagEntityType) => Tag[];
}

// Initial state
const initialState: TagState = {
  tags: [],
  isLoading: true,
  error: null,
};

// Reducer
function tagReducer(state: TagState, action: TagAction): TagState {
  switch (action.type) {
    case 'SET_TAGS':
      return { ...state, tags: action.payload, isLoading: false };
    case 'ADD_TAG':
      return { ...state, tags: [...state.tags, action.payload] };
    case 'UPDATE_TAG':
      return {
        ...state,
        tags: state.tags.map((tag) =>
          tag.id === action.payload.id ? action.payload : tag
        ),
      };
    case 'DELETE_TAG':
      return {
        ...state,
        tags: state.tags.filter((tag) => tag.id !== action.payload),
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

// Context
const TagContext = createContext<TagContextType | undefined>(undefined);

// Provider
export function TagProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tagReducer, initialState);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoad = useRef(true);

  // Load tags on mount
  useEffect(() => {
    const tags = getAllTags();
    dispatch({ type: 'SET_TAGS', payload: tags });
    isInitialLoad.current = false;
  }, []);

  // Save to storage with debounce (skip initial load)
  useEffect(() => {
    if (isInitialLoad.current || state.isLoading) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveAllTags(state.tags);
    }, 300);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state.tags, state.isLoading]);

  const createTagAction = useCallback((data: CreateTagDTO): Tag => {
    const now = getCurrentTimestamp();
    const newTag: Tag = {
      id: generateId(),
      name: data.name,
      color: data.color,
      customColor: data.customColor,
      entityType: data.entityType,
      createdAt: now,
      updatedAt: now,
    };

    dispatch({ type: 'ADD_TAG', payload: newTag });
    return newTag;
  }, []);

  const updateTagAction = useCallback(
    (id: string, data: UpdateTagDTO): Tag | null => {
      const tag = state.tags.find((t) => t.id === id);
      if (!tag) return null;

      const updatedTag: Tag = {
        ...tag,
        ...data,
        updatedAt: getCurrentTimestamp(),
      };

      dispatch({ type: 'UPDATE_TAG', payload: updatedTag });
      return updatedTag;
    },
    [state.tags]
  );

  const deleteTagAction = useCallback(
    (id: string): boolean => {
      const exists = state.tags.some((t) => t.id === id);
      if (!exists) return false;

      dispatch({ type: 'DELETE_TAG', payload: id });
      return true;
    },
    [state.tags]
  );

  const getTagById = useCallback(
    (id: string): Tag | undefined => {
      return state.tags.find((t) => t.id === id);
    },
    [state.tags]
  );

  const getTagsByIds = useCallback(
    (ids: string[]): Tag[] => {
      return state.tags.filter((t) => ids.includes(t.id));
    },
    [state.tags]
  );

  const getTagsByEntityType = useCallback(
    (entityType: TagEntityType): Tag[] => {
      return state.tags.filter((t) => t.entityType === entityType);
    },
    [state.tags]
  );

  const contextValue = useMemo(
    () => ({
      state,
      createTag: createTagAction,
      updateTag: updateTagAction,
      deleteTag: deleteTagAction,
      getTagById,
      getTagsByIds,
      getTagsByEntityType,
    }),
    [state, createTagAction, updateTagAction, deleteTagAction, getTagById, getTagsByIds, getTagsByEntityType]
  );

  return <TagContext.Provider value={contextValue}>{children}</TagContext.Provider>;
}

// Hook
export function useTags() {
  const context = useContext(TagContext);
  if (context === undefined) {
    throw new Error('useTags must be used within a TagProvider');
  }
  return context;
}
