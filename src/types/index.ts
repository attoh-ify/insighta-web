export interface Profile {
  id: string;
  name: string;
  gender: string | null;
  gender_probability: number;
  age: number;
  age_group: string | null;
  country_id: string | null;
  country_name: string | null;
  country_probability: number;
  created_at: string;
}

export interface PaginationLinks {
  self: string;
  next: string | null;
  prev: string | null;
}

export interface PaginatedResponse {
  status: string;
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  links: PaginationLinks;
  data: Profile[];
}

export interface SingleProfileResponse {
  status: string;
  data: Profile;
}

export interface User {
  id: string;
  github_id: string;
  username: string;
  email: string | null;
  avatar_url: string | null;
  role: "admin" | "analyst";
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

export interface TokenResponse {
  status: string;
  access_token: string;
  refresh_token: string;
  username: string;
}

export interface ProfileFilters {
  gender?: string;
  country_id?: string;
  age_group?: string;
  min_age?: string;
  max_age?: string;
  sort_by?: string;
  order?: string;
  page?: string;
  limit?: string;
}