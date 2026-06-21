import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/FadeIn";

export interface GalleryImage {
  src: string;
  caption: string;
}

export interface EventsSectionProps {
  sectionId?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  button_label?: string;
  button_url?: string;
  images?: GalleryImage[];
}

const DEFAULT_IMAGES: GalleryImage[] = [
  { src: "/images/gallery/2.jpg", caption: "Leadership Conference" },
  { src: "/images/gallery/5.jpg", caption: "Family Transformation Summit" },
  { src: "/images/gallery/9.jpg", caption: "Women's Leadership Gathering" },
  { src: "/images/gallery/14.jpg", caption: "Global Mentorship Sessions" },
];

export function EventsSection({
  sectionId,
  title = "A Voice on Stages Around the World",
  subtitle = "Media, Speaking & Global Impact",
  body = "Delphine Nforgwei is an international speaker and transformational leader, empowering individuals, families and communities through teaching, mentorship and leadership development.",
  button_label = "Invite Delphine to Speak",
  button_url = "/contact",
  images = DEFAULT_IMAGES,
}: EventsSectionProps) {
  return (
    <section className="py-[100px] lg:py-[120px] bg-secondary/30">
      <div className="container mx-auto px-6 lg:px-12">
        <FadeIn variant="fade-up">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-5">
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: "hsl(38, 70%, 55%)" }}>
              {subtitle}
            </span>
<h2
              className="font-serif text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-foreground leading-tight"
              data-editable="true"
              data-field="title"
              data-section-id={sectionId}
            >
              {title}
            </h2>
            <p
              className="text-base text-muted-foreground leading-[1.7]"
              data-editable="true"
              data-field="body"
              data-section-id={sectionId}
            >
              {body}
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-12">
          {images.map(({ src, caption }, i) => (
            <FadeIn key={caption} variant="scale-in" delay={i * 0.1}>
              <motion.div
                className="group relative rounded-2xl overflow-hidden"
                style={{ border: "1px solid hsla(288, 20%, 88%, 0.4)", borderRadius: "16px" }}
                whileHover={{ scale: 1.02, boxShadow: "0 16px 40px -8px hsla(288, 30%, 20%, 0.2)" }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={src}
                  alt={caption}
                  className="w-full h-56 sm:h-64 object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                />
                <div
                  className="absolute bottom-0 left-0 right-0 px-4 py-3"
                  style={{ background: "linear-gradient(to top, hsla(288, 40%, 10%, 0.9), transparent)" }}
                >
                  <p className="text-xs font-medium text-white/90 tracking-wide">{caption}</p>
                </div>
              </motion.div>
            </FadeIn>
          ))}
        </div>

        <FadeIn variant="fade-up" delay={0.2}>
          <div className="text-center">
            <Link to={button_url || "/contact"}>
              <motion.div className="inline-block" whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
                <Button size="xl" className="bg-primary text-primary-foreground font-semibold tracking-wide rounded-xl hover:opacity-90 shadow-[0_6px_24px_-6px_hsl(288,72%,38%,0.4)] hover:shadow-[0_10px_32px_-6px_hsl(288,72%,38%,0.55)] transition-shadow duration-300">
                  {button_label}
                </Button>
              </motion.div>
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
