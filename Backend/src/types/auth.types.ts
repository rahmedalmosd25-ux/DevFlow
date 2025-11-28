export interface SignUpRequest {
  email: string;
  name: string;
  password: string;
  phone: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      phone?: string;
    };
    token: string;
  };
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
}

