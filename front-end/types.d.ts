  interface Children {
    children: React.ReactNode;
  }

  interface User {
  id: number;
  email: string;
  images?: string[];
  videos?: string[];
  last_seen?: string;
  created_at: string;
  updated_at: string;
  }

  interface AdminUser {
  id: number;
  email: string;
  password: string;
  created_at: string;
  updated_at: string;
  last_seen: string;
  images: string[];
  videos: string[];
}

  interface Admin {
  id: number;
  email: string;
  password: string;
  created_at: string; 
  updated_at: string; 
}

  interface Domain {
  id: number;
  name: string;
  description: string;
  status: number;
  created_at: string;
  updated_at: string;
  user_id: number;
  user: User;
  image: string;
  video: string;
}

interface DomainResponse {
  currentPage: number;
  data: Domain[];
  limit: number;
  totalItems: number;
  totalPages: number;
}

interface AdminToken {
  id: number;
  token: string;
  admin_id: number;
  created_at: string; 
}

interface UserToken {
  id: number;
  token: string;
  user_id: number;
  created_at: string; 
}

interface Notification {
  id: number;
  user_id: number;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
}

interface NotificationsResponse {
  currentPage: number;
  data: Notification[];
  limit: number;
  totalItems: number;
  totalPages: number;
  unseenCount: number;
}

interface UpdateOneUserValues {
  email: string;
    password: string;
    repeatPassword: string;
    images: string[];
    videos: string[];
    newImages: [] | File[];
    newVideos: [] | File[];
}

interface ForgotResetState {
  email: string;
  code: string;
  newPassword: string;
  repeatNewPassword: string;
}