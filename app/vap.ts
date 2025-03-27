export const subject = 'https://mywebpush.vercel.app/';
export const publicKey =
  process.env.FROG_TEST === '1'
    ? process.env.NEXT_PUBLIC_FROG_VAPID_PUBLIC_KEY!
    : process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
export const privateKey =
  process.env.FROG_TEST === '1'
    ? process.env.FROG_VAPID_PRIVATE_KEY!
    : process.env.VAPID_PRIVATE_KEY!;

console.log('FROG', process.env.FROG_TEST);
