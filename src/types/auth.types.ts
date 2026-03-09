export interface LoginBody {
  nombre: string;
  password: string;
}

export interface LoginParams {
  nombre: string;
  password: string;
}

export interface JwtPayloadUser {
  id: number;
  nombre: string;
}

export interface LoginResponse {
  token: string;
  user: JwtPayloadUser;
}
