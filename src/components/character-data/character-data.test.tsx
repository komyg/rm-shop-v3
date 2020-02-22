import React from 'react';
import { shallow } from 'enzyme';
import CharacterData from './character-data';

describe('Character Data', () => {
  it('should mount', () => {
    const wrapper = shallow(<CharacterData character={mockCharacter} />);
    expect(wrapper).toBeTruthy();
  });
});

const mockCharacter: any = {
  id: '1',
  __typename: 'Character',
  name: 'Rick Sanchez',
  species: 'Human',
  image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
  chosenQuantity: 1,
  unitPrice: 10,
  origin: {
    id: '1',
    __typename: 'Location',
    name: 'Earth (C-137)',
  },
  location: {
    id: '20',
    __typename: 'Location',
    name: 'Earth (Replacement Dimension)',
  },
};
