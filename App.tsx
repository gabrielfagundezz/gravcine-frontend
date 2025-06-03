import React, { useState, useCallback, useEffect } from 'react';
import type { 
    MediaSearchResult, 
    UserRating, 
    MediaDetail, 
    CreditsResponse, 
    MediaType,
    PersonDetail,
    PersonCombinedCreditsResponse,
    KnownForMovieOrTVShow,
    PersonImagesResponse,
    SearchType, 
    PersonSearchResult,
    WatchProviderResults,
    VideosResponse,
    CurrentUser, 
    StoredUser,
    UserDashboardMediaItem, 
    UserDashboardActorItem,
    UserReviewItem,
    AllMediaReviews,
    AllUserRatings 
} from './types';
import { 
    searchMedia, 
    searchPeople, 
    getPopularMedia, 
    getMediaByGenre, 
    getMediaDetails, 
    getMediaCredits,
    getMediaWatchProviders,
    getMediaVideos,
    getPersonDetails,
    getPersonCombinedCredits,
    getPersonImages 
} from './services/tmdbService';
import { 
    getCurrentUser as authGetCurrentUser,
    logoutUser as authLogoutUser,
    getUserProfileById,
    updateUserFavoriteActorsInStorage, 
    updateUserProfileDetails as authUpdateUserProfileDetails, 
    updateUserBio as authUpdateUserBio, 
    updateUserEmail as authUpdateUserEmail, 
    updateUserPassword as authUpdateUserPassword, 
    saveUserRating, 
    deleteUserRating,
    addFavoriteActor, 
    removeFavoriteActor,
    saveReview, 
    deleteReview, 
    fetchReviewsForMedia 
} from './services/authService'; 
import SearchBar from './components/SearchBar';
import MediaList from './components/MediaList';
import PersonList from './components/PersonList'; 
import MediaSection from './components/MediaSection';
import MediaDetailsPage from './components/MediaDetailsPage';
import ActorDetailsPage from './components/ActorDetailsPage';
import AuthPage from './components/AuthPage'; 
import UserProfilePage from './components/UserProfilePage'; 
import UserDashboardPage from './components/UserDashboardPage'; 
import UserIcon from './components/icons/UserIcon'; 
import { TMDB_PLACEHOLDER_IMAGE_URL, GENRE_IDS } from './constants';

const ALL_USER_RATINGS_STORAGE_KEY = 'gravcine-all-user-ratings'; 
const REVIEWS_STORAGE_KEY = 'gravcine-reviews'; 

