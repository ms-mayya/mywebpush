'use client';

import { useState, useEffect, Suspense } from 'react';
import { subscribeUser, unsubscribeUser, sendNotification } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import OpenedFromNotification from '@/components/OpenedFromNotification';

function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [message, setMessage] = useState('');

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    });
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready;
    const pushManager = registration.pushManager;
    const sub = await pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    });
    setSubscription(sub);
    await subscribeUser(sub);
  }

  async function unsubscribeFromPush() {
    await subscription?.unsubscribe();
    setSubscription(null);
    await unsubscribeUser(subscription!);
  }

  async function sendTestNotification() {
    if (subscription) {
      const notification = {
        title: 'Test Notification',
        body: message,
        icon: '/android-chrome-192x192.png',
        badge: '/android-chrome-72x72.png',
      };
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(
        'Client: ' + notification.title,
        notification
      );
      await sendNotification(notification);
      setMessage('');
    }
  }

  if (!isSupported) {
    return <p>Push notifications are not supported in this browser.</p>;
  }

  return (
    <div>
      <h3 className="text-2xl font-bold">Push Notifications</h3>
      {subscription ? (
        <>
          <div className="mb-3">
            <p className="text-muted-foreground">
              You are subscribed to push notifications.
            </p>
            <Button variant={'destructive'} onClick={unsubscribeFromPush}>
              Unsubscribe
            </Button>
          </div>
          <div className="flex items-center space-x-1">
            <Input
              type="text"
              className="my-1"
              placeholder="Enter notification message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button onClick={sendTestNotification}>Send Test</Button>
          </div>
        </>
      ) : (
        <>
          <p>You are not subscribed to push notifications.</p>
          <Button onClick={subscribeToPush}>Subscribe</Button>
        </>
      )}
    </div>
  );
}

function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window)
    );
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
  }, []);

  if (isStandalone) {
    return null; // Don't show install button if already installed
  }

  return (
    <div>
      <h3 className="text-2xl font-bold">Install App</h3>
      <p>Add to Home Screen</p>
      {isIOS && (
        <p>
          To install this app on your iOS device, tap the share button
          <span role="img" aria-label="share icon">
            {' '}
            ⎋{' '}
          </span>
          and then &quot;Add to Home Screen&quot;
          <span role="img" aria-label="plus icon">
            {' '}
            ➕{' '}
          </span>
          .
        </p>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <div className={`p-4 flex flex-col items-center`}>
      <Suspense fallback={'...'}>
        <OpenedFromNotification />
      </Suspense>
      <div className="space-y-8">
        <PushNotificationManager />
        <InstallPrompt />
      </div>
    </div>
  );
}
