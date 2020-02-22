import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import fragmentData from '../generated/fragment-matcher.json';
import increaseChosenQuantity from './increase-chosen-quantity.resolver';
import {
  IncreaseChosenQuantityMutation,
  IncreaseChosenQuantityDocument,
  CharacterDataFragment,
  CharacterDataFragmentDoc,
  GetShoppingCartQuery,
  GetShoppingCartDocument,
} from '../generated/graphql';

describe('Add To Cart Resolver', () => {
  let cache: InMemoryCache;
  let client: ApolloClient<any>;

  beforeEach(() => {
    // Create mock fragment matcher
    const fragmentMatcher = new IntrospectionFragmentMatcher({
      introspectionQueryResultData: fragmentData,
    });

    // Create mock client and cache
    cache = new InMemoryCache({ addTypename: false, fragmentMatcher, freezeResults: true });
    client = new ApolloClient({
      cache,
      resolvers: { Mutation: { increaseChosenQuantity } }, // Resolver we want to test
      assumeImmutableResults: true,
    });

    // Initialize the cache with the desired state
    cache.writeData({ data: mockData });
  });

  it('should increase a character chosen quantity', async () => {
    const result = await client.mutate<IncreaseChosenQuantityMutation>({
      mutation: IncreaseChosenQuantityDocument,
      variables: { input: { id: '1' } },
    });
    expect(result.data?.increaseChosenQuantity).toBe(true);

    const character = client.readFragment<CharacterDataFragment>({
      fragment: CharacterDataFragmentDoc,
      id: 'Character:1',
    });
    expect(character?.chosenQuantity).toBe(1);
  });

  it('should update the shopping cart', async () => {
    const result = await client.mutate<IncreaseChosenQuantityMutation>({
      mutation: IncreaseChosenQuantityDocument,
      variables: { input: { id: '1' } },
    });
    expect(result.data?.increaseChosenQuantity).toBe(true);

    const shoppingCartQuery = client.readQuery<GetShoppingCartQuery>({
      query: GetShoppingCartDocument,
    });
    expect(shoppingCartQuery?.shoppingCart.numActionFigures).toBe(1);
    expect(shoppingCartQuery?.shoppingCart.totalPrice).toBe(10);
  });
});

const mockData = {
  characters: {
    results: [
      {
        id: '1',
        __typename: 'Character',
        name: 'Rick Sanchez',
        species: 'Human',
        image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
        chosenQuantity: 0,
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
      },
    ],
  },
  shoppingCart: {
    __typename: 'ShoppingCart',
    id: btoa('ShoppingCart:1'),
    totalPrice: 0,
    numActionFigures: 0,
  },
};
