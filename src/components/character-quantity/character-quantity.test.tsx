import React from 'react';
import { mount } from 'enzyme';
import CharacterQuantity from './character-quantity';
import { MockedProvider } from '@apollo/react-testing';
import { act } from 'react-dom/test-utils';
import {
  IncreaseChosenQuantityDocument,
  DecreaseChosenQuantityDocument,
} from '../../generated/graphql';
import waitForExpect from 'wait-for-expect';

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
    const mockIncreaseQuantity = {
      request: { query: IncreaseChosenQuantityDocument, variables: { input: { id: '1' } } },
      result: jest.fn().mockReturnValue({ data: { increaseChosenQuantity: true } }),
    };

    await act(async () => {
      const wrapper = mount(
        <MockedProvider addTypename={false} mocks={[mockIncreaseQuantity]}>
          <CharacterQuantity characterId='1' chosenQuantity={0} />
        </MockedProvider>
      );
      expect(wrapper).toBeTruthy();

      wrapper
        .find('#increase-btn')
        .first()
        .simulate('click');

      await waitForExpect(() => {
        wrapper.update();
        expect(mockIncreaseQuantity.result).toHaveBeenCalled();
      });
    });
  });

  it('should call a mutation when decreasing a character quantity', async () => {
    const mockDecreaseQuantity = {
      request: { query: DecreaseChosenQuantityDocument, variables: { input: { id: '1' } } },
      result: jest.fn().mockReturnValue({ data: { increaseChosenQuantity: true } }),
    };

    await act(async () => {
      const wrapper = mount(
        <MockedProvider addTypename={false} mocks={[mockDecreaseQuantity]}>
          <CharacterQuantity characterId='1' chosenQuantity={2} />
        </MockedProvider>
      );
      expect(wrapper).toBeTruthy();

      wrapper
        .find('#decrease-btn')
        .first()
        .simulate('click');

      await waitForExpect(() => {
        wrapper.update();
        expect(mockDecreaseQuantity.result).toHaveBeenCalled();
      });
    });
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
