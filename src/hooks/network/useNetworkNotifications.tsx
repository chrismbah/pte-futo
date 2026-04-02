import { useState, useEffect } from 'react';
import { playSound } from '../useSound';

export const useNetworkNotifications = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleOffline = () => {
      playSound("message");
      setIsOffline(true);
      setMessage('You are currently offline.');
    };

    const handleOnline = () => {
      playSound("notify");
      setIsOffline(false);
      setMessage("You're back Online!");
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return { isOffline, message };
};
