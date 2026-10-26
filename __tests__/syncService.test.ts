jest.mock('../src/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    patch: jest.fn(),
    post: jest.fn(),
  },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import {apiClient} from '../src/api/client';
import {outbox} from '../src/storage/outbox';
import {synchronizeOutbox} from '../src/services/syncService';

const getItem = jest.mocked(AsyncStorage.getItem);
const setItem = jest.mocked(AsyncStorage.setItem);
const removeItem = jest.mocked(AsyncStorage.removeItem);
const apiGet = jest.mocked(apiClient.get);
const apiPatch = jest.mocked(apiClient.patch);
const apiPost = jest.mocked(apiClient.post);

describe('outbox synchronization', () => {
  let stored: Map<string, string>;

  beforeEach(() => {
    jest.clearAllMocks();
    stored = new Map();
    getItem.mockImplementation(async key => stored.get(key) ?? null);
    setItem.mockImplementation(async (key, value) => {
      stored.set(key, value);
    });
    removeItem.mockImplementation(async key => {
      stored.delete(key);
    });
  });

  test('server wins when the remote record has a newer updatedAt', async () => {
    await outbox.enqueue(
      'PATCH',
      '/assignments/1',
      {status: 'done'},
      '2026-10-01T10:00:00.000Z',
      'conflict-1',
    );
    apiGet.mockResolvedValue({updatedAt: '2026-10-01T11:00:00.000Z'});

    const result = await synchronizeOutbox();

    expect(result).toEqual({synced: 1, remaining: 0, error: null});
    expect(apiPatch).not.toHaveBeenCalled();
    expect(await outbox.getActions()).toEqual([]);
  });

  test('does not repost an assignment already created after a timeout', async () => {
    await outbox.enqueue(
      'POST',
      '/assignments',
      {clientRequestId: 'request-1', title: 'Task'},
      '2026-10-01T10:00:00.000Z',
      'post-1',
    );
    apiGet.mockResolvedValue([
      {id: 7, clientRequestId: 'request-1', title: 'Task'},
    ]);

    const result = await synchronizeOutbox();

    expect(result).toEqual({synced: 1, remaining: 0, error: null});
    expect(apiPost).not.toHaveBeenCalled();
  });

  test('keeps the failed action and later actions in the outbox', async () => {
    await outbox.enqueue(
      'PATCH',
      '/assignments/1',
      {status: 'done'},
      '2026-10-01T10:00:00.000Z',
      'patch-1',
    );
    await outbox.enqueue(
      'PATCH',
      '/assignments/2',
      {status: 'done'},
      '2026-10-01T11:00:00.000Z',
      'patch-2',
    );
    apiGet.mockResolvedValue({updatedAt: '2026-09-01T00:00:00.000Z'});
    apiPatch.mockRejectedValue({type: 'network', status: null, message: 'offline'});

    const result = await synchronizeOutbox();

    expect(result.synced).toBe(0);
    expect(result.remaining).toBe(2);
    expect(result.error).toBe('offline');
    expect(apiPatch).toHaveBeenCalledTimes(1);
    expect((await outbox.getActions()).map(action => action.id)).toEqual([
      'patch-1',
      'patch-2',
    ]);
  });

  test('shares one in-flight synchronization promise', async () => {
    const first = synchronizeOutbox();
    const second = synchronizeOutbox();

    expect(second).toBe(first);
    await first;
  });
});
