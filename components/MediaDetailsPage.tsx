import React, { useState } from 'react';
import type { MediaDetail, TVDetail, CreditsResponse, WatchProviderResults, VideosResponse, UserReviewItem, CurrentUser, MediaType } from '../types';
import { 
    TMDB_BACKDROP_IMAGE_BASE_URL, 
    TMDB_IMAGE_BASE_URL, 
    TMDB_PLACEHOLDER_IMAGE_URL,
    TMDB_PLACEHOLDER_BACKDROP_URL,
    TMDB_PROVIDER_LOGO_BASE_URL,
} from '../constants';
import StarRating from './StarRating';
import CastMemberCard from './CastMemberCard';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import TrailerCard from './TrailerCard';
import ReviewCard from './ReviewCard'; 

interface MediaDetailsPageProps {
  media: MediaDetail;
  credits: CreditsResponse | null;
  watchProviders: WatchProviderResults | null;
  videos: VideosResponse | null;
  onClose: () => void;
  currentRating: number; 
  onRate: (mediaId: number, rating: number, mediaType: MediaType) => void; 
  onSelectActor: (actorId: number) => void;
  currentUser: CurrentUser | null; 
  onViewUserProfile: (userId: string) => void; 
  reviews: UserReviewItem[]; // Reviews agora vêm do App.tsx
  onAddReview: (mediaId: number, reviewText: string, ratingForReview: number) => void; 
  onDeleteReview: (mediaId: number, reviewId: string) => void; 
}

