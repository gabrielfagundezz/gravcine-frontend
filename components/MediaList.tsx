
import React from 'react';
import type { MediaSearchResult, UserRating, MediaType } from '../types';
import MediaCard from './MediaCard';

interface MediaListProps {
  mediaItems: MediaSearchResult[];
  ratings: UserRating;
  onRateMedia: (mediaId: number, rating: number, mediaType: MediaType) => void; // Updated signature
  onSelectMedia: (media: MediaSearchResult) => void;
}

const MediaList: React.FC<MediaListProps> = ({ mediaItems, ratings, onRateMedia, onSelectMedia }) => {
  if (mediaItems.length === 0) {
    return null; 
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-4">
      {mediaItems.map((item) => (
        <MediaCard
          key={`${item.media_type}-${item.id}`}
          media={item}
          currentRating={ratings[item.id]?.rating || 0} // Access .rating from UserRatingValue
          onRate={onRateMedia} // Prop in MediaCard is 'onRate'
          onSelectMedia={onSelectMedia}
        />
      ))}
    </div>
  );
};

export default MediaList;
