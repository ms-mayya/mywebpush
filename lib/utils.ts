import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Joke = {
  id: string;
  joke: string;
  status: number;
};

export async function getJoke(): Promise<Joke> {
  return await fetch('https://icanhazdadjoke.com/', {
    headers: {
      'User-Agent': 'My Web Push (https://github.com/ms-mayya/mywebpush)',
      Accept: 'application/json',
    },
  }).then((res) => res.json());
}
