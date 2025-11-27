import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@shared/types';
import { MOCK_USERS } from '@shared/mock-data';
interface AuthState {
  user: User | null;
  login: (role: 'Admin' | 'Staff') => void;
  logout: () => void;
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (role) => {
        let userToLogin: User | undefined;
        if (role === 'Staff') {
          // Client request: Default to "Jabir Nasir" for staff login
          userToLogin = MOCK_USERS.find(u => u.name === 'Jabir Nasir' && u.role === 'Staff');
          // Fallback to the first staff member if Jabir Nasir is not found
          if (!userToLogin) {
            userToLogin = MOCK_USERS.find(u => u.role === 'Staff');
          }
        } else {
          // Default admin login
          userToLogin = MOCK_USERS.find(u => u.role === role);
        }
        set({ user: userToLogin || null });
      },
      logout: () => set({ user: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);