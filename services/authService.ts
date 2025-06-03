import type { UserCredentials, StoredUser, CurrentUser, UserRating, UserReviewItem, MediaType } from '../types';

// A URL base do seu backend PHP.
// Certifique-se de que o Apache do XAMPP esteja rodando para que esta URL funcione.
const API_BASE_URL = 'http://localhost/gravcine-backend/index.php'; // Aponta para o seu index.php

const SESSION_STORAGE_KEY = 'gravcine-session'; // Manteremos a sessão no localStorage do frontend por enquanto

// --- Funções Auxiliares para o Frontend ---
// Estas funções interagem com o localStorage do navegador APENAS para gerenciar a sessão do usuário logado no frontend.
// O banco de dados real está no backend PHP.

export const getCurrentUser = (): CurrentUser | null => {
  const sessionJson = localStorage.getItem(SESSION_STORAGE_KEY);
  if (sessionJson) {
    try {
      const parsedSession = JSON.parse(sessionJson) as CurrentUser;
      // Validar se os campos essenciais existem
      if (parsedSession.id && parsedSession.username && parsedSession.email) {
        // Garantir que favoriteActorIds seja um array, mesmo que vazio
        parsedSession.favoriteActorIds = parsedSession.favoriteActorIds || [];
        return parsedSession;
      }
    } catch (e) {
      console.error("Erro ao parsear sessão do localStorage:", e);
      localStorage.removeItem(SESSION_STORAGE_KEY); // Limpar sessão inválida
    }
  }
  return null;
};

const saveCurrentUserSession = (user: CurrentUser) => {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
};

export const logoutUser = async (): Promise<void> => {
  // Em uma aplicação real, você faria uma requisição para um endpoint de logout no backend
  // para invalidar a sessão no servidor. Para este projeto, vamos apenas limpar o frontend.
  localStorage.removeItem(SESSION_STORAGE_KEY);
  await Promise.resolve(); // Simula uma operação assíncrona
};

// --- Funções que interagem com o Backend PHP ---

export const registerUser = async (credentials: UserCredentials): Promise<CurrentUser> => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Falha no registro.');
  }

  // O backend retorna diretamente a estrutura CurrentUser
  const user: CurrentUser = {
    id: data.user.id,
    username: data.user.username,
    email: data.user.email,
    profilePictureUrl: data.user.profilePictureUrl || null,
    favoriteActorIds: data.user.favoriteActorIds || [],
  };
  saveCurrentUserSession(user);
  return user;
};

export const loginUser = async (credentials: UserCredentials): Promise<CurrentUser> => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Falha no login.');
  }

  // O backend retorna diretamente a estrutura CurrentUser
  const user: CurrentUser = {
    id: data.user.id,
    username: data.user.username,
    email: data.user.email,
    profilePictureUrl: data.user.profilePictureUrl || null,
    favoriteActorIds: data.user.favoriteActorIds || [],
  };
  saveCurrentUserSession(user);
  return user;
};

// --- Funções para buscar e atualizar dados do usuário que interagem com o Backend PHP ---

export const getUserProfileById = async (userId: string): Promise<StoredUser | null> => {
  // Agora ele realmente busca o perfil do backend PHP
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    if (!response.ok) {
      const errorData = await response.json(); // Tenta ler a mensagem de erro do backend
      if (response.status === 404) return null; // Usuário não encontrado
      throw new Error(errorData.error || 'Falha ao buscar perfil do usuário.'); // Captura a mensagem de erro do backend
    }
    const data = await response.json();
    const profileData = data.profile;

    // Formatar os dados para corresponder a StoredUser
    const formattedProfile: StoredUser = {
        id: profileData.id,
        username: profileData.username,
        email: profileData.email,
        passwordForDemo: '', // Não vem do backend, é apenas para compatibilidade de tipo
        createdAt: profileData.created_at,
        profilePictureUrl: profileData.profile_picture_url || null,
        bio: profileData.bio || null,
        favoriteActorIds: profileData.favoriteActorIds || [],
        ratings: profileData.ratings || {},
        reviews: profileData.reviews || [] // Reviews ainda não estão no backend, manter vazio por enquanto
    };
    return formattedProfile;
  } catch (error: any) { // Adicionado : any para lidar com erros de fetch
    console.error("Erro ao buscar perfil do usuário no backend:", error);
    throw error;
  }
};

