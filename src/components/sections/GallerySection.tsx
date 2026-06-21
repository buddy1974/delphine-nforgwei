import { motion } from "framer-motion";
import { FadeIn } from "@/components/FadeIn";

export interface GalleryImageItem {
  src: string;
  alt: string;
}

export interface GallerySectionProps {
  sectionId?: string;
  title?: string;
  subtitle?: string;
  images?: GalleryImageItem[];
}

const DEFAULT_IMAGES: GalleryImageItem[] = [
  { src: "/images/gallery/1.jpg", alt: "Community gathering" },
  { src: "/images/gallery/4.jpg", alt: "Conference audience" },
  { src: "/images/gallery/6.jpg", alt: "Ministry session" },
  { src: "/images/gallery/10.jpg", alt: "Leadership event" },
  { src: "/images/gallery/15.jpg", alt: "Women's empowerment gathering" },
];

export function GallerySection({
  sectionId,
  title = "Reaching People. Changing Lives.",
  subtitle = "Impact Across Communities",
  images = DEFAULT_IMAGES,
}: GallerySectionProps) {
  return (
    <section className="py-[100px] lg:py-[120px] bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        <FadeIn variant="fade-up">
          <div className="text-center mb-12 space-y-3">
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: "hsl(38, 70%, 55%)" }}>
              {subtitle}
            </span>
<h2
              className="font-serif text-2xl sm:text-3xl font-bold text-foreground leading-tight"
              data-editable="true"
              data-field="title"
              data-section-id={sectionId}
            >
              {title}
            </h2>
          </div>
        </FadeIn>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {images.map(({ src, alt }, i) => (
            <FadeIn key={src} variant="scale-in" delay={i * 0.08}>
              <motion.div
                className="rounded-xl overflow-hidden aspect-square"
                style={{ border: "1px solid hsla(288, 20%, 88%, 0.4)", borderRadius: "12px" }}
                whileHover={{ scale: 1.04, boxShadow: "0 12px 30px -6px hsla(288, 30%, 20%, 0.18)" }}
                transition={{ duration: 0.3 }}
              >
                <img src={src} alt={alt} className="w-full h-full object-cover" />
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
