import React, { createContext, useContext, useState } from 'react';
import { AuthUser, UserRole } from './appStore';

interface AuthContextType {
  user: AuthUser | null;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});

const ROLE_USERS: Record<UserRole, AuthUser> = {
  patient: { id: 'p1', role: 'patient', name: 'Carlos Mendoza' },
  doctor: { id: 'd1', role: 'doctor', name: 'Dra. Patricia Vidal' },
  admin: { id: 'admin1', role: 'admin', name: 'Administrador General' },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = (role: UserRole) => setUser(ROLE_USERS[role]);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
