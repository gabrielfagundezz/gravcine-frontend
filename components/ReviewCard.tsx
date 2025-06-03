
import React from 'react';
import type { UserReviewItem } from '../types';
import StarRating from './StarRating';
import UserIcon from './icons/UserIcon';
import { TMDB_PLACEHOLDER_PROFILE_URL } from '../constants';
import CloseIcon from './icons/CloseIcon'; // For delete button

interface ReviewCardProps {
  review: UserReviewItem;
  onViewProfile?: (userId: string) => void;
  currentUserId?: string; // ID of the currently logged-in user
  onDelete?: () => void; // Function to call when delete is clicked
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onViewProfile, currentUserId, onDelete }) => {
  const avatarUrl = review.userAvatarUrl || TMDB_PLACEHOLDER_PROFILE_URL;
  const reviewDate = new Date(review.reviewDate).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const handleUsernameClick = () => {
    if (onViewProfile && review.userId) {
      onViewProfile(review.userId);
    }
  };

  const isOwnReview = review.userId === currentUserId;

  return (
    <div className="bg-secondary-bg p-4 rounded-lg shadow-md relative">
      {isOwnReview && onDelete && (
        <button
          onClick={onDelete}
          className="absolute top-2 right-2 p-1 bg-tertiary-bg/70 hover:bg-red-700/70 rounded-full text-gray-300 hover:text-white transition-colors"
          aria-label="Excluir meu comentário"
          title="Excluir meu comentário"
        >
          <CloseIcon size={16} />
        </button>
      )}
      <div className="flex items-start space-x-3 mb-3">
        <button
            onClick={handleUsernameClick}
            className={`flex-shrink-0 w-10 h-10 rounded-full bg-tertiary-bg flex items-center justify-center overflow-hidden border border-gray-600 ${onViewProfile ? 'cursor-pointer hover:opacity-80' : ''}`}
            disabled={!onViewProfile}
            aria-label={`Ver perfil de ${review.username}`}
        >
          {review.userAvatarUrl ? (
            <img 
              src={review.userAvatarUrl} 
              alt={`Avatar de ${review.username}`} 
              className="w-full h-full object-cover" 
              onError={(e) => {
                (e.target as HTMLImageElement).onerror = null; 
                (e.target as HTMLImageElement).src = TMDB_PLACEHOLDER_PROFILE_URL;
              }} 
            />
          ) : (
            <UserIcon size={24} className="text-gray-400" />
          )}
        </button>
        <div>
          {onViewProfile ? (
            <button 
                onClick={handleUsernameClick} 
                className="font-semibold text-tmdb-light-blue hover:text-tmdb-green hover:underline focus:outline-none"
                aria-label={`Ver perfil de ${review.username}`}
            >
              {review.username}
            </button>
          ) : (
            <p className="font-semibold text-tmdb-light-blue">{review.username}</p>
          )}
          <p className="text-xs text-gray-400">{reviewDate}</p>
        </div>
      </div>
      <div className="mb-2 flex"> {/* Alterado aqui para alinhar estrelas à esquerda */}
        <StarRating rating={review.rating} starSize={20} readOnly />
      </div>
      {review.reviewText && <p className="text-gray-300 text-sm leading-relaxed break-words">{review.reviewText}</p>}
      {!review.reviewText && <p className="text-gray-400 text-sm italic">Este usuário não deixou um comentário escrito.</p>}
    </div>
  );
};

export default ReviewCard;
