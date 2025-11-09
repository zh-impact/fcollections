import { Hono } from "hono";
import { cache } from "hono/cache";
import { prettyJSON } from "hono/pretty-json";
import { LRUCache } from "lru-cache";

type Random = {
  id: string;
  created_at: string;
  updated_at: string;
  urls: {
    full: string;
    raw: string;
    regular: string;
    small: string;
    thumb: string;
  };
};

const options = {
  max: 500,
  ttl: 1000 * 60 * 5,
};

const lruCache = new LRUCache(options);

type Bindings = CloudflareBindings & {
  UNSPLASH_TOKEN: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(cache({ cacheName: "fcollections", cacheControl: "max-age=60" }));
app.use(prettyJSON());

app.get("/message", (c) => {
  return c.text("Hello Hono!");
});

app.get("/cover", (c) => {
  const url = new URL(c.req.url);
  console.log(c.req.url, url);
  url.pathname = "/cover.png";
  return c.env.ASSETS.fetch(
    new Request(url.toString(), { method: "GET" })
  );
});

app.get("/random/picture", async (c) => {
  if (lruCache.has("random/picture")) {
    console.log("Cache hit");
    const data = lruCache.get("random/picture") as Random;

    const targetPicture = data.urls.regular;
    console.log(targetPicture);
    return fetch(targetPicture);
  }

  const api = "https://api.unsplash.com/photos/random";
  const response = await fetch(api, {
    headers: {
      Authorization: `Client-ID ${c.env.UNSPLASH_TOKEN}`,
      "Accept-Version": "v1",
    },
  });
  console.log(response.headers);
  const data = (await response.json()) as Random;
  lruCache.set("random/picture", data as any);
  console.log("Cache miss", data.urls);

  const targetPicture = data.urls.regular;
  console.log(targetPicture);
  return fetch(targetPicture);
});

export default app;
