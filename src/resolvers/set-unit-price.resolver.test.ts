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
