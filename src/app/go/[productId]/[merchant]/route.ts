import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientIpFromRequest, rateLimit } from "@/lib/rateLimit";
import { resolveStore, STORES } from "@/lib/stores";
import { isHttpUrl } from "@/lib/urls";

const MERCHANTS = [...STORES.map((store) => store.id), "network"] as const;

// new URL("/", request.url) resolves against the address the server is bound
// to, which produced links to http://0.0.0.0:3000/. A relative Location is
// resolved by the browser against the origin it actually requested.
function backHome() {
  return new NextResponse(null, { status: 307, headers: { Location: "/" } });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ productId: string; merchant: string }> },
) {
  const { productId, merchant } = await context.params;
  if (!MERCHANTS.includes(merchant as (typeof MERCHANTS)[number])) {
    return backHome();
  }

  let product;
  try {
    product = await prisma.product.findUnique({ where: { id: productId } });
  } catch {
    return backHome();
  }
  if (!product || !product.published) return backHome();

  const resolved = resolveStore(product);
  const target =
    product.affiliateUrl ||
    (merchant === "amazon" ? product.amazonUrl : "") ||
    (merchant === "flipkart" ? product.flipkartUrl : "") ||
    product.networkUrl ||
    resolved.url;

  if (!target || !isHttpUrl(target)) return backHome();

  // Record the merchant this product actually resolves to rather than the one
  // in the URL, so the click report cannot be skewed by hand-typed paths.
  //
  // The rate limit caps *recording*, never the redirect: throttling the buy
  // button would cost real sales, while an unlimited insert let anyone inflate
  // the click table at will. Over the cap the visitor still reaches the
  // retailer, we simply stop counting.
  const ip = clientIpFromRequest(request);
  if (rateLimit(`click:${ip}`, 60, 60 * 1000).ok) {
    const src = new URL(request.url).searchParams.get("src") ?? "direct";
    try {
      await prisma.click.create({
        data: {
          productId: product.id,
          merchant: resolved.id,
          source: src.slice(0, 32),
          referrer: request.headers.get("referer")?.slice(0, 500) ?? "",
        },
      });
    } catch (error) {
      // Analytics must never cost a sale: log and still send the visitor onward.
      console.error("Failed to record outbound click", error);
    }
  }

  return NextResponse.redirect(target, 302);
}
