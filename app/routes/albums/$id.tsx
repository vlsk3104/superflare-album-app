import { useCatch, useLoaderData, useParams } from "@remix-run/react";
import { type LoaderArgs, json, redirect } from "@remix-run/server-runtime";
import { parseMultipartFormData, storage } from "superflare";
import { Album } from "~/models/Album";
import { Image } from "~/models/Image";
import { User } from "~/models/User";


export async function loader({ params, context: { auth } }: LoaderArgs) {
  if (!(await auth.check(User))) {
    return redirect("/auth/login");
  }

  const userId = await auth.id();

  const albumId = Number(params.id);

  const album = await Album.where("id", albumId)
    .where("userId", userId)
    .first();

  if (!album) {
    throw new Response("Not found", { status: 404 });
  }

  return json({
    album,
    images: await album.images,
  });
}

export async function action({
  request,
  params,
  context: { auth, session },
}: LoaderArgs) {
  if (!(await auth.check(User))) {
    return redirect("/auth/login");
  }

  const formData = await parseMultipartFormData(
    request,
    async ({ name, filename, stream }) => {
      if (name !== "file") return undefined
      const r2Object = await storage().putRandom(stream, {
        extension: filename?.split(".").pop(),
      });
      return r2Object.key;
    }
  );

  const albumId = Number(params.id);
  const userId = await auth.id();

  await Image.create({
    key: formData.get("file") as string,
    albumId,
    userId
  });

  session.flash("success", "Photo uploaded successfully");

  return redirect(`/albums/${albumId}`);
}

export default function AlbumPage() {
  const { album, images } = useLoaderData<typeof loader>();

  return (
    <>
      <h1>{album.title}</h1>
      <p>{album.description}</p>

      <form method="post" encType="multipart/form-data">
        <fieldset>
          <legend>Upload Photo</legend>
          <div>
            <label htmlFor="file">Photo</label>
            <input type="file" name="file" />
          </div>
          <button type="submit">Upload</button>
        </fieldset>
      </form>

      <h2>Photos</h2>
      <form method="post">
        <ul
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(256px, 1fr))",
            gap: "1rem",
          }}
        >
          {images.length === 0 && <li>No photos yet</li>}
          {images.map((image) => (
            <li key={image.id}>
              <img
                src={`/images/${image.key}`}
                alt=""
                width="256"
                height="144"
              />
              <button
                type="submit"
                name="intent"
                value="delete"
                formAction={`/images/${image.key}`}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </form>
    </>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  const params = useParams();
  if (caught.status = 404) {
    return (
      <>
        <h1>404</h1>
        <p>Album {params.id} is not found.</p>
      </>
    );
  }
  throw new Error("Something went wrong");
}

export function ErrorBoundary() {
  return (
    <>
    </>
  );
}
