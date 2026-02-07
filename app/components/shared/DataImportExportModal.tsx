'use client';

/**
 * Data Import/Export Modal Component
 * Allows users to export data as Excel/JSON and import from files
 */

import React, { useState, useRef } from 'react';
import { Modal, Button } from '@/app/components/shared';
import { exportToJSON, exportToExcel } from '@/app/services/exportService';
import { importFromFile, ImportResult } from '@/app/services/importService';

interface DataImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: () => void;
}

type ExportFormat = 'excel' | 'json';

// Icon Components
function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

function ExcelIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm1 9h-2v2h2v2h-2v2h-2v-2H9v-2h2v-2H9V9h2V7h2v2h2v2zm-1-6V3.5L18.5 8H14z"/>
    </svg>
  );
}

function JsonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 3h2v2H5v5a2 2 0 01-2 2 2 2 0 012 2v5h2v2H5c-1.07-.27-2-.9-2-2v-4a2 2 0 00-2-2H0v-2h1a2 2 0 002-2V5a2 2 0 012-2m14 0a2 2 0 012 2v4a2 2 0 002 2h1v2h-1a2 2 0 00-2 2v4a2 2 0 01-2 2h-2v-2h2v-5a2 2 0 012-2 2 2 0 01-2-2V5h-2V3h2m-7 12a1 1 0 011 1 1 1 0 01-1 1 1 1 0 01-1-1 1 1 0 011-1m-4 0a1 1 0 011 1 1 1 0 01-1 1 1 1 0 01-1-1 1 1 0 011-1m8 0a1 1 0 011 1 1 1 0 01-1 1 1 1 0 01-1-1 1 1 0 011-1z"/>
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

export function DataImportExportModal({
  isOpen,
  onClose,
  onImportComplete,
}: DataImportExportModalProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('excel');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (exportFormat === 'excel') {
        exportToExcel();
      } else {
        exportToJSON();
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    try {
      const result = await importFromFile(selectedFile);
      setImportResult(result);
      if (result.success) {
        onImportComplete?.();
      }
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setImportResult(null);
    setSelectedFile(null);
    onClose();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Data Management" size="lg">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('export')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'export'
              ? 'border-french-blue text-french-blue'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <DownloadIcon className="w-4 h-4" />
          Export
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('import')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'import'
              ? 'border-french-blue text-french-blue'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <UploadIcon className="w-4 h-4" />
          Import
        </button>
      </div>

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Export your accounts and chains data. Choose your preferred format below.
          </p>

          {/* Format Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-jet-black dark:text-white">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setExportFormat('excel')}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                  exportFormat === 'excel'
                    ? 'border-french-blue bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <ExcelIcon className="w-8 h-8 text-green-600" />
                <div className="text-left">
                  <p className="font-medium text-jet-black dark:text-white">Excel</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Spreadsheet format (.xlsx)
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setExportFormat('json')}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                  exportFormat === 'json'
                    ? 'border-french-blue bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <JsonIcon className="w-8 h-8 text-amber-600" />
                <div className="text-left">
                  <p className="font-medium text-jet-black dark:text-white">JSON</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Developer format (.json)
                  </p>
                </div>
              </button>
            </div>
          </div>

          <Button onClick={handleExport} disabled={isExporting} fullWidth>
            {isExporting ? (
              'Exporting...'
            ) : (
              <>
                <DownloadIcon className="w-4 h-4 mr-2" />
                Export as {exportFormat === 'excel' ? 'Excel' : 'JSON'}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Import Tab */}
      {activeTab === 'import' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Import data from a previously exported file. Supports both Excel (.xlsx) and JSON (.json) formats.
          </p>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <AlertIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Warning:</strong> Importing will replace all existing data. Consider exporting your current data first as a backup.
            </p>
          </div>

          {/* File Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-french-blue dark:hover:border-fresh-sky transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            <UploadIcon className="w-10 h-10 mx-auto text-slate-400 mb-3" />
            <p className="text-sm font-medium text-jet-black dark:text-white">
              {selectedFile ? selectedFile.name : 'Click or drag file to upload'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Supports .xlsx and .json files
            </p>
          </div>

          {/* Import Result */}
          {importResult && (
            <div
              className={`p-3 rounded-lg ${
                importResult.success
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}
            >
              <div className="flex items-start gap-2">
                {importResult.success ? (
                  <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      importResult.success
                        ? 'text-green-800 dark:text-green-200'
                        : 'text-red-800 dark:text-red-200'
                    }`}
                  >
                    {importResult.message}
                  </p>
                  {importResult.success && (
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      Imported {importResult.accountsImported} accounts and{' '}
                      {importResult.chainsImported} chains
                    </p>
                  )}
                  {importResult.errors.length > 0 && (
                    <ul className="text-xs text-red-700 dark:text-red-300 mt-1 list-disc list-inside">
                      {importResult.errors.slice(0, 5).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                      {importResult.errors.length > 5 && (
                        <li>...and {importResult.errors.length - 5} more errors</li>
                      )}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleImport}
            disabled={!selectedFile || isImporting}
            fullWidth
          >
            {isImporting ? (
              'Importing...'
            ) : (
              <>
                <UploadIcon className="w-4 h-4 mr-2" />
                Import Data
              </>
            )}
          </Button>
        </div>
      )}
    </Modal>
  );
}
