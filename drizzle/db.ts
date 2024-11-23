import '@/drizzle/envConfig';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import { eq } from 'drizzle-orm';
import * as schema from './schema';

// Use this object to send drizzle queries to your DB
export const db = drizzle(sql, { schema });

export const getAllSubscriptions = async () => {
  return (await db.select().from(schema.subscriptions)).map(
    (row) => JSON.parse(row.token) as PushSubscription
  );
};

export const addSubscription = async (token: PushSubscription) => {
  return await db
    .insert(schema.subscriptions)
    .values({ token: JSON.stringify(token) });
};

export const deleteSubscription = async (token: PushSubscription) => {
  const tokenStr = JSON.stringify(token);
  return await db
    .delete(schema.subscriptions)
    .where(eq(schema.subscriptions.token, tokenStr));
};
