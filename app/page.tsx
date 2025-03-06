/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, Suspense } from 'react';
import { subscribeUser, unsubscribeUser, sendNotification } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import OpenedFromNotification from '@/components/OpenedFromNotification';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader, Plus, Share } from 'lucide-react';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState<number | null>(null);
  const [subscription, setSubscription] = useState<
    PushSubscription | null | undefined
  >(undefined);
  const [isBusy, setIsIsBusy] = useState(false);
  const [message, setMessage] = useState('');

  const runWithErrorHandling = async (
    job: (...args: any[]) => Promise<any>,
    ...args: any[]
  ) => {
    try {
      setIsIsBusy(true);
      const result = job(...args);
      return 'then' in result ? await result : result;
    } catch (e: any) {
      toast.error(e.message || 'An error occurred');
      throw e;
    } finally {
      setIsIsBusy(false);
    }
  };

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
    runWithErrorHandling(async () => {
      const registration = await navigator.serviceWorker.ready;
      const pushManager = registration.pushManager;
      const sub = await pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      });
      setSubscription(sub);
      await subscribeUser(sub);
    });
  }

  async function unsubscribeFromPush() {
    runWithErrorHandling(async () => {
      await subscription!.unsubscribe();
      await unsubscribeUser(subscription!);
      setSubscription(null);
    });
  }

  async function sendClientNotification() {
    runWithErrorHandling(async () => {
      const notification = {
        title: 'Test Notification',
        body: message,
        icon: '/android-chrome-192x192.png',
        badge: '/android-chrome-72x72.png',
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: '2',
        },
      };
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(
        '【Client】' + notification.title,
        notification
      );
      await sendNotification(notification);
      setMessage('');
    });
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
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  🎉You are subscribed to push notifications.🎉
                </AccordionTrigger>
                <AccordionContent>
                  <pre>{JSON.stringify(subscription, null, 2)}</pre>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          <div className="mb-3">
            <Button
              variant={'destructive'}
              disabled={isBusy}
              onClick={unsubscribeFromPush}
            >
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
            <Button disabled={isBusy} onClick={sendClientNotification}>
              Send
            </Button>
          </div>
        </>
      ) : subscription === null ? (
        <>
          <p>You are not subscribed to push notifications.</p>
          <Button disabled={isBusy} onClick={subscribeToPush}>
            Subscribe
          </Button>
        </>
      ) : (
        <>
          <Loader className="animate-spin text-green-600" />
        </>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <div className={`p-4 flex flex-col items-center`}>
      <h1 className="text-3xl font-bold mb-3">Web Push</h1>
      <Suspense>
        <OpenedFromNotification />
      </Suspense>
      <PushNotificationManager />
    </div>
  );
}
