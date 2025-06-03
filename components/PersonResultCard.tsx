
import React from 'react';
import type { PersonSearchResult } from '../types';
import { TMDB_PROFILE_IMAGE_BASE_URL, TMDB_PLACEHOLDER_PROFILE_URL } from '../constants';

interface PersonResultCardProps {
  person: PersonSearchResult;
  onSelectActor: (actorId: number) => void;
}

const PersonResultCard: React.FC<PersonResultCardProps> = ({ person, onSelectActor }) => {
  const profileUrl = person.profile_path
    ? `${TMDB_PROFILE_IMAGE_BASE_URL}${person.profile_path}`
    : TMDB_PLACEHOLDER_PROFILE_URL;

  return (
    <div
      className="group bg-secondary-bg rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] border-2 border-transparent hover:border-tmdb-light-blue/70 flex flex-col cursor-pointer"
      onClick={() => onSelectActor(person.id)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onSelectActor(person.id)}
      aria-label={`Ver detalhes de ${person.name}`}
    >
      <div className="relative overflow-hidden aspect-[2/3]"> {/* Forçar proporção de poster */}
        <img
          src={profileUrl}
          alt={`Foto de ${person.name}`}
          className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-110"
          onError={(e) => (e.currentTarget.src = TMDB_PLACEHOLDER_PROFILE_URL)}
        />
         <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-tmdb-light-blue mb-1 truncate transition-colors duration-300 group-hover:text-tmdb-green" title={person.name}>
          {person.name}
        </h3>
        {person.known_for_department && (
          <p className="text-xs text-gray-400">{person.known_for_department}</p>
        )}
      </div>
    </div>
  );
};
export default PersonResultCard;
