import { LoaderArgs, redirect } from "@remix-run/server-runtime";
import { storage } from "superflare";
import { Image } from "~/models/Image";
import { User } from "~/models/User";


const contentTypes: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  svg: "image/svg+xml"
};

const getContentTypes = (extension: string): string => {
  return contentTypes[extension] || "application/octet-stream";
};

export async function loader({ context: { auth }, params }: LoaderArgs) {
  if (!(await auth.check(User))) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const storageKey = params.key as string;

  const obj = await storage().get(storageKey);

  if (!obj) return new Response("Not found", { status: 404 });

  const extension = obj.key.split(".").pop() || "";

  return new Response(obj.body, {
    headers: {
      "Content-Type": getContentTypes(extension),
    }
  });
}

export async function action({
  request,
  params,
  context: { auth }
}: LoaderArgs) {
  if (!(await auth.check(User))) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  console.log(formData, intent)

  if (intent !== "delete") {
    throw new Response(`The intent ${intent} is not supported`, {
      status: 400,
    });
  }

  const storageKey = params.key as string;
  const image = await Image.where("key", storageKey).first();

  if (!image) throw new Response("Not found", { status: 404 });

  const { albumId, userId } = image;

  if (userId !== (await auth.id())) {
    throw new Response("Forbidden", { status: 403 });
  }

  await Promise.all([image.delete(), storage().delete(storageKey)]);

  return redirect(`/albums/${albumId}`);
}
