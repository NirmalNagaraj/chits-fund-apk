import { apiService } from './ApiService';
import { 
  ApiResponse, 
  ChitPayment, 
  ChitPaymentRequest, 
  ChitDeactivateRequest,
  WeeklyChitsUpdate 
} from '../types';

export class ChitService {
  // Update weekly chits
  async updateWeeklyChits(): Promise<ApiResponse<WeeklyChitsUpdate>> {
    return apiService.post<WeeklyChitsUpdate>('/update/weekly-chits');
  }

  // Make chit payment
  async makeChitPayment(paymentData: ChitPaymentRequest): Promise<ApiResponse<ChitPayment>> {
    return apiService.post<ChitPayment>('/pay/chit-funds', paymentData);
  }

  // Deactivate a chit
  async deactivateChit(deactivateData: ChitDeactivateRequest): Promise<ApiResponse<any>> {
    return apiService.post<any>('/chits/deactive', deactivateData);
  }
}

export const chitService = new ChitService();