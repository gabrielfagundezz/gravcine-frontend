
import React from 'react';
import type { PersonSearchResult } from '../types';
import PersonResultCard from './PersonResultCard';

interface PersonListProps {
  people: PersonSearchResult[];
  onSelectActor: (actorId: number) => void;
}

const PersonList: React.FC<PersonListProps> = ({ people, onSelectActor }) => {
  if (people.length === 0) {
    return null; 
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-4">
      {people.map((person) => (
        <PersonResultCard
          key={person.id}
          person={person}
          onSelectActor={onSelectActor}
        />
      ))}
    </div>
  );
};

export default PersonList;
