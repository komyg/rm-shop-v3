# Part 3: Adding Unit Tests

This is a three part tutorial series in which we will build a simple shopping cart app using React and [Apollo Graphql](https://www.apollographql.com/):

- [Part 1: Retrieve and display data from a remote server.](https://dev.to/komyg/creating-an-app-using-react-and-apollo-graphql-1ine)
- [Part 2: Use Apollo to manage the app's local state.](https://dev.to/komyg/use-apollo-to-manage-the-app-s-local-state-167f)
- Part 3: Add unit tests.

On this third part we will add unit tests to our components and our resolvers.

>Note: usually I think that it is a good practice to write the tests at the same time as you are writing the code (see [TDD - Test Driven Development](https://en.wikipedia.org/wiki/Test-driven_development)), but I chose not do to this on this tutorial series, because I thought it would be clearer to separate the subjects.

This tutorial builds on top of the code generated in the Part 2. [You can get it here](https://github.com/komyg/rm-shop-v2).

The complete code for the Part 3 is available in [this repository](https://github.com/komyg/rm-shop-v3).

>Note: this tutorial assumes that you have a working knowledge of React and Typescript.

# Getting Started

To begin, clone the [repository](https://github.com/komyg/rm-shop-v2) that we used on the [Part 2](https://dev.to/komyg/use-apollo-to-manage-the-app-s-local-state-167f).

After you cloned the repository, run `yarn install` to download the necessary packages.

# Configuring Enzyme

In this tutorial we are going to use Enzime and Jest to run unit tests on our code. The Enzyme configuration below was taken from the Create React App [official documentation](https://create-react-app.dev/docs/running-tests).

First let's add the necessary packages: `yarn add -D enzyme @types/enzyme enzyme-adapter-react-16 react-test-renderer jest-enzyme`.

Then let's setup our tests by creating the file: *src/setupTests.js* and pasting the contents below:

```js
import {
  configure
} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import 'jest-enzyme';

configure({
  adapter: new Adapter()
});
```

# Testing the resolvers

To test our resolvers, we are going to setup a mock Apollo Client and check the inputs and outputs from them. A good way see what comes in and out of a resolver is to use `console.log` statements and create the tests accordingly.

The first resolver we are going to test is the `setUnitPrice`. Let's start by creating a test file: *resolvers/set-unit-price.resolver.test.ts* and then pasting the contents below on it:

```ts
import setUnitPrice from './set-unit-price.resolver';

describe('Set Unit Price Resolver', () => {
  it('should set the unit price for a regular character', () => {
    const mockCharacter: any = {
      id: '3',
      __typename: 'Character',
      name: 'Summer Smith',
    };

    const result = setUnitPrice(mockCharacter, null, null as any, null);
    expect(result).toBe(5);
  });

  it('should set the unit price for a special character', () => {
    const mockCharacter: any = {
      id: '1',
      __typename: 'Character',
      name: 'Rick Sanchez',
    };

    const result = setUnitPrice(mockCharacter, null, null as any, null);
    expect(result).toBe(10);
  });
});

```

The purpose of this resolver is to assign the price of 10 USD to Rick and Morty and 5 USD to everyone else. The way that Apollo does this, is by sending every new `Character` that comes from the backend through this resolver in the `root` param in order to get the `unitPrice` value. This is what we are reproducing in our test.

In this case we don't need to setup a mock client for the test to work, however we are telling the compiler that the `mockCharacter` and the `context` are of the `any` type, so that the compiler won't complain that the `mockCharacter` is missing some properties and that we can't assign `null` to the context.

Next we will test the `increaseChosenQuantityResolver`. To do this, create the file *resolvers/increase-chosen-quantity.resolver.test.ts* and paste the contents below:

```ts
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
```

There is a lot going on in this file, so we are going to break it down:

- First we begin by setting up a mock Apollo Client complete with a `fragmentMatcher`, an `InMemoryCache` and the resolver that we want to test. Note that both the client and the cache should have the same configurations as the real client, but with the `addTypename` property as false.
- Then we `InMemoryCache` with a mock state by passing the `mockData` variable to the `cache.writeData` function. It is important to mention that all fields that are part of any query, fragment or mutation that is ran on this test, must be present on the mock data, otherwise the Apollo will throw an error. For example, if we omit the character's `name` parameter in the `mockData`, then the Apollo will throw an error, because the `characterData` fragment that is used inside the `increaseChosenQuantity` resolver contains this field.
- Once the cache is initialized, we run two tests to see if the `Character` and the `ShoppingCart` are being successfully updated in the cache when the mutation is ran an the resolver is called.

Next, let's create a test for the `decreseChosenQuantity` resolver. Start by creating the file: *resolvers/decrease-chosen-quantity.resolver.test.ts* and pasting the contents below:

```ts
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
```

This test is very similar to the one we created for the `increaseChosenQuantity` resolver, but in this case the cache starts with an action figure that has already been selected by the user. Also we added two more tests to make sure that we will not decrease the quantities and the price to a value that is less than 0.
