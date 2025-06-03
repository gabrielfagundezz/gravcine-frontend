
import React from 'react';
import type { MediaSearchResult, MediaType } from '../types';
import { TMDB_IMAGE_BASE_URL, TMDB_PLACEHOLDER_IMAGE_URL } from '../constants';
import StarRating from './StarRating';

interface MediaCardProps {
  media: MediaSearchResult;
  currentRating: number;
  onRate: (mediaId: number, rating: number, mediaType: MediaType) => void; // Updated signature
  onSelectMedia: (media: MediaSearchResult) => void;
}

const MediaCard: React.FC<MediaCardProps> = ({ media, currentRating, onRate, onSelectMedia }) => {
  const title = media.title || media.name || "Título Desconhecido";
  const posterUrl = media.poster_path
    ? `${TMDB_IMAGE_BASE_URL}${media.poster_path}`
    : TMDB_PLACEHOLDER_IMAGE_URL;
  
  const mediaTypeDisplay = media.media_type === 'movie' ? 'Filme' : 'Série';
  
  const releaseYear = media.release_date 
    ? new Date(media.release_date).getFullYear() 
    : media.first_air_date 
    ? new Date(media.first_air_date).getFullYear() 
    : '';

  const overviewSnippet = (media.overview && media.overview.length > 100)
    ? media.overview.substring(0, 97) + "..."
    : media.overview || "Sem sinopse disponível.";

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.star-rating-container')) {
      return;
    }
    onSelectMedia(media);
  };

  return (
    <div 
      className="group bg-secondary-bg rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] border-2 border-transparent hover:border-tmdb-light-blue/70 flex flex-col cursor-pointer w-full h-full"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && handleCardClick(e as any)}
      aria-label={`Ver detalhes de ${title}`}
    >
      <div className="relative overflow-hidden">
        <img 
          src={posterUrl} 
          alt={`Capa de ${title}`} 
          className="w-full h-80 sm:h-96 object-cover transition-transform duration-300 group-hover:scale-110" 
          onError={(e) => (e.currentTarget.src = TMDB_PLACEHOLDER_IMAGE_URL)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        <h3 className="text-lg sm:text-xl font-semibold text-tmdb-light-blue mb-1 truncate transition-colors duration-300 group-hover:text-tmdb-green" title={title}>
          {title} {releaseYear && `(${releaseYear})`}
        </h3>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mb-2 w-min whitespace-nowrap ${media.media_type === 'movie' ? 'bg-tmdb-light-blue text-tmdb-dark-blue' : 'bg-tmdb-green text-tmdb-dark-blue'}`}>
          {mediaTypeDisplay}
        </span>
        
        <p className="text-gray-300 text-sm mb-3 flex-grow min-h-[50px] sm:min-h-[60px] break-words">
          {overviewSnippet}
        </p>

        <div className="mt-auto pt-2 sm:pt-3 border-t border-gray-700 star-rating-container">
          <p className="text-xs sm:text-sm text-gray-400 mb-1">Sua avaliação:</p>
          <StarRating
            rating={currentRating}
            onRatingChange={(newRating) => onRate(media.id, newRating, media.media_type)} // Pass media.media_type
            starSize={ window.innerWidth < 640 ? 22 : 28 } // Smaller stars on mobile
          />
        </div>
      </div>
    </div>
  );
};

export default MediaCard;
