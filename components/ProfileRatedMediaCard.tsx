
import React from 'react';
import type { UserDashboardMediaItem, MediaType, MediaSearchResult } from '../types'; // Added MediaSearchResult
import { TMDB_IMAGE_BASE_URL, TMDB_PLACEHOLDER_IMAGE_URL } from '../constants';
import StarRating from './StarRating';

interface ProfileRatedMediaCardProps {
  item: UserDashboardMediaItem;
  onSelectMedia: (media: MediaSearchResult) => void;
}

const ProfileRatedMediaCard: React.FC<ProfileRatedMediaCardProps> = ({ item, onSelectMedia }) => {
  const posterUrl = item.posterPath ? `${TMDB_IMAGE_BASE_URL}${item.posterPath}` : TMDB_PLACEHOLDER_IMAGE_URL;

  const handleCardClick = () => {
    // Construct a minimal MediaSearchResult-like object for onSelectMedia
    const mediaToSelect: MediaSearchResult = {
      id: item.id,
      media_type: item.mediaType,
      title: item.title,
      name: item.title, // for consistency if it's a TV show
      poster_path: item.posterPath,
      overview: '', // Not strictly needed for selection, can be fetched later
      genre_ids: [], // Ditto
      vote_average: 0, // Ditto
      // Add other required fields if onSelectMedia depends on them, or ensure they are optional
    };
    onSelectMedia(mediaToSelect);
  };

  return (
    <div
      className="bg-secondary-bg rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:scale-105 cursor-pointer flex flex-col"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-label={`Ver detalhes de ${item.title}`}
    >
      <img
        src={posterUrl}
        alt={`Capa de ${item.title}`}
        className="w-full h-64 object-cover" 
        onError={(e) => { (e.currentTarget.src = TMDB_PLACEHOLDER_IMAGE_URL); }}
      />
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-sm font-semibold text-tmdb-light-blue mb-1 truncate" title={item.title}>
          {item.title} {item.releaseYear && item.releaseYear !== 'N/A' ? `(${item.releaseYear})` : ''}
        </h3>
        <div className="mt-auto">
          <p className="text-xs text-gray-400 mb-0.5">Avaliado com:</p>
          <StarRating rating={item.userRating} starSize={18} readOnly />
        </div>
      </div>
    </div>
  );
};

export default ProfileRatedMediaCard;