const MediaDetailsPage: React.FC<MediaDetailsPageProps> = ({ 
    media, 
    credits, 
    watchProviders,
    videos,
    onClose, 
    currentRating, 
    onRate,
    onSelectActor,
    currentUser,
    onViewUserProfile,
    reviews, // Use received reviews
    onAddReview,
    onDeleteReview
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'reviews'>('info');
  const [userReviewText, setUserReviewText] = useState('');

  const title = media.media_type === 'movie' ? media.title : media.name;
  const releaseDate = media.media_type === 'movie' ? media.release_date : media.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
  
  const backdropUrl = media.backdrop_path 
    ? `${TMDB_BACKDROP_IMAGE_BASE_URL}${media.backdrop_path}`
    : TMDB_PLACEHOLDER_BACKDROP_URL;
  const posterUrl = media.poster_path 
    ? `${TMDB_IMAGE_BASE_URL}${media.poster_path}`
    : TMDB_PLACEHOLDER_IMAGE_URL;

  let tvDetails: TVDetail | null = null;
  if (media.media_type === 'tv') {
    tvDetails = media as TVDetail;
  }

  const runtime = tvDetails 
    ? tvDetails.episode_run_time && tvDetails.episode_run_time.length > 0 
      ? tvDetails.episode_run_time[0] 
      : null
    : (media as any).runtime;
  const runtimeDisplay = runtime ? `${runtime} min${tvDetails ? ' /ep' : ''}` : null;

  const genresDisplay = media.genres.map(g => g.name).join(', ');
  const numberOfSeasonsDisplay = tvDetails ? `${tvDetails.number_of_seasons} temporada${tvDetails.number_of_seasons > 1 ? 's' : ''}` : null;
  
  let seriesStatusDisplay = null;
  if (tvDetails) {
    if (tvDetails.status === "Ended") seriesStatusDisplay = "Finalizada";
    else if (tvDetails.status === "Returning Series" || tvDetails.status === "In Production" || tvDetails.in_production) seriesStatusDisplay = "Em Andamento";
    else if (tvDetails.status) seriesStatusDisplay = tvDetails.status;
  }

  const brazilianProviders = watchProviders?.BR?.flatrate;
  const officialTrailer = videos?.results?.find(v => v.site === "YouTube" && v.type === "Trailer" && v.official) || 
                        videos?.results?.find(v => v.site === "YouTube" && v.type === "Trailer") || 
                        videos?.results?.find(v => v.site === "YouTube");

  const averageUserRating = reviews.length > 0 
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
    : 0;

  const handlePostReview = () => {
    if (!currentUser || !userReviewText.trim() || currentRating === 0) {
      alert("Por favor, adicione uma avaliação em estrelas e escreva um comentário para enviar.");
      return;
    }
    onAddReview(media.id, userReviewText, currentRating);
    setUserReviewText(''); // Limpa o campo de texto após o envio
  };

  const handleDeleteOwnReview = (reviewId: string) => {
    if (window.confirm("Tem certeza que deseja excluir seu comentário?")) {
        onDeleteReview(media.id, reviewId);
    }
  };

  return (
    <div className="animate-fadeIn">
      <button onClick={onClose} className="mb-6 flex items-center text-tmdb-light-blue hover:text-tmdb-green transition-colors duration-150 group" aria-label="Voltar para a lista">
        <ArrowLeftIcon className="w-6 h-6 mr-2 transition-transform duration-150 group-hover:-translate-x-1" />
        <span className="font-semibold">Voltar</span>
      </button>

      <div className="relative rounded-xl overflow-hidden shadow-2xl">
        <img src={backdropUrl} alt={`Banner de ${title}`} className="absolute inset-0 w-full h-full object-cover opacity-20" onError={(e) => (e.currentTarget.src = TMDB_PLACEHOLDER_BACKDROP_URL)}/>
        <div className="absolute inset-0 bg-gradient-to-t from-primary-bg via-primary-bg/70 to-transparent"></div>
        <div className="relative p-6 md:p-10 flex flex-col md:flex-row gap-6 md:gap-10">
          <div className="md:w-2/5 lg:w-1/3 flex-shrink-0"> 
            <img src={posterUrl} alt={`Capa de ${title}`} className="w-full h-auto object-contain rounded-lg shadow-xl border-4 border-secondary-bg" onError={(e) => (e.currentTarget.src = TMDB_PLACEHOLDER_IMAGE_URL)}/>
          </div>
          <div className="md:w-3/5 lg:w-2/3 text-primary-text z-10 flex flex-col">
            <h1 className="text-4xl md:text-5xl font-bold text-tmdb-light-blue mb-2">{title}</h1>
            <div className="flex flex-wrap items-center text-secondary-text text-sm mb-1">
              <span>{year}</span>
              {runtimeDisplay && <><span className="mx-2">•</span><span>{runtimeDisplay}</span></>}
              {genresDisplay && <><span className="mx-2">•</span><span className="truncate max-w-[200px] sm:max-w-xs">{genresDisplay}</span></>}
            </div>
            {tvDetails && (
              <div className="flex flex-wrap items-center text-secondary-text text-sm mb-4">
                {numberOfSeasonsDisplay && <span>{numberOfSeasonsDisplay}</span>}
                {seriesStatusDisplay && <><span className="mx-2">•</span><span>{seriesStatusDisplay}</span></>}
              </div>
            )}
            {media.tagline && <p className="text-lg italic text-gray-400 mb-3">{media.tagline}</p>}
            <div>
              <h2 className="text-xl font-semibold text-tmdb-green mt-3 mb-2">Sinopse</h2>
              <div className="text-gray-300 leading-relaxed text-justify max-h-60 md:max-h-72 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-tertiary-bg scrollbar-track-secondary-bg">
                {(media.overview || "Sinopse não disponível.").split('\n\n').map((p, i) => <p key={i} className={i > 0 ? "mt-4" : ""}>{p}</p>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 mb-8 border-b border-tertiary-bg flex justify-center">
          <button onClick={() => setActiveTab('info')} className={`px-8 py-3 text-xl font-semibold transition-colors duration-150 focus:outline-none ${activeTab === 'info' ? 'text-tmdb-green border-b-2 border-tmdb-green' : 'text-gray-400 hover:text-tmdb-light-blue'}`} aria-pressed={activeTab === 'info'}>
            INFORMAÇÕES
          </button>
          <button onClick={() => setActiveTab('reviews')} className={`px-8 py-3 text-xl font-semibold transition-colors duration-150 focus:outline-none ${activeTab === 'reviews' ? 'text-tmdb-green border-b-2 border-tmdb-green' : 'text-gray-400 hover:text-tmdb-light-blue'}`} aria-pressed={activeTab === 'reviews'}>
            AVALIAÇÕES
          </button>
      </div>

      <div className="px-1 md:px-0">
        {activeTab === 'info' && (
          <div className="animate-fadeIn space-y-12">
            <div className="pt-4"> 
              <p className="text-lg font-semibold text-gray-300 mb-2">Sua Avaliação:</p>
              <StarRating rating={currentRating} onRatingChange={(newRating) => onRate(media.id, newRating, media.media_type)} starSize={32} />
            </div>
            {credits?.cast?.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold text-tmdb-light-blue mb-6">Elenco Principal</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6">
                  {credits.cast.filter(c => c.profile_path).slice(0, 12).map(m => <CastMemberCard key={m.id} member={m} onSelectActor={onSelectActor}/>)}
                </div>
              </div>
            )}
            {officialTrailer && (
              <div>
                <h2 className="text-3xl font-bold text-tmdb-light-blue mb-6">Trailer Oficial</h2>
                <div className="flex justify-center md:justify-start"><TrailerCard videoKey={officialTrailer.key} videoTitle={officialTrailer.name} /></div>
              </div>
            )}
            {videos?.results?.length > 0 && !officialTrailer && (
              <div><h2 className="text-3xl font-bold text-tmdb-light-blue mb-6">Vídeos</h2><p className="text-gray-400">Nenhum trailer oficial. Outros vídeos podem estar disponíveis.</p></div>
            )}
            {brazilianProviders?.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold text-tmdb-light-blue mb-6">Onde Assistir (Brasil)</h2>
                <div className="flex flex-wrap gap-4 items-center">
                  {brazilianProviders.map(p => (
                    <a key={p.provider_id} href={watchProviders?.BR?.link} target="_blank" rel="noopener noreferrer"
                      className="flex flex-col items-center p-2 bg-secondary-bg rounded-lg shadow-md hover:bg-tertiary-bg transition-colors w-28 h-28 justify-center" title={`Assistir em ${p.provider_name}`}>
                      {p.logo_path ? <img src={`${TMDB_PROVIDER_LOGO_BASE_URL}${p.logo_path}`} alt={p.provider_name} className="w-16 h-16 object-contain rounded"/> : <span className="text-xs text-center text-gray-300">{p.provider_name}</span>}
                      <span className="text-xs text-center text-gray-400 mt-1 truncate w-full" title={p.provider_name}>{p.provider_name}</span>
                    </a>
                  ))}
                </div>
                {watchProviders?.BR?.link && <p className="text-xs text-gray-500 mt-3">Opções fornecidas por <a href={watchProviders.BR.link} target="_blank" rel="noopener noreferrer" className="text-tmdb-light-blue hover:underline ml-1">JustWatch</a>.</p>}
              </div>
            )}
            {watchProviders && (!brazilianProviders || brazilianProviders.length === 0) && (
              <div><h2 className="text-3xl font-bold text-tmdb-light-blue mb-6">Onde Assistir (Brasil)</h2><p className="text-gray-400">Informações não disponíveis para o Brasil.</p></div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-semibold text-tmdb-green mb-3">Avaliação Média dos Usuários</h2>
            <div className="flex items-center mb-6 bg-secondary-bg p-4 rounded-lg shadow">
              <StarRating rating={averageUserRating} starSize={28} readOnly />
              <span className="ml-3 text-xl font-bold text-yellow-400">{averageUserRating > 0 ? averageUserRating.toFixed(1) : '-'}</span>
              <span className="ml-2 text-gray-400"> ({reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'})</span>
            </div>
            {currentUser && (
              <div className="mb-8 p-4 bg-secondary-bg rounded-lg shadow">
                <h3 className="text-xl font-semibold text-tmdb-light-blue mb-3">Deixe seu Comentário</h3>
                <div className="mb-3">
                  <p className="text-sm text-gray-300 mb-1">Sua nota atual: {currentRating > 0 ? `${currentRating} estrela(s)`: "Nenhuma avaliação ainda"}</p>
                  {currentRating === 0 && <p className="text-xs text-yellow-500">Você precisa dar uma nota (na aba "Informações") para comentar.</p>}
                </div>
                <textarea value={userReviewText} onChange={(e) => setUserReviewText(e.target.value)}
                  placeholder={currentRating > 0 ? "Escreva seu comentário aqui..." : "Avalie primeiro para poder comentar."}
                  rows={4} className="w-full p-3 bg-tertiary-bg border border-gray-600 rounded-md shadow-sm text-primary-text placeholder-gray-500 focus:ring-2 focus:ring-tmdb-green focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!currentUser || currentRating === 0} aria-label="Campo para escrever comentário"/>
                <button onClick={handlePostReview} disabled={!currentUser || !userReviewText.trim() || currentRating === 0}
                  className="mt-3 px-6 py-2 bg-tmdb-green text-tmdb-dark-blue font-semibold rounded-md hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Enviar Comentário
                </button>
              </div>
            )}
            <h3 className="text-xl font-semibold text-tmdb-light-blue mb-4">Comentários de Usuários ({reviews.length})</h3>
            {reviews.length > 0 ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-tertiary-bg scrollbar-track-secondary-bg">
                {reviews.map(review => (
                  <ReviewCard key={review.id} review={review} onViewProfile={onViewUserProfile} 
                    currentUserId={currentUser?.id}
                    onDelete={() => handleDeleteOwnReview(review.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic bg-secondary-bg p-4 rounded-lg shadow">Ainda não há avaliações de usuários para este título.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaDetailsPage;
