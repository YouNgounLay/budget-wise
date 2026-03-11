/**
 * Import Service
 * Handles data import from Excel and JSON formats
 */

import * as XLSX from 'xlsx';
import { Account, AccountIcon, AccountColor, AccountItem } from '@/app/types/account';
import { Chain, ChainAccountConfig } from '@/app/types/chain';
import { Tag } from '@/app/types/tag';
import { AccountRule, AllocationTarget, RuleFrequency, DayOfWeek } from '@/app/types/rule';
import { TransactionStorage } from '@/app/types/transaction';
import { setToStorage, STORAGE_KEYS } from '@/app/utils/storage';
import { ExportData } from './exportService';

export interface ImportResult {
  success: boolean;
  message: string;
  accountsImported: number;
  chainsImported: number;
  tagsImported: number;
  rulesImported: number;
  transactionsImported: number;
  errors: string[];
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates account data structure
 */
function validateAccount(account: unknown, index: number): ValidationResult {
  const errors: string[] = [];
  const acc = account as Record<string, unknown>;

  if (!acc.id || typeof acc.id !== 'string') {
    errors.push(`Account ${index + 1}: Missing or invalid ID`);
  }
  if (!acc.name || typeof acc.name !== 'string') {
    errors.push(`Account ${index + 1}: Missing or invalid name`);
  }
  if (typeof acc.amount !== 'number') {
    errors.push(`Account ${index + 1}: Missing or invalid amount`);
  }
  if (!acc.icon || typeof acc.icon !== 'string') {
    errors.push(`Account ${index + 1}: Missing or invalid icon`);
  }
  if (!acc.color || typeof acc.color !== 'string') {
    errors.push(`Account ${index + 1}: Missing or invalid color`);
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validates chain data structure
 */
function validateChain(chain: unknown, index: number): ValidationResult {
  const errors: string[] = [];
  const ch = chain as Record<string, unknown>;

  if (!ch.id || typeof ch.id !== 'string') {
    errors.push(`Chain ${index + 1}: Missing or invalid ID`);
  }
  if (!ch.name || typeof ch.name !== 'string') {
    errors.push(`Chain ${index + 1}: Missing or invalid name`);
  }
  if (!Array.isArray(ch.accounts)) {
    errors.push(`Chain ${index + 1}: Missing or invalid accounts array`);
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validates tag data structure
 */
function validateTag(tag: unknown, index: number): ValidationResult {
  const errors: string[] = [];
  const t = tag as Record<string, unknown>;

  if (!t.id || typeof t.id !== 'string') {
    errors.push(`Tag ${index + 1}: Missing or invalid ID`);
  }
  if (!t.name || typeof t.name !== 'string') {
    errors.push(`Tag ${index + 1}: Missing or invalid name`);
  }
  if (!t.color || typeof t.color !== 'string') {
    errors.push(`Tag ${index + 1}: Missing or invalid color`);
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validates rule data structure
 */
function validateRule(rule: unknown, index: number): ValidationResult {
  const errors: string[] = [];
  const r = rule as Record<string, unknown>;

  if (!r.id || typeof r.id !== 'string') {
    errors.push(`Rule ${index + 1}: Missing or invalid ID`);
  }
  if (!r.sourceAccountId || typeof r.sourceAccountId !== 'string') {
    errors.push(`Rule ${index + 1}: Missing or invalid source account ID`);
  }
  if (typeof r.dayOfWeek !== 'number' || r.dayOfWeek < 0 || r.dayOfWeek > 6) {
    errors.push(`Rule ${index + 1}: Missing or invalid day of week`);
  }
  if (typeof r.thresholdAmount !== 'number') {
    errors.push(`Rule ${index + 1}: Missing or invalid threshold amount`);
  }
  if (!Array.isArray(r.targets)) {
    errors.push(`Rule ${index + 1}: Missing or invalid targets array`);
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validates the entire export data structure
 */
function validateExportData(data: unknown): ValidationResult {
  const errors: string[] = [];
  const exportData = data as ExportData;

  if (!exportData.metadata) {
    errors.push('Missing metadata section');
  }
  if (!Array.isArray(exportData.accounts)) {
    errors.push('Missing or invalid accounts array');
  } else {
    exportData.accounts.forEach((account, index) => {
      const result = validateAccount(account, index);
      errors.push(...result.errors);
    });
  }
  if (!Array.isArray(exportData.chains)) {
    errors.push('Missing or invalid chains array');
  } else {
    exportData.chains.forEach((chain, index) => {
      const result = validateChain(chain, index);
      errors.push(...result.errors);
    });
  }
  // Tags are optional for backward compatibility
  if (exportData.tags && Array.isArray(exportData.tags)) {
    exportData.tags.forEach((tag, index) => {
      const result = validateTag(tag, index);
      errors.push(...result.errors);
    });
  }

  // Rules are optional for backward compatibility
  if (exportData.rules && Array.isArray(exportData.rules)) {
    exportData.rules.forEach((rule, index) => {
      const result = validateRule(rule, index);
      errors.push(...result.errors);
    });
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Imports data from a JSON file
 */
export async function importFromJSON(file: File): Promise<ImportResult> {
  try {
    const text = await file.text();
    const data = JSON.parse(text) as ExportData;

    const validation = validateExportData(data);
    if (!validation.isValid) {
      return {
        success: false,
        message: 'Validation failed',
        accountsImported: 0,
        chainsImported: 0,
        tagsImported: 0,
        rulesImported: 0,
        transactionsImported: 0,
        errors: validation.errors,
      };
    }

    // Ensure accounts have tagIds array and items array (backward compatibility)
    const accountsWithTags = data.accounts.map((acc) => ({
      ...acc,
      tagIds: acc.tagIds || [],
      items: acc.items || [],
    }));

    // Ensure chains have color (backward compatibility)
    const chainsWithColor = data.chains.map((chain) => ({
      ...chain,
      color: chain.color || 'french-blue',
    }));

    // Ensure tags have entityType (backward compatibility - default to 'account')
    const tagsWithEntityType = data.tags
      ? data.tags.map((tag) => ({
          ...tag,
          entityType: tag.entityType || 'account',
        }))
      : [];

    // Save to storage
    setToStorage(STORAGE_KEYS.ACCOUNTS, accountsWithTags);
    setToStorage(STORAGE_KEYS.CHAINS, chainsWithColor);
    if (tagsWithEntityType.length > 0) {
      setToStorage(STORAGE_KEYS.TAGS, tagsWithEntityType);
    }
    if (data.rules) {
      // Ensure rules have frequency and mode fields (backward compatibility)
      const rulesWithFrequency = data.rules.map((rule) => ({
        ...rule,
        frequency: rule.frequency || 'weekly',
        targets: rule.targets.map((t) => ({
          ...t,
          mode: t.mode || 'percentage',
        })),
      }));
      setToStorage(STORAGE_KEYS.RULES, rulesWithFrequency);
    }

    // Import transactions if present
    let transactionCount = 0;
    if (data.transactions) {
      setToStorage(STORAGE_KEYS.TRANSACTIONS, data.transactions);
      // Count transactions
      Object.values(data.transactions.years || {}).forEach((year) => {
        Object.values(year.months).forEach((monthTxns) => {
          transactionCount += (monthTxns as unknown[]).length;
        });
      });
    }

    // Import settings if present (custom colors, fonts, saved descriptions)
    if (data.settings) {
      if (data.settings.customColors && Array.isArray(data.settings.customColors)) {
        setToStorage(STORAGE_KEYS.CUSTOM_COLORS, data.settings.customColors);
      }
      if (data.settings.fontSettings) {
        setToStorage(STORAGE_KEYS.ACTIVE_FONT, data.settings.fontSettings);
      }
      if (data.settings.customFonts && Array.isArray(data.settings.customFonts)) {
        setToStorage(STORAGE_KEYS.CUSTOM_FONTS, data.settings.customFonts);
      }
      if (data.settings.savedChainDescriptions && Array.isArray(data.settings.savedChainDescriptions)) {
        setToStorage(STORAGE_KEYS.SAVED_CHAIN_DESCRIPTIONS, data.settings.savedChainDescriptions);
      }
    }

    return {
      success: true,
      message: 'Import successful',
      accountsImported: data.accounts.length,
      chainsImported: data.chains.length,
      tagsImported: tagsWithEntityType.length,
      rulesImported: data.rules?.length || 0,
      transactionsImported: transactionCount,
      errors: [],
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to parse JSON file',
      accountsImported: 0,
      chainsImported: 0,
      tagsImported: 0,
      rulesImported: 0,
      transactionsImported: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}

/**
 * Imports data from an Excel file
 */
export async function importFromExcel(file: File): Promise<ImportResult> {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    const errors: string[] = [];

    // Check required sheets exist
    if (!workbook.SheetNames.includes('Accounts')) {
      errors.push('Missing "Accounts" sheet');
    }
    if (!workbook.SheetNames.includes('Chains')) {
      errors.push('Missing "Chains" sheet');
    }

    if (errors.length > 0) {
      return {
        success: false,
        message: 'Invalid Excel structure',
        accountsImported: 0,
        chainsImported: 0,
        tagsImported: 0,
        rulesImported: 0,
        transactionsImported: 0,
        errors,
      };
    }

    // Parse Accounts sheet
    const accountsSheet = workbook.Sheets['Accounts'];
    const accountsRaw = XLSX.utils.sheet_to_json<Record<string, unknown>>(accountsSheet);
    
    const accounts: Account[] = accountsRaw.map((row) => ({
      id: String(row['ID'] || ''),
      name: String(row['Name'] || ''),
      description: String(row['Description'] || ''),
      amount: Number(row['Amount']) || 0,
      icon: String(row['Icon'] || 'money') as AccountIcon,
      color: String(row['Color'] || 'french-blue') as AccountColor,
      customColor: row['Custom Color'] ? String(row['Custom Color']) : undefined,
      tagIds: row['Tag IDs'] ? String(row['Tag IDs']).split(',').map(id => id.trim()).filter(Boolean) : [],
      items: [], // Will be populated from Account Items sheet
      createdAt: String(row['Created At'] || new Date().toISOString()),
      updatedAt: String(row['Updated At'] || new Date().toISOString()),
    }));

    // Parse Account Items sheet if exists
    if (workbook.SheetNames.includes('Account Items')) {
      const accountItemsSheet = workbook.Sheets['Account Items'];
      const accountItemsRaw = XLSX.utils.sheet_to_json<Record<string, unknown>>(accountItemsSheet);
      
      accountItemsRaw.forEach((row) => {
        const accountId = String(row['Account ID'] || '');
        const item: AccountItem = {
          id: String(row['Item ID'] || ''),
          name: String(row['Item Name'] || ''),
          cost: Number(row['Item Cost']) || 0,
        };
        
        const account = accounts.find(a => a.id === accountId);
        if (account) {
          if (!account.items) {
            account.items = [];
          }
          account.items.push(item);
        }
      });
    }

    // Parse Chains sheet
    const chainsSheet = workbook.Sheets['Chains'];
    const chainsRaw = XLSX.utils.sheet_to_json<Record<string, unknown>>(chainsSheet);

    // Parse Chain Accounts sheet if exists
    let chainAccountsMap: Map<string, ChainAccountConfig[]> = new Map();
    if (workbook.SheetNames.includes('Chain Accounts')) {
      const chainAccountsSheet = workbook.Sheets['Chain Accounts'];
      const chainAccountsRaw = XLSX.utils.sheet_to_json<Record<string, unknown>>(chainAccountsSheet);
      
      chainAccountsRaw.forEach((row) => {
        const chainId = String(row['Chain ID'] || '');
        const config: ChainAccountConfig = {
          accountId: String(row['Account ID'] || ''),
          limit: Number(row['Limit']) || 0,
          percentage: Number(row['Percentage']) || 0,
        };
        
        if (!chainAccountsMap.has(chainId)) {
          chainAccountsMap.set(chainId, []);
        }
        chainAccountsMap.get(chainId)?.push(config);
      });
    }

    const chains: Chain[] = chainsRaw.map((row) => {
      const chainId = String(row['ID'] || '');
      const distributionModeRaw = String(row['Distribution Mode'] || 'sequential');
      const distributionMode = distributionModeRaw === 'percentage' ? 'percentage' : 'sequential';
      return {
        id: chainId,
        name: String(row['Name'] || ''),
        description: String(row['Description'] || ''),
        defaultLimit: Number(row['Default Limit']) || 2000,
        hasBufferAccount: row['Has Buffer'] === 'true' || row['Has Buffer'] === true,
        bufferAmount: Number(row['Buffer Amount']) || 0,
        bufferAccountId: row['Buffer Account ID'] ? String(row['Buffer Account ID']) : undefined,
        accounts: chainAccountsMap.get(chainId) || [],
        distributionMode: distributionMode as 'sequential' | 'percentage',
        color: (String(row['Color'] || 'french-blue')) as AccountColor,
        customColor: row['Custom Color'] ? String(row['Custom Color']) : undefined,
        createdAt: String(row['Created At'] || new Date().toISOString()),
        updatedAt: String(row['Updated At'] || new Date().toISOString()),
      };
    });

    // Parse Tags sheet if exists
    let tags: Tag[] = [];
    if (workbook.SheetNames.includes('Tags')) {
      const tagsSheet = workbook.Sheets['Tags'];
      const tagsRaw = XLSX.utils.sheet_to_json<Record<string, unknown>>(tagsSheet);
      
      tags = tagsRaw.map((row) => ({
        id: String(row['ID'] || ''),
        name: String(row['Name'] || ''),
        color: (String(row['Color'] || 'french-blue')) as AccountColor,
        customColor: row['Custom Color'] ? String(row['Custom Color']) : undefined,
        entityType: (String(row['Entity Type'] || 'account')) as Tag['entityType'],
        createdAt: String(row['Created At'] || new Date().toISOString()),
        updatedAt: String(row['Updated At'] || new Date().toISOString()),
      }));
    }

    // Parse Rules sheet if exists
    let rules: AccountRule[] = [];
    let ruleTargetsMap: Map<string, AllocationTarget[]> = new Map();
    
    if (workbook.SheetNames.includes('Rule Targets')) {
      const ruleTargetsSheet = workbook.Sheets['Rule Targets'];
      const ruleTargetsRaw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ruleTargetsSheet);
      
      ruleTargetsRaw.forEach((row) => {
        const ruleId = String(row['Rule ID'] || '');
        const target: AllocationTarget = {
          accountId: String(row['Target Account ID'] || ''),
          percentage: Number(row['Percentage']) || 0,
          amount: row['Amount'] ? Number(row['Amount']) : undefined,
          mode: (String(row['Mode'] || 'percentage')) as AllocationTarget['mode'],
        };
        
        if (!ruleTargetsMap.has(ruleId)) {
          ruleTargetsMap.set(ruleId, []);
        }
        ruleTargetsMap.get(ruleId)?.push(target);
      });
    }
    
    if (workbook.SheetNames.includes('Rules')) {
      const rulesSheet = workbook.Sheets['Rules'];
      const rulesRaw = XLSX.utils.sheet_to_json<Record<string, unknown>>(rulesSheet);
      
      rules = rulesRaw.map((row) => {
        const ruleId = String(row['ID'] || '');
        return {
          id: ruleId,
          sourceAccountId: String(row['Source Account ID'] || ''),
          dayOfWeek: (Number(row['Day of Week']) || 0) as DayOfWeek,
          frequency: (String(row['Frequency'] || 'weekly')) as RuleFrequency,
          thresholdAmount: Number(row['Threshold Amount']) || 0,
          targets: ruleTargetsMap.get(ruleId) || [],
          isActive: row['Is Active'] === 'true' || row['Is Active'] === true,
          lastExecuted: row['Last Executed'] ? String(row['Last Executed']) : null,
          createdAt: String(row['Created At'] || new Date().toISOString()),
          updatedAt: String(row['Updated At'] || new Date().toISOString()),
        };
      });
    }

    // Validate imported data
    accounts.forEach((account, index) => {
      const result = validateAccount(account, index);
      errors.push(...result.errors);
    });
    chains.forEach((chain, index) => {
      const result = validateChain(chain, index);
      errors.push(...result.errors);
    });
    tags.forEach((tag, index) => {
      const result = validateTag(tag, index);
      errors.push(...result.errors);
    });
    rules.forEach((rule, index) => {
      const result = validateRule(rule, index);
      errors.push(...result.errors);
    });

    if (errors.length > 0) {
      return {
        success: false,
        message: 'Validation failed',
        accountsImported: 0,
        chainsImported: 0,
        tagsImported: 0,
        rulesImported: 0,
        transactionsImported: 0,
        errors,
      };
    }

    // Save to storage
    setToStorage(STORAGE_KEYS.ACCOUNTS, accounts);
    setToStorage(STORAGE_KEYS.CHAINS, chains);
    if (tags.length > 0) {
      setToStorage(STORAGE_KEYS.TAGS, tags);
    }
    if (rules.length > 0) {
      setToStorage(STORAGE_KEYS.RULES, rules);
    }

    return {
      success: true,
      message: 'Import successful',
      accountsImported: accounts.length,
      chainsImported: chains.length,
      tagsImported: tags.length,
      rulesImported: rules.length,
      transactionsImported: 0,
      errors: [],
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to parse Excel file',
      accountsImported: 0,
      chainsImported: 0,
      tagsImported: 0,
      rulesImported: 0,
      transactionsImported: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}

/**
 * Detects file type and imports accordingly
 */
export async function importFromFile(file: File): Promise<ImportResult> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (extension === 'json') {
    return importFromJSON(file);
  } else if (extension === 'xlsx' || extension === 'xls') {
    return importFromExcel(file);
  } else {
    return {
      success: false,
      message: 'Unsupported file type',
      accountsImported: 0,
      chainsImported: 0,
      tagsImported: 0,
      rulesImported: 0,
      transactionsImported: 0,
      errors: ['Please upload a .json or .xlsx file'],
    };
  }
}
