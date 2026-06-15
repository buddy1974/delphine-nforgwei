"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { DEFAULT_BRAND_KEY, OS_BRANDS, type OsBrand } from "@/lib/brands";

const STORAGE_KEY = "delphine_os_brand";

interface BrandContextValue {
  brand: OsBrand;
  brands: OsBrand[];
  setBrandKey: (key: OsBrand["key"]) => void;
}

const BrandContext = createContext<BrandContextValue | null>(null);

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [storedKey, setStoredKey] = useState<OsBrand["key"]>(DEFAULT_BRAND_KEY);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && OS_BRANDS.some((b) => b.key === saved)) {
      setStoredKey(saved as OsBrand["key"]);
    }
  }, []);

  function setBrandKey(key: OsBrand["key"]) {
    setStoredKey(key);
    window.localStorage.setItem(STORAGE_KEY, key);
  }

  const urlBrandKey =
    OS_BRANDS.find((b) =>
      pathname.split("/").some((seg) => seg === b.key)
    )?.key ?? null;

  const activeBrandKey = urlBrandKey ?? storedKey;

  const value = useMemo<BrandContextValue>(
    () => ({
      brand: OS_BRANDS.find((b) => b.key === activeBrandKey) ?? OS_BRANDS[0],
      brands: OS_BRANDS,
      setBrandKey,
    }),
    [activeBrandKey]
  );

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}

export function useBrand(): BrandContextValue {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error("useBrand must be used inside BrandProvider");
  return ctx;
}
