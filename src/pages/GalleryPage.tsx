// src/pages/GalleryPage.tsx
import { useMemo, useState } from "react";

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, idx) => from + idx);

const GalleryPage = () => {
  const [activeTab, setActiveTab] = useState<"studio" | "moments">("studio");

  const studioImages = useMemo(
    () => range(1, 17).map((n) => `/images/gallery/${n}.jpg`),
    []
  );

  const momentImages = useMemo(
    () => range(1, 28).map((n) => `/images/gallery-2/${n}.jpg`),
    []
  );

  const isJpeg = (src: string) =>
    src.toLowerCase().endsWith(".jpg") ||
    src.toLowerCase().endsWith(".jpeg");

  const images = activeTab === "studio" ? studioImages : momentImages;

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
            Gallery
          </h1>
          <p className="text-muted-foreground">
            Moments of leadership, conferences, transformation, and personal highlights.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-secondary rounded-xl p-1">
            <button
              onClick={() => setActiveTab("studio")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "studio"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary/70"
              }`}
            >
              Studio
            </button>
            <button
              onClick={() => setActiveTab("moments")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "moments"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary/70"
              }`}
            >
              Moments
            </button>
          </div>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {images
            .filter((src) => isJpeg(src))
            .map((src) => (
              <div
                key={src}
                className="group relative overflow-hidden rounded-2xl bg-card border border-border"
              >
                <img
                  src={src}
                  alt="Gallery image"
                  className="w-full h-[220px] sm:h-[260px] lg:h-[300px] object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            ))}
        </div>

      </div>
    </section>
  );
};

export default GalleryPage;
