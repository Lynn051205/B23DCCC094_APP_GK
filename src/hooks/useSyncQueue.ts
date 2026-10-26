import {useCallback, useEffect, useRef, useState} from 'react';
import {outbox} from '../storage/outbox';
import {synchronizeOutbox} from '../services/syncService';

type UseSyncQueueOptions = {
  isOnline: boolean;
  onSynced: () => Promise<void>;
};

export function useSyncQueue({isOnline, onSynced}: UseSyncQueueOptions) {
  const [pendingCount, setPendingCount] = useState(0);
  const [queueReady, setQueueReady] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const onSyncedRef = useRef(onSynced);
  const attemptedThisConnection = useRef(false);
  onSyncedRef.current = onSynced;

  const updateCount = useCallback(async () => {
    const actions = await outbox.getActions();
    setPendingCount(actions.length);
    return actions.length;
  }, []);

  const sync = useCallback(async () => {
    setSyncing(true);
    setSyncError(null);
    try {
      const result = await synchronizeOutbox();
      setPendingCount(result.remaining);
      if (result.synced > 0) {
        setSyncMessage(`Đã đồng bộ ${result.synced} thay đổi`);
        await onSyncedRef.current();
      }
      if (result.error) {
        setSyncError(result.error);
      }
      return result;
    } finally {
      setSyncing(false);
    }
  }, []);

  const enqueue = useCallback(
    async (
      method: 'PATCH' | 'POST',
      url: string,
      body: Record<string, unknown>,
      createdAt?: string,
      id?: string,
    ) => {
      await outbox.enqueue(method, url, body, createdAt, id);
      const count = await updateCount();
      if (isOnline && count > 0) {
        await sync();
      }
    },
    [isOnline, sync, updateCount],
  );

  useEffect(() => {
    updateCount().catch(error => {
      setSyncError(
        error instanceof Error
          ? error.message
          : 'Không thể đọc hàng đợi đồng bộ.',
      );
    }).finally(() => {
      setQueueReady(true);
    });
  }, [updateCount]);

  useEffect(() => {
    if (!isOnline) {
      attemptedThisConnection.current = false;
      return;
    }
    if (pendingCount > 0 && !syncing && !attemptedThisConnection.current) {
      attemptedThisConnection.current = true;
      sync().catch(error => {
        setSyncError(
          error instanceof Error
            ? error.message
            : 'Không thể đồng bộ hàng đợi.',
        );
      });
    }
  }, [isOnline, pendingCount, sync, syncing]);

  return {
    isOnline,
    pendingCount,
    queueReady,
    syncing,
    syncMessage,
    syncError,
    enqueue,
    sync,
    updateCount,
  };
}
