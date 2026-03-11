'use client';

/**
 * Transactions Page
 * View and manage transaction history with filtering by year/month
 */

import React, { useState, useMemo } from 'react';
import { MainLayout } from '../components/layout';
import { Button, Card, DeleteConfirmationModal } from '../components/shared';
import { useTransactions } from '../context/TransactionContext';
import { Transaction, TransactionType } from '../types/transaction';
import { formatCurrency } from '../utils/helpers';

export default function TransactionsPage() {
  const {
    state,
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    deleteTransaction,
    deleteTransactionsForPeriod,
    summary,
  } = useTransactions();

  // Filter state
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Get available years from transactions
  const availableYears = useMemo(() => {
    const years = Object.keys(state.years).map(Number).sort((a, b) => b - a);
    if (years.length === 0) {
      years.push(new Date().getFullYear());
    }
    return years;
  }, [state.years]);

  // Get transactions for current selection
  const currentTransactions = useMemo(() => {
    const yearData = state.years[selectedYear];
    if (!yearData) return [];

    let transactions: Transaction[] = [];
    
    if (selectedMonth) {
      // Specific month
      transactions = yearData.months[selectedMonth] || [];
    } else {
      // All months for the year
      Object.values(yearData.months).forEach((monthTxns) => {
        transactions = [...transactions, ...(monthTxns || [])];
      });
    }

    // Apply filters
    if (typeFilter !== 'all') {
      transactions = transactions.filter((t) => t.type === typeFilter);
    }
    if (entityFilter !== 'all') {
      transactions = transactions.filter((t) => t.entityId === entityFilter);
    }

    // Sort by date descending
    return transactions.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [state.years, selectedYear, selectedMonth, typeFilter, entityFilter]);

  // Get unique entities for filter
  const uniqueEntities = useMemo(() => {
    const entities = new Map<string, string>();
    currentTransactions.forEach((t) => {
      entities.set(t.entityId, t.entityName);
    });
    return Array.from(entities.entries());
  }, [currentTransactions]);

  const monthNames = [
    'All Months',
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    setDeleteTarget(transaction);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteTransaction(deleteTarget.id, selectedYear, new Date(deleteTarget.createdAt).getMonth() + 1);
      setDeleteTarget(null);
    }
  };

  const handleBulkDelete = () => {
    setShowBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = () => {
    deleteTransactionsForPeriod(selectedYear, selectedMonth || undefined);
    setShowBulkDeleteConfirm(false);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-jet-black dark:text-white">
              Transactions
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              View and manage your transaction history
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Deposits</p>
            <p className="text-2xl font-bold text-emerald-600">
              +{formatCurrency(summary.totalDeposits)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Withdrawals</p>
            <p className="text-2xl font-bold text-red-600">
              -{formatCurrency(summary.totalWithdrawals)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">Net Change</p>
            <p className={`text-2xl font-bold ${summary.netChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {summary.netChange >= 0 ? '+' : ''}{formatCurrency(summary.netChange)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">Transactions</p>
            <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">
              {summary.transactionCount}
            </p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Year Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Month
              </label>
              <select
                value={selectedMonth ?? 0}
                onChange={(e) =>
                  setSelectedMonth(Number(e.target.value) || null)
                }
                className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {monthNames.map((name, index) => (
                  <option key={index} value={index}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value as TransactionType | 'all')
                }
                className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Types</option>
                <option value="deposit">Deposits</option>
                <option value="withdraw">Withdrawals</option>
              </select>
            </div>

            {/* Entity Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Account
              </label>
              <select
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Accounts</option>
                {uniqueEntities.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Bulk Delete */}
            {currentTransactions.length > 0 && (
              <Button
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Clear {selectedMonth ? monthNames[selectedMonth] : 'Year'} History
              </Button>
            )}
          </div>
        </Card>

        {/* Transactions List */}
        <Card className="overflow-hidden">
          {currentTransactions.length === 0 ? (
            <div className="p-8 text-center">
              <svg
                className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5l7 7-7 7M15 19l-7-7 7-7"
                />
              </svg>
              <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                No Transactions
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                No transactions found for the selected period.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {currentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Type Icon */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'deposit'
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-600'
                        }`}
                      >
                        {transaction.type === 'deposit' ? (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m0 0l-6-6m6 6l6-6"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 20V4m0 0l6 6m-6-6l-6 6"
                            />
                          </svg>
                        )}
                      </div>

                      {/* Details */}
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {transaction.entityName}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {transaction.description || (transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal')}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Amount */}
                      <div className="text-right">
                        <p
                          className={`text-lg font-semibold ${
                            transaction.type === 'deposit'
                              ? 'text-emerald-600'
                              : 'text-red-600'
                          }`}
                        >
                          {transaction.type === 'deposit' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Balance: {formatCurrency(transaction.balanceAfter)}
                        </p>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteTransaction(transaction)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete transaction"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <DeleteConfirmationModal
            isOpen={true}
            onClose={() => setDeleteTarget(null)}
            onConfirm={confirmDelete}
            title="Delete Transaction"
            message={`Are you sure you want to delete this ${deleteTarget.type} transaction of ${formatCurrency(deleteTarget.amount)} ${deleteTarget.type === 'deposit' ? 'to' : 'from'} ${deleteTarget.entityName}?`}
            itemName="transaction"
          />
        )}

        {/* Bulk Delete Confirmation Modal */}
        {showBulkDeleteConfirm && (
          <DeleteConfirmationModal
            isOpen={true}
            onClose={() => setShowBulkDeleteConfirm(false)}
            onConfirm={confirmBulkDelete}
            title="Clear Transaction History"
            message={`Are you sure you want to delete all ${currentTransactions.length} transactions for ${selectedMonth ? monthNames[selectedMonth] + ' ' : ''}${selectedYear}? This action cannot be undone.`}
            itemName="transactions"
            showUndoWarning={true}
          />
        )}
      </div>
    </MainLayout>
  );
}
