import { getJoke } from '@/lib/utils';
import { sendNotification, PushSubscription } from 'web-push';

export async function GET(request: Request) {
  const joke = await getJoke();
  const result = await sendNotification({
    title: 'Got a joke',
    body: joke.joke,
    icon: '/android-chrome-192x192.png',
    badge: '/android-chrome-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2',
    },
  } as unknown as PushSubscription);
  return Response.json(result);
}
