# Part 3: Adding Unit Tests

This is a three part tutorial series in which we will build a simple shopping cart app using React and [Apollo Graphql](https://www.apollographql.com/). The idea is to build a table in which the user can choose which Rick and Morty action figures he wants to buy.

- [Part 1: Retrieve and display data from a remote server.](https://dev.to/komyg/creating-an-app-using-react-and-apollo-graphql-1ine)
- [Part 2: Use Apollo to manage the app's local state.](https://dev.to/komyg/use-apollo-to-manage-the-app-s-local-state-167f)
- [Part 3: Add unit tests.](https://dev.to/komyg/unit-tests-with-enzyme-and-apollo-graphql-5e7p)

In this third part we will add unit tests to our components and our resolvers.

>Note: usually I think that it is a good practice to write the tests at the same time as you are writing the code (see [TDD - Test Driven Development](https://en.wikipedia.org/wiki/Test-driven_development)), but I chose not do to this on this tutorial series, because I thought it would be clearer to separate the subjects.

This tutorial builds on top of the code generated in the Part 2. [You can get it here](https://github.com/komyg/rm-shop-v2).

The complete code for the Part 3 is available in [this repository](https://github.com/komyg/rm-shop-v3).

>Note: this tutorial assumes that you have a working knowledge of React and Typescript.

# Getting Started

To begin, clone the [repository](https://github.com/komyg/rm-shop-v2) that we used on the [Part 2](https://dev.to/komyg/use-apollo-to-manage-the-app-s-local-state-167f).

After you cloned the repository, run `yarn install` to download the necessary packages.

# Configuring Enzyme

In this tutorial we are going to use Enzyme and Jest to run unit tests on our code. The Enzyme configuration below was taken from the Create React App [official documentation](https://create-react-app.dev/docs/running-tests).

First let's add the necessary packages: `yarn add -D enzyme @types/enzyme enzyme-adapter-react-16 react-test-renderer jest-enzyme wait-for-expect`.

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

Also delete the *src/setupTests.ts* file if you have it.

# Running the tests

At any point in this tutorial you can execute the command `yarn test` to run the tests we've written so far. You can also add the file name to the end of this command to run a single test suite.

# Testing the resolvers

To test our resolvers, we are going to setup a mock Apollo Client and check the inputs and outputs from them. A good way to see what comes in and out of a resolver is to use `console.log` statements.

## Set unit price

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

In this case we don't need to setup a mock client for the test to work, however we are telling the compiler that the `mockCharacter` and the `context` are of the `any` type, so that it won't complain that the `mockCharacter` is missing some properties and that we can't assign `null` to the context.

## Increase chosen quantity

Next we will test the `increaseChosenQuantity`. To do this, create the file *resolvers/increase-chosen-quantity.resolver.test.ts* and paste the contents below:

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

First we begin by setting up a mock Apollo Client complete with a `fragmentMatcher`, an `InMemoryCache` and the resolver that we want to test. Note that both the client and the cache should have the same configurations as the real client, but with the `addTypename` property as false.

Then we initialize the `InMemoryCache` with a mock state by passing the `mockData` variable to the `cache.writeData` function. It is important to mention that all fields that are part of any query, fragment or mutation that is ran on this test, must be present on the mock data, otherwise the Apollo will throw an error. For example, if we omit the character's `name` parameter in the `mockData`, then the Apollo will throw an error, because the `characterData` fragment that is used inside the `increaseChosenQuantity` resolver contains this field.

Once the cache is initialized, we run two tests to see if the `Character` and the `ShoppingCart` are being successfully updated when the mutation is ran.

## Decrease chosen quantity

Next, let's create a test for the `decreaseChosenQuantity` resolver. Start by creating the file: *resolvers/decrease-chosen-quantity.resolver.test.ts* and pasting the contents below:

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

This test is very similar to the one we created for the `increaseChosenQuantity` resolver, but in this case the cache starts with an action figure that has already been selected by the user. Also we added two more tests to make sure that we will not decrease the quantities and the price to less than 0.

## Get character

Finally, let's add a test for the last resolver: `getCharacter`. Create a new file *resolvers/get-character.resolver.test.ts* and paste the contents below:

```ts
import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import fragmentData from '../generated/fragment-matcher.json';
import getCharacter from './get-character.resolver';
import { GetCharacterQuery, GetCharacterDocument } from '../generated/graphql';

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
      resolvers: { Query: { getCharacter } }, // Resolver we want to test
      assumeImmutableResults: true,
    });

    // Initialize the cache with the desired state
    cache.writeData({ data: mockData });
  });

  it('should retrieve a character', async () => {
    const result = await client.query<GetCharacterQuery>({
      query: GetCharacterDocument,
      variables: { id: '1' },
    });
    expect(result.data.getCharacter?.id).toBe('1');
    expect(result.data.getCharacter?.name).toBe('Rick Sanchez');
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
};
```

This test just runs the query through the Apollo and checks the result.

# Testing the components

Now let's begin testing the components themselves.

## App component

First let's begin with the `App` component. Create the file: *components/app/app.test.tsx* and paste the contents below:

```tsx
import React from 'react';
import { shallow } from 'enzyme';
import App from './app';

describe('App Component', () => {
  it('should mount', () => {
    const wrapper = shallow(<App />);
    expect(wrapper).toBeTruthy();
  });
});
```

This test is just a [smoke test](https://en.wikipedia.org/wiki/Smoke_testing_(software)) to see if anything will break if we mount this component. Since this component doesn't do much else besides instating other components, just this smoke test is enough.

## Character data component

Now let's also create a smoke test fo the `CharacterData` component in the file: *components/character-data/character-data.test.tsx*:

```tsx
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
```

In both tests above, we are using Enzyme's `shallow`. By using it, we are telling Enzyme that we just want to mount the top level component. It can and will ignore all sub-components. This is why we don't have to bother on creating mocks for the children of these two components.

## The Apollo Mocked Provider

For the next components that we will test we will need the [ApolloMockedProvider](https://www.apollographql.com/docs/react/development-testing/testing/#mockedprovider) to simulate graphql queries and mutations. The `ApolloMockedProvider` is available on a separate package: `yarn add -D @apollo/react-testing`.

## Character table component

Now, let's create a new test for the `CharacterTable` component. Since it contains a graphql query, we will need to use the `MockedProvider` to simulate the graphql elements.

To start, update the `CharacterTable` component in the *components/character-table/character-table.tsx* file with the content below. We've added a few `ids` to the components, so it is easier to query for them in the tests:

```tsx
// Query state management
if (loading) {
  return <CircularProgress id='progress' />;
} else if (error) {
  return (
    <Typography variant='h5' id='error-msg'>
      Error retrieving data, please reload the page to try again.
    </Typography>
  );
} else if (!data || !data.characters || !data.characters.results) {
  return (
    <Typography variant='h5' id='no-data-msg'>
      No data available, please reload the page to try again.
    </Typography>
  );
}
```

Now create the file *components/character-table/character-table.spec.tsx* and paste the content below:

```tsx
import React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import CharacterTable from './character-table';
import { MockedProvider, wait } from '@apollo/react-testing';
import { act } from 'react-dom/test-utils';
import { GetCharactersDocument } from '../../generated/graphql';

jest.mock('../character-data/character-data', () => ({
  __esModule: true,
  default: function CharacterData() {
    return <tr />;
  },
}));

describe('Character Table', () => {
  it('should show a spinner when loading the data', async () => {
    let wrapper;
    await act(async () => {
      wrapper = mount(
        <MockedProvider addTypename={false} mocks={[]} resolvers={{}}>
          <CharacterTable />
        </MockedProvider>
      );
    });

    expect(wrapper).toBeTruthy();
    expect(wrapper).toContainMatchingElement('#progress');
  });

  it('should successfully display the character data', async () => {
    let wrapper: ReactWrapper;
    await act(async () => {
      // Mount the component
      wrapper = mount(
        <MockedProvider addTypename={false} mocks={[mockCharacters]} resolvers={{}}>
          <CharacterTable />
        </MockedProvider>
      );

      // Wait until the query is resolved
      await wait(0);
      wrapper.update();
    });

    expect(wrapper!).toContainMatchingElement('CharacterData');
  });

  it('should handle an error', async () => {
    let wrapper: ReactWrapper;

    await act(async () => {
      wrapper = mount(
        <MockedProvider addTypename={false} mocks={[mockWithError]} resolvers={{}}>
          <CharacterTable />
        </MockedProvider>
      );

      await wait(0);
      wrapper.update();
    });

    expect(wrapper!).toContainMatchingElement('#error-msg');
  });

  it('should handle when there is no data', async () => {
    let wrapper: ReactWrapper;

    await act(async () => {
      wrapper = mount(
        <MockedProvider addTypename={false} mocks={[emptyMock]} resolvers={{}}>
          <CharacterTable />
        </MockedProvider>
      );

      await wait(0);
      wrapper.update();
    });

    expect(wrapper!).toContainMatchingElement('#no-data-msg');
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

const emptyMock = {
  request: { query: GetCharactersDocument },
  result: {
    data: {
      characters: null,
    },
  },
};
```

There is quite a bit going on in this file, so let's break it down:

### Test setup

First we created a mock of the `CharacterData` component, to make sure that we are testing the `CharacterTable` component in isolation (it is important to do this, because we are using `mount` instead of `shallow`, this way the whole component tree will be mounted).

Notice that the mock itself contains a `default` property which returns an functional component, this is because the `CharacterData` component is exported as the module default (`export default function CharacterData`), so we mock this by using the `default` parameter.

### Should show a spinner when loading the data

Our first test checks if we show a spinner while loading the data from the graphql server. We do this, by mounting the whole component wrapped by the `MockedProvider`. Notice that we used `mount` instead of `shallow`, this is because the `shallow` function would only mount the first level component, which in this case is the `MockedProvider`, so we use `mount` to mount the whole component tree.

In this test, we don't have to pass any mocks to it, because we are not waiting for them to be resolved. We just want to see if the spinner will be shown when the query is loading.

### Should successfully display the character data

In this test we check if we display the `CharacterData` components if our data loads successfully (keep in mind that this is not the real `CharacterData` component, but rather our mock). In order to do this, we had to configure a mock which contains the expected input and output data that is handled by the Apollo graphql.

Here we also use the [wait](https://github.com/wesbos/waait) function make sure our mock resolves so we can make assertions, otherwise we would only see the loading spinner.

### Other tests

We have two more tests, one that checks if we can gracefully handle an error and the other when there is no data available (notice that the error mock has an `error` parameter instead of a `result` parameter).

At the end of the file, we have our mocks. In here, the same rule we applied with resolvers is valid: all of the fields that you requested in a query or a mutation must be returned in the mock. If a single field is missing, Apollo will throw an error.

You can take a look at [Apollo's official documentation](https://www.apollographql.com/docs/react/development-testing/testing/) if you want to know more about the tests.

>Note: in this test suite it is very important to set the `resolver` param in the `MockedProvider`, even if it is just an empty object. This is because our query has two `@client` fields (`chosenQuantity` and `unitPrice`) and if we don't set it, the `MockedProvider` will always throw a **ApolloError: Network error: No more mocked responses for the query: query GetCharacters** error.

>Note 2: in some tests we need to use the [act](https://reactjs.org/docs/test-utils.html#act) function to make sure our component's state is correct before making any assertions.

## Character quantity component

In this component, we would like to test that a mutation to increase or decrease the character's quantity is called whenever we click one of the buttons. First let's add an `id` property to both so that we can test them more easily. Change the *components/character-quantity/character-quantity.tsx* file:

```tsx
<IconButton color='primary' disabled={props.chosenQuantity <= 0} onClick={onDecreaseQty} id='decrease-btn'>
  <ChevronLeftIcon />
</IconButton>
<Typography>{props.chosenQuantity}</Typography>
<IconButton color='primary' onClick={onIncreaseQty} id='increase-btn'>
  <ChevronRightIcon />
</IconButton>
```

Now, create the file: *components/character-quantity/character-quantity.test.tsx* and paste the contents below:

```tsx
import React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import CharacterQuantity from './character-quantity';
import { MockedProvider, wait } from '@apollo/react-testing';
import { act } from 'react-dom/test-utils';
import {
  IncreaseChosenQuantityDocument,
  DecreaseChosenQuantityDocument,
} from '../../generated/graphql';

describe('Character Quantity', () => {
  it('should mount', () => {
    const wrapper = mount(
      <MockedProvider addTypename={false} mocks={[]}>
        <CharacterQuantity characterId='1' chosenQuantity={0} />
      </MockedProvider>
    );
    expect(wrapper).toBeTruthy();
  });

  it('should call a mutation when increasing a character quantity', async () => {
    let wrapper: ReactWrapper;

    // Grapqhl mock
    const mockIncreaseQuantity = {
      request: { query: IncreaseChosenQuantityDocument, variables: { input: { id: '1' } } },
      result: jest.fn().mockReturnValue({ data: { increaseChosenQuantity: true } }),
    };

    await act(async () => {
      // Mount
      wrapper = mount(
        <MockedProvider addTypename={false} mocks={[mockIncreaseQuantity]}>
          <CharacterQuantity characterId='1' chosenQuantity={0} />
        </MockedProvider>
      );

      // Simulate button click
      wrapper
        .find('#increase-btn')
        .first()
        .simulate('click');

      // Wait until the mutation is called
      await wait(0);
    });

    // Check if the mutation was actually called.
    expect(mockIncreaseQuantity.result).toHaveBeenCalled();
  });

  it('should call a mutation when decreasing a character quantity', async () => {
    let wrapper: ReactWrapper;

    const mockDecreaseQuantity = {
      request: { query: DecreaseChosenQuantityDocument, variables: { input: { id: '1' } } },
      result: jest.fn().mockReturnValue({ data: { increaseChosenQuantity: true } }),
    };

    await act(async () => {
      wrapper = mount(
        <MockedProvider addTypename={false} mocks={[mockDecreaseQuantity]}>
          <CharacterQuantity characterId='1' chosenQuantity={2} />
        </MockedProvider>
      );

      wrapper
        .find('#decrease-btn')
        .first()
        .simulate('click');

      await wait(0);
    });

    expect(mockDecreaseQuantity.result).toHaveBeenCalled();
  });

  it('should disable the decrease quantity button when the character quantity is 0', () => {
    const wrapper = mount(
      <MockedProvider addTypename={false} mocks={[]}>
        <CharacterQuantity characterId='1' chosenQuantity={0} />
      </MockedProvider>
    );
    expect(wrapper).toBeTruthy();
    expect(
      wrapper
        .find('#decrease-btn')
        .first()
        .prop('disabled')
    ).toBe(true);
  });
});
```

Let's breakdown this test:

We've added a function as the result value of both mutations instead of plain objects. The Apollo `MockedProvider` supports either objects, functions and promises as the `result` property. This way we can test if the mutation was called.

Just like queries, mutations are also executed asynchronously, so we use the `await wait(0);` function (after we clicked on the increase or decrease button) to wait until our mutation has finished executing.

## Shopping cart component

For this component, we are going to check if it appears when we have one or more action figures selected. To simplify our tests open the file *components/shopping-cart-btn/shopping-cart-btn.tsx* and add `id` param to the `<Box />` that is returned when there are no action figures selected:

```tsx
if (!data || data.shoppingCart.numActionFigures <= 0) {
  return <Box className={classes.root} id='empty-btn' />;
}
```

Let's also add an `id` param to the `<Box />` that contains the actual button:

```tsx
return (
  <Box className={classes.root} id='shopping-cart-btn'>
    {/* [...] */}
  </Box>
);
```

Now create a new file: *components/shopping-cart-btn/shopping-cart-btn.test.tsx* and paste the contents below:

```tsx
import React from 'react';
import { act } from 'react-dom/test-utils';
import { GetShoppingCartDocument } from '../../generated/graphql';
import { mount, ReactWrapper } from 'enzyme';
import { MockedProvider, wait } from '@apollo/react-testing';
import ShoppingCartBtn from './shopping-cart-btn';

describe('Shopping Cart Btn', () => {
  it('should not show the button when there are 0 action figures selected', async () => {
    let wrapper: ReactWrapper;
    await act(async () => {
      wrapper = mount(
        <MockedProvider addTypename={false} mocks={[mockEmptyCart]}>
          <ShoppingCartBtn />
        </MockedProvider>
      );

      await wait(0);
      wrapper.update();
    });

    expect(wrapper!).toContainMatchingElement('#empty-btn');
    expect(wrapper!).not.toContainMatchingElement('#shopping-cart-btn');
  });

  it('should show the button when there is 1 or more action figures selected', async () => {
    let wrapper: ReactWrapper;

    await act(async () => {
      wrapper = mount(
        <MockedProvider addTypename={false} mocks={[mockShoppingCart]}>
          <ShoppingCartBtn />
        </MockedProvider>
      );

      await wait(0);
      wrapper.update();
    });

    expect(wrapper!).not.toContainMatchingElement('#empty-btn');
    expect(wrapper!).toContainMatchingElement('#shopping-cart-btn');
  });
});

const mockEmptyCart = {
  request: { query: GetShoppingCartDocument },
  result: {
    data: {
      shoppingCart: {
        __typename: 'ShoppingCart',
        id: btoa('ShoppingCart:1'),
        totalPrice: 0,
        numActionFigures: 0,
      },
    },
  },
};

const mockShoppingCart = {
  request: { query: GetShoppingCartDocument },
  result: {
    data: {
      shoppingCart: {
        __typename: 'ShoppingCart',
        id: btoa('ShoppingCart:1'),
        totalPrice: 10,
        numActionFigures: 1,
      },
    },
  },
};
```

This test is similar to the other ones we've written so far: we use `await wait(0);` to wait for the query execution, then we check if we are showing the results correctly.

# Conclusion

You can now run all the tests by executing the command: `yarn test --watchAll`. If all goes well all of them should pass.
