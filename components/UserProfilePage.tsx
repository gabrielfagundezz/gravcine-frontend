
import React, { useState, useEffect, useCallback } from 'react';
import type { StoredUser, UserDashboardMediaItem, MediaSearchResult, MediaType, MediaDetail, CurrentUser } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import UserIcon from './icons/UserIcon'; 
import { TMDB_PLACEHOLDER_PROFILE_URL } from '../constants';
import ProfileRatedMediaCard from './ProfileRatedMediaCard';
import { getMediaDetails } from '../services/tmdbService';
import ProfilePictureModal from './ProfilePictureModal'; // Import the new modal

interface UserProfilePageProps {
  userProfileData: StoredUser;
  isOwnProfile: boolean;
  onClose: () => void;
  onUpdateProfile?: (userId: string, updates: { username?: string; profilePictureUrl?: string | null }) => Promise<void>;
  onUpdateBio?: (userId: string, bio: string | null) => Promise<void>;
  onUpdateEmail?: (userId: string, currentPasswordAttempt: string, newEmail: string) => Promise<CurrentUser>;
  onUpdatePassword?: (userId: string, currentPasswordAttempt: string, newPasswordValue: string, confirmNewPasswordValue: string) => Promise<void>;
  onSelectMedia: (media: MediaSearchResult) => void; 
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ 
    userProfileData, 
    isOwnProfile, 
    onClose, 
    onUpdateProfile, 
    onUpdateBio,
    onUpdateEmail,
    onUpdatePassword,
    onSelectMedia
}) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  
  const [editableUsername, setEditableUsername] = useState(userProfileData.username);
  const [editableProfilePicUrl, setEditableProfilePicUrl] = useState(userProfileData.profilePictureUrl || '');
  const [isPicModalOpen, setIsPicModalOpen] = useState(false); // State for modal visibility
  const [editableBio, setEditableBio] = useState(userProfileData.bio || '');

  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

  const [currentPasswordForPwd, setCurrentPasswordForPwd] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const [profileRatedMedia, setProfileRatedMedia] = useState<UserDashboardMediaItem[]>([]);
  const [isLoadingRatedMedia, setIsLoadingRatedMedia] = useState(false);
  const [ratedMediaError, setRatedMediaError] = useState<string | null>(null);

  useEffect(() => {
    setEditableUsername(userProfileData.username);
    setEditableProfilePicUrl(userProfileData.profilePictureUrl || '');
    setEditableBio(userProfileData.bio || '');
    setEmailError(null); setEmailSuccess(null);
    setPasswordError(null); setPasswordSuccess(null);
    setCurrentPasswordForEmail(''); setNewEmail('');
    setCurrentPasswordForPwd(''); setNewPassword(''); setConfirmNewPassword('');
    setIsPicModalOpen(false); // Ensure modal is closed if profile data changes
  }, [userProfileData]);


  const handleSaveProfile = async () => {
    if (!onUpdateProfile || !editableUsername.trim()) {
        alert("Nome de usuário não pode ser vazio.");
        return;
    }
    try {
      await onUpdateProfile(userProfileData.id, { 
        username: editableUsername.trim(), 
        profilePictureUrl: editableProfilePicUrl // This is now updated by the modal
      });
      setIsEditingProfile(false);
    } catch (error: any) {
      alert(`Erro ao atualizar perfil: ${error.message}`);
    }
  };

  const handleSaveBio = async () => {
    if (!onUpdateBio) return;
    try {
      await onUpdateBio(userProfileData.id, editableBio.trim() || null);
      setIsEditingBio(false);
    } catch (error: any) {
      alert(`Erro ao atualizar bio: ${error.message}`);
    }
  };

  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateEmail) return;
    setEmailError(null); setEmailSuccess(null);
    try {
      await onUpdateEmail(userProfileData.id, currentPasswordForEmail, newEmail);
      setEmailSuccess("E-mail atualizado com sucesso!");
      setCurrentPasswordForEmail(''); setNewEmail('');
      setTimeout(() => setIsEditingEmail(false), 1500);
    } catch (error: any) {
      setEmailError(error.message);
    }
  };
  
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdatePassword) return;
    setPasswordError(null); setPasswordSuccess(null);
    try {
      await onUpdatePassword(userProfileData.id, currentPasswordForPwd, newPassword, confirmNewPassword);
      setPasswordSuccess("Senha atualizada com sucesso!");
      setCurrentPasswordForPwd(''); setNewPassword(''); setConfirmNewPassword('');
      setTimeout(() => setIsEditingPassword(false), 1500);
    } catch (error: any) {
      setPasswordError(error.message);
    }
  };

  const handleSavePictureFromModal = (newUrl: string | null) => {
    setEditableProfilePicUrl(newUrl || '');
    setIsPicModalOpen(false);
  };

  const formattedJoinDate = userProfileData.createdAt ? new Date(userProfileData.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }) : 'Data de entrada desconhecida';

  const fetchProfileRatedMedia = useCallback(async () => {
    if (!userProfileData.ratings || Object.keys(userProfileData.ratings).length === 0) {
        setProfileRatedMedia([]);
        return;
    }
    setIsLoadingRatedMedia(true);
    setRatedMediaError(null);
    try {
        const mediaPromises = Object.entries(userProfileData.ratings).map(async ([mediaIdStr, ratingData]) => {
            const mediaId = parseInt(mediaIdStr, 10);
            const ratingValueObj = typeof ratingData === 'object' ? ratingData : null;
            const ratingNumber = typeof ratingData === 'number' ? ratingData : ratingData.rating;
            
            if (ratingNumber === 0) return null;

            let mediaType: MediaType | undefined = ratingValueObj?.mediaType;
            let details: MediaDetail | null = null;

            if (mediaType) {
                details = await getMediaDetails(mediaId, mediaType).catch(() => null);
            } else { 
                details = await getMediaDetails(mediaId, 'movie').catch(() => null);
                if (!details) {
                    details = await getMediaDetails(mediaId, 'tv').catch(() => null);
                }
            }
            
            if (details) {
                return {
                    id: details.id,
                    title: details.media_type === 'movie' ? details.title : details.name,
                    posterPath: details.poster_path,
                    releaseYear: new Date(details.media_type === 'movie' ? details.release_date : details.first_air_date).getFullYear() || 'N/A',
                    mediaType: details.media_type,
                    userRating: ratingNumber,
                } as UserDashboardMediaItem;
            }
            return null;
        });
        const results = (await Promise.all(mediaPromises)).filter(Boolean) as UserDashboardMediaItem[];
        setProfileRatedMedia(results);
    } catch (error) {
        console.error("Erro ao buscar mídias avaliadas do perfil:", error);
        setRatedMediaError("Não foi possível carregar as mídias avaliadas.");
        setProfileRatedMedia([]);
    } finally {
        setIsLoadingRatedMedia(false);
    }
  }, [userProfileData.ratings]);

  useEffect(() => {
    fetchProfileRatedMedia();
  }, [fetchProfileRatedMedia]);

  const commonInputClass = "w-full px-3 py-2 bg-tertiary-bg border border-gray-600 rounded-md shadow-sm text-primary-text placeholder-gray-500 focus:ring-1 focus:ring-tmdb-green focus:border-transparent outline-none";
  const commonButtonClass = "px-4 py-2 text-sm font-semibold rounded-md hover:bg-opacity-80 transition-colors";
  const saveButtonClass = `${commonButtonClass} bg-action-color text-tmdb-dark-blue`;
  const cancelButtonClass = `${commonButtonClass} bg-tertiary-bg text-gray-300 hover:bg-gray-600`;


  return (
    <div className="animate-fadeIn p-4 md:p-8 bg-secondary-bg rounded-xl shadow-2xl max-w-4xl mx-auto my-8 text-primary-text">
      <button
        onClick={onClose}
        className="mb-6 flex items-center text-tmdb-light-blue hover:text-tmdb-green transition-colors duration-150 group"
        aria-label="Voltar"
      >
        <ArrowLeftIcon className="w-6 h-6 mr-2 transition-transform duration-150 group-hover:-translate-x-1" />
        <span className="font-semibold">Voltar</span>
      </button>

      <div className="flex flex-col items-center md:flex-row md:items-start gap-6 md:gap-10">
        <div className="flex-shrink-0 w-40 h-40 md:w-48 md:h-48 rounded-full bg-tertiary-bg flex items-center justify-center overflow-hidden border-4 border-tmdb-green shadow-lg relative group">
          <img 
            src={editableProfilePicUrl || TMDB_PLACEHOLDER_PROFILE_URL} 
            alt={`Foto de perfil de ${editableUsername}`} 
            className="w-full h-full object-cover" 
            onError={(e) => { (e.currentTarget.src = TMDB_PLACEHOLDER_PROFILE_URL); }}
          />
        </div>

        <div className="flex-grow text-center md:text-left">
          {isEditingProfile && isOwnProfile ? (
            <input 
              type="text"
              value={editableUsername}
              onChange={(e) => setEditableUsername(e.target.value)}
              className="text-3xl md:text-4xl font-bold text-tmdb-light-blue bg-transparent border-b-2 border-tmdb-green focus:outline-none mb-2 w-full"
              placeholder="Nome de usuário"
            />
          ) : (
            <h1 className="text-3xl md:text-4xl font-bold text-tmdb-light-blue">{userProfileData.username}</h1>
          )}
          <p className="text-md text-gray-400 mt-1">{userProfileData.email}</p>
          <p className="text-sm text-gray-500 mt-1">Membro desde: {formattedJoinDate}</p>
          
          {isOwnProfile && !isEditingProfile && (
            <button 
              onClick={() => setIsEditingProfile(true)}
              className="mt-4 px-4 py-2 bg-tmdb-green text-tmdb-dark-blue text-sm font-semibold rounded-md hover:bg-opacity-80 transition-colors"
            >
              Editar Perfil
            </button>
          )}
          {isOwnProfile && isEditingProfile && (
            <div className="mt-3 space-y-2">
              <button 
                onClick={() => setIsPicModalOpen(true)}
                className={`${commonButtonClass} bg-tmdb-light-blue text-tmdb-dark-blue w-full sm:w-auto`}
              >
                Alterar Foto
              </button>
              <div className="flex space-x-2">
                <button onClick={handleSaveProfile} className={`${saveButtonClass} flex-1`}>Salvar Perfil</button>
                <button onClick={() => { setIsEditingProfile(false); setEditableUsername(userProfileData.username); setEditableProfilePicUrl(userProfileData.profilePictureUrl || '');}} className={`${cancelButtonClass} flex-1`}>Cancelar</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isPicModalOpen && isOwnProfile && (
        <ProfilePictureModal
          isOpen={isPicModalOpen}
          onClose={() => setIsPicModalOpen(false)}
          currentImageUrl={editableProfilePicUrl || null}
          onSavePicture={handleSavePictureFromModal}
        />
      )}

      {/* Bio Section */}
      <div className="mt-10 pt-6 border-t border-tertiary-bg">
        <div className="flex justify-between items-center mb-3">
            <h2 className="text-2xl font-semibold text-tmdb-green">Bio</h2>
            {isOwnProfile && !isEditingBio && !isEditingProfile && !isEditingEmail && !isEditingPassword && (
                <button onClick={() => setIsEditingBio(true)} className={`${commonButtonClass} bg-tertiary-bg text-tmdb-light-blue text-xs`}>Editar Bio</button>
            )}
        </div>
        <div className="bg-primary-bg p-4 rounded-md shadow min-h-[60px]">
          {isEditingBio && isOwnProfile ? (
            <>
              <textarea value={editableBio} onChange={(e) => setEditableBio(e.target.value)} className={`${commonInputClass} min-h-[80px]`} placeholder="Escreva algo sobre você..."/>
              <div className="mt-3 space-x-2">
                <button onClick={handleSaveBio} className={saveButtonClass}>Salvar Bio</button>
                <button onClick={() => { setIsEditingBio(false); setEditableBio(userProfileData.bio || ''); }} className={cancelButtonClass}>Cancelar</button>
              </div>
            </>
          ) : ( userProfileData.bio ? <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{userProfileData.bio}</p> : <p className="text-gray-400 italic">Nenhuma bio definida ainda.</p> )}
        </div>
      </div>

      {/* Email/Password Editing for Own Profile */}
      {isOwnProfile && (
        <div className="mt-10 pt-6 border-t border-tertiary-bg space-y-6">
          {/* Edit Email */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-semibold text-tmdb-green">Alterar E-mail</h3>
              {!isEditingEmail && !isEditingProfile && !isEditingBio && !isEditingPassword && (
                <button onClick={() => { setIsEditingEmail(true); setEmailError(null); setEmailSuccess(null);}} className={`${commonButtonClass} bg-tertiary-bg text-tmdb-light-blue text-xs`}>Alterar E-mail</button>
              )}
            </div>
            {isEditingEmail && (
              <form onSubmit={handleSaveEmail} className="p-4 bg-primary-bg rounded-md shadow space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="currentPasswordForEmail">Senha Atual</label>
                  <input type="password" id="currentPasswordForEmail" value={currentPasswordForEmail} onChange={(e) => setCurrentPasswordForEmail(e.target.value)} className={commonInputClass} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="newEmail">Novo E-mail</label>
                  <input type="email" id="newEmail" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className={commonInputClass} required />
                </div>
                {emailError && <p className="text-xs text-red-400">{emailError}</p>}
                {emailSuccess && <p className="text-xs text-green-400">{emailSuccess}</p>}
                <div className="flex space-x-2">
                  <button type="submit" className={saveButtonClass}>Salvar E-mail</button>
                  <button type="button" onClick={() => { setIsEditingEmail(false); setEmailError(null); setEmailSuccess(null); setCurrentPasswordForEmail(''); setNewEmail('');}} className={cancelButtonClass}>Cancelar</button>
                </div>
              </form>
            )}
          </div>

          {/* Edit Password */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-semibold text-tmdb-green">Alterar Senha</h3>
              {!isEditingPassword && !isEditingProfile && !isEditingBio && !isEditingEmail &&(
                <button onClick={() => { setIsEditingPassword(true); setPasswordError(null); setPasswordSuccess(null);}} className={`${commonButtonClass} bg-tertiary-bg text-tmdb-light-blue text-xs`}>Alterar Senha</button>
              )}
            </div>
            {isEditingPassword && (
              <form onSubmit={handleSavePassword} className="p-4 bg-primary-bg rounded-md shadow space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="currentPasswordForPwd">Senha Atual</label>
                  <input type="password" id="currentPasswordForPwd" value={currentPasswordForPwd} onChange={(e) => setCurrentPasswordForPwd(e.target.value)} className={commonInputClass} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="newPassword">Nova Senha</label>
                  <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={commonInputClass} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="confirmNewPassword">Confirmar Nova Senha</label>
                  <input type="password" id="confirmNewPassword" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className={commonInputClass} required />
                </div>
                {passwordError && <p className="text-xs text-red-400">{passwordError}</p>}
                {passwordSuccess && <p className="text-xs text-green-400">{passwordSuccess}</p>}
                <div className="flex space-x-2">
                  <button type="submit" className={saveButtonClass}>Salvar Senha</button>
                  <button type="button" onClick={() => { setIsEditingPassword(false); setPasswordError(null); setPasswordSuccess(null); setCurrentPasswordForPwd(''); setNewPassword(''); setConfirmNewPassword('');}} className={cancelButtonClass}>Cancelar</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      
      {/* Rated Media Section */}
      <div className="mt-10 pt-6 border-t border-tertiary-bg">
        <h2 className="text-2xl font-semibold text-tmdb-green mb-4">
          Avaliações de {userProfileData.username} ({profileRatedMedia.length})
        </h2>
        {isLoadingRatedMedia && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-tmdb-light-blue"></div>
            <p className="ml-3 text-gray-400">Carregando avaliações...</p>
          </div>
        )}
        {ratedMediaError && !isLoadingRatedMedia && (
          <p className="text-red-400 bg-red-900/20 p-3 rounded-md">{ratedMediaError}</p>
        )}
        {!isLoadingRatedMedia && !ratedMediaError && profileRatedMedia.length === 0 && (
          <p className="text-gray-400 italic">Este usuário ainda não avaliou nenhum filme ou série.</p>
        )}
        {!isLoadingRatedMedia && !ratedMediaError && profileRatedMedia.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {profileRatedMedia.map(item => (
              <ProfileRatedMediaCard 
                key={`${item.mediaType}-${item.id}`} 
                item={item} 
                onSelectMedia={onSelectMedia} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
