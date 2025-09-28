export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export const config: ApiConfig = {
  baseUrl: 'https://chits-backend.vercel.app',
  timeout: 10000,
  retryAttempts: 3,
};

export default config;