
import React from 'react';
import type { CastMember } from '../types';
import { TMDB_PROFILE_IMAGE_BASE_URL, TMDB_PLACEHOLDER_PROFILE_URL } from '../constants';

interface CastMemberCardProps {
  member: CastMember;
  onSelectActor?: (actorId: number) => void; // Tornada opcional, mas será usada
}

const CastMemberCard: React.FC<CastMemberCardProps> = ({ member, onSelectActor }) => {
  const profileUrl = member.profile_path
    ? `${TMDB_PROFILE_IMAGE_BASE_URL}${member.profile_path}`
    : TMDB_PLACEHOLDER_PROFILE_URL;

  const handleActorClick = () => {
    if (onSelectActor) {
      onSelectActor(member.id);
    }
  };

  return (
    <div 
      className="bg-secondary-bg rounded-lg shadow-md overflow-hidden text-center transform transition-all duration-300 hover:scale-105 cursor-pointer"
      onClick={handleActorClick}
      onKeyPress={(e) => e.key === 'Enter' && handleActorClick()}
      role="button"
      tabIndex={0}
      aria-label={`Ver detalhes de ${member.name}`}
    >
      <img
        src={profileUrl}
        alt={member.name}
        className="w-full h-56 md:h-64 object-cover"
        onError={(e) => (e.currentTarget.src = TMDB_PLACEHOLDER_PROFILE_URL)}
      />
      <div className="p-3">
        <p className="font-semibold text-tmdb-light-blue text-sm truncate" title={member.name}>{member.name}</p>
        <p className="text-xs text-gray-400 truncate" title={member.character}>{member.character}</p>
      </div>
    </div>
  );
};

export default CastMemberCard;
