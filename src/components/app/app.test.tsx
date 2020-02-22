import React from 'react';
import { shallow } from 'enzyme';
import App from './app';

describe('App Component', () => {
  it('should mount', () => {
    const wrapper = shallow(<App />);
    expect(wrapper).toBeTruthy();
  });
});
