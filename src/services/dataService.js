import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Chaves do localStorage (mantidas para migração)
const INITIATIVE_KEY = 'rpgInitiativeCharacters';
const HP_KEY = 'rpgCharactersHP';

// Funções auxiliares para migração
const getLocalData = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

const clearLocalData = () => {
  localStorage.removeItem(INITIATIVE_KEY);
  localStorage.removeItem(HP_KEY);
};

// Funções para o Firestore
export const saveUserData = async (userId, data, collection = 'userData') => {
  try {
    const userDocRef = doc(db, collection, userId);
    await setDoc(userDocRef, data, { merge: true });
    return true;
  } catch (error) {
    console.error('Erro ao salvar dados no Firestore:', error);
    throw error;
  }
};

export const getUserData = async (userId, collection = 'userData') => {
  try {
    const docRef = doc(db, collection, userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar dados do Firestore:', error);
    throw error;
  }
};

// Funções específicas para iniciativa
export const saveInitiativeData = async (userId, characters) => {
  return saveUserData(userId, { initiative: characters }, 'initiativeData');
};

export const getInitiativeData = async (userId) => {
  const data = await getUserData(userId, 'initiativeData');
  return data?.initiative || [];
};

// Funções específicas para HP
export const saveHPData = async (userId, hpValues) => {
  return saveUserData(userId, { hp: hpValues }, 'hpData');
};

export const getHPData = async (userId) => {
  const data = await getUserData(userId, 'hpData');
  return data?.hp || {};
};

// Função para migrar dados do localStorage para o Firestore
export const migrateLocalDataToFirestore = async (userId) => {
  try {
    const initiativeData = getLocalData(INITIATIVE_KEY);
    const hpData = getLocalData(HP_KEY);

    if (initiativeData) {
      await saveInitiativeData(userId, initiativeData);
    }
    
    if (hpData) {
      await saveHPData(userId, hpData);
    }

    // Limpa os dados do localStorage após migração bem-sucedida
    clearLocalData();
    
    return true;
  } catch (error) {
    console.error('Erro ao migrar dados para o Firestore:', error);
    throw error;
  }
}; 