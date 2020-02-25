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
        <MockedProvider addTypename={false} mocks={[mockEmtpyCart]}>
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

const mockEmtpyCart = {
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
