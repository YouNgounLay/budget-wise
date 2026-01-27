/**
 * Account Types
 * Defines the structure for budget accounts
 */

export type AccountIcon =
  | 'money'
  | 'car'
  | 'grocery'
  | 'home'
  | 'health'
  | 'education'
  | 'entertainment'
  | 'travel'
  | 'clothing'
  | 'business'
  | 'food'
  | 'technology'
  | 'fitness'
  | 'gifts'
  | 'savings';

export type AccountColor =
  | 'jet-black'
  | 'yale-blue'
  | 'french-blue'
  | 'fresh-sky'
  | 'strong-cyan'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'violet'
  | 'slate';

export interface Account {
  id: string;
  name: string;
  description: string;
  amount: number;
  icon: AccountIcon;
  color: AccountColor;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountDTO {
  name: string;
  description: string;
  amount: number;
  icon: AccountIcon;
  color: AccountColor;
}

export interface UpdateAccountDTO {
  name?: string;
  description?: string;
  amount?: number;
  icon?: AccountIcon;
  color?: AccountColor;
}

export const ACCOUNT_ICONS: Record<AccountIcon, string> = {
  money: '💰',
  car: '🚗',
  grocery: '🛒',
  home: '🏠',
  health: '💊',
  education: '🎓',
  entertainment: '🎮',
  travel: '✈️',
  clothing: '👔',
  business: '💼',
  food: '🍽️',
  technology: '📱',
  fitness: '💪',
  gifts: '🎁',
  savings: '📦',
};

export const ACCOUNT_COLORS: Record<AccountColor, string> = {
  'jet-black': '#122C34',
  'yale-blue': '#224870',
  'french-blue': '#2A4494',
  'fresh-sky': '#4EA5D9',
  'strong-cyan': '#44CFCB',
  'emerald': '#10B981',
  'amber': '#F59E0B',
  'rose': '#F43F5E',
  'violet': '#8B5CF6',
  'slate': '#64748B',
};
