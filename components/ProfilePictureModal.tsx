
import React, { useState, useEffect, useRef } from 'react';
import CloseIcon from './icons/CloseIcon';
import { TMDB_PLACEHOLDER_PROFILE_URL } from '../constants';

interface ProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImageUrl: string | null;
  onSavePicture: (newImageUrl: string | null) => void;
}

const ProfilePictureModal: React.FC<ProfilePictureModalProps> = ({ 
  isOpen, 
  onClose, 
  currentImageUrl, 
  onSavePicture 
}) => {
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(currentImageUrl);
  const [inputValue, setInputValue] = useState(currentImageUrl || ''); // For URL input field
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSelectedImageUrl(currentImageUrl);
    setInputValue(currentImageUrl || '');
  }, [isOpen, currentImageUrl]);

  if (!isOpen) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setSelectedImageUrl(dataUrl);
        setInputValue(dataUrl); // Show "File selected" or Data URL in input for feedback
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    setSelectedImageUrl(event.target.value); // Update preview as user types URL
  };

  const handleRemovePicture = () => {
    setSelectedImageUrl(null);
    setInputValue('');
  };

  const handleSave = () => {
    onSavePicture(selectedImageUrl);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const commonButtonClass = "px-4 py-2 text-sm font-semibold rounded-md transition-colors";
  const primaryButtonClass = `${commonButtonClass} bg-tmdb-green text-tmdb-dark-blue hover:bg-opacity-80`;
  const secondaryButtonClass = `${commonButtonClass} bg-tertiary-bg text-gray-300 hover:bg-gray-600`;
  const dangerButtonClass = `${commonButtonClass} bg-red-600 text-white hover:bg-red-700`;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-75 p-4 animate-fadeIn"
      onClick={handleCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-pic-modal-title"
    >
      <div 
        className="bg-secondary-bg p-6 rounded-lg shadow-2xl w-full max-w-md text-primary-text"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="profile-pic-modal-title" className="text-xl font-semibold text-tmdb-light-blue">
            Alterar Foto de Perfil
          </h2>
          <button onClick={handleCancel} className="text-gray-400 hover:text-white">
            <CloseIcon size={24} />
          </button>
        </div>

        <div className="mb-4 text-center">
          <img 
            src={selectedImageUrl || TMDB_PLACEHOLDER_PROFILE_URL} 
            alt="Prévia da foto de perfil" 
            className="w-32 h-32 rounded-full object-cover mx-auto mb-3 border-2 border-tmdb-green bg-tertiary-bg"
            onError={(e) => { (e.currentTarget.src = TMDB_PLACEHOLDER_PROFILE_URL); }}
          />
        </div>
        
        <div className="space-y-3">
          <div>
            <label htmlFor="profile-pic-url" className="block text-sm font-medium text-gray-300 mb-1">
              URL da Imagem
            </label>
            <input
              type="text"
              id="profile-pic-url"
              value={inputValue}
              onChange={handleUrlInputChange}
              placeholder="Cole a URL da imagem aqui"
              className="w-full px-3 py-2 bg-tertiary-bg border border-gray-600 rounded-md text-primary-text placeholder-gray-500 focus:ring-1 focus:ring-tmdb-green"
            />
          </div>
          
          <div className="text-center text-sm text-gray-400">ou</div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className={`${secondaryButtonClass} w-full`}
          >
            Carregar do Computador
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {selectedImageUrl && (
            <button onClick={handleRemovePicture} className={`${dangerButtonClass} w-full mt-2`}>
              Remover Foto Atual
            </button>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={handleCancel} className={secondaryButtonClass}>
            Cancelar
          </button>
          <button onClick={handleSave} className={primaryButtonClass}>
            Salvar Foto
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureModal;
