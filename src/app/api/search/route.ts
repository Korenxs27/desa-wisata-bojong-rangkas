import { NextResponse } from "next/server";
import { api as wcApi } from "@/lib/woocommerce";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  if (!query) return NextResponse.json([]);

  try {
    const response = await wcApi.get("products", { search: query, per_page: 3 });
    const products = response.data || response;
    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json([]);
  }
}