
import React, { useState, useEffect, useCallback } from 'react';
import type { MediaSearchResult, UserRating, MediaType } from '../types';
import MediaCard from './MediaCard';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';

interface MediaSectionProps {
  title: string;
  mediaItems: MediaSearchResult[];
  ratings: UserRating;
  onRateMedia: (mediaId: number, rating: number, mediaType: MediaType) => void;
  onSelectMedia: (media: MediaSearchResult) => void;
}

const getItemsPerPage = (width: number): number => {
  if (width < 640) return 2; // Celulares (sm) - 2 itens
  if (width < 768) return 2; // Tablets pequenos (md) - 2 itens
  if (width < 1024) return 3; // Tablets maiores (lg) - 3 itens
  return 4; // Telas grandes (xl e acima) - 4 itens
};

const MediaSection: React.FC<MediaSectionProps> = ({
  title,
  mediaItems,
  ratings,
  onRateMedia,
  onSelectMedia,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage(window.innerWidth));

  const updateItemsPerPage = useCallback(() => {
    setItemsPerPage(getItemsPerPage(window.innerWidth));
  }, []);

  useEffect(() => {
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, [updateItemsPerPage]);

  useEffect(() => {
    // Reset currentIndex if itemsPerPage changes to prevent out-of-bounds
    setCurrentIndex(0);
  }, [itemsPerPage]);


  if (!mediaItems || mediaItems.length === 0) {
    return null;
  }

  const totalItems = mediaItems.length;
  const canGoPrev = currentIndex > 0;
  // Check if there are enough items to show a full next page
  const canGoNext = totalItems > itemsPerPage && currentIndex < totalItems - itemsPerPage;


  const handlePrev = () => {
    setCurrentIndex((prevIndex) => Math.max(0, prevIndex - 1));
  };

  const handleNext = () => {
    // Ensure we don't go past the last possible starting index for a page
    setCurrentIndex((prevIndex) => Math.min(totalItems - itemsPerPage, prevIndex + 1));
  };

  const showCarouselControls = totalItems > itemsPerPage;
  const itemWidthPercentage = 100 / itemsPerPage;

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-tmdb-light-blue mb-6 px-1 sm:px-0">{title}</h2>
      <div className="relative">
        {showCarouselControls && (
          <button
            onClick={handlePrev}
            disabled={!canGoPrev}
            className={`absolute -left-1 sm:-left-4 md:-left-5 top-1/2 z-10 p-1 sm:p-2 bg-secondary-bg/70 hover:bg-secondary-bg text-primary-text rounded-full shadow-lg transform -translate-y-1/2 transition-all duration-150 ${
              canGoPrev ? 'opacity-100 cursor-pointer hover:scale-110' : 'opacity-30 cursor-not-allowed'
            }`}
            aria-label="Anterior"
          >
            <ChevronLeftIcon size={window.innerWidth < 640 ? 20 : 28} />
          </button>
        )}
        
        <div className="overflow-hidden"> 
          <div
            className="flex transition-transform duration-300 ease-in-out" 
            style={{ transform: `translateX(-${currentIndex * itemWidthPercentage}%)` }}
          >
            {mediaItems.map((item) => (
              <div 
                key={`${item.media_type}-${item.id}`} 
                className="flex-shrink-0" 
                style={{ width: `${itemWidthPercentage}%` }} 
              >
                <div className="p-1.5 sm:p-2 md:p-3 h-full"> 
                  <MediaCard
                    media={item}
                    currentRating={ratings[item.id]?.rating || 0}
                    onRate={onRateMedia}
                    onSelectMedia={onSelectMedia}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {showCarouselControls && (
          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className={`absolute -right-1 sm:-right-4 md:-right-5 top-1/2 z-10 p-1 sm:p-2 bg-secondary-bg/70 hover:bg-secondary-bg text-primary-text rounded-full shadow-lg transform -translate-y-1/2 transition-all duration-150 ${
              canGoNext ? 'opacity-100 cursor-pointer hover:scale-110' : 'opacity-30 cursor-not-allowed'
            }`}
            aria-label="Próximo"
          >
            <ChevronRightIcon size={window.innerWidth < 640 ? 20 : 28} />
          </button>
        )}
      </div>
      
      {showCarouselControls && totalItems > itemsPerPage && (
        <div className="flex justify-center mt-4 space-x-2">
          {/* Generate page indicators based on available pages */}
          {Array.from({ length: Math.max(0, totalItems - itemsPerPage + 1) }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-colors ${
                currentIndex === i ? 'bg-tmdb-light-blue' : 'bg-tertiary-bg hover:bg-gray-600'
              }`}
              aria-label={`Ir para página ${i + 1} do carrossel`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default MediaSection;
