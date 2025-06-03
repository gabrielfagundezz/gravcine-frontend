
import React from 'react';
import type { UserDashboardMediaItem, UserDashboardActorItem, UserRating, MediaType, MediaSearchResult, MediaDetail, KnownForMovieOrTVShow } from '../types';
import { TMDB_IMAGE_BASE_URL, TMDB_PLACEHOLDER_IMAGE_URL, TMDB_PROFILE_IMAGE_BASE_URL, TMDB_PLACEHOLDER_PROFILE_URL } from '../constants';
import StarRating from './StarRating';
import HeartIcon from './icons/HeartIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

interface UserDashboardPageProps {
  isLoading: boolean;
  ratedMedia: UserDashboardMediaItem[];
  favoriteActors: UserDashboardActorItem[];
  ratings: UserRating; 
  onClose: () => void;
  onRateMedia: (mediaId: number, rating: number, mediaType: MediaType) => void; // Updated signature
  onToggleFavoriteActor: (actorId: number) => void;
  onSelectMedia: (media: MediaSearchResult | MediaDetail | KnownForMovieOrTVShow) => void; 
  onSelectActor: (actorId: number) => void;
}

const UserDashboardPage: React.FC<UserDashboardPageProps> = ({
  isLoading,
  ratedMedia,
  favoriteActors,
  ratings,
  onClose,
  onRateMedia,
  onToggleFavoriteActor,
  onSelectMedia,
  onSelectActor,
}) => {

  const handleMediaCardClick = (item: UserDashboardMediaItem) => {
    const mediaObject: MediaSearchResult = {
        id: item.id,
        title: item.title, 
        name: item.title,
        poster_path: item.posterPath,
        media_type: item.mediaType,
        overview: '', 
        genre_ids: [], 
        vote_average: 0, 
    };
    onSelectMedia(mediaObject);
  };


  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-primary-bg">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-tmdb-light-blue"></div>
        <p className="text-xl text-gray-300 mt-4">Carregando seu painel...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <button
        onClick={onClose}
        className="mb-8 flex items-center text-tmdb-light-blue hover:text-tmdb-green transition-colors duration-150 group"
        aria-label="Voltar"
      >
        <ArrowLeftIcon className="w-6 h-6 mr-2 transition-transform duration-150 group-hover:-translate-x-1" />
        <span className="font-semibold text-lg">Voltar</span>
      </button>

      <h1 className="text-4xl font-bold text-tmdb-green mb-10 text-center">Meu Painel</h1>

      <section className="mb-12">
        <h2 className="text-3xl font-semibold text-tmdb-light-blue mb-6">Minhas Avaliações</h2>
        {ratedMedia.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {ratedMedia.map((item) => (
              <div key={`${item.mediaType}-${item.id}`} 
                   className="bg-secondary-bg rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-2 border-transparent hover:border-tmdb-light-blue/50 flex flex-col">
                <button 
                    onClick={() => handleMediaCardClick(item)} 
                    className="block w-full focus:outline-none group"
                    aria-label={`Ver detalhes de ${item.title}`}
                >
                    <img
                    src={item.posterPath ? `${TMDB_IMAGE_BASE_URL}${item.posterPath}` : TMDB_PLACEHOLDER_IMAGE_URL}
                    alt={`Capa de ${item.title}`}
                    className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => (e.currentTarget.src = TMDB_PLACEHOLDER_IMAGE_URL)}
                    />
                </button>
                <div className="p-4 flex flex-col flex-grow">
                  <button 
                    onClick={() => handleMediaCardClick(item)}
                    className="focus:outline-none group"
                    aria-label={`Ver detalhes de ${item.title}`}
                  >
                    <h3 className="text-lg font-semibold text-tmdb-light-blue mb-1 truncate group-hover:text-tmdb-green transition-colors" title={item.title}>
                      {item.title} ({item.releaseYear})
                    </h3>
                  </button>
                  <div className="mt-auto pt-2">
                    <StarRating
                      rating={ratings[item.id]?.rating || 0} // Use .rating from the UserRatingValue object
                      onRatingChange={(newRating) => onRateMedia(item.id, newRating, item.mediaType)} // Pass item.mediaType
                      starSize={24}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-lg text-center py-8">Você ainda não avaliou nenhum título. Explore e comece a avaliar!</p>
        )}
      </section>

      <section>
        <h2 className="text-3xl font-semibold text-tmdb-light-blue mb-6">Meus Atores Favoritos</h2>
        {favoriteActors.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6">
            {favoriteActors.map((actor) => (
              <div key={actor.id} className="bg-secondary-bg rounded-lg shadow-md overflow-hidden text-center relative group">
                <button onClick={() => onSelectActor(actor.id)} className="block w-full focus:outline-none" aria-label={`Ver detalhes de ${actor.name}`}>
                    <img
                    src={actor.profilePath ? `${TMDB_PROFILE_IMAGE_BASE_URL}${actor.profilePath}` : TMDB_PLACEHOLDER_PROFILE_URL}
                    alt={`Foto de ${actor.name}`}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => (e.currentTarget.src = TMDB_PLACEHOLDER_PROFILE_URL)}
                    />
                </button>
                <div className="p-3">
                   <button onClick={() => onSelectActor(actor.id)} className="focus:outline-none group" aria-label={`Ver detalhes de ${actor.name}`}>
                     <p className="font-semibold text-tmdb-light-blue text-sm truncate group-hover:text-tmdb-green transition-colors" title={actor.name}>{actor.name}</p>
                   </button>
                </div>
                <button
                  onClick={() => onToggleFavoriteActor(actor.id)}
                  className="absolute top-2 right-2 p-1.5 bg-black/40 rounded-full hover:bg-black/70 transition-colors"
                  aria-label={`Desfavoritar ${actor.name}`}
                  title={`Desfavoritar ${actor.name}`}
                >
                  <HeartIcon filled={true} size={20} className="text-red-500" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-lg text-center py-8">Você ainda não favoritou nenhum ator. Encontre seus atores preferidos e adicione-os!</p>
        )}
      </section>
    </div>
  );
};

export default UserDashboardPage;
