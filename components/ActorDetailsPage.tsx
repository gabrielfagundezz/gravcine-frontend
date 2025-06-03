
import React, { useState, useEffect } from 'react';
import type { PersonDetail, PersonCombinedCreditsResponse, KnownForMovieOrTVShow, MediaSearchResult, PersonImagesResponse } from '../types';
import { 
    TMDB_PROFILE_IMAGE_BASE_URL, 
    TMDB_PLACEHOLDER_PROFILE_URL,
    TMDB_BACKDROP_IMAGE_BASE_URL,
    TMDB_PLACEHOLDER_ACTOR_BANNER_URL,
    TMDB_IMAGE_BASE_URL 
} from '../constants';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import FilmographyItemCard from './FilmographyItemCard';
import ImageModal from './ImageModal'; 
import HeartIcon from './icons/HeartIcon'; // Novo

interface ActorDetailsPageProps {
  actor: PersonDetail;
  credits: PersonCombinedCreditsResponse | null;
  images: PersonImagesResponse | null; 
  onClose: () => void;
  onSelectMedia: (media: MediaSearchResult | KnownForMovieOrTVShow) => void;
  isFavorite?: boolean; // Novo
  onToggleFavorite?: (actorId: number) => void; // Novo
}

const ActorDetailsPage: React.FC<ActorDetailsPageProps> = ({ 
    actor, 
    credits, 
    images, 
    onClose, 
    onSelectMedia,
    isFavorite, // Novo
    onToggleFavorite // Novo
}) => {
  const [selectedImageForModal, setSelectedImageForModal] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);

  const profileUrl = actor.profile_path
    ? `${TMDB_PROFILE_IMAGE_BASE_URL}${actor.profile_path}`
    : TMDB_PLACEHOLDER_PROFILE_URL;

  const calculateAge = (birthday: string, deathday?: string | null): string => {
    if (!birthday) return "Idade desconhecida";
    const birthDate = new Date(birthday);
    const toDate = deathday ? new Date(deathday) : new Date();
    
    let age = toDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = toDate.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && toDate.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (deathday) {
      return `Faleceu aos ${age} anos (${birthDate.toLocaleDateString('pt-BR')} - ${toDate.toLocaleDateString('pt-BR')})`;
    }
    return `${age} anos (Nasc. ${birthDate.toLocaleDateString('pt-BR')})`;
  };

  const ageDisplay = calculateAge(actor.birthday!, actor.deathday);

  const topTenForBanner = credits?.cast
    ?.filter(item => item.backdrop_path && (item.media_type === 'movie' || item.media_type === 'tv'))
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 10) || [];
  
  const bannerUrl = topTenForBanner.length > 0 && topTenForBanner[0].backdrop_path 
    ? `${TMDB_BACKDROP_IMAGE_BASE_URL}${topTenForBanner[0].backdrop_path}`
    : actor.profile_path
    ? `${TMDB_IMAGE_BASE_URL}${actor.profile_path}` 
    : TMDB_PLACEHOLDER_ACTOR_BANNER_URL;

  const actorPhotos = images?.profiles?.filter(p => p.file_path).slice(0, 20) || [];

  const allKnownWorks = credits?.cast
    ?.filter(item => item.poster_path && (item.media_type === 'movie' || item.media_type === 'tv'))
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0)) || [];

  const handleOpenImageModal = (imageUrl: string) => {
    setSelectedImageForModal(imageUrl);
    setIsImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImageForModal(null);
  };
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isImageModalOpen) {
        handleCloseImageModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isImageModalOpen]);

  const handleFavoriteClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Impede que o clique propague para outros elementos
    if (onToggleFavorite) {
      onToggleFavorite(actor.id);
    }
  };

  return (
    <div className="animate-fadeIn">
      <button
        onClick={onClose}
        className="mb-6 flex items-center text-tmdb-light-blue hover:text-tmdb-green transition-colors duration-150 group"
        aria-label="Voltar"
      >
        <ArrowLeftIcon className="w-6 h-6 mr-2 transition-transform duration-150 group-hover:-translate-x-1" />
        <span className="font-semibold">Voltar</span>
      </button>

      <div className="relative rounded-xl overflow-hidden shadow-2xl mb-12">
         <img 
            src={bannerUrl} 
            alt={`Banner de ${actor.name}`} 
            className="absolute inset-0 w-full h-full object-cover opacity-15 md:opacity-20"
            onError={(e) => (e.currentTarget.src = TMDB_PLACEHOLDER_ACTOR_BANNER_URL)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-bg via-primary-bg/80 to-transparent"></div>

        <div className="relative p-6 md:p-10 flex flex-col md:flex-row gap-6 md:gap-10 items-start">
            <div className="md:w-2/5 lg:w-1/3 xl:w-1/4 flex-shrink-0">
                <img 
                src={profileUrl} 
                alt={`Foto de ${actor.name}`} 
                className="w-full h-auto object-contain rounded-lg shadow-xl border-4 border-secondary-bg"
                onError={(e) => (e.currentTarget.src = TMDB_PLACEHOLDER_PROFILE_URL)}
                />
            </div>
            <div className="md:w-3/5 lg:w-2/3 xl:w-3/4 text-primary-text z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-tmdb-light-blue mb-2">{actor.name}</h1>
                        <p className="text-md text-secondary-text mb-1">{ageDisplay}</p>
                        {actor.place_of_birth && <p className="text-sm text-gray-400 mb-4">Local de Nascimento: {actor.place_of_birth}</p>}
                    </div>
                    {onToggleFavorite && (
                      <button
                        onClick={handleFavoriteClick}
                        className="p-2 rounded-full hover:bg-tertiary-bg/70 transition-colors"
                        aria-label={isFavorite ? `Desfavoritar ${actor.name}` : `Favoritar ${actor.name}`}
                        title={isFavorite ? `Desfavoritar ${actor.name}` : `Favoritar ${actor.name}`}
                      >
                        <HeartIcon filled={!!isFavorite} size={32} />
                      </button>
                    )}
                </div>

                {actor.biography && (
                    <>
                        <h2 className="text-2xl font-semibold text-tmdb-green mt-6 mb-2">Biografia</h2>
                        <div className="text-gray-300 leading-relaxed text-justify max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-tertiary-bg scrollbar-track-secondary-bg">
                            {actor.biography.split('\n\n').map((paragraph, index) => (
                                <p key={index} className={index > 0 ? "mt-4" : ""}>{paragraph}</p>
                            ))}
                        </div>
                    </>
                )}
                {!actor.biography && <p className="text-gray-400 mt-6">Biografia não disponível.</p>}
            </div>
        </div>
      </div>

      {actorPhotos.length > 0 && (
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-tmdb-light-blue mb-6">Fotos</h2>
          <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-thin scrollbar-thumb-tertiary-bg scrollbar-track-secondary-bg">
            {actorPhotos.map((photo) => (
              <div 
                key={photo.file_path} 
                className="flex-shrink-0 w-40 h-60 md:w-48 md:h-72 rounded-lg overflow-hidden shadow-md cursor-pointer group relative"
                onClick={() => handleOpenImageModal(`${TMDB_IMAGE_BASE_URL}${photo.file_path}`)}
                onKeyPress={(e) => e.key === 'Enter' && handleOpenImageModal(`${TMDB_IMAGE_BASE_URL}${photo.file_path}`)}
                role="button"
                tabIndex={0}
                aria-label={`Ampliar foto de ${actor.name}`}
              >
                <img
                  src={`${TMDB_PROFILE_IMAGE_BASE_URL}${photo.file_path}`} 
                  alt={`Foto de ${actor.name}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => (e.currentTarget.src = TMDB_PLACEHOLDER_PROFILE_URL)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {allKnownWorks.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold text-tmdb-light-blue mb-6">Trabalhos Conhecidos</h2>
          <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-thin scrollbar-thumb-tertiary-bg scrollbar-track-secondary-bg">
            {allKnownWorks.map((item) => ( 
              <FilmographyItemCard 
                key={`${item.media_type}-${item.id}`} 
                media={item} 
                onSelectMedia={onSelectMedia} 
              />
            ))}
          </div>
        </div>
      )}
       {allKnownWorks.length === 0 && credits && (
         <p className="text-gray-400">Nenhum trabalho conhecido encontrado com poster disponível.</p>
       )}

      {isImageModalOpen && selectedImageForModal && (
        <ImageModal 
          imageUrl={selectedImageForModal}
          altText={`Foto ampliada de ${actor.name}`}
          isOpen={isImageModalOpen}
          onClose={handleCloseImageModal}
        />
      )}
    </div>
  );
};

export default ActorDetailsPage;
