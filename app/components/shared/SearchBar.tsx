'use client';

/**
 * SearchBar Component
 * Fuzzy search for accounts, chains, and tags
 */

import React, { useState, useRef, useEffect, useMemo, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAccounts } from '@/app/context/AccountContext';
import { useChains } from '@/app/context/ChainContext';
import { useTags } from '@/app/context/TagContext';
import { AccountIcon } from '@/app/types/account';
import { getLucideIcon } from '@/app/utils/lucideIconMap';
import {
  SearchAllIcon,
  WalletIcon,
  ChainLinkIcon,
  TagIcon,
  ChevronDownIcon,
} from './Icons';

type SearchFilter = 'accounts' | 'chains' | 'tags' | 'all';

interface SearchResult {
  id: string;
  name: string;
  type: 'account' | 'chain' | 'tag';
  iconKey?: AccountIcon; // Icon key for accounts (to render Lucide icons)
  color?: string;
  description?: string;
}

// Simple fuzzy match function
function fuzzyMatch(text: string, query: string): boolean {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  // Check for simple includes first
  if (lowerText.includes(lowerQuery)) return true;
  
  // Simple fuzzy matching - check if all query chars appear in order
  let queryIndex = 0;
  for (let i = 0; i < lowerText.length && queryIndex < lowerQuery.length; i++) {
    if (lowerText[i] === lowerQuery[queryIndex]) {
      queryIndex++;
    }
  }
  return queryIndex === lowerQuery.length;
}

