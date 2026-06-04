"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DEFAULT_BRAND_KEY, OS_BRANDS, type OsBrand } from "@/lib/brands";

const STORAGE_KEY = "delphine_os_brand";

interface BrandContextValue {
  brand: OsBrand;
  brands: OsBrand[];
  setBrandKey: (key: OsBrand["key"]) => void;
}

const BrandContext = createContext<BrandContextValue | null>(null);

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [brandKey, setBrandKeyState] = useState<OsBrand["key"]>(DEFAULT_BRAND_KEY);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && OS_BRANDS.some((b) => b.key === saved)) {
      setBrandKeyState(saved as OsBrand["key"]);
    }
  }, []);

  function setBrandKey(key: OsBrand["key"]) {
    setBrandKeyState(key);
    window.localStorage.setItem(STORAGE_KEY, key);
  }

  const value = useMemo<BrandContextValue>(() => {
    const brand =
      OS_BRANDS.find((b) => b.key === brandKey) ?? OS_BRANDS[0];
    return { brand, brands: OS_BRANDS, setBrandKey };
  }, [brandKey]);

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}

export function useBrand(): BrandContextValue {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error("useBrand must be used inside <BrandProvider>");
  return ctx;
}
