import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Chaves do localStorage
const INITIATIVE_KEY = 'rpgInitiativeCharacters';
const HP_KEY = 'rpgCharactersHP';
const GUEST_PREFIX = 'guest_';

// Funções para o localStorage
const getLocalData = (key, isGuest = false) => {
  const finalKey = isGuest ? GUEST_PREFIX + key : key;
  const data = localStorage.getItem(finalKey);
  return data ? JSON.parse(data) : null;
};

const setLocalData = (key, data, isGuest = false) => {
  const finalKey = isGuest ? GUEST_PREFIX + key : key;
  localStorage.setItem(finalKey, JSON.stringify(data));
};

const clearLocalData = (isGuest = false) => {
  if (isGuest) {
    localStorage.removeItem(GUEST_PREFIX + INITIATIVE_KEY);
    localStorage.removeItem(GUEST_PREFIX + HP_KEY);
  } else {
    localStorage.removeItem(INITIATIVE_KEY);
    localStorage.removeItem(HP_KEY);
  }
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

// Funções para gerenciar dados (com suporte a modo offline)
export const saveInitiativeData = async (userId, characters) => {
  if (userId) {
    return saveUserData(userId, { initiative: characters }, 'initiativeData');
  } else {
    setLocalData(INITIATIVE_KEY, characters, true);
    return true;
  }
};

export const getInitiativeData = async (userId) => {
  if (userId) {
    const data = await getUserData(userId, 'initiativeData');
    return data?.initiative || [];
  } else {
    return getLocalData(INITIATIVE_KEY, true) || [];
  }
};

export const saveHPData = async (userId, hpValues) => {
  if (userId) {
    return saveUserData(userId, { hp: hpValues }, 'hpData');
  } else {
    setLocalData(HP_KEY, hpValues, true);
    return true;
  }
};

export const getHPData = async (userId) => {
  if (userId) {
    const data = await getUserData(userId, 'hpData');
    return data?.hp || {};
  } else {
    return getLocalData(HP_KEY, true) || {};
  }
};

// Função para migrar dados do localStorage para o Firestore
export const migrateLocalDataToFirestore = async (userId) => {
  try {
    // Verifica se existem dados de convidado
    const guestInitiativeData = getLocalData(INITIATIVE_KEY, true);
    const guestHPData = getLocalData(HP_KEY, true);

    // Se existirem dados de convidado, pergunta ao usuário se quer migrar
    if (guestInitiativeData || guestHPData) {
      const shouldMigrate = window.confirm(
        'Encontramos dados salvos localmente. Deseja importá-los para sua conta?'
      );

      if (shouldMigrate) {
        if (guestInitiativeData) {
          await saveInitiativeData(userId, guestInitiativeData);
        }
        
        if (guestHPData) {
          await saveHPData(userId, guestHPData);
        }
      }

      // Limpa os dados de convidado após a decisão
      clearLocalData(true);
    }

    // Migra dados antigos do localStorage (se existirem)
    const oldInitiativeData = getLocalData(INITIATIVE_KEY);
    const oldHPData = getLocalData(HP_KEY);

    if (oldInitiativeData) {
      await saveInitiativeData(userId, oldInitiativeData);
    }
    
    if (oldHPData) {
      await saveHPData(userId, oldHPData);
    }

    // Limpa os dados antigos do localStorage
    clearLocalData();
    
    return true;
  } catch (error) {
    console.error('Erro ao migrar dados para o Firestore:', error);
    throw error;
  }
}; 