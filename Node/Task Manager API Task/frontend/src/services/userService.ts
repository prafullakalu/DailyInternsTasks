import api from './api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export const UserService = {
  getProfile() {
    return api.get<UserProfile>('/users/me');
  },
  updateProfile(payload: Partial<Pick<UserProfile, 'name' | 'email'>>) {
    return api.put<UserProfile>('/users/me', payload);
  },
};
