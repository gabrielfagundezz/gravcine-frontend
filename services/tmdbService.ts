
import { TMDB_API_KEY, TMDB_BASE_URL } from '../constants';
import type { 
    TMDBSearchResponse, 
    MediaSearchResult, 
    MediaType, 
    MediaDetail, 
    CreditsResponse,
    PersonDetail,
    PersonCombinedCreditsResponse,
    KnownForMovieOrTVShow,
    PersonImagesResponse,
    PersonSearchResult, 
    TMDBSearchPersonResponse,
    WatchProvidersResponse,
    VideosResponse
} from '../types';

const processMediaResults = (results: any[], defaultMediaType?: MediaType): MediaSearchResult[] => {
  return results
    .map(item => {
      const media_type = item.media_type || defaultMediaType;
      return {
        ...item,
        media_type: media_type,
        title: media_type === 'movie' ? (item.title || item.original_title) : (item.name || item.original_name || item.title || item.original_title),
        name: media_type === 'tv' ? (item.name || item.original_name) : (item.title || item.original_title || item.name || item.original_name),
      };
    })
    .filter(
      (item): item is MediaSearchResult =>
        (item.media_type === 'movie' || item.media_type === 'tv') &&
        typeof item.id === 'number' &&
        (item.title || item.name) && 
        item.poster_path 
    );
};


export const searchMedia = async (query: string, limit?: number): Promise<MediaSearchResult[]> => {
  if (!query.trim()) {
    return [];
  }
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
        query
      )}&language=pt-BR&include_adult=false&page=1`
    );
    if (!response.ok) {
      throw new Error(`Erro na API TMDB (search/multi): Status ${response.status}`);
    }
    const data = (await response.json()) as TMDBSearchResponse;
    const filteredResults = data.results.filter(
        item => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path
    );
    const processedResults = processMediaResults(filteredResults);
    return limit ? processedResults.slice(0, limit) : processedResults;
  } catch (error) {
    console.error("Falha ao buscar mídia:", error);
    throw error; 
  }
};

export const searchPeople = async (query: string, limit?: number): Promise<PersonSearchResult[]> => {
  if (!query.trim()) {
    return [];
  }
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
        query
      )}&language=pt-BR&page=1&include_adult=false`
    );
    if (!response.ok) {
      throw new Error(`Erro na API TMDB (search/person): Status ${response.status}`);
    }
    const data = (await response.json()) as TMDBSearchPersonResponse;
    const filteredResults = data.results.filter(person => person.profile_path);
    return limit ? filteredResults.slice(0, limit) : filteredResults;
  } catch (error) {
    console.error("Falha ao buscar pessoas:", error);
    throw error;
  }
};


export const getPopularMedia = async (
  mediaTypeOption: 'movie' | 'tv' | 'all' = 'all',
  page: number = 1
): Promise<MediaSearchResult[]> => {
  let endpoint: string;
  let defaultMediaType: MediaType | undefined = undefined;

  switch (mediaTypeOption) {
    case 'movie':
      endpoint = 'movie/popular';
      defaultMediaType = 'movie';
      break;
    case 'tv':
      endpoint = 'tv/popular';
      defaultMediaType = 'tv';
      break;
    default: // 'all'
      endpoint = 'trending/all/week';
      break;
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/${endpoint}?api_key=${TMDB_API_KEY}&language=pt-BR&page=${page}&include_adult=false`
    );
    if (!response.ok) {
      throw new Error(`Erro na API TMDB (popular ${mediaTypeOption}): Status ${response.status}`);
    }
    const data = (await response.json()) as TMDBSearchResponse;
    return processMediaResults(data.results, defaultMediaType);
  } catch (error) {
    console.error(`Falha ao buscar mídia popular (${mediaTypeOption}):`, error);
    throw error;
  }
};

export const getMediaByGenre = async (
  genreId: number,
  mediaType: 'movie' | 'tv' = 'movie',
  page: number = 1
): Promise<MediaSearchResult[]> => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/${mediaType}?api_key=${TMDB_API_KEY}&language=pt-BR&with_genres=${genreId}&page=${page}&sort_by=popularity.desc&include_adult=false`
    );
    if (!response.ok) {
      throw new Error(`Erro na API TMDB (genre ${genreId}, ${mediaType}): Status ${response.status}`);
    }
    const data = (await response.json()) as TMDBSearchResponse;
    return processMediaResults(data.results, mediaType);
  } catch (error) {
    console.error(`Falha ao buscar mídia por gênero (${genreId}, ${mediaType}):`, error);
    throw error;
  }
};

