import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, getCurrentUser, logout as doLogout, loginUser, registerUser } from '@/lib/store';

interface AuthContextType {
  user: User | null;
  login: (cpf: string, senha: string) => { success: boolean; message: string };
  register: (data: Omit<User, 'id'>) => { success: boolean; message: string };
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getCurrentUser);

  const login = useCallback((cpf: string, senha: string) => {
    const result = loginUser(cpf, senha);
    if (result.success && result.user) setUser(result.user);
    return result;
  }, []);

  const register = useCallback((data: Omit<User, 'id'>) => {
    return registerUser(data);
  }, []);

  const logout = useCallback(() => {
    doLogout();
    setUser(null);
  }, []);

  const refreshUser = useCallback(() => {
    setUser(getCurrentUser());
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
