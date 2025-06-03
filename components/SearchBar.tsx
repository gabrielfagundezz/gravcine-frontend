
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { searchMedia, searchPeople } from '../services/tmdbService'; // Adicionado searchPeople
import type { MediaSearchResult, PersonSearchResult, SearchType } from '../types'; // Adicionado PersonSearchResult e SearchType
import { TMDB_IMAGE_BASE_URL, TMDB_PLACEHOLDER_IMAGE_URL, TMDB_PROFILE_IMAGE_BASE_URL, TMDB_PLACEHOLDER_PROFILE_URL } from '../constants';

interface SearchBarProps {
  onSearchSubmit: (query: string, searchType: SearchType) => void;
  onSelectSuggestion: (item: MediaSearchResult | PersonSearchResult, searchType: SearchType) => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearchSubmit, onSelectSuggestion, isLoading }) => {
  const [query, setQuery] = useState('');
  const [mediaSuggestions, setMediaSuggestions] = useState<MediaSearchResult[]>([]);
  const [personSuggestions, setPersonSuggestions] = useState<PersonSearchResult[]>([]);
  const [currentSearchType, setCurrentSearchType] = useState<SearchType>('media');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (searchTerm: string, type: SearchType) => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) {
      setMediaSuggestions([]);
      setPersonSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setIsSuggestionsLoading(true);
    try {
      if (type === 'media') {
        const results = await searchMedia(searchTerm, 5);
        setMediaSuggestions(results);
        setPersonSuggestions([]);
        setShowSuggestions(results.length > 0);
      } else { // type === 'person'
        const results = await searchPeople(searchTerm, 5);
        setPersonSuggestions(results);
        setMediaSuggestions([]);
        setShowSuggestions(results.length > 0);
      }
    } catch (error) {
      console.error("Erro ao buscar sugestões:", error);
      setMediaSuggestions([]);
      setPersonSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsSuggestionsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchSuggestions(query, currentSearchType);
    }, 500); 

    return () => {
      clearTimeout(handler);
    };
  }, [query, currentSearchType, fetchSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowSuggestions(false);
    onSearchSubmit(query, currentSearchType); 
  };

  const handleSuggestionClick = (item: MediaSearchResult | PersonSearchResult, type: SearchType) => {
    setQuery(type === 'media' ? (item as MediaSearchResult).title || (item as MediaSearchResult).name || '' : (item as PersonSearchResult).name || '');
    setShowSuggestions(false);
    onSelectSuggestion(item, type);
  };
  
  const placeholderText = currentSearchType === 'media' ? "Buscar filmes ou séries..." : "Buscar atores ou atrizes...";

  return (
    <div ref={searchContainerRef} className="relative w-full max-w-2xl mx-auto">
      <div className="flex justify-center mb-3 space-x-1">
        <button
          onClick={() => { setCurrentSearchType('media'); setQuery(''); setMediaSuggestions([]); setPersonSuggestions([]); setShowSuggestions(false);}}
          className={`px-5 py-2 text-sm font-medium rounded-l-md transition-colors duration-150 ${currentSearchType === 'media' ? 'bg-tmdb-green text-tmdb-dark-blue' : 'bg-tertiary-bg text-gray-300 hover:bg-gray-600'}`}
          aria-pressed={currentSearchType === 'media'}
        >
          Títulos
        </button>
        <button
          onClick={() => { setCurrentSearchType('person'); setQuery(''); setMediaSuggestions([]); setPersonSuggestions([]); setShowSuggestions(false);}}
          className={`px-5 py-2 text-sm font-medium rounded-r-md transition-colors duration-150 ${currentSearchType === 'person' ? 'bg-tmdb-green text-tmdb-dark-blue' : 'bg-tertiary-bg text-gray-300 hover:bg-gray-600'}`}
          aria-pressed={currentSearchType === 'person'}
        >
          Pessoas
        </button>
      </div>
      <form 
        onSubmit={handleSubmit} 
        className="flex items-center space-x-2 bg-secondary-bg p-3 rounded-lg shadow-md"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if(e.target.value.trim().length >=2) setShowSuggestions(true); else setShowSuggestions(false);
          }}
          onFocus={() => query.trim().length >=2 && setShowSuggestions(true)}
          placeholder={placeholderText}
          className="flex-grow p-3 border border-tertiary-bg rounded-l-md 
                     focus:ring-2 focus:ring-tmdb-green focus:border-transparent 
                     outline-none transition-shadow 
                     text-primary-text placeholder-secondary-text bg-tertiary-bg"
          disabled={isLoading}
          aria-label={`Campo de busca de ${currentSearchType === 'media' ? 'filmes e séries' : 'pessoas'}`}
          autoComplete="off"
        />
        <button
          type="submit"
          className="bg-tmdb-green hover:bg-opacity-80 text-tmdb-dark-blue font-semibold py-3 px-6 rounded-r-md 
                     transition-colors duration-150 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || !query.trim()}
          aria-label="Buscar"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-tmdb-dark-blue mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : "Buscar"}
        </button>
      </form>
      {showSuggestions && (query.trim().length >= 2) && (
        <div className="absolute z-10 w-full mt-1 bg-secondary-bg border border-tertiary-bg rounded-md shadow-lg max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-tertiary-bg scrollbar-track-secondary-bg">
          {isSuggestionsLoading && <p className="p-3 text-sm text-gray-400">Carregando sugestões...</p>}
          
          {!isSuggestionsLoading && currentSearchType === 'media' && mediaSuggestions.length === 0 && query.trim().length >= 2 && (
            <p className="p-3 text-sm text-gray-400">Nenhuma sugestão de título encontrada.</p>
          )}
          {!isSuggestionsLoading && currentSearchType === 'person' && personSuggestions.length === 0 && query.trim().length >= 2 && (
            <p className="p-3 text-sm text-gray-400">Nenhuma sugestão de pessoa encontrada.</p>
          )}

          {/* Media Suggestions */}
          {!isSuggestionsLoading && currentSearchType === 'media' && mediaSuggestions.map((item) => {
            const title = item.title || item.name;
            const year = item.release_date?.substring(0,4) || item.first_air_date?.substring(0,4);
            const posterUrl = item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : TMDB_PLACEHOLDER_IMAGE_URL;
            return (
              <div
                key={`media-${item.id}`}
                className="flex items-center p-3 hover:bg-tertiary-bg cursor-pointer transition-colors"
                onClick={() => handleSuggestionClick(item, 'media')}
                onKeyPress={(e) => e.key === 'Enter' && handleSuggestionClick(item, 'media')}
                role="option"
                aria-selected="false"
                tabIndex={0}
              >
                <img 
                  src={posterUrl} 
                  alt={`Capa de ${title}`} 
                  className="w-12 h-18 object-cover rounded-sm mr-3" // h-18 (72px) for aspect ratio
                  onError={(e) => (e.currentTarget.src = TMDB_PLACEHOLDER_IMAGE_URL)}
                />
                <div>
                  <p className="font-semibold text-primary-text text-sm">{title}</p>
                  {year && <p className="text-xs text-gray-400">{year}</p>}
                </div>
              </div>
            );
          })}

          {/* Person Suggestions */}
          {!isSuggestionsLoading && currentSearchType === 'person' && personSuggestions.map((item) => {
            // Para sugestões de pessoas, usamos uma imagem de perfil menor se disponível, ex: w45 ou w185
            const profileSuggestionUrl = item.profile_path ? `https://image.tmdb.org/t/p/w185${item.profile_path}` : TMDB_PLACEHOLDER_PROFILE_URL;
            return (
              <div
                key={`person-${item.id}`}
                className="flex items-center p-3 hover:bg-tertiary-bg cursor-pointer transition-colors"
                onClick={() => handleSuggestionClick(item, 'person')}
                onKeyPress={(e) => e.key === 'Enter' && handleSuggestionClick(item, 'person')}
                role="option"
                aria-selected="false"
                tabIndex={0}
              >
                <img 
                  src={profileSuggestionUrl} 
                  alt={`Foto de ${item.name}`} 
                  className="w-12 h-18 object-cover rounded-sm mr-3" // Mantendo o mesmo tamanho para consistência visual no dropdown
                  onError={(e) => (e.currentTarget.src = TMDB_PLACEHOLDER_PROFILE_URL)}
                />
                <div>
                  <p className="font-semibold text-primary-text text-sm">{item.name}</p>
                  {item.known_for_department && <p className="text-xs text-gray-400">{item.known_for_department}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
