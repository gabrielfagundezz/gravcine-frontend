
import React from 'react';
import type { KnownForMovieOrTVShow, MediaSearchResult } from '../types';
import { TMDB_IMAGE_BASE_URL, TMDB_PLACEHOLDER_IMAGE_URL } from '../constants';

interface FilmographyItemCardProps {
  media: KnownForMovieOrTVShow;
  onSelectMedia: (media: MediaSearchResult | KnownForMovieOrTVShow) => void;
}

const FilmographyItemCard: React.FC<FilmographyItemCardProps> = ({ media, onSelectMedia }) => {
  const title = media.title || media.name || "Título Desconhecido";
  const posterUrl = media.poster_path
    ? `${TMDB_IMAGE_BASE_URL}${media.poster_path}`
    : TMDB_PLACEHOLDER_IMAGE_URL;
  
  const releaseYear = media.release_date 
    ? new Date(media.release_date).getFullYear() 
    : media.first_air_date 
    ? new Date(media.first_air_date).getFullYear() 
    : '';

  const handleCardClick = () => {
    onSelectMedia(media);
  };

  return (
    <div
      className="bg-secondary-bg rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:scale-105 w-40 flex-shrink-0 cursor-pointer"
      onClick={handleCardClick}
      onKeyPress={(e) => e.key === 'Enter' && handleCardClick()}
      role="button"
      tabIndex={0}
      aria-label={`Ver detalhes de ${title}`}
    >
      <img
        src={posterUrl}
        alt={`Capa de ${title}`}
        className="w-full h-60 object-cover"
        onError={(e) => (e.currentTarget.src = TMDB_PLACEHOLDER_IMAGE_URL)}
      />
      <div className="p-2">
        <p className="font-semibold text-tmdb-light-blue text-xs truncate" title={title}>
          {title}
        </p>
        {releaseYear && <p className="text-xs text-gray-400">{releaseYear}</p>}
      </div>
    </div>
  );
};

export default FilmographyItemCard;
