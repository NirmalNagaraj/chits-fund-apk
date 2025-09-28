import { apiService } from './ApiService';
import { 
  ApiResponse, 
  User, 
  UserDetails, 
  UserOnboardRequest 
} from '../types';

export class UserService {
  // Onboard a new user
  async onboardUser(userData: UserOnboardRequest): Promise<ApiResponse<User & { chit: any }>> {
    return apiService.post<User & { chit: any }>('/onboard', userData);
  }

  // Get all users basic details
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    return apiService.get<User[]>('/users/details');
  }

  // Get detailed user information
  async getUserDetails(userId: string): Promise<ApiResponse<UserDetails>> {
    return apiService.get<UserDetails>(`/users/details/${userId}`);
  }
}

export const userService = new UserService();