export function SearchBar() {
  const router = useRouter();
  const { state: accountState } = useAccounts();
  const { state: chainState } = useChains();
  const { state: tagState } = useTags();
  
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<SearchFilter>('all');
  const [isOpen, setIsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Combine all searchable items
  const allResults = useMemo((): SearchResult[] => {
    const results: SearchResult[] = [];

    // Add accounts
    if (filter === 'all' || filter === 'accounts') {
      accountState.accounts.forEach(account => {
        results.push({
          id: account.id,
          name: account.name,
          type: 'account',
          iconKey: account.icon,
          color: account.color === 'custom' ? account.customColor : undefined,
          description: account.description,
        });
      });
    }

    // Add chains
    if (filter === 'all' || filter === 'chains') {
      chainState.chains.forEach(chain => {
        results.push({
          id: chain.id,
          name: chain.name,
          type: 'chain',
          // No emoji icon - will use ChainLinkIcon component
          description: chain.description,
        });
      });
    }

    // Add tags
    if (filter === 'all' || filter === 'tags') {
      tagState.tags.forEach(tag => {
        results.push({
          id: tag.id,
          name: tag.name,
          type: 'tag',
          // No emoji icon - will use TagIcon component
          color: tag.color,
        });
      });
    }

    return results;
  }, [accountState.accounts, chainState.chains, tagState.tags, filter]);

  // Filter results based on query
  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];
    return allResults.filter(result => fuzzyMatch(result.name, query));
  }, [allResults, query]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredResults]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    
    switch (result.type) {
      case 'account':
        router.push('/accounts');
        break;
      case 'chain':
        router.push('/chains');
        break;
      case 'tag':
        router.push('/tags');
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredResults.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredResults.length) % filteredResults.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredResults[selectedIndex]) {
          handleSelect(filteredResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const filterOptions: { value: SearchFilter; label: string; icon: ReactNode }[] = [
    { value: 'all', label: 'All', icon: <SearchAllIcon className="w-4 h-4" /> },
    { value: 'accounts', label: 'Accounts', icon: <WalletIcon className="w-4 h-4" /> },
    { value: 'chains', label: 'Chains', icon: <ChainLinkIcon className="w-4 h-4" /> },
    { value: 'tags', label: 'Tags', icon: <TagIcon className="w-4 h-4" /> },
  ];

  const currentFilter = filterOptions.find(f => f.value === filter) || filterOptions[0];

  return (
    <div className="relative flex flex-col sm:flex-row sm:items-center gap-0 group/searchbar" ref={dropdownRef}>
      {/* Search input container - comes first on mobile (visually) but second in DOM for tab order */}
      <div className="order-1 sm:order-2 flex items-center flex-1 bg-white dark:bg-slate-800 rounded-xl sm:rounded-l-none sm:rounded-r-xl border-2 sm:border-l-0 border-slate-200 dark:border-slate-600 shadow-sm group-hover/searchbar:border-french-blue dark:group-hover/searchbar:border-french-blue group-focus-within/searchbar:border-french-blue dark:group-focus-within/searchbar:border-french-blue transition-all duration-200">
        <div className="relative flex-1">
          <SearchAllIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-french-blue" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(e.target.value.length > 0);
            }}
            onFocus={() => query.length > 0 && setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search accounts, chains, tags..."
            className="search-input w-full pl-10 pr-4 py-2.5 bg-transparent text-sm text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-0 outline-none ring-0"
          />
        </div>
      </div>

      {/* Custom filter dropdown - below on mobile, left side on desktop */}
      <div className="order-2 sm:order-1 relative mt-2 sm:mt-0 sm:-mr-[2px] sm:z-10" ref={filterDropdownRef}>
        <button
          type="button"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-1.5 px-3 py-2.5 bg-slate-50 dark:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors rounded-xl sm:rounded-l-xl sm:rounded-r-none border-2 border-slate-200 dark:border-slate-600 hover:border-french-blue dark:hover:border-french-blue group-hover/searchbar:border-french-blue dark:group-hover/searchbar:border-french-blue group-focus-within/searchbar:border-french-blue dark:group-focus-within/searchbar:border-french-blue"
        >
          <span className="text-french-blue">{currentFilter.icon}</span>
          <span>{currentFilter.label}</span>
          <ChevronDownIcon className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {/* Filter dropdown menu */}
        {isFilterOpen && (
          <div className="absolute top-full left-0 right-0 sm:right-auto mt-1 bg-surface border border-border rounded-lg shadow-lg z-[100] min-w-[140px] overflow-hidden">
            {filterOptions.map(option => (
              <button
                key={option.value}
                onClick={() => {
                  setFilter(option.value);
                  setIsFilterOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                  filter === option.value
                    ? 'bg-french-blue/10 text-french-blue font-medium'
                    : 'text-foreground hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className={filter === option.value ? 'text-french-blue' : 'text-slate-500'}>{option.icon}</span>
                <span>{option.label}</span>
                {filter === option.value && (
                  <svg className="ml-auto w-4 h-4 text-french-blue" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && filteredResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-50 max-h-[300px] overflow-y-auto">
          {filteredResults.map((result, index) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleSelect(result)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                index === selectedIndex
                  ? 'bg-french-blue/10 text-french-blue'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {/* Render icon based on type */}
              <span className="text-lg flex items-center justify-center w-6 h-6">
                {result.type === 'account' && result.iconKey ? (
                  (() => {
                    const IconComponent = getLucideIcon(result.iconKey);
                    return <IconComponent className="w-5 h-5 text-french-blue" />;
                  })()
                ) : result.type === 'chain' ? (
                  <ChainLinkIcon className="w-5 h-5 text-french-blue" />
                ) : result.type === 'tag' ? (
                  <TagIcon className="w-5 h-5 text-french-blue" />
                ) : (
                  <WalletIcon className="w-5 h-5 text-french-blue" />
                )}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {result.name}
                </p>
                <p className="text-xs text-muted capitalize">
                  {result.type}
                  {result.description && ` • ${result.description}`}
                </p>
              </div>
              {result.color && (
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: result.color }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {isOpen && query.length > 0 && filteredResults.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-50 p-4 text-center">
          <p className="text-sm text-muted">No results found for &quot;{query}&quot;</p>
        </div>
      )}
    </div>
  );
}
