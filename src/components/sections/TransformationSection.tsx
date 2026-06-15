import { motion } from "framer-motion";
import { FadeIn } from "@/components/FadeIn";

export interface TransformationItem {
  num: string;
  title: string;
  desc: string;
}

export interface TransformationSectionProps {
  title?: string;
  subtitle?: string;
  body?: string;
  items?: TransformationItem[];
}

const DEFAULT_ITEMS: TransformationItem[] = [
  { num: "01", title: "Identity", desc: "Helping individuals discover their true purpose and calling — so they live with clarity, confidence and conviction." },
  { num: "02", title: "Family", desc: "Equipping couples and families to build strong, thriving homes rooted in love, wisdom and intentional commitment." },
  { num: "03", title: "Leadership", desc: "Raising leaders who influence communities, institutions and nations — through Spirit-led vision and strategic action." },
];

export function TransformationSection({
  title = "A Clear Path. A Proven Approach.",
  subtitle = "The Transformation Framework",
  body = "Delphine's teachings focus on restoring identity, strengthening families and raising leaders who influence nations.",
  items = DEFAULT_ITEMS,
}: TransformationSectionProps) {
  return (
    <section className="py-[100px] lg:py-[120px] bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        <FadeIn variant="fade-up">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-5">
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: "hsl(38, 70%, 55%)" }}>
              {subtitle}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-foreground leading-tight">
              {title}
            </h2>
            <p className="text-base text-muted-foreground leading-[1.7]">
              {body}
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {items.map(({ num, title: itemTitle, desc }, i) => (
            <FadeIn key={num} variant="fade-up" delay={i * 0.12}>
              <motion.div
                className="relative rounded-2xl p-8 lg:p-10 flex flex-col gap-5 h-full"
                style={{
                  border: "1px solid hsla(288, 20%, 90%, 0.6)",
                  boxShadow: "0 4px 20px -4px hsla(288, 20%, 30%, 0.06)",
                  background: "var(--card)",
                  borderRadius: "16px",
                }}
                whileHover={{
                  y: -6,
                  boxShadow: "0 20px 40px -8px hsla(288, 30%, 30%, 0.15)",
                }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="absolute top-0 left-8 right-8 h-[2px] rounded-full"
                  style={{ background: "linear-gradient(90deg, hsl(288, 72%, 38%), hsl(38, 70%, 55%), transparent)" }}
                />
                <span className="font-serif text-4xl font-bold leading-none" style={{ color: "hsla(288, 72%, 38%, 0.15)" }}>
                  {num}
                </span>
                <div className="space-y-3">
                  <h3 className="font-serif text-2xl font-bold text-foreground">{itemTitle}</h3>
                  <p className="text-sm text-muted-foreground leading-[1.7]">{desc}</p>
                </div>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
