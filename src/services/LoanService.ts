import { apiService } from './ApiService';
import { 
  ApiResponse, 
  Loan, 
  LoanApplicationRequest, 
  LoanPaymentRequest, 
  LoanDeactivateRequest 
} from '../types';

export class LoanService {
  // Apply for a loan
  async applyForLoan(loanData: LoanApplicationRequest): Promise<ApiResponse<Loan>> {
    return apiService.post<Loan>('/loan/apply', loanData);
  }

  // Make loan payment
  async makeLoanPayment(paymentData: LoanPaymentRequest): Promise<ApiResponse<Loan>> {
    return apiService.post<Loan>('/loan/pay', paymentData);
  }

  // Deactivate a loan
  async deactivateLoan(deactivateData: LoanDeactivateRequest): Promise<ApiResponse<any>> {
    return apiService.post<any>('/loan/deactive', deactivateData);
  }
}

export const loanService = new LoanService();