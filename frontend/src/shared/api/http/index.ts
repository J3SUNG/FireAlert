import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

interface HttpClientOptions extends AxiosRequestConfig {
  headers?: Record<string, string>;
}

// Single Responsibility Principle: This module only handles HTTP communication
// Dependency Inversion Principle: Higher-level modules depend on this abstraction
export class HttpClient {
  private client: AxiosInstance;

  constructor(baseURL = '', options: HttpClientOptions = {}) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    // Add request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Get token from storage if it exists
        const token = localStorage.getItem('token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response.data,
      (error) => {
        // Handle 401 Unauthorized
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          // You might want to redirect to login page here
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, params = {}): Promise<T> {
    return this.client.get<T, T>(url, { params });
  }

  async post<T>(url: string, data = {}): Promise<T> {
    return this.client.post<T, T>(url, data);
  }

  async put<T>(url: string, data = {}): Promise<T> {
    return this.client.put<T, T>(url, data);
  }

  async delete<T>(url: string): Promise<T> {
    return this.client.delete<T, T>(url);
  }
}

// Create a singleton instance for the application
const apiUrl = (import.meta.env.VITE_API_URL as string) || '/api';
export const httpClient = new HttpClient(apiUrl);

export default httpClient;