export type MediaType = 'movie' | 'tv';
export type SearchType = 'media' | 'person'; // Novo tipo para busca

export interface MediaSearchResult {
  id: number;
  title?: string; // For movies
  name?: string; // For TV shows
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path?: string | null; 
  release_date?: string; // For movies
  first_air_date?: string; // For TV shows
  vote_average: number;
  media_type: MediaType;
  genre_ids: number[];
  popularity?: number; 
}

export interface TMDBSearchResponse {
  page: number;
  results: MediaSearchResult[]; // Pode ser usado para mídia, para pessoas usaremos um tipo específico
  total_pages: number;
  total_results: number;
}

// Novo tipo para resultados da busca de pessoas
export interface PersonSearchResult {
  id: number;
  name: string;
  original_name?: string;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
  known_for: KnownForMovieOrTVShow[]; // Filmes/Séries pelos quais a pessoa é conhecida
}

export interface TMDBSearchPersonResponse {
  page: number;
  results: PersonSearchResult[];
  total_pages: number;
  total_results: number;
}


export interface UserRatingValue {
  rating: number;
  mediaType: MediaType;
}
export interface UserRating {
  [mediaId: number]: UserRatingValue; 
}

// To store all user ratings, namespaced by userId
export interface AllUserRatings {
  [userId: string]: UserRating;
}

// --- Tipos para Detalhes da Mídia ---
interface BaseMediaDetail {
  id: number;
  overview: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  genres: { id: number; name: string }[];
  tagline: string | null;
}

export interface MovieDetail extends BaseMediaDetail {
  media_type: 'movie';
  title: string;
  original_title: string;
  release_date: string;
  runtime: number | null; 
}

export interface TVDetail extends BaseMediaDetail {
  media_type: 'tv';
  name: string;
  original_name: string;
  first_air_date: string;
  episode_run_time: number[];
  number_of_seasons: number;
  number_of_episodes: number;
  status: string; // e.g., "Returning Series", "Ended", "Canceled", "In Production"
  in_production: boolean; // true or false
}

export type MediaDetail = MovieDetail | TVDetail;

// --- Tipos para Créditos (Elenco e Equipe) ---
export interface CastMember {
  id: number;
  name: string;
  original_name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  original_name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface CreditsResponse {
  id: number; 
  cast: CastMember[];
  crew: CrewMember[];
}

// --- Tipos para Detalhes de Pessoa (Ator/Atriz) ---
export interface PersonDetail {
  id: number;
  name: string;
  biography: string | null;
  birthday: string | null; 
  deathday: string | null; 
  place_of_birth: string | null;
  profile_path: string | null;
  known_for_department: string; 
  also_known_as: string[];
  gender: number; 
  popularity: number;
}

// Representa um filme ou série na filmografia de uma pessoa
// ou nos resultados 'known_for' da busca de pessoa
export interface KnownForMovieOrTVShow {
  id: number;
  title?: string; 
  name?: string; 
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  media_type: 'movie' | 'tv'; 
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  popularity: number;
  character?: string; 
  episode_count?: number; 
}

export interface PersonCombinedCreditsResponse {
  id: number; 
  cast: KnownForMovieOrTVShow[];
  crew: KnownForMovieOrTVShow[]; 
}

// --- Tipos para Imagens de Pessoa (Ator/Atriz) ---
export interface ProfileImage {
  aspect_ratio: number;
  height: number;
  iso_639_1: string | null;
  file_path: string;
  vote_average: number;
  vote_count: number;
  width: number;
}

export interface PersonImagesResponse {
  id: number; 
  profiles: ProfileImage[];
}

// --- Tipos para Provedores de Exibição (Onde Assistir) ---
export interface WatchProviderItem {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

export interface WatchProviderCountryDetails {
  link: string;
  flatrate?: WatchProviderItem[];
  rent?: WatchProviderItem[];
  buy?: WatchProviderItem[];
}

export interface WatchProviderResults {
  [countryCode: string]: WatchProviderCountryDetails;
}

export interface WatchProvidersResponse {
  id: number;
  results: WatchProviderResults;
}

// --- Tipos para Vídeos (Trailers, etc.) ---
export interface VideoResult {
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  key: string; // YouTube video key
  site: string; // e.g., "YouTube"
  size: number;
  type: string; // e.g., "Trailer", "Teaser", "Featurette"
  official: boolean;
  published_at: string;
  id: string; // Video ID from TMDB
}

export interface VideosResponse {
  id: number;
  results: VideoResult[];
}

// --- Tipos para Autenticação ---
export interface UserCredentials {
  username?: string; // Opcional para login
  email: string;
  password?: string; // Opcional para getCurrentUser
  confirmPassword?: string; // Apenas para cadastro
}

export interface StoredUser {
  id: string;
  username: string;
  email: string;
  passwordForDemo: string; // Apenas para compatibilidade de tipo, não deve ser exposta
  createdAt: string;
  profilePictureUrl: string | null; 
  bio: string | null; 
  favoriteActorIds: number[];
  ratings: UserRating; 
  reviews: UserReviewItem[]; 
}

export interface CurrentUser {
  id: string;
  username: string;
  email: string;
  profilePictureUrl: string | null;
  favoriteActorIds: number[]; 
}

// --- Tipos para User Dashboard ---
export interface UserDashboardMediaItem {
  id: number;
  title: string;
  posterPath: string | null;
  releaseYear: string | number;
  mediaType: MediaType;
  userRating: number;
}

export interface UserDashboardActorItem {
  id: number;
  name: string;
  profilePath: string | null;
}

// --- Tipos para Avaliações de Usuários ---
export interface UserReviewItem {
  id: string; // Unique ID for the review
  userId: string;
  username: string;
  userAvatarUrl?: string | null; // URL for user's avatar
  rating: number; // 1-5 stars (rating associated with this specific review text)
  reviewDate: string; // ISO string date
  reviewText?: string | null; // Optional review text
}

export interface AllMediaReviews {
  [mediaId: number]: UserReviewItem[];
}
