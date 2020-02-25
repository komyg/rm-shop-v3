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
