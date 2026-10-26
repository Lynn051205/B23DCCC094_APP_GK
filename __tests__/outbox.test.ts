import AsyncStorage from '@react-native-async-storage/async-storage';
import {outbox} from '../src/storage/outbox';

const getItem = jest.mocked(AsyncStorage.getItem);
const setItem = jest.mocked(AsyncStorage.setItem);
const removeItem = jest.mocked(AsyncStorage.removeItem);

describe('offline outbox', () => {
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

  test('persists supported actions in creation order and updates queued posts', async () => {
    await outbox.enqueue(
      'PATCH',
      '/assignments/1',
      {status: 'done'},
      '2026-10-01T10:00:00.000Z',
      'patch-1',
    );
    await outbox.enqueue(
      'POST',
      '/assignments',
      {clientRequestId: 'client-1', status: 'todo'},
      '2026-10-01T11:00:00.000Z',
      'post-1',
    );

    expect(
      await outbox.updateQueuedAssignment('client-1', {status: 'done'}),
    ).toBe(true);
    const actions = await outbox.getActions();
    expect(actions.map(action => action.id)).toEqual(['patch-1', 'post-1']);
    expect(actions[1].body.status).toBe('done');
  });

  test('retains two assignment updates and one new assignment across a restart', async () => {
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
      '2026-10-01T10:01:00.000Z',
      'patch-2',
    );
    await outbox.enqueue(
      'POST',
      '/assignments',
      {clientRequestId: 'client-new', title: 'Offline assignment'},
      '2026-10-01T10:02:00.000Z',
      'post-new',
    );

    const actionsAfterRestart = await outbox.getActions();
    expect(actionsAfterRestart).toHaveLength(3);
    expect(actionsAfterRestart.map(action => action.method)).toEqual([
      'PATCH',
      'PATCH',
      'POST',
    ]);
  });

  test('rejects unsupported actions and preserves invalid stored queue data', async () => {
    await expect(
      outbox.enqueue('PATCH', '/unrelated/1', {}, undefined, 'invalid'),
    ).rejects.toThrow('Không hỗ trợ thao tác offline');

    stored.set('study-planner:outbox:v1', '{');
    await expect(outbox.getActions()).rejects.toThrow('được giữ nguyên');
    expect(removeItem).not.toHaveBeenCalled();
  });
});
