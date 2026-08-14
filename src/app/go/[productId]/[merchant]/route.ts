import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveStore, STORES } from "@/lib/stores";

const MERCHANTS = [...STORES.map((store) => store.id), "network"] as const;

export async function GET(
  request: Request,
  context: { params: Promise<{ productId: string; merchant: string }> },
) {
  const { productId, merchant } = await context.params;
  if (!MERCHANTS.includes(merchant as (typeof MERCHANTS)[number])) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.redirect(new URL("/", request.url));

  const resolved = resolveStore(product);
  const target =
    product.affiliateUrl ||
    (merchant === "amazon" ? product.amazonUrl : "") ||
    (merchant === "flipkart" ? product.flipkartUrl : "") ||
    product.networkUrl ||
    resolved.url;

  if (!target) return NextResponse.redirect(new URL("/", request.url));

  const src = new URL(request.url).searchParams.get("src") ?? "direct";
  await prisma.click.create({
    data: {
      productId: product.id,
      merchant,
      source: src.slice(0, 32),
      referrer: request.headers.get("referer")?.slice(0, 500) ?? "",
    },
  });

  return NextResponse.redirect(target, 302);
}
