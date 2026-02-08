/**
 * Export Service
 * Handles data export to Excel and JSON formats
 */

import * as XLSX from 'xlsx';
import { Account } from '@/app/types/account';
import { Chain } from '@/app/types/chain';
import { Tag } from '@/app/types/tag';
import { getAllAccounts } from './accountService';
import { getAllChains } from './chainService';
import { getAllTags } from './tagService';

const APP_NAME = 'BudgetWise';
const EXPORT_VERSION = '1.1';

interface ExportData {
  metadata: {
    appName: string;
    version: string;
    exportDate: string;
    accountCount: number;
    chainCount: number;
    tagCount: number;
  };
  accounts: Account[];
  chains: Chain[];
  tags: Tag[];
}

/**
 * Gathers all application data for export
 */
function gatherExportData(): ExportData {
  const accounts = getAllAccounts();
  const chains = getAllChains();
  const tags = getAllTags();
  
  return {
    metadata: {
      appName: APP_NAME,
      version: EXPORT_VERSION,
      exportDate: new Date().toISOString(),
      accountCount: accounts.length,
      chainCount: chains.length,
      tagCount: tags.length,
    },
    accounts,
    chains,
    tags,
  };
}

/**
 * Triggers a file download in the browser
 */
function downloadFile(content: Blob, filename: string): void {
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports all data as a JSON file
 */
export function exportToJSON(): void {
  const data = gatherExportData();
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const filename = `budgetwise-export-${new Date().toISOString().split('T')[0]}.json`;
  downloadFile(blob, filename);
}

/**
 * Exports all data as an Excel spreadsheet
 * Creates multiple sheets: Accounts, Chains, Chain Accounts, Tags, and Metadata
 */
export function exportToExcel(): void {
  const data = gatherExportData();
  const workbook = XLSX.utils.book_new();

  // Metadata sheet
  const metadataRows = [
    ['BudgetWise Data Export'],
    [''],
    ['Property', 'Value'],
    ['Application', data.metadata.appName],
    ['Version', data.metadata.version],
    ['Export Date', data.metadata.exportDate],
    ['Total Accounts', data.metadata.accountCount],
    ['Total Chains', data.metadata.chainCount],
    ['Total Tags', data.metadata.tagCount],
  ];
  const metadataSheet = XLSX.utils.aoa_to_sheet(metadataRows);
  metadataSheet['!cols'] = [{ wch: 20 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadata');

  // Accounts sheet
  const accountHeaders = [
    'ID',
    'Name',
    'Description',
    'Amount',
    'Icon',
    'Custom Emoji',
    'Color',
    'Custom Color',
    'Tag IDs',
    'Created At',
    'Updated At',
  ];
  const accountRows = data.accounts.map((account) => [
    account.id,
    account.name,
    account.description,
    account.amount,
    account.icon,
    account.customEmoji || '',
    account.color,
    account.customColor || '',
    (account.tagIds || []).join(','),
    account.createdAt,
    account.updatedAt,
  ]);
  const accountsSheet = XLSX.utils.aoa_to_sheet([accountHeaders, ...accountRows]);
  accountsSheet['!cols'] = [
    { wch: 15 },
    { wch: 25 },
    { wch: 40 },
    { wch: 12 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 30 },
    { wch: 25 },
    { wch: 25 },
  ];
  XLSX.utils.book_append_sheet(workbook, accountsSheet, 'Accounts');

  // Chains sheet
  const chainHeaders = [
    'ID',
    'Name',
    'Description',
    'Default Limit',
    'Has Buffer',
    'Buffer Amount',
    'Distribution Mode',
    'Color',
    'Custom Color',
    'Created At',
    'Updated At',
  ];
  const chainRows = data.chains.map((chain) => [
    chain.id,
    chain.name,
    chain.description,
    chain.defaultLimit,
    chain.hasBufferAccount ? 'true' : 'false',
    chain.bufferAmount || 0,
    chain.distributionMode || 'sequential',
    chain.color || 'french-blue',
    chain.customColor || '',
    chain.createdAt,
    chain.updatedAt,
  ]);
  const chainsSheet = XLSX.utils.aoa_to_sheet([chainHeaders, ...chainRows]);
  chainsSheet['!cols'] = [
    { wch: 15 },
    { wch: 25 },
    { wch: 40 },
    { wch: 15 },
    { wch: 12 },
    { wch: 15 },
    { wch: 18 },
    { wch: 15 },
    { wch: 15 },
    { wch: 25 },
    { wch: 25 },
  ];
  XLSX.utils.book_append_sheet(workbook, chainsSheet, 'Chains');

  // Chain Accounts sheet (relationship table)
  const chainAccountHeaders = ['Chain ID', 'Chain Name', 'Account ID', 'Limit', 'Percentage'];
  const chainAccountRows: (string | number)[][] = [];
  data.chains.forEach((chain) => {
    chain.accounts.forEach((acc) => {
      chainAccountRows.push([chain.id, chain.name, acc.accountId, acc.limit, acc.percentage || 0]);
    });
  });
  const chainAccountsSheet = XLSX.utils.aoa_to_sheet([
    chainAccountHeaders,
    ...chainAccountRows,
  ]);
  chainAccountsSheet['!cols'] = [
    { wch: 15 },
    { wch: 25 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(workbook, chainAccountsSheet, 'Chain Accounts');

  // Tags sheet
  const tagHeaders = [
    'ID',
    'Name',
    'Color',
    'Custom Color',
    'Created At',
    'Updated At',
  ];
  const tagRows = data.tags.map((tag) => [
    tag.id,
    tag.name,
    tag.color,
    tag.customColor || '',
    tag.createdAt,
    tag.updatedAt,
  ]);
  const tagsSheet = XLSX.utils.aoa_to_sheet([tagHeaders, ...tagRows]);
  tagsSheet['!cols'] = [
    { wch: 15 },
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 25 },
    { wch: 25 },
  ];
  XLSX.utils.book_append_sheet(workbook, tagsSheet, 'Tags');

  // Generate and download
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const filename = `budgetwise-export-${new Date().toISOString().split('T')[0]}.xlsx`;
  downloadFile(blob, filename);
}

export type { ExportData };
