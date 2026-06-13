import { apiRequest } from '@/lib/api-client';
import type {
  LoginRequest,
  LoginResponse,
} from '@/types/auth';

export const authApi = {
  login(payload: LoginRequest): Promise<LoginResponse> {
    return apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
