'use client';

import { useState, useEffect, Suspense } from 'react';
import { subscribeUser, unsubscribeUser, sendNotification } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import OpenedFromNotification from '@/components/OpenedFromNotification';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader, Plus, Share } from 'lucide-react';

function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState<number | null>(null);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [message, setMessage] = useState('');

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      if ('PushManager' in window) {
        setIsSupported(2);
        registerServiceWorker();
      } else if (
        !navigator.standalone ||
        !matchMedia('(display-mode: standalone)').matches
      ) {
        setIsSupported(1);
      } else {
        setIsSupported(0);
      }
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

  if (isSupported == null) {
    return <Loader className="animate-spin" />;
  }

  if (isSupported === 0) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Push notifications are not supported in this browser.
        </AlertDescription>
      </Alert>
    );
  }

  if (isSupported === 1) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Add to Home Screen</AlertTitle>
        <AlertDescription>
          <p>
            To install this app on your iOS device, tap the share button
            <Share className="mx-1 inline" />
            and then &quot;Add to Home Screen&quot;
            <Plus className="mx-1 inline" />.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      {subscription ? (
        <>
          <div className="mb-3">
            <p>You are subscribed to push notifications.</p>
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
            <Button onClick={sendTestNotification}>Send</Button>
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

export default function Page() {
  return (
    <div className={`p-4 flex flex-col items-center`}>
      <h1 className="text-3xl font-bold mb-3">Web Push</h1>
      <Suspense fallback={'...'}>
        <OpenedFromNotification />
      </Suspense>
      <PushNotificationManager />
    </div>
  );
}
