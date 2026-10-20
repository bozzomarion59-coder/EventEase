import { getSessionUser, loginUser, logoutUser, registerUser } from '@/services/auth';
import { User } from '@/types';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Ce que le Context met à disposition de tous les écrans
type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, statut: User['statut']) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restaure la session de l'utilisateur au démarrage de l'application
  useEffect(() => {
    async function restoreSession() {
      try {
        const currentUser = await getSessionUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Erreur lors de la restauration de la session :', error);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  // Connexion de l'utilisateur
  async function login(email: string, password: string): Promise<void> {
    const u = await loginUser(email, password);
    setUser(u);
  }

  // Inscription et connexion automatique de l'utilisateur
  async function register(name: string, email: string, password: string, statut: User['statut']): Promise<void> {
    const u = await registerUser(name, email, password, statut);
    setUser(u);
  }

  // Déconnexion de l'utilisateur
  async function logout(): Promise<void> {
    await logoutUser();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personnalisé pour consommer le contexte facilement
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l’intérieur d’un AuthProvider');
  }
  return context;
}