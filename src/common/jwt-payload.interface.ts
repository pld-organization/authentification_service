import { Role } from './role.enum';

export interface JwtPayload {
  id: string;      
  sub?: number;    
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}