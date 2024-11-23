'use server';

import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import webpush from 'web-push';

webpush.setVapidDetails(
    'mailto:http://localhost:3000',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function subscribeUser(sub: PushSubscription) {
    // Save the subscription to a file
    if (!existsSync('./users.jsonl')) {
        writeFileSync('./users.jsonl', JSON.stringify(sub));
    } else {
        // Append the subscription to the file
        appendFileSync('./users.jsonl', '\n' + JSON.stringify(sub));
    }

    // In a production environment, you would want to store the subscription in a database
    // For example: await db.subscriptions.create({ data: sub })
    return { success: true };
}

export async function unsubscribeUser(sub: PushSubscription) {
    const users = readFileSync('./users.jsonl', 'utf-8').split('\n');
    const userToDelete = JSON.stringify(sub);
    const updatedUsers = users.filter((user) => user !== userToDelete);
    writeFileSync('./users.jsonl', updatedUsers.join('\n'));
    // In a production environment, you would want to remove the subscription from the database
    // For example: await db.subscriptions.delete({ where: { ... } })
    return { success: true };
}

export async function sendNotification(message: string) {
    const users = readFileSync('./users.jsonl', 'utf-8')
        .split('\n')
        .map((user) => JSON.parse(user));
    if (users.length < 1) {
        throw new Error('No subscription available');
    }

    try {
        for (const user of users) {
            webpush
                .sendNotification(
                    user,
                    JSON.stringify({
                        title: 'Test Notification',
                        body: message,
                        icon: '/android-chrome-192x192.png',
                        badge: '/android-chrome-72x72.png'
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
