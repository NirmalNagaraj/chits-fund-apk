import { apiService } from './ApiService';
import { 
  ApiResponse, 
  Analytics, 
  HealthStatus 
} from '../types';

export class AnalyticsService {
  // Get system analytics
  async getAnalytics(): Promise<ApiResponse<Analytics>> {
    return apiService.get<Analytics>('/analytics');
  }

  // Health check
  async getHealthStatus(): Promise<ApiResponse<HealthStatus>> {
    return apiService.get<HealthStatus>('/health');
  }
}

export const analyticsService = new AnalyticsService();