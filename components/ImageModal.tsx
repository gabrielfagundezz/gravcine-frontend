
import React from 'react';
import CloseIcon from './icons/CloseIcon';

interface ImageModalProps {
  imageUrl: string;
  altText: string;
  isOpen: boolean;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, altText, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-80 p-4 animate-fadeIn"
      onClick={onClose} // Fecha ao clicar no overlay
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-modal-title"
    >
      <div 
        className="relative bg-secondary-bg p-2 rounded-lg shadow-2xl max-w-3xl max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()} // Impede que o clique na imagem feche o modal
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors z-10 bg-black/50 rounded-full p-1"
          aria-label="Fechar modal"
        >
          <CloseIcon size={28} />
        </button>
        <img 
          src={imageUrl} 
          alt={altText} 
          className="block max-w-full max-h-[85vh] rounded object-contain" 
        />
        <span id="image-modal-title" className="sr-only">{altText}</span>
      </div>
    </div>
  );
};

export default ImageModal;
