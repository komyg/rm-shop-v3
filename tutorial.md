# Part 3: Adding Unit Tests

This is a three part tutorial series in which we will build a simple shopping cart app using React and [Apollo Graphql](https://www.apollographql.com/):

- [Part 1: Retrieve and display data from a remote server.](https://dev.to/komyg/creating-an-app-using-react-and-apollo-graphql-1ine)
- [Part 2: Use Apollo to manage the app's local state.](https://dev.to/komyg/use-apollo-to-manage-the-app-s-local-state-167f)
- Part 3: Add unit tests.

On this third part we will add unit tests to our components and our resolvers.

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

