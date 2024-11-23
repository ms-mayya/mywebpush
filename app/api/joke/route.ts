export const dynamic = 'force-dynamic'; // static by default, unless reading the request

type Joke = {
  id: string;
  joke: string;
  status: number;
};

export async function GET(request: Request) {
  const joke: Joke = await fetch('https://icanhazdadjoke.com/', {
    headers: {
      'User-Agent': 'My Web Push (https://github.com/ms-mayya/mywebpush)',
      Accept: 'application/json',
    },
  }).then((res) => res.json());
  return Response.json(joke);
}
