import {useEffect, useState} from 'react';
import NetInfo from '@react-native-community/netinfo';
import type {NetInfoState} from '@react-native-community/netinfo';

export type NetworkStatus = {
  isOnline: boolean;
  isConnected: boolean | null;
};

function toNetworkStatus(state: NetInfoState): NetworkStatus {
  return {
    isConnected: state.isConnected,
    isOnline:
      state.isConnected !== false && state.isInternetReachable !== false,
  };
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: true,
    isConnected: null,
  });

  useEffect(() => NetInfo.addEventListener(next => setStatus(toNetworkStatus(next))), []);

  return status;
}