export const getMediaDetails = async (id: number, mediaType: MediaType): Promise<MediaDetail | null> => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/${mediaType}/${id}?api_key=${TMDB_API_KEY}&language=pt-BR&append_to_response=release_dates` 
    );
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Recurso não encontrado na API TMDB (${mediaType} details, ID: ${id}): Status ${response.status}`);
        return null; 
      }
      throw new Error(`Erro na API TMDB (${mediaType} details, ID: ${id}): Status ${response.status}`);
    }
    const data = await response.json();
    return { ...data, media_type: mediaType } as MediaDetail; 
  } catch (error) {
    console.error(`Falha crítica ao buscar detalhes da mídia (${mediaType}, ID: ${id}):`, error);
    throw error; 
  }
};

export const getMediaCredits = async (id: number, mediaType: MediaType): Promise<CreditsResponse> => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/${mediaType}/${id}/credits?api_key=${TMDB_API_KEY}&language=pt-BR`
    );
    if (!response.ok) {
      throw new Error(`Erro na API TMDB (${mediaType} credits, ID: ${id}): Status ${response.status}`);
    }
    return (await response.json()) as CreditsResponse;
  } catch (error) {
    console.error(`Falha ao buscar créditos da mídia (${mediaType}, ID: ${id}):`, error);
    throw error;
  }
};

export const getMediaWatchProviders = async (id: number, mediaType: MediaType): Promise<WatchProvidersResponse> => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/${mediaType}/${id}/watch/providers?api_key=${TMDB_API_KEY}`
    );
    if (!response.ok) {
      throw new Error(`Erro na API TMDB (${mediaType} watch/providers, ID: ${id}): Status ${response.status}`);
    }
    return (await response.json()) as WatchProvidersResponse;
  } catch (error) {
    console.error(`Falha ao buscar provedores de exibição da mídia (${mediaType}, ID: ${id}):`, error);
    throw error;
  }
};

export const getMediaVideos = async (id: number, mediaType: MediaType): Promise<VideosResponse> => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/${mediaType}/${id}/videos?api_key=${TMDB_API_KEY}&language=pt-BR`
    );
    if (!response.ok) {
      throw new Error(`Erro na API TMDB (${mediaType} videos, ID: ${id}): Status ${response.status}`);
    }
    return (await response.json()) as VideosResponse;
  } catch (error) {
    console.error(`Falha ao buscar vídeos da mídia (${mediaType}, ID: ${id}):`, error);
    throw error;
  }
};

export const getPersonDetails = async (personId: number): Promise<PersonDetail> => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/person/${personId}?api_key=${TMDB_API_KEY}&language=pt-BR`
    );
    if (!response.ok) {
      // Note: App.tsx handles 404s for actors in the dashboard by catching this error.
      throw new Error(`Erro na API TMDB (person details, ID: ${personId}): Status ${response.status}`);
    }
    return (await response.json()) as PersonDetail;
  } catch (error) {
    console.error(`Falha ao buscar detalhes da pessoa (ID: ${personId}):`, error);
    throw error;
  }
};

export const getPersonCombinedCredits = async (personId: number): Promise<PersonCombinedCreditsResponse> => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/person/${personId}/combined_credits?api_key=${TMDB_API_KEY}&language=pt-BR`
    );
    if (!response.ok) {
      throw new Error(`Erro na API TMDB (person combined_credits, ID: ${personId}): Status ${response.status}`);
    }
    const data = (await response.json()) as PersonCombinedCreditsResponse;
    const filteredCast = data.cast
      .filter(item => item.poster_path && (item.media_type === 'movie' || item.media_type === 'tv')) 
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      
    return { ...data, cast: filteredCast as KnownForMovieOrTVShow[] };
  } catch (error) {
    console.error(`Falha ao buscar créditos combinados da pessoa (ID: ${personId}):`, error);
    throw error;
  }
};

export const getPersonImages = async (personId: number): Promise<PersonImagesResponse> => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/person/${personId}/images?api_key=${TMDB_API_KEY}`
    );
    if (!response.ok) {
      throw new Error(`Erro na API TMDB (person images, ID: ${personId}): Status ${response.status}`);
    }
    return (await response.json()) as PersonImagesResponse;
  } catch (error) {
    console.error(`Falha ao buscar imagens da pessoa (ID: ${personId}):`, error);
    throw error;
  }
};
