import { useState, useEffect } from 'react';
import { api } from '../api';

export const useNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
      setIsSubscribed(!!sub);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  const subscribeUser = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      const response = await api.get('/notifications/vapid-public-key');
      const vapidPublicKey = response.data.publicKey;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      await api.post('/notifications/subscribe', {
        subscription: subscription.toJSON()
      });

      setSubscription(subscription);
      setIsSubscribed(true);
      return true;
    } catch (error) {
      console.error('Failed to subscribe user:', error);
      return false;
    }
  };

  const unsubscribeUser = async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe();
        await api.post('/notifications/unsubscribe');
        setSubscription(null);
        setIsSubscribed(false);
        return true;
      }
    } catch (error) {
      console.error('Failed to unsubscribe user:', error);
      return false;
    }
  };

  const sendTestNotification = async () => {
    try {
      await api.post('/notifications/send-test');
      return true;
    } catch (error) {
      console.error('Failed to send test notification:', error);
      return false;
    }
  };

  return {
    isSupported,
    isSubscribed,
    subscribeUser,
    unsubscribeUser,
    sendTestNotification
  };
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}