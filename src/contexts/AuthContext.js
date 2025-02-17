import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { migrateLocalDataToFirestore } from '../services/dataService';
import '../styles/special-user.css';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataMigrated, setDataMigrated] = useState(false);

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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('Estado da autenticação mudou:', currentUser);
      
      // Se o usuário acabou de fazer login e ainda não migramos os dados
      if (currentUser && !dataMigrated) {
        try {
          await migrateLocalDataToFirestore(currentUser.uid);
          setDataMigrated(true);
        } catch (error) {
          console.error('Erro ao migrar dados:', error);
        }
      }

      // Adiciona ou remove a classe special-user com base no email
      if (currentUser?.email === 'gu.almeidan2007@gmail.com') {
        document.body.classList.add('special-user');
      } else {
        document.body.classList.remove('special-user');
      }
      
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      document.body.classList.remove('special-user');
    };
  }, [dataMigrated]);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isCreator: user?.email === 'gu.almeidan2007@gmail.com'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 