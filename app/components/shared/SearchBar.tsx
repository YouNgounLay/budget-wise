'use client';

/**
 * SearchBar Component
 * Fuzzy search for accounts, chains, and tags
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAccounts } from '@/app/context/AccountContext';
import { useChains } from '@/app/context/ChainContext';
import { useTags } from '@/app/context/TagContext';
import { ACCOUNT_ICONS } from '@/app/types/account';

type SearchFilter = 'accounts' | 'chains' | 'tags' | 'all';

interface SearchResult {
  id: string;
  name: string;
  type: 'account' | 'chain' | 'tag';
  icon?: string;
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

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

export function SearchBar() {
  const router = useRouter();
  const { state: accountState } = useAccounts();
  const { state: chainState } = useChains();
  const { state: tagState } = useTags();
  
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<SearchFilter>('all');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
          icon: account.icon === 'custom' ? account.customEmoji : ACCOUNT_ICONS[account.icon],
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
          icon: '🔗',
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
          icon: '🏷️',
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

  const filterOptions: { value: SearchFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'accounts', label: 'Accounts' },
    { value: 'chains', label: 'Chains' },
    { value: 'tags', label: 'Tags' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
        {/* Filter dropdown */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as SearchFilter)}
          className="px-2 py-2 bg-transparent text-sm text-slate-600 dark:text-slate-300 border-none focus:outline-none cursor-pointer"
        >
          {filterOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Search input */}
        <div className="relative flex-1">
          <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
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
            placeholder="Search..."
            className="w-full pl-8 pr-3 py-2 bg-transparent text-sm text-foreground placeholder:text-slate-400 focus:outline-none min-w-[120px] sm:min-w-[200px]"
          />
        </div>
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
              <span className="text-lg">{result.icon}</span>
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
