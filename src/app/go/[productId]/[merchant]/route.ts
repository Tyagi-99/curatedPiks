import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MERCHANTS = ["amazon", "flipkart", "network"] as const;
type Merchant = (typeof MERCHANTS)[number];

function urlFor(product: { amazonUrl: string; flipkartUrl: string; networkUrl: string }, merchant: Merchant) {
  if (merchant === "amazon") return product.amazonUrl;
  if (merchant === "flipkart") return product.flipkartUrl;
  return product.networkUrl;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ productId: string; merchant: string }> },
) {
  const { productId, merchant } = await context.params;
  if (!MERCHANTS.includes(merchant as Merchant)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  const target = product ? urlFor(product, merchant as Merchant) : "";
  if (!product || !target) {
    return NextResponse.redirect(new URL("/", request.url));
  }

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
