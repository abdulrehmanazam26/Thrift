import { z } from "zod";
import { isStoreOrigin } from "@/lib/request-origin";
export async function POST(request: Request) {
  if (!isStoreOrigin(request))
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const endpoint = process.env.NEWSLETTER_ENDPOINT;
  if (!endpoint)
    return Response.json(
      {
        error:
          "The list isn’t open yet. Check back when the first drop launches.",
      },
      { status: 503 },
    );
  try {
    const { email } = z
      .object({ email: z.email().max(254) })
      .parse(await request.json());
    const result = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.NEWSLETTER_API_KEY
          ? { Authorization: `Bearer ${process.env.NEWSLETTER_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({ email, source: "thrift-vault" }),
      signal: AbortSignal.timeout(10000),
    });
    if (!result.ok) throw new Error();
    return Response.json({
      message: "You’re on the list. Watch your inbox for the next drop.",
    });
  } catch {
    return Response.json(
      { error: "We couldn’t add that email. Please check it and try again." },
      { status: 400 },
    );
  }
}