// Para salvar/atualizar UMA ÚNICA avaliação no backend
export const saveUserRating = async (userId: string, mediaId: number, rating: number, mediaType: MediaType): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/ratings`, {
    method: 'POST', // Ou PUT, o backend aceita ambos para upsert
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, mediaId, rating, mediaType }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Falha ao salvar a avaliação.');
  }
};

// Para remover UMA ÚNICA avaliação (rating = 0) no backend
export const deleteUserRating = async (userId: string, mediaId: number, mediaType: MediaType): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/ratings?userId=${userId}&mediaId=${mediaId}&mediaType=${mediaType}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json', // Pode ser necessário para alguns servidores
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Falha ao remover a avaliação.');
  }
};

// Para adicionar um ator favorito no backend
export const addFavoriteActor = async (userId: string, actorId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/favorite-actors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, actorId }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Falha ao adicionar ator favorito.');
  }
};

// Para remover um ator favorito no backend
export const removeFavoriteActor = async (userId: string, actorId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/favorite-actors?userId=${userId}&actorId=${actorId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json', // Pode ser necessário para alguns servidores
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Falha ao remover ator favorito.');
  }
};


// --- Funções de Atualização de Perfil (Agora implementadas para o Backend PHP) ---

export const updateUserProfileDetails = async (userId: string, updates: { username?: string; profilePictureUrl?: string | null }): Promise<CurrentUser> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Falha ao atualizar perfil.');
  }
  const updatedUser: CurrentUser = { 
      id: data.user.id,
      username: data.user.username,
      email: data.user.email,
      profilePictureUrl: data.user.profilePictureUrl || null,
      favoriteActorIds: getCurrentUser()?.favoriteActorIds || [], // Mantém os favoritos atuais da sessão
  };
  saveCurrentUserSession(updatedUser); // Atualiza a sessão local
  return updatedUser;
};

export const updateUserBio = async (userId: string, bio: string | null): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bio }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Falha ao atualizar bio.');
  }
  // Não precisa atualizar a sessão aqui, pois a bio não está no CurrentUser
};

export const updateUserEmail = async (userId: string, currentPasswordAttempt: string, newEmail: string): Promise<CurrentUser> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ currentPasswordAttempt, newEmail }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Falha ao atualizar e-mail.');
  }
  const updatedUser: CurrentUser = { 
      id: data.user.id,
      username: data.user.username,
      email: data.user.email,
      profilePictureUrl: data.user.profilePictureUrl || null,
      favoriteActorIds: getCurrentUser()?.favoriteActorIds || [], // Mantém os favoritos atuais da sessão
  };
  saveCurrentUserSession(updatedUser); // Atualiza a sessão local
  return updatedUser;
};

export const updateUserPassword = async (userId: string, currentPasswordAttempt: string, newPasswordValue: string, confirmNewPasswordValue: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ currentPasswordAttempt, newPasswordValue, confirmNewPasswordValue }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Falha ao atualizar senha.');
  }
  // Não precisa atualizar a sessão aqui, pois a senha não está no CurrentUser
};

// --- Funções de Comentários (Reviews) - NOVAS ---

export const saveReview = async (review: UserReviewItem): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(review),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Falha ao salvar o comentário.');
  }
  return data.reviewId; // Retorna o ID do review gerado/confirmado pelo backend
};

export const deleteReview = async (reviewId: string, userId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}?userId=${userId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Falha ao excluir o comentário.');
  }
};

export const fetchReviewsForMedia = async (mediaId: number): Promise<UserReviewItem[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/${mediaId}`);
    if (!response.ok) {
      if (response.status === 404) return []; // Nenhuma review encontrada para esta mídia
      throw new Error('Falha ao buscar comentários para esta mídia.');
    }
    const data = await response.json();
    return data.reviews || [];
  } catch (error) {
    console.error("Erro ao buscar comentários da mídia:", error);
    throw error;
  }
};


// ATENÇÃO: As funções abaixo não são mais usadas diretamente.
export const updateUserRatingsInStorage = async (userId: string, ratings: UserRating): Promise<void> => {
  console.warn("`updateUserRatingsInStorage` não é mais usada diretamente para salvar avaliações individuais. Use `saveUserRating` e `deleteUserRating`.");
  await Promise.resolve();
};

export const updateUserFavoriteActorsInStorage = async (userId: string, favoriteActorIds: number[]): Promise<void> => {
  console.warn("updateUserFavoriteActorsInStorage: Esta função foi substituída por `addFavoriteActor` e `removeFavoriteActor`.");
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
      const updatedUser = {...currentUser, favoriteActorIds: favoriteActorIds};
      saveCurrentUserSession(updatedUser);
  }
  await Promise.resolve();
};
