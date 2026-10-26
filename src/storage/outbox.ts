import AsyncStorage from '@react-native-async-storage/async-storage';

export type OutboxMethod = 'PATCH' | 'POST';

export type OutboxAction = {
  id: string;
  method: OutboxMethod;
  url: string;
  body: Record<string, unknown>;
  createdAt: string;
};

const OUTBOX_KEY = 'study-planner:outbox:v1';
let mutationQueue: Promise<void> = Promise.resolve();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isOutboxAction(value: unknown): value is OutboxAction {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.id === 'string' &&
    (value.method === 'PATCH' || value.method === 'POST') &&
    typeof value.url === 'string' &&
    isRecord(value.body) &&
    typeof value.createdAt === 'string' &&
    !Number.isNaN(Date.parse(value.createdAt)) &&
    isSupportedAction(value)
  );
}

function isSupportedAction(action: Record<string, unknown>): boolean {
  const {method, url, body} = action;
  if (typeof url !== 'string' || !isRecord(body)) {
    return false;
  }
  if (method === 'POST') {
    return url === '/assignments' && typeof body.clientRequestId === 'string';
  }
  return (
    method === 'PATCH' &&
    (/^\/assignments\/\d+$/.test(url) || url === '/students/1')
  );
}

function serializeMutation<T>(operation: () => Promise<T>): Promise<T> {
  const result = mutationQueue.then(operation, operation);
  mutationQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

async function readActions(): Promise<OutboxAction[]> {
  const serialized = await AsyncStorage.getItem(OUTBOX_KEY);
  if (serialized === null) {
    return [];
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized) as unknown;
  } catch {
    throw new Error(
      'Hàng đợi đồng bộ bị hỏng. Dữ liệu được giữ nguyên để kiểm tra, không bị xóa.',
    );
  }
  if (!Array.isArray(parsed)) {
    throw new Error(
      'Hàng đợi đồng bộ không hợp lệ. Dữ liệu được giữ nguyên để kiểm tra.',
    );
  }
  if (!parsed.every(isOutboxAction)) {
    throw new Error(
      'Có thao tác trong hàng đợi không hợp lệ. Hàng đợi được giữ nguyên.',
    );
  }
  const actions = parsed;
  return actions.sort((first, second) =>
    first.createdAt.localeCompare(second.createdAt) ||
    first.id.localeCompare(second.id),
  );
}

async function writeActions(actions: OutboxAction[]): Promise<void> {
  await AsyncStorage.setItem(OUTBOX_KEY, JSON.stringify(actions));
}

export const outbox = {
  getActions(): Promise<OutboxAction[]> {
    return serializeMutation(readActions);
  },

  async enqueue(
    method: OutboxMethod,
    url: string,
    body: Record<string, unknown>,
    createdAt = new Date().toISOString(),
    id = `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  ): Promise<OutboxAction> {
    const action: OutboxAction = {id, method, url, body, createdAt};
    if (!isOutboxAction(action)) {
      throw new Error(`Không hỗ trợ thao tác offline: ${method} ${url}`);
    }
    await serializeMutation(async () => {
      const actions = await readActions();
      await writeActions([...actions, action]);
    });
    return action;
  },

  remove(id: string): Promise<void> {
    return serializeMutation(async () => {
      const actions = await readActions();
      await writeActions(actions.filter(action => action.id !== id));
    });
  },

  updateQueuedAssignment(
    clientRequestId: string,
    changes: Record<string, unknown>,
  ): Promise<boolean> {
    return serializeMutation(async () => {
      const actions = await readActions();
      let updated = false;
      const next = actions.map(action => {
        if (
          action.method === 'POST' &&
          action.body.clientRequestId === clientRequestId
        ) {
          updated = true;
          return {
            ...action,
            body: {...action.body, ...changes},
          };
        }
        return action;
      });
      if (updated) {
        await writeActions(next);
      }
      return updated;
    });
  },
};
