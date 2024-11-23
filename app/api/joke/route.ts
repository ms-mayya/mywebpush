import { getJoke } from '@/lib/utils';

export async function GET(request: Request) {
  const joke = await getJoke();
  return Response.json(joke);
}
