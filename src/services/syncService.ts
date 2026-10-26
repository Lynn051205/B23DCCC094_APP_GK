import {apiClient} from '../api/client';
import type {Assignment} from '../api/types';
import {outbox} from '../storage/outbox';
import type {OutboxAction} from '../storage/outbox';

export type SyncResult = {
  synced: number;
  remaining: number;
  error: string | null;
};

type ServerRecord = {
  updatedAt?: unknown;
};

let activeSync: Promise<SyncResult> | null = null;

function getActionError(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }
  return 'Không thể đồng bộ thao tác đang chờ.';
}

function serverIsNewer(record: ServerRecord, action: OutboxAction): boolean {
  if (typeof record.updatedAt !== 'string') {
    return false;
  }
  const serverUpdatedAt = Date.parse(record.updatedAt);
  const actionCreatedAt = Date.parse(action.createdAt);
  return (
    !Number.isNaN(serverUpdatedAt) &&
    !Number.isNaN(actionCreatedAt) &&
    serverUpdatedAt > actionCreatedAt
  );
}

async function resolveServerWins(action: OutboxAction): Promise<boolean> {
  if (action.method !== 'PATCH') {
    return false;
  }
  const record = await apiClient.get<ServerRecord>(action.url);
  return serverIsNewer(record, action);
}

async function findExistingAssignment(
  clientRequestId: string,
): Promise<Assignment | null> {
  const items = await apiClient.get<Assignment[]>(
    `/assignments?clientRequestId=${encodeURIComponent(clientRequestId)}`,
  );
  return items[0] ?? null;
}

async function sendAction(action: OutboxAction): Promise<void> {
  if (action.method === 'PATCH') {
    await apiClient.patch<unknown, Record<string, unknown>>(
      action.url,
      action.body,
    );
    return;
  }

  const requestId = action.body.clientRequestId;
  if (typeof requestId !== 'string') {
    throw new Error('Thao tác tạo bài tập thiếu clientRequestId.');
  }
  const existing = await findExistingAssignment(requestId);
  if (existing) {
    return;
  }
  await apiClient.post<Assignment, Record<string, unknown>>(
    action.url,
    action.body,
  );
}

async function processOutbox(): Promise<SyncResult> {
  let synced = 0;
  let errorMessage: string | null = null;
  let actions: OutboxAction[];
  try {
    actions = await outbox.getActions();
  } catch (error) {
    return {
      synced: 0,
      remaining: 0,
      error: getActionError(error),
    };
  }

  for (const action of actions) {
    try {
      const serverWins = await resolveServerWins(action);
      if (!serverWins) {
        await sendAction(action);
      }
      await outbox.remove(action.id);
      synced += 1;
    } catch (error) {
      errorMessage = getActionError(error);
      break;
    }
  }

  let remaining = actions.length - synced;
  try {
    remaining = (await outbox.getActions()).length;
  } catch (error) {
    errorMessage = getActionError(error);
  }
  return {synced, remaining, error: errorMessage};
}

export function synchronizeOutbox(): Promise<SyncResult> {
  if (activeSync) {
    return activeSync;
  }
  activeSync = processOutbox().finally(() => {
    activeSync = null;
  });
  return activeSync;
}
