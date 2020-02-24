import React from 'react';
import { mount } from 'enzyme';
import CharacterTable from './character-table';
import { MockedProvider } from '@apollo/react-testing';
import { act } from 'react-dom/test-utils';
import { GetCharactersDocument } from '../../generated/graphql';
import waitForExpect from 'wait-for-expect';

jest.mock('../character-data/character-data', () => ({
  __esModule: true,
  default: function CharacterData() {
    return <tr />;
  },
}));

describe('Character Table', () => {
  it('should show a spinner when loading the data', async () => {
    await act(async () => {
      const wrapper = mount(
        <MockedProvider addTypename={false} mocks={[mockCharacters]} resolvers={{}}>
          <CharacterTable />
        </MockedProvider>
      );
      expect(wrapper).toBeTruthy();
      expect(wrapper).toContainMatchingElement('#progress');
    });
  });

  it('should successfully dislay the character data', async () => {
    await act(async () => {
      const wrapper = mount(
        <MockedProvider addTypename={false} mocks={[mockCharacters]} resolvers={{}}>
          <CharacterTable />
        </MockedProvider>
      );

      await waitForExpect(() => {
        wrapper.update();
        expect(wrapper).toContainMatchingElement('CharacterData');
      });
    });
  });

  it('should handle an error', async () => {
    await act(async () => {
      const wrapper = mount(
        <MockedProvider addTypename={false} mocks={[mockWithError]} resolvers={{}}>
          <CharacterTable />
        </MockedProvider>
      );

      await waitForExpect(() => {
        wrapper.update();
        expect(wrapper).toContainMatchingElement('#error-msg');
      });
    });
  });

  it('should handle when there is no data', async () => {
    await act(async () => {
      const wrapper = mount(
        <MockedProvider addTypename={false} mocks={[emtpyMock]} resolvers={{}}>
          <CharacterTable />
        </MockedProvider>
      );

      await waitForExpect(() => {
        wrapper.update();
        expect(wrapper).toContainMatchingElement('#no-data-msg');
      });
    });
  });
});

const mockCharacters = {
  request: { query: GetCharactersDocument },
  result: {
    data: {
      characters: {
        __typename: 'Characters',
        results: [
          {
            id: '1',
            __typename: 'Character',
            name: 'Rick Sanchez',
            image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
            species: 'Human',
            chosenQuantity: 0,
            unitPrice: 0,
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
          },
          {
            id: '2',
            __typename: 'Character',
            name: 'Morty Smith',
            image: 'https://rickandmortyapi.com/api/character/avatar/2.jpeg',
            species: 'Human',
            chosenQuantity: 0,
            unitPrice: 0,
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
          },
        ],
      },
    },
  },
};

const mockWithError = {
  request: { query: GetCharactersDocument },
  error: new Error('Network Error'),
};

const emtpyMock = {
  request: { query: GetCharactersDocument },
  result: {
    data: {
      characters: null,
    },
  },
};
