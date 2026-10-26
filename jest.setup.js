const {jest} = require('@jest/globals');

jest.mock('@react-native-async-storage/async-storage', () =>
  ({
    __esModule: true,
    default: {
      getItem: jest.fn(async () => null),
      setItem: jest.fn(async () => undefined),
      removeItem: jest.fn(async () => undefined),
    },
  }),
);

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    addEventListener: jest.fn(listener => {
      listener({isConnected: false, isInternetReachable: false});
      return jest.fn();
    }),
  },
}));
