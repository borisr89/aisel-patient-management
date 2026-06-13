import { Role } from '../../enums/role.enum';

export interface LoginResponse {
  token: string;
  user: {
    email: string;
    role: Role;
  };
}
