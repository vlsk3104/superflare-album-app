import { LoaderArgs, json } from "@remix-run/server-runtime";

export async function loader({ context, params, request }: LoaderArgs) {

  const data = [
    { id: 1, title: 'Post 1' },
    { id: 2, title: 'Post 2' },
    { id: 3, title: 'Post 3' },
  ];

  return json(data);
}
