import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Primeiro, verifica se há resultado de redirecionamento
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log('Usuário autenticado após redirecionamento:', result.user);
          setUser(result.user);
        }
      })
      .catch((error) => {
        console.error('Erro ao processar redirecionamento:', error);
      });

    // Depois, configura o listener de estado da autenticação
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Estado da autenticação mudou:', currentUser);
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 