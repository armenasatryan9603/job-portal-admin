export interface User {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  avatarUrl: string | null;
  bannerUrl?: string | null;
  bio: string | null;
  creditBalance: number;
  verified: boolean;
  createdAt: string;
  deletedAt?: string | null;
  experienceYears?: number | null;
  priceMin?: number | null;
  priceMax?: number | null;
  location?: string | null;
  currency?: string | null;
  rateUnit?: string | null;
  languages?: any;
  preferences?: any;
  _count?: {
    Orders: number;
    Proposals: number;
    Reviews: number;
    Notifications: number;
  };
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface Stats {
  users: {
    total: number;
    verified: number;
    recent: number;
    byRole: Record<string, number>;
  };
  orders: {
    total: number;
    active: number;
  };
  proposals: {
    total: number;
  };
  notifications: {
    total: number;
  };
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}
