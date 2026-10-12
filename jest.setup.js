const {jest} = require('@jest/globals');

jest.mock('@react-native-async-storage/async-storage', () =>
  ({
    __esModule: true,
    default: {
      getItem: jest.fn(async () => null),
      setItem: jest.fn(async () => undefined),
    },
  }),
);
