import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import fragmentData from '../generated/fragment-matcher.json';
import {
  CharacterDataFragment,
  CharacterDataFragmentDoc,
  DecreaseChosenQuantityDocument,
  DecreaseChosenQuantityMutation,
  GetShoppingCartDocument,
  GetShoppingCartQuery,
} from '../generated/graphql';
import decreaseChosenQuantity from './decrease-chosen-quantity.resolver';

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
      resolvers: { Mutation: { decreaseChosenQuantity } }, // Resolver we want to test
      assumeImmutableResults: true,
    });

    // Initialize the cache with the desired state
    cache.writeData({ data: mockData });
  });

  it('should decrease a character chosen quantity', async () => {
    const result = await client.mutate<DecreaseChosenQuantityMutation>({
      mutation: DecreaseChosenQuantityDocument,
      variables: { input: { id: '1' } },
    });
    expect(result.data?.decreaseChosenQuantity).toBe(true);

    const character = client.readFragment<CharacterDataFragment>({
      fragment: CharacterDataFragmentDoc,
      id: 'Character:1',
    });
    expect(character?.chosenQuantity).toBe(0);
  });

  it('should update the shopping cart', async () => {
    const result = await client.mutate<DecreaseChosenQuantityMutation>({
      mutation: DecreaseChosenQuantityDocument,
      variables: { input: { id: '1' } },
    });
    expect(result.data?.decreaseChosenQuantity).toBe(true);

    const shoppingCartQuery = client.readQuery<GetShoppingCartQuery>({
      query: GetShoppingCartDocument,
    });
    expect(shoppingCartQuery?.shoppingCart.numActionFigures).toBe(0);
    expect(shoppingCartQuery?.shoppingCart.totalPrice).toBe(0);
  });

  it('should not decrease the chosen quantity below 0', async () => {
    await client.mutate<DecreaseChosenQuantityMutation>({
      mutation: DecreaseChosenQuantityDocument,
      variables: { input: { id: '1' } },
    });
    await client.mutate<DecreaseChosenQuantityMutation>({
      mutation: DecreaseChosenQuantityDocument,
      variables: { input: { id: '1' } },
    });

    const character = client.readFragment<CharacterDataFragment>({
      fragment: CharacterDataFragmentDoc,
      id: 'Character:1',
    });
    expect(character?.chosenQuantity).toBe(0);
  });

  it('should not decrease the shopping cart price and quantity below 0', async () => {
    await client.mutate<DecreaseChosenQuantityMutation>({
      mutation: DecreaseChosenQuantityDocument,
      variables: { input: { id: '1' } },
    });
    await client.mutate<DecreaseChosenQuantityMutation>({
      mutation: DecreaseChosenQuantityDocument,
      variables: { input: { id: '1' } },
    });

    const shoppingCartQuery = client.readQuery<GetShoppingCartQuery>({
      query: GetShoppingCartDocument,
    });
    expect(shoppingCartQuery?.shoppingCart.numActionFigures).toBe(0);
    expect(shoppingCartQuery?.shoppingCart.totalPrice).toBe(0);
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
      },
    ],
  },
  shoppingCart: {
    __typename: 'ShoppingCart',
    id: btoa('ShoppingCart:1'),
    totalPrice: 10,
    numActionFigures: 1,
  },
};
