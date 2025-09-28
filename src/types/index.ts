// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

// User Types
export interface User {
  user_id: string;
  name: string;
  mobile: number;
  total_chits: number;
  created_at?: string;
}

export interface UserOnboardRequest {
  name: string;
  total_chits: number;
  mobile: number;
}

export interface UserDetails extends User {
  chit_payment_history: ChitPayment[];
  loan_details: Loan[];
}

// Chit Types
export interface ChitPayment {
  id: number;
  created_at: string;
  user_id: string;
  chit_id: string;
  due_amount: number;
  amount_paid: number;
  balance: number;
  weekly_installment: number;
  payment_mode?: string;
  paid_on?: string;
  is_paid: boolean;
  transaction_history: Transaction[];
}

export interface ChitPaymentRequest {
  user_id: string;
  chit_id: string;
  amount: number;
  payment_mode: string;
}

export interface ChitDeactivateRequest {
  chit_id: string;
  reason?: string;
}

export interface WeeklyChitsUpdate {
  message: string;
  current_week: number;
  payments_created: number;
  chits_processed: ChitPayment[];
}

// Loan Types
export interface Loan {
  id: number;
  created_at: string;
  loan_id: string;
  is_active: boolean;
  user_id: string;
  interest_rate: string;
  interest_type: string;
  borrowed_amount: number;
  balance: number;
  amount_paid: number;
  transaction_history: Transaction[];
  is_paid: boolean;
}

export interface LoanApplicationRequest {
  user_id: string;
  interest_rate: string;
  interest_type: string;
  borrowed_amount: number;
}

export interface LoanPaymentRequest {
  user_id: string;
  loan_id: string;
  amount: number;
  payment_mode: string;
}

export interface LoanDeactivateRequest {
  loan_id: string;
  reason?: string;
}

// Transaction Types
export interface Transaction {
  timestamp: string;
  amount: number;
  mode: string;
}

// Analytics Types
export interface Analytics {
  total_persons_applied_for_chits: number;
  total_persons_applied_for_loans: number;
  total_number_of_active_chits: number;
  total_pending_loans: number;
  total_pending_chits: number;
  amount_in_chits: number;
  amount_pending_to_be_paid_chits: number;
  amount_provided_for_loans: number;
  amount_paid_for_loans: number;
  count_of_unpaid_chits: number;
  count_of_unpaid_loans: number;
}

// Health Check Types
export interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
}

// Form Validation Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string;
}

// Navigation Types
export type RootTabParamList = {
  Dashboard: undefined;
  Users: undefined;
  Chits: undefined;
  Loans: undefined;
  Analytics: undefined;
};

export type UsersStackParamList = {
  UsersList: undefined;
  UserDetails: { userId: string };
  UserOnboard: undefined;
};

export type ChitsStackParamList = {
  ChitsOverview: undefined;
  ChitPayment: undefined;
};

export type LoansStackParamList = {
  LoansOverview: undefined;
  LoanApplication: undefined;
  LoanPayment: undefined;
};