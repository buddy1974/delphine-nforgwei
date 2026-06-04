import { notFound } from "next/navigation";
import { OS_BRANDS } from "@/lib/brands";

/**
 * Validates that the [brand] URL segment is a registered brand key.
 * Returns 404 for unknown brands (e.g. /foobar/pages).
 */
export default function BrandLayout({
  params,
  children,
}: {
  params: { brand: string };
  children: React.ReactNode;
}) {
  const valid = OS_BRANDS.some((b) => b.key === params.brand);
  if (!valid) notFound();
  return <>{children}</>;
}
