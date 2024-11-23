'use server';

import {
  addSubscription,
  deleteSubscription,
  getAllSubscriptions,
} from '@/drizzle/db';
import webpush from 'web-push';

webpush.setVapidDetails(
  'https://mywebpush.vercel.app',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function subscribeUser(sub: PushSubscription) {
  // Save the subscription to a file
  await addSubscription(sub);
  // In a production environment, you would want to store the subscription in a database
  // For example: await db.subscriptions.create({ data: sub })
  return { success: true };
}

export async function unsubscribeUser(sub: PushSubscription) {
  await deleteSubscription(sub);
  // In a production environment, you would want to remove the subscription from the database
  // For example: await db.subscriptions.delete({ where: { ... } })
  return { success: true };
}

export async function sendNotification(message: string) {
  const subscriptions = await getAllSubscriptions();
  if (subscriptions.length < 1) {
    throw new Error('No subscription available');
  }

  try {
    for (const subscription of subscriptions) {
      webpush
        .sendNotification(
          subscription,
          JSON.stringify({
            title: 'Test Notification',
            body: message,
            icon: '/android-chrome-192x192.png',
            badge: '/android-chrome-72x72.png',
          })
        )
        .catch(console.log);
    }
    return { success: true };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error: 'Failed to send notification' };
  }
}
