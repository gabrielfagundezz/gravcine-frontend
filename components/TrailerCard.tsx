
import React, { useState, useEffect } from 'react';
import CloseIcon from './icons/CloseIcon'; // Importar o ícone de fechar

interface TrailerCardProps {
  videoKey: string;
  videoTitle: string;
}

const TrailerCard: React.FC<TrailerCardProps> = ({ videoKey, videoTitle }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const thumbnailUrl = `https://i.ytimg.com/vi/${videoKey}/hqdefault.jpg`;

  // Dimensões do placeholder do card na página
  const placeholderWidth = 320; 
  const placeholderHeight = 180;

  // Dimensões do player expandido
  const expandedPlayerWidth = '80vw';
  const expandedPlayerHeight = '45vw'; 

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Efeito para adicionar/remover listener de 'Escape'
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.body.style.overflow = 'hidden'; // Impede scroll da página quando o modal está aberto
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded]);


  return (
    <>
      {/* Placeholder e área de trigger */}
      <div
        className="relative shadow-lg rounded-lg overflow-hidden cursor-pointer group"
        style={{
          width: `${placeholderWidth}px`,
          height: `${placeholderHeight}px`,
        }}
        onClick={toggleExpand}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => e.key === 'Enter' && toggleExpand()}
        aria-expanded={isExpanded}
        aria-label={`Trailer: ${videoTitle}. Clique para ${isExpanded ? 'fechar' : 'abrir'}.`}
      >
        <img
          src={thumbnailUrl}
          alt={`Thumbnail do trailer: ${videoTitle}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-10 flex items-center justify-center transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" className="w-16 h-16 opacity-80 group-hover:opacity-100 transition-opacity">
            <path d="M8 8.25v7.5L15.75 12 8 8.25z" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
          <p className="text-white text-xs font-semibold truncate" title={videoTitle}>{videoTitle}</p>
        </div>
      </div>

      {/* Overlay e Player Expandido */}
      {isExpanded && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-75 transition-opacity duration-300 ease-in-out z-40 animate-fadeIn"
            onClick={() => setIsExpanded(false)} // Fecha ao clicar no overlay
            aria-hidden="true"
          />
          
          {/* Player expandido e centralizado */}
          <div
            className="fixed top-1/2 left-1/2 p-1 bg-black rounded-lg shadow-2xl 
                       transition-all duration-300 ease-in-out z-50 animate-fadeIn"
            style={{
              width: expandedPlayerWidth,
              height: expandedPlayerHeight,
              transform: 'translate(-50%, -50%)',
            }}
            onClick={(e) => e.stopPropagation()} // Impede que cliques no player fechem o modal
            role="dialog"
            aria-modal="true"
            aria-label={`Player do trailer: ${videoTitle}`}
          >
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute -top-3 -right-3 md:top-1 md:right-1 text-white bg-black/70 rounded-full p-1.5 hover:bg-red-600/90 transition-colors z-10"
              aria-label="Fechar trailer"
            >
              <CloseIcon size={20} />
            </button>
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&mute=1&controls=1&modestbranding=1&rel=0&showinfo=0&loop=0`}
              title={`Trailer: ${videoTitle}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="rounded-md"
            ></iframe>
          </div>
        </>
      )}
    </>
  );
};

export default TrailerCard;
