import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

/**
 * Sanity webhook target. Configure it in Sanity so the menu updates the
 * moment staff publish a change, instead of waiting for the 60s revalidate.
 * See README for setup.
 */
export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<{ _type: string }>(
      req,
      process.env.SANITY_REVALIDATE_SECRET,
    );

    if (!isValidSignature) {
      return new NextResponse("Invalid signature", { status: 401 });
    }
    if (!body?._type) {
      return new NextResponse("Bad request", { status: 400 });
    }

    revalidatePath("/");

    return NextResponse.json({ revalidated: true, type: body._type });
  } catch (error) {
    console.error("Revalidate webhook failed", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
