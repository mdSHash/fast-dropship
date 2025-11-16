// User types
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
  is_active?: boolean;
}

export interface UserUpdate {
  username?: string;
  email?: string;
  role?: UserRole;
  is_active?: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

// Client types
export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface ClientCreate {
  name: string;
  email: string;
  phone: string;
  location: string;
  notes?: string;
}

// Order types
export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
}

export interface Order {
  id: number;
  client_id: number;
  order_name: string;
  order_link?: string;
  quantity: number;
  cost: number;
  customer_price: number;
  taxes: number;
  profit: number;
  status: OrderStatus;
  created_at: string;
  updated_at?: string;
  completed_at?: string;
  created_by?: number;
  created_by_username?: string;
  assigned_to?: number;
  assigned_to_username?: string;
}

export interface OrderWithClient extends Order {
  client_name: string;
  client_phone: string;
  client_location: string;
}

export interface OrderCreate {
  client_id: number;
  order_name: string;
  order_link?: string;
  quantity: number;
  cost: number;
  customer_price: number;
  taxes: number;
  assigned_to?: number;
}

// Delivery types
export enum DeliveryStatus {
  PENDING = 'pending',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  FAILED = 'failed',
}

export interface Delivery {
  id: number;
  order_id: number;
  delivery_address: string;
  tracking_number?: string;
  driver_name?: string;
  driver_phone?: string;
  status: DeliveryStatus;
  notes?: string;
  created_at: string;
  updated_at?: string;
  delivered_at?: string;
  created_by?: number;
  created_by_username?: string;
}

export interface DeliveryWithOrder extends Delivery {
  order_name: string;
  client_name: string;
  client_phone: string;
}

export interface DeliveryCreate {
  order_id: number;
  delivery_address: string;
  tracking_number?: string;
  driver_name?: string;
  driver_phone?: string;
  notes?: string;
}

// Transaction types
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum TransactionCategory {
  ORDER_PAYMENT = 'order_payment',
  DELIVERY_COST = 'delivery_cost',
  PRODUCT_COST = 'product_cost',
  OPERATIONAL = 'operational',
  OTHER = 'other',
}

export interface Transaction {
  id: number;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description?: string;
  reference_id?: string;
  created_at: string;
  transaction_date: string;
  created_by?: number;
  created_by_username?: string;
}

export interface TransactionCreate {
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description?: string;
  reference_id?: string;
  transaction_date?: string;
}

// Dashboard types
export interface DashboardStats {
  monthly_profit: number;
  monthly_revenue: number;
  overall_capital: number;
  total_clients: number;
  ongoing_orders: number;
}

export interface MonthlyData {
  month: string;
  pv: number;
  uv: number;
}

export interface ChartData {
  monthly_data: MonthlyData[];
}

export interface RecentClient {
  id: number;
  name: string;
  phone: string;
  location: string;
}

export interface RecentOrder {
  id: number;
  order_name: string;
  order_link: string;
  quantity: number;
  cost: number;
  customer_price: number;
  taxes: number;
  profit: number;
}

export interface DashboardData {
  stats: DashboardStats;
  chart_data: ChartData;
  recent_clients: RecentClient[];
  recent_orders: RecentOrder[];
}

// Monthly Financials types
export interface MonthlyFinancials {
  id: number;
  year: number;
  month: number;
  monthly_profit: number;
  monthly_revenue: number;
  overall_capital: number;
  created_at: string;
  updated_at?: string;
}

export interface CurrentFinancials {
  monthly_profit: number;
  monthly_revenue: number;
  overall_capital: number;
  year: number;
  month: number;
}

export interface FinancialSummary {
  total_profit: number;
  total_revenue: number;
  current_capital: number;
  months_tracked: number;
}

// Budget Transaction types
export enum BudgetTransactionType {
  ADDITION = 'addition',
  WITHDRAWAL = 'withdrawal',
}

export enum BudgetAccount {
  MONTHLY_PROFIT = 'monthly_profit',
  OVERALL_CAPITAL = 'overall_capital',
}

export interface BudgetTransaction {
  id: number;
  type: BudgetTransactionType;
  account: BudgetAccount;
  amount: number;
  description: string;
  notes?: string;
  created_by: string;
  transaction_date: string;
  created_at: string;
}

export interface BudgetTransactionCreate {
  type: BudgetTransactionType;
  account: BudgetAccount;
  amount: number;
  description: string;
  notes?: string;
  transaction_date?: string;
}

export interface BudgetBalances {
  monthly_profit: number;
  overall_capital: number;
  last_updated: string;
}

export interface BudgetTransactionSummary {
  total_additions: number;
  total_withdrawals: number;
  net_change: number;
  transaction_count: number;
}

// Made with Bob
