'use server';

import {
  addSubscription,
  deleteSubscription,
  getAllSubscriptions,
} from '@/drizzle/db';
import webpush from 'web-push';
import { privateKey, publicKey, subject } from './vap';

webpush.setVapidDetails(subject, publicKey, privateKey);

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

export async function sendNotification(
  notification: NotificationOptions & { title: string }
) {
  const subscriptions = await getAllSubscriptions();
  if (subscriptions.length < 1) {
    throw new Error('No subscription available');
  }

  try {
    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          // @ts-expect-error nope
          subscription,
          JSON.stringify({
            ...notification,
            title: notification.title,
          })
        );
      } catch (e) {
        console.error('Error sending push notification:', e);
        // await deleteSubscription(subscription);
      }
    }
    return { success: true };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error: 'Failed to send notification' };
  }
}