const App: React.FC = () => {
  const [allStoredUserRatings, setAllStoredUserRatings] = useState<AllUserRatings>(() => {
    const savedRatings = localStorage.getItem(ALL_USER_RATINGS_STORAGE_KEY);
    return savedRatings ? JSON.parse(savedRatings) : {};
  });

  const [currentUserRatings, setCurrentUserRatings] = useState<UserRating>({});

  const [allMediaReviews, setAllMediaReviews] = useState<AllMediaReviews>({}); 

  const [isLoadingSearch, setIsLoadingSearch] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState<string>("");
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  
  const [currentSearchType, setCurrentSearchType] = useState<SearchType>('media');
  const [searchResults, setSearchResults] = useState<MediaSearchResult[]>([]);
  const [personSearchResults, setPersonSearchResults] = useState<PersonSearchResult[]>([]);

  const [popularMedia, setPopularMedia] = useState<MediaSearchResult[]>([]);
  const [actionMedia, setActionMedia] = useState<MediaSearchResult[]>([]);
  const [horrorMedia, setHorrorMedia] = useState<MediaSearchResult[]>([]);
  const [dramaMedia, setDramaMedia] = useState<MediaSearchResult[]>([]);
  const [homepageLoading, setHomepageLoading] = useState<boolean>(true);
  const [homepageError, setHomepageError] = useState<string | null>(null);

  const [selectedMedia, setSelectedMedia] = useState<MediaDetail | null>(null);
  const [selectedMediaCredits, setSelectedMediaCredits] = useState<CreditsResponse | null>(null);
  const [selectedMediaWatchProviders, setSelectedMediaWatchProviders] = useState<WatchProviderResults | null>(null);
  const [selectedMediaVideos, setSelectedMediaVideos] = useState<VideosResponse | null>(null);
  const [isMediaDetailPageLoading, setIsMediaDetailPageLoading] = useState<boolean>(false);
  const [mediaDetailPageError, setMediaDetailPageError] = useState<string | null>(null);
  const [mediaReviews, setMediaReviews] = useState<UserReviewItem[]>([]); 

  const [selectedActor, setSelectedActor] = useState<PersonDetail | null>(null);
  const [selectedActorCredits, setSelectedActorCredits] = useState<PersonCombinedCreditsResponse | null>(null);
  const [selectedActorImages, setSelectedActorImages] = useState<PersonImagesResponse | null>(null); 
  const [isActorDetailPageLoading, setIsActorDetailPageLoading] = useState<boolean>(false);
  const [actorDetailPageError, setActorDetailPageError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [showAuthPage, setShowAuthPage] = useState<boolean>(false);

  const [viewingProfileUserId, setViewingProfileUserId] = useState<string | null>(null);
  const [profileToViewData, setProfileToViewData] = useState<StoredUser | null>(null);
  const [isUserProfileLoading, setIsUserProfileLoading] = useState<boolean>(false);
  const [userProfileError, setUserProfileError] = useState<string | null>(null);

  const [showUserDashboard, setShowUserDashboard] = useState<boolean>(false);
  const [favoriteActorIds, setFavoriteActorIds] = useState<number[]>([]);
  const [dashboardRatedMedia, setDashboardRatedMedia] = useState<UserDashboardMediaItem[]>([]);
  const [dashboardFavoriteActors, setDashboardFavoriteActors] = useState<UserDashboardActorItem[]>([]);
  
  const [isDashboardDataLoading, setIsDashboardDataLoading] = useState<boolean>(false);
  const [isDashboardMediaLoading, setIsDashboardMediaLoading] = useState<boolean>(false);
  const [isDashboardActorsLoading, setIsDashboardActorsLoading] = useState<boolean>(false);


  useEffect(() => {
    localStorage.setItem(ALL_USER_RATINGS_STORAGE_KEY, JSON.stringify(allStoredUserRatings));
  }, [allStoredUserRatings]);

  useEffect(() => {
    const img = new Image();
    img.src = TMDB_PLACEHOLDER_IMAGE_URL; 
  }, []);

  useEffect(() => {
      const user = authGetCurrentUser();
      if (user) {
          setCurrentUser(user);
          setFavoriteActorIds(user.favoriteActorIds || []);
          setCurrentUserRatings(allStoredUserRatings[user.id] || {});
      } else {
          setCurrentUserRatings({});
      }
  }, [allStoredUserRatings]); 

  // COMENTADO: Este useEffect foi removido/comentado pois a lógica de favoritos será refeita com o backend.
  // useEffect(() => {
  //   if (currentUser?.id) { 
  //     if (JSON.stringify(favoriteActorIds) !== JSON.stringify(currentUser.favoriteActorIds)) {
  //       updateUserFavoriteActorsInStorage(currentUser.id, [...favoriteActorIds]) 
  //         .catch(err => {
  //           console.error("Falha ao salvar atores favoritos no storage:", err);
  //         });
  //     }
  //   }
  // }, [favoriteActorIds, currentUser?.id, currentUser?.favoriteActorIds]);


   useEffect(() => {
    const fetchHomepageData = async () => {
      if (hasSearched || selectedMedia || selectedActor || showAuthPage || viewingProfileUserId || showUserDashboard) return; 

      setHomepageLoading(true);
      setHomepageError(null);
      try {
        const [popularResults, actionResults, horrorResults, dramaResults] = await Promise.all([
          getPopularMedia('all', 1),
          getMediaByGenre(GENRE_IDS.ACTION, 'movie', 1),
          getMediaByGenre(GENRE_IDS.HORROR, 'movie', 1),
          getMediaByGenre(GENRE_IDS.DRAMA, 'movie', 1)
        ]);
        
        setPopularMedia(popularResults.slice(0, 10)); 
        setActionMedia(actionResults.slice(0, 7));
        setHorrorMedia(horrorResults.slice(0, 7));
        setDramaMedia(dramaResults.slice(0, 7));

        if (!popularResults.length && !actionResults.length && !horrorResults.length && !dramaResults.length) {
          setHomepageError("Nenhum título da página inicial pôde ser carregado. Tente recarregar.");
        }
      } catch (err) { 
        console.error("Falha geral ao buscar dados da página inicial:", err);
        setHomepageError("Falha ao carregar dados da página inicial. Verifique sua conexão ou tente novamente mais tarde.");
      } finally {
        setHomepageLoading(false);
      }
    };

    if (!hasSearched && !selectedMedia && !selectedActor && !showAuthPage && !viewingProfileUserId && !showUserDashboard) { 
        fetchHomepageData();
    }
  }, [hasSearched, selectedMedia, selectedActor, showAuthPage, viewingProfileUserId, showUserDashboard]);


  const handleSearchSubmit = useCallback(async (query: string, searchType: SearchType) => {
    if (query.trim() === "") { 
        handleLogoClick(); 
        return;
    }
    setIsLoadingSearch(true); setSearchError(null); setHasSearched(true);
    setCurrentQuery(query); setCurrentSearchType(searchType); 
    setShowAuthPage(false); setViewingProfileUserId(null); setProfileToViewData(null); setShowUserDashboard(false);
    setSelectedMedia(null); setSelectedMediaCredits(null); setSelectedMediaWatchProviders(null); setSelectedMediaVideos(null); 
    setSelectedActor(null); setSelectedActorCredits(null); setSelectedActorImages(null);
    
    try {
      if (searchType === 'media') {
        const results = await searchMedia(query);
        setSearchResults(results); setPersonSearchResults([]); 
      } else { 
        const results = await searchPeople(query);
        setPersonSearchResults(results); setSearchResults([]); 
      }
    } catch (err) {
      setSearchError("Falha ao buscar dados. Verifique sua conexão ou tente novamente mais tarde.");
      setSearchResults([]); setPersonSearchResults([]);
    } finally {
      setIsLoadingSearch(false); window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);
  
  const handleSelectSuggestion = useCallback(async (item: MediaSearchResult | PersonSearchResult, type: SearchType) => {
    setShowAuthPage(false); setViewingProfileUserId(null); setProfileToViewData(null); setShowUserDashboard(false);
    if (type === 'media' && 'media_type' in item) {
        await handleSelectMedia(item as MediaSearchResult);
    } else if (type === 'person' && 'known_for_department' in item) {
        await handleSelectActor((item as PersonSearchResult).id);
    }
  }, []);


  const handleSelectMedia = useCallback(async (mediaItem: MediaSearchResult | MediaDetail | KnownForMovieOrTVShow) => {
    if (!mediaItem || !mediaItem.id || !('media_type' in mediaItem) || !mediaItem.media_type) {
        console.error("Tentativa de selecionar mídia inválida:", mediaItem);
        setMediaDetailPageError("Não foi possível carregar os detalhes desta mídia. Informações incompletas.");
        setSelectedMedia(null); setSelectedMediaCredits(null); setSelectedMediaWatchProviders(null); setSelectedMediaVideos(null); 
        setIsMediaDetailPageLoading(false); setSelectedActor(null); setSelectedActorCredits(null); setSelectedActorImages(null);
        setShowAuthPage(false); setViewingProfileUserId(null); setProfileToViewData(null); setShowUserDashboard(false);
        return;
    }
    
    setIsMediaDetailPageLoading(true); setMediaDetailPageError(null);
    setSelectedMedia(null); setSelectedMediaCredits(null); setSelectedMediaWatchProviders(null); setSelectedMediaVideos(null); 
    setSelectedActor(null); setSelectedActorCredits(null); setSelectedActorImages(null);
    setShowAuthPage(false); setViewingProfileUserId(null); setProfileToViewData(null); setShowUserDashboard(false);
    setHasSearched(false); setCurrentSearchType('media'); 
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
        const [details, credits, providersResponse, videosResponse, reviewsData] = await Promise.all([ 
            getMediaDetails(mediaItem.id, mediaItem.media_type as MediaType),
            getMediaCredits(mediaItem.id, mediaItem.media_type as MediaType),
            getMediaWatchProviders(mediaItem.id, mediaItem.media_type as MediaType),
            getMediaVideos(mediaItem.id, mediaItem.media_type as MediaType),
            fetchReviewsForMedia(mediaItem.id) 
        ]);
        setSelectedMedia(details); setSelectedMediaCredits(credits);
        setSelectedMediaWatchProviders(providersResponse.results); setSelectedMediaVideos(videosResponse); 
        setMediaReviews(reviewsData); 
    } catch (err) {
        console.error("Erro ao buscar detalhes, créditos, provedores, vídeos ou reviews da mídia:", err);
        setMediaDetailPageError("Falha ao carregar detalhes da mídia. Tente novamente.");
    } finally {
        setIsMediaDetailPageLoading(false);
    }
  }, []);
  
  const handleCloseMediaDetailsPage = useCallback(() => {
    setSelectedMedia(null); setSelectedMediaCredits(null); setSelectedMediaWatchProviders(null); setSelectedMediaVideos(null); 
    setMediaDetailPageError(null);
    setMediaReviews([]); 
    if (currentQuery && (searchResults.length > 0 || personSearchResults.length > 0) && !selectedActor && !viewingProfileUserId && !showUserDashboard) {
        setHasSearched(true); 
    } else if (!selectedActor && !viewingProfileUserId && !showUserDashboard) { 
        setHasSearched(false); setCurrentQuery(""); setSearchResults([]); setPersonSearchResults([]); setCurrentSearchType('media'); 
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentQuery, searchResults, personSearchResults, selectedActor, viewingProfileUserId, showUserDashboard]);

  const handleSelectActor = useCallback(async (actorId: number) => {
    setIsActorDetailPageLoading(true); setActorDetailPageError(null);
    setSelectedActor(null); setSelectedActorCredits(null); setSelectedActorImages(null);
    setShowAuthPage(false); setViewingProfileUserId(null); setProfileToViewData(null); setShowUserDashboard(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const [details, creditsResponse, imagesResponse] = await Promise.all([
        getPersonDetails(actorId), 
        getPersonCombinedCredits(actorId), 
        getPersonImages(actorId)
      ]);
      setSelectedActor(details); setSelectedActorCredits(creditsResponse); setSelectedActorImages(imagesResponse);
    } catch (error) {
      console.error("Erro ao buscar detalhes do ator ou suas imagens:", error);
      setActorDetailPageError("Falha ao carregar detalhes do ator. Tente novamente.");
    } finally {
      setIsActorDetailPageLoading(false);
    }
  }, []);

  const handleCloseActorDetailsPage = useCallback(() => {
    setSelectedActor(null); setSelectedActorCredits(null); setSelectedActorImages(null);
    setActorDetailPageError(null);
     if (currentQuery && (searchResults.length > 0 || personSearchResults.length > 0) && !selectedMedia && !viewingProfileUserId && !showUserDashboard) {
        setHasSearched(true); 
    } else if (!selectedMedia && !viewingProfileUserId && !showUserDashboard) { 
        setHasSearched(false); setCurrentQuery(""); setSearchResults([]); setPersonSearchResults([]); setCurrentSearchType('media'); 
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentQuery, searchResults, personSearchResults, selectedMedia, viewingProfileUserId, showUserDashboard]);

  const handleRateMedia = useCallback((mediaId: number, newRating: number, mediaType: MediaType) => {
    if (!currentUser) {
      handleShowAuthPage();
      return;
    }

    setCurrentUserRatings(prevUserRatings => {
      const updatedUserRatings = { ...prevUserRatings };
      
      if (newRating === 0) {
        delete updatedUserRatings[mediaId];
        deleteUserRating(currentUser.id, mediaId, mediaType) 
          .catch(err => console.error("Falha ao remover avaliação no backend:", err));
      } else {
        updatedUserRatings[mediaId] = { rating: newRating, mediaType: mediaType };
        saveUserRating(currentUser.id, mediaId, newRating, mediaType) 
          .catch(err => console.error("Falha ao salvar avaliação no backend:", err));
      }

      setAllStoredUserRatings(prevAllRatings => ({
        ...prevAllRatings,
        [currentUser.id]: updatedUserRatings
      }));
          
      return updatedUserRatings;
    });
  }, [currentUser]); 

  const handleAddReview = useCallback(async (mediaId: number, reviewText: string, ratingForReview: number) => {
    if (!currentUser) return;
    try {
      const newReview: UserReviewItem = {
        id: `review-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, 
        userId: currentUser.id,
        username: currentUser.username,
        userAvatarUrl: currentUser.profilePictureUrl,
        mediaId: mediaId, 
        rating: ratingForReview,
        reviewDate: new Date().toISOString(),
        reviewText: reviewText.trim(),
      };
      
      const reviewId = await saveReview(newReview); 
      
      setMediaReviews(prevReviews => [{ ...newReview, id: reviewId }, ...prevReviews]);

    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
      alert(`Erro ao adicionar comentário: ${(error as Error).message}`);
    }
  }, [currentUser]);

  const handleDeleteReview = useCallback(async (mediaId: number, reviewId: string) => {
    if (!currentUser) return;
    try {
      await deleteReview(reviewId, currentUser.id); 
      setMediaReviews(prevReviews => prevReviews.filter(review => review.id !== reviewId)); 
    } catch (error) {
      console.error("Erro ao excluir comentário:", error);
      alert(`Erro ao excluir comentário: ${(error as Error).message}`);
    }
  }, [currentUser]);


  const handleLogoClick = () => {
    setSelectedMedia(null); setSelectedMediaCredits(null); setSelectedMediaWatchProviders(null); setSelectedMediaVideos(null); 
    setMediaDetailPageError(null); setSelectedActor(null); setSelectedActorCredits(null); setSelectedActorImages(null);
    setActorDetailPageError(null); setSearchResults([]); setPersonSearchResults([]); 
    setCurrentQuery(""); setHasSearched(false); setSearchError(null); setCurrentSearchType('media'); 
    setShowAuthPage(false); setViewingProfileUserId(null); setProfileToViewData(null); setUserProfileError(null);
    setShowUserDashboard(false); 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const handleShowAuthPage = () => {
    setShowAuthPage(true); 
    setSelectedMedia(null); setSelectedActor(null); setHasSearched(false);
    setViewingProfileUserId(null); setProfileToViewData(null); setShowUserDashboard(false);
  };

  const handleAuthSuccess = (user: CurrentUser) => {
    setCurrentUser(user); 
    setFavoriteActorIds(user.favoriteActorIds || []); 
    setCurrentUserRatings(allStoredUserRatings[user.id] || {});
    setShowAuthPage(false); 
  };

  const handleLogout = async () => {
    await authLogoutUser(); 
    setCurrentUser(null); 
    setFavoriteActorIds([]); 
    setCurrentUserRatings({}); 
    handleLogoClick(); 
  };

  const handleViewUserProfile = useCallback(async (userId: string) => {
    setIsUserProfileLoading(true); setUserProfileError(null); setProfileToViewData(null);
    setViewingProfileUserId(userId); setSelectedMedia(null); setSelectedActor(null); 
    setHasSearched(false); setShowAuthPage(false); setShowUserDashboard(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const fetchedProfileData = await getUserProfileById(userId); 
      
      if (fetchedProfileData) {
        if (currentUser && currentUser.id === userId) {
            setProfileToViewData({
                ...fetchedProfileData, 
                username: currentUser.username, 
                email: currentUser.email, 
                profilePictureUrl: currentUser.profilePictureUrl, 
                ratings: currentUserRatings, 
                favoriteActorIds: favoriteActorIds, 
            });
        } else {
            setProfileToViewData(fetchedProfileData);
        }
      } else {
        setUserProfileError("Perfil de usuário não encontrado.");
      }
    } catch (err) {
      console.error("Erro ao buscar perfil do usuário:", err);
      setUserProfileError("Falha ao carregar o perfil do usuário.");
    } finally {
      setIsUserProfileLoading(false);
    }
  }, [currentUser, currentUserRatings, favoriteActorIds]); 

  const handleUpdateUserProfile = useCallback(async (userId: string, updates: { username?: string; profilePictureUrl?: string | null }) => {
    if (!currentUser || currentUser.id !== userId) throw new Error("Não autorizado");
    try {
      const updatedUser = await authUpdateUserProfileDetails(userId, updates);
      setCurrentUser(updatedUser); 
      if (viewingProfileUserId === userId) { 
        setProfileToViewData(prev => prev ? {
          ...prev, 
          username: updatedUser.username,
          profilePictureUrl: updatedUser.profilePictureUrl,
        } : null);
      }
    } catch (error: any) {
      alert(`Erro ao atualizar perfil: ${error.message}`);
      throw error; 
    }
  }, [currentUser, viewingProfileUserId]);

  const handleUpdateUserBio = useCallback(async (userId: string, bio: string | null) => {
    if (!currentUser || currentUser.id !== userId) throw new Error("Não autorizado");
    try {
      await authUpdateUserBio(userId, bio);
      if (viewingProfileUserId === userId) { 
         setProfileToViewData(prev => prev ? {...prev, bio: bio} : null);
      }
    } catch (error: any) {
      alert(`Erro ao atualizar bio: ${error.message}`);
      throw error;
    }
  }, [currentUser, viewingProfileUserId]);

  const handleUpdateUserEmail = useCallback(async (userId: string, currentPasswordAttempt: string, newEmail: string): Promise<CurrentUser> => {
    if (!currentUser || currentUser.id !== userId) throw new Error("Não autorizado");
    try {
      const updatedUser = await authUpdateUserEmail(userId, currentPasswordAttempt, newEmail);
      setCurrentUser(updatedUser); 
      if (viewingProfileUserId === userId) { 
        setProfileToViewData(prev => prev ? {
          ...prev,
          email: updatedUser.email,
          username: updatedUser.username, 
          profilePictureUrl: updatedUser.profilePictureUrl,
        } : null);
      }
      return updatedUser;
    } catch (error: any) {
      throw error; 
    }
  }, [currentUser, viewingProfileUserId]);

  const handleUpdateUserPassword = useCallback(async (userId: string, currentPasswordAttempt: string, newPasswordValue: string, confirmNewPasswordValue: string) => {
    if (!currentUser || currentUser.id !== userId) throw new Error("Não autorizado");
    try {
      await authUpdateUserPassword(userId, currentPasswordAttempt, newPasswordValue, confirmNewPasswordValue);
    } catch (error: any) {
      throw error; 
    }
  }, [currentUser]);


  const handleCloseUserProfilePages = useCallback(() => {
    setViewingProfileUserId(null); setProfileToViewData(null); setUserProfileError(null); setIsUserProfileLoading(false);
    if (currentQuery && (searchResults.length > 0 || personSearchResults.length > 0)) setHasSearched(true);
    else { setHasSearched(false); setCurrentQuery(""); setSearchResults([]); setPersonSearchResults([]); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentQuery, searchResults, personSearchResults]);

  const handleToggleFavoriteActor = useCallback((actorId: number) => {
    if (!currentUser) {
      handleShowAuthPage(); 
      return;
    }

    setFavoriteActorIds(prevIds => {
      const isCurrentlyFavorite = prevIds.includes(actorId);
      let updatedIds: number[];

      if (isCurrentlyFavorite) {
        updatedIds = prevIds.filter(id => id !== actorId);
        removeFavoriteActor(currentUser.id, actorId)
          .catch(err => console.error("Falha ao remover ator favorito no backend:", err));
      } else {
        updatedIds = [...prevIds, actorId];
        addFavoriteActor(currentUser.id, actorId)
          .catch(err => console.error("Falha ao adicionar ator favorito no backend:", err));
      }

      setCurrentUser(prevUser => {
        if (prevUser) {
          return { ...prevUser, favoriteActorIds: updatedIds };
        }
        return null;
      });

      return updatedIds;
    });
  }, [currentUser]);

  useEffect(() => {
    if (showUserDashboard) {
      setIsDashboardDataLoading(isDashboardMediaLoading || isDashboardActorsLoading);
    } else {
      setIsDashboardDataLoading(false);
      setIsDashboardMediaLoading(false);
      setIsDashboardActorsLoading(false);
    }
  }, [showUserDashboard, isDashboardMediaLoading, isDashboardActorsLoading]);

  useEffect(() => {
    if (showUserDashboard && currentUser) {
      const fetchRatedMediaForDashboard = async () => {
        setIsDashboardMediaLoading(true);
        try {
          const mediaEntries = Object.entries(currentUserRatings).filter(([_, value]) => {
            return value.rating > 0; 
          });
          
          const ratedMediaPromises = mediaEntries.map(async ([mediaIdStr, ratingData]) => {
              const mediaId = parseInt(mediaIdStr, 10);
              const storedMediaType = ratingData.mediaType;
              let details: MediaDetail | null = null;
              
              if (storedMediaType) {
                try {
                    details = await getMediaDetails(mediaId, storedMediaType);
                } catch (error: any) { 
                    const fallbackMediaType = storedMediaType === 'movie' ? 'tv' : 'movie';
                    console.warn(`Painel: Falha ao buscar ${storedMediaType} ID ${mediaId}. Tentando ${fallbackMediaType}. Erro:`, error.message);
                    try { details = await getMediaDetails(mediaId, fallbackMediaType); } catch (fallbackError: any) {
                        if (!(fallbackError instanceof Error && fallbackError.message.includes("Status 404"))) {
                            console.error(`Erro ao buscar detalhes (fallback) para mídia ID ${mediaId} no painel:`, fallbackError);
                        }
                    }
                }
              } else { 
                try { details = await getMediaDetails(mediaId, 'movie'); } catch (e) { /* ignore */ }
                if (!details) { try { details = await getMediaDetails(mediaId, 'tv'); } catch (e) { /* ignore */ } }
              }
              return details;
          });
          
          const fetchedMediaDetails = (await Promise.all(ratedMediaPromises)).filter(Boolean) as MediaDetail[];
          
          const dashboardMediaItems: UserDashboardMediaItem[] = fetchedMediaDetails
            .map(detail => {
              const ratingEntry = currentUserRatings[detail.id];
              const userRating = ratingEntry?.rating || 0;
              
              if (userRating === 0) return null; 

              return {
                id: detail.id,
                title: detail.media_type === 'movie' ? detail.title : detail.name,
                posterPath: detail.poster_path,
                releaseYear: new Date(detail.media_type === 'movie' ? detail.release_date : detail.first_air_date).getFullYear() || 'N/A',
                mediaType: detail.media_type,
                userRating: userRating
              };
            }).filter(Boolean) as UserDashboardMediaItem[];
          setDashboardRatedMedia(dashboardMediaItems);
        } catch (error) {
          console.error("Erro ao atualizar mídias avaliadas do painel:", error);
          setDashboardRatedMedia([]); 
        } finally {
           setIsDashboardMediaLoading(false);
        }
      };
      fetchRatedMediaForDashboard();
    } else if (!showUserDashboard) {
      setDashboardRatedMedia([]); 
    }
  }, [currentUserRatings, showUserDashboard, currentUser]); 

  useEffect(() => {
    if (showUserDashboard && currentUser) {
      const fetchFavoriteActorsForDashboard = async () => {
        setIsDashboardActorsLoading(true);
        try {
          if (favoriteActorIds && favoriteActorIds.length > 0) {
            const actorDetailsPromises = favoriteActorIds.map(id => 
              getPersonDetails(id).catch(err => {
                console.warn(`Painel: Falha ao buscar detalhes do ator ID ${id}. Erro:`, err.message);
                return null; 
              })
            );
            const fetchedActorDetails = (await Promise.all(actorDetailsPromises)).filter(Boolean) as PersonDetail[];
            const dashboardActorItems: UserDashboardActorItem[] = fetchedActorDetails.map(detail => ({
              id: detail.id, name: detail.name, profilePath: detail.profile_path
            }));
            setDashboardFavoriteActors(dashboardActorItems);
          } else {
            setDashboardFavoriteActors([]); 
          }
        } catch (error) {
          console.error("Erro ao atualizar atores favoritos do painel:", error);
          setDashboardFavoriteActors([]); 
        } finally {
          setIsDashboardActorsLoading(false);
        }
      };
      fetchFavoriteActorsForDashboard();
    } else if (!showUserDashboard) {
      setDashboardFavoriteActors([]); 
    }
  }, [favoriteActorIds, showUserDashboard, currentUser]); 


  const handleShowUserDashboard = useCallback(async () => {
    if (!currentUser) return; 
    setDashboardRatedMedia([]); setDashboardFavoriteActors([]); setShowUserDashboard(true);
    setSelectedMedia(null); setSelectedActor(null); setHasSearched(false); setShowAuthPage(false); setViewingProfileUserId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentUser]);

  const handleCloseUserDashboard = useCallback(() => {
    setShowUserDashboard(false);
    if (currentQuery && (searchResults.length > 0 || personSearchResults.length > 0)) {
        setHasSearched(true);
    } else {
        setHasSearched(false); setCurrentQuery(""); setSearchResults([]); setPersonSearchResults([]);
    }
     window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentQuery, searchResults, personSearchResults]);
  
   const renderActiveOverlay = () => {
    if (showUserDashboard && currentUser) {
      return (
        <div className="fixed inset-0 z-[70] bg-primary-bg overflow-y-auto scrollbar-thin scrollbar-thumb-tertiary-bg scrollbar-track-secondary-bg animate-fadeIn">
          <UserDashboardPage
            isLoading={isDashboardDataLoading} ratedMedia={dashboardRatedMedia} favoriteActors={dashboardFavoriteActors}
            onClose={handleCloseUserDashboard} onRateMedia={handleRateMedia} onToggleFavoriteActor={handleToggleFavoriteActor}
            onSelectMedia={handleSelectMedia} onSelectActor={handleSelectActor} ratings={currentUserRatings} 
          />
        </div>
      );
    }
    if (isUserProfileLoading) {
      return (
        <div className="fixed inset-0 z-[70] flex flex-col justify-center items-center bg-primary-bg">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-tmdb-light-blue"></div>
          <p className="text-xl text-gray-300 mt-4">Carregando perfil do usuário...</p>
        </div>
      );
    }
    if (userProfileError) {
      return (
        <div className="fixed inset-0 z-[70] flex flex-col justify-center items-center bg-primary-bg p-4">
          <div className="text-center py-10 px-4 bg-secondary-bg rounded-lg shadow-xl">
            <p className="text-xl text-red-400">{userProfileError}</p>
            <button onClick={handleCloseUserProfilePages} className="mt-6 bg-tmdb-light-blue text-tmdb-dark-blue px-6 py-2 rounded hover:bg-opacity-80 transition-colors font-semibold">
              Voltar
            </button>
          </div>
        </div>
      );
    }
    if (viewingProfileUserId && profileToViewData) {
      return (
        <div className="fixed inset-0 z-[70] bg-primary-bg overflow-y-auto scrollbar-thin scrollbar-thumb-tertiary-bg scrollbar-track-secondary-bg animate-fadeIn">
          <UserProfilePage 
            userProfileData={profileToViewData} 
            isOwnProfile={currentUser?.id === viewingProfileUserId} 
            onClose={handleCloseUserProfilePages}
            onUpdateProfile={currentUser?.id === viewingProfileUserId ? handleUpdateUserProfile : undefined}
            onUpdateBio={currentUser?.id === viewingProfileUserId ? handleUpdateUserBio : undefined}
            onUpdateEmail={currentUser?.id === viewingProfileUserId ? handleUpdateUserEmail : undefined}
            onUpdatePassword={currentUser?.id === viewingProfileUserId ? handleUpdateUserPassword : undefined}
            onSelectMedia={handleSelectMedia}
          />
        </div>
      );
    }
    return null;
  };

  const renderContentForMain = () => {
    if (showUserDashboard || isUserProfileLoading || userProfileError || (viewingProfileUserId && profileToViewData)) {
      return null; 
    }
    if (isActorDetailPageLoading) {
      return (
        <div className="flex flex-col justify-center items-center h-96 py-10">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-tmdb-light-blue"></div>
          <p className="text-xl text-gray-300 mt-4">Carregando detalhes do ator...</p>
        </div>
      );
    }
    if (actorDetailPageError) {
      return (
        <div className="text-center py-10 px-4">
          <p className="text-xl text-red-400 bg-red-900/30 p-4 rounded-md shadow">{actorDetailPageError}</p>
          <button onClick={handleCloseActorDetailsPage} className="mt-6 bg-tmdb-light-blue text-tmdb-dark-blue px-6 py-2 rounded hover:bg-opacity-80 transition-colors font-semibold">
            Voltar
          </button>
        </div>
      );
    }
    if (selectedActor) {
      return (
        <ActorDetailsPage actor={selectedActor} credits={selectedActorCredits} images={selectedActorImages} 
          onClose={handleCloseActorDetailsPage} onSelectMedia={handleSelectMedia} 
          isFavorite={currentUser ? favoriteActorIds.includes(selectedActor.id) : false}
          onToggleFavorite={currentUser ? handleToggleFavoriteActor : undefined}
        />
      );
    }
    if (isMediaDetailPageLoading) {
      return (
        <div className="flex flex-col justify-center items-center h-96 py-10">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-tmdb-light-blue"></div>
          <p className="text-xl text-gray-300 mt-4">Carregando detalhes...</p>
        </div>
      );
    }
    if (mediaDetailPageError) {
      return (
        <div className="text-center py-10 px-4">
          <p className="text-xl text-red-400 bg-red-900/30 p-4 rounded-md shadow">{mediaDetailPageError}</p>
          <button onClick={handleCloseMediaDetailsPage} className="mt-6 bg-tmdb-light-blue text-tmdb-dark-blue px-6 py-2 rounded hover:bg-opacity-80 transition-colors font-semibold">
            Voltar
          </button>
        </div>
      );
    }
    if (selectedMedia) {
      return (
        <MediaDetailsPage media={selectedMedia} credits={selectedMediaCredits} watchProviders={selectedMediaWatchProviders}
          videos={selectedMediaVideos} onClose={handleCloseMediaDetailsPage} 
          currentRating={currentUserRatings[selectedMedia.id]?.rating || 0} 
          onRate={(mediaId, rating) => handleRateMedia(mediaId, rating, selectedMedia.media_type)}
          onSelectActor={handleSelectActor} currentUser={currentUser} onViewUserProfile={handleViewUserProfile}
          reviews={mediaReviews} 
          onAddReview={handleAddReview}
          onDeleteReview={handleDeleteReview}
        />
      );
    }
    if (isLoadingSearch) { 
      return (
        <div className="flex flex-col justify-center items-center h-64 py-10">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-tmdb-light-blue"></div>
          <p className="text-xl text-gray-300 mt-4">Carregando busca...</p>
        </div>
      );
    }
    if (searchError) { 
      return <div className="text-center py-10 px-4"><p className="text-xl text-red-400 bg-red-900/30 p-4 rounded-md shadow">{searchError}</p></div>;
    }
    if (hasSearched) {
      if (currentSearchType === 'media' && searchResults.length > 0) {
        return (
          <><h2 className="text-3xl font-bold text-tmdb-light-blue mb-8 mt-4 px-4">Resultados de Títulos para "{currentQuery}"</h2>
            <MediaList mediaItems={searchResults} ratings={currentUserRatings} onRateMedia={(id, rating, type) => handleRateMedia(id, rating, type)} onSelectMedia={handleSelectMedia}/>
          </>
        );
      }
      if (currentSearchType === 'person' && personSearchResults.length > 0) {
        return (
          <><h2 className="text-3xl font-bold text-tmdb-light-blue mb-8 mt-4 px-4">Resultados de Pessoas para "{currentQuery}"</h2>
            <PersonList people={personSearchResults} onSelectActor={handleSelectActor}/>
          </>
        );
      }
      if (currentQuery.trim() !== "") { 
        const searchTypeName = currentSearchType === 'media' ? 'títulos' : 'pessoas';
        return (
          <div className="text-center py-20 px-4">
            <svg className="mx-auto h-20 w-20 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-2xl text-gray-400 mt-6">Nenhum resultado de {searchTypeName} encontrado para "{currentQuery}".</p>
            <p className="text-gray-500 mt-2">Tente uma busca diferente ou verifique a ortografia.</p>
          </div>
        );
      }
    }
    if (homepageLoading) {
      return (
        <div className="flex flex-col justify-center items-center h-64 py-10">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-tmdb-light-blue"></div>
          <p className="text-xl text-gray-300 mt-4">Carregando destaques...</p>
        </div>
      );
    }
    if (homepageError) {
      return <div className="text-center py-10 px-4"><p className="text-xl text-red-400 bg-red-900/30 p-4 rounded-md shadow">{homepageError}</p></div>;
    }
    const noHomepageData = !popularMedia.length && !actionMedia.length && !horrorMedia.length && !dramaMedia.length;
    if (noHomepageData && !homepageLoading) { 
         return (
            <div className="text-center py-20 px-4">
                <svg className="mx-auto h-24 w-24 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-6 text-2xl font-semibold text-gray-300">Nenhum título para exibir</h3>
                <p className="mt-2 text-gray-500">Não foi possível carregar os destaques. Por favor, tente recarregar a página ou verifique sua conexão.</p>
            </div>
        );
    }
    return (
      <>
        <MediaSection title="Títulos em Destaque" mediaItems={popularMedia} ratings={currentUserRatings} onRateMedia={(id, rating, type) => handleRateMedia(id, rating, type)} onSelectMedia={handleSelectMedia}/>
        <MediaSection title="Ação" mediaItems={actionMedia} ratings={currentUserRatings} onRateMedia={(id, rating, type) => handleRateMedia(id, rating, type)} onSelectMedia={handleSelectMedia}/>
        <MediaSection title="Terror" mediaItems={horrorMedia} ratings={currentUserRatings} onRateMedia={(id, rating, type) => handleRateMedia(id, rating, type)} onSelectMedia={handleSelectMedia}/>
        <MediaSection title="Drama" mediaItems={dramaMedia} ratings={currentUserRatings} onRateMedia={(id, rating, type) => handleRateMedia(id, rating, type)} onSelectMedia={handleSelectMedia}/>
      </>
    );
  };

  const isAnyOverlayActive = showAuthPage || showUserDashboard || isUserProfileLoading || userProfileError || (viewingProfileUserId && profileToViewData);
  const mainContentShouldBeDimmed = isAnyOverlayActive;

  return (
    <div className="min-h-screen flex flex-col bg-primary-bg text-primary-text">
      <header className="bg-tmdb-dark-blue shadow-md sticky top-0 z-[60]">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-tmdb-light-blue cursor-pointer hover:text-tmdb-green transition-colors"
            onClick={handleLogoClick} role="button" tabIndex={0} onKeyPress={(e) => e.key === 'Enter' && handleLogoClick()} aria-label="Página inicial GravCine">
            GravCine
          </h1>
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <button onClick={handleShowUserDashboard}
                  className="text-tmdb-green hover:text-tmdb-light-blue transition-colors font-semibold px-3 py-2 rounded-md hover:bg-tertiary-bg/50"
                  aria-label="Abrir meu painel de avaliações e atores favoritos">
                  Meu Painel
                </button>
                <button onClick={() => handleViewUserProfile(currentUser.id)}
                  className="flex items-center space-x-2 text-tmdb-green hover:text-tmdb-light-blue transition-colors"
                  aria-label={`Ver perfil de ${currentUser.username}`}>
                  <span className="font-semibold hidden sm:inline">Olá, {currentUser.username}!</span>
                  <div className="w-8 h-8 rounded-full bg-tertiary-bg flex items-center justify-center overflow-hidden border-2 border-tmdb-green hover:border-tmdb-light-blue">
                    {currentUser.profilePictureUrl ? (
                      <img src={currentUser.profilePictureUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : ( <UserIcon size={20} className="text-primary-text" /> )}
                  </div>
                </button>
                <button onClick={handleLogout}
                  className="bg-tertiary-bg text-primary-text px-4 py-2 rounded-md font-semibold hover:bg-red-700/70 transition-colors">
                  Sair
                </button>
              </>
            ) : (
              <button onClick={handleShowAuthPage}
                className="bg-tmdb-green text-tmdb-dark-blue px-4 py-2 rounded-md font-semibold hover:bg-opacity-80 transition-colors">
                Login
              </button>
            )}
          </div>
        </div>
      </header>
      {showAuthPage && (<AuthPage onAuthSuccess={handleAuthSuccess} onClose={() => setShowAuthPage(false)} popularMoviesForBackground={popularMedia} />)}
      {renderActiveOverlay()}
      <main className={`flex-grow container mx-auto px-4 py-8 ${mainContentShouldBeDimmed ? 'opacity-30 pointer-events-none' : ''}`}>
        {!selectedMedia && !selectedActor && !showAuthPage && !showUserDashboard && !viewingProfileUserId && !isUserProfileLoading && !userProfileError && (
          <div className="mb-10">
            <SearchBar onSearchSubmit={handleSearchSubmit} onSelectSuggestion={handleSelectSuggestion} isLoading={isLoadingSearch} />
          </div>
        )}
        {renderContentForMain()}
      </main>
      <footer className="bg-tmdb-dark-blue text-center p-6 shadow-md mt-auto">
        <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} GravCine. Todos os direitos reservados.</p>
        <p className="text-gray-500 text-xs mt-1">Este produto usa a API TMDB mas não é endossado ou certificado pela TMDB.</p>
      </footer>
    </div>
  );
};

export default App;
