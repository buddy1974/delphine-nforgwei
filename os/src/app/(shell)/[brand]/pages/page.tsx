import PageList from "@/app/(shell)/pages/PageList";

export default function BrandPagesPage() {
  // Brand is derived from the URL by BrandProvider (see BrandProvider.tsx).
  // PageList reads the current brand via useBrand() and shows the correct pages.
  return <PageList />;
}
