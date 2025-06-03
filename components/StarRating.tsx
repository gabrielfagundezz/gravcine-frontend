
import React, { useState } from 'react';
import StarIcon from './icons/StarIcon';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void; // Tornou-se opcional
  maxStars?: number;
  starSize?: number;
  readOnly?: boolean; // Nova propriedade
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  maxStars = 5,
  starSize = 28,
  readOnly = false, // Padrão para false
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleStarClick = (index: number) => {
    if (readOnly || !onRatingChange) return; // Não faz nada se for readOnly ou onRatingChange não for fornecido

    const newRating = index + 1;
    if (newRating === rating) {
      onRatingChange(0); 
    } else {
      onRatingChange(newRating);
    }
  };

  const handleStarMouseEnter = (index: number) => {
    if (readOnly) return;
    setHoverRating(index + 1);
  };

  const handleStarMouseLeave = () => {
    if (readOnly) return;
    setHoverRating(0);
  };

  return (
    <div className="flex items-center space-x-1" aria-label={`Avaliação: ${rating > 0 ? rating : 'Nenhuma'} de ${maxStars} estrelas`}>
      {[...Array(maxStars)].map((_, index) => {
        const starValue = index + 1;
        const currentDisplayRating = hoverRating > 0 ? hoverRating : rating;
        const isFilled = starValue <= currentDisplayRating;
        
        let starColorClass = '';
        if (isFilled) {
          starColorClass = 'text-yellow-400'; 
        } else {
          starColorClass = 'text-gray-600'; 
        }
        
        const hoverEffectClass = hoverRating > 0 && starValue <= hoverRating 
                                 ? 'text-yellow-300' 
                                 : 'hover:text-yellow-300';

        return (
          <button
            key={index}
            type="button"
            className={`focus:outline-none rounded-sm ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
            onClick={() => handleStarClick(index)} // MODIFIED LINE
            onMouseEnter={readOnly ? undefined : () => handleStarMouseEnter(index)}
            onMouseLeave={readOnly ? undefined : () => handleStarMouseLeave()}
            aria-label={readOnly ? 
                          `Avaliação: ${currentDisplayRating > 0 ? currentDisplayRating : 'Nenhuma'} de ${maxStars} estrelas` : 
                          `Avaliar com ${starValue} estrela${starValue > 1 ? 's' : ''}${starValue === rating && onRatingChange ? ' (remover avaliação)' : ''}`}
            role="radio"
            aria-checked={starValue === rating}
            name="rating"
            disabled={readOnly}
          >
            <StarIcon
              filled={isFilled}
              className={`${starColorClass} ${!isFilled && !readOnly ? hoverEffectClass : ''} transition-colors duration-150`}
              size={starSize}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
