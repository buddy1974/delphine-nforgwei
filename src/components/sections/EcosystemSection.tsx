import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/FadeIn";

export interface EcosystemSectionProps {
  sectionId?: string;
  title?: string;
  subtitle?: string;
  body?: string;
}

export function EcosystemSection({
  sectionId,
  title = "Platforms Built to Impact Families, Leaders and Nations",
  subtitle = "The Ecosystem",
  body = "Through strategic platforms and initiatives, Delphine equips individuals, families and leaders to build stronger homes and communities.",
}: EcosystemSectionProps) {
  return (
    <section className="py-[100px] lg:py-[120px] bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        <FadeIn variant="fade-up">
          <div className="max-w-3xl mx-auto text-center space-y-6 mb-16">
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: "hsl(38, 70%, 55%)" }}>
              {subtitle}
            </span>
<h2
              className="font-serif text-3xl sm:text-4xl lg:text-[2.85rem] font-bold text-foreground leading-tight"
              data-editable="true"
              data-field="title"
              data-section-id={sectionId}
            >
              {title}
            </h2>
            <p
              className="text-base sm:text-lg text-muted-foreground leading-[1.7]"
              data-editable="true"
              data-field="body"
              data-section-id={sectionId}
            >
              {body}
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* SMCC */}
          <FadeIn variant="fade-up" delay={0.1}>
            <motion.div
              className="rounded-2xl p-10 flex flex-col justify-between h-full relative overflow-hidden"
              style={{
                border: "1px solid hsla(288, 20%, 90%, 0.6)",
                boxShadow: "0 4px 20px -4px hsla(288, 20%, 30%, 0.06)",
                background: "var(--card)",
                borderRadius: "16px",
              }}
              whileHover={{ y: -6, boxShadow: "0 24px 50px -10px hsla(288, 30%, 25%, 0.18)" }}
              transition={{ duration: 0.3 }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-[3px]"
                style={{ background: "linear-gradient(90deg, hsl(288, 72%, 38%), hsl(38, 70%, 55%))" }}
              />
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold tracking-wider" style={{ background: "hsl(288, 72%, 38%)" }}>
                  SM
                </div>
                <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: "hsl(38, 70%, 55%)" }}>
                  SMCC
                </span>
                <h3 className="font-serif text-2xl font-bold text-foreground leading-snug">
                  School of Marriage Counseling &amp; Coaching
                </h3>
                <p className="text-muted-foreground text-sm leading-[1.7]">
                  Professional training and certification for marriage counselors and relationship coaches.
                </p>
              </div>
              <div className="mt-8">
                <a href="https://www.smcc.solutions" target="_blank" rel="noopener noreferrer">
                  <Button size="xl" className="w-full bg-primary text-primary-foreground font-semibold tracking-wide rounded-xl hover:opacity-90 transition-all duration-300">
                    Explore SMCC
                  </Button>
                </a>
              </div>
            </motion.div>
          </FadeIn>

          {/* E-Woman */}
          <FadeIn variant="fade-up" delay={0.2}>
            <motion.div
              className="rounded-2xl p-10 flex flex-col justify-between h-full relative overflow-hidden"
              style={{
                border: "1px solid hsla(288, 20%, 90%, 0.6)",
                boxShadow: "0 4px 20px -4px hsla(288, 20%, 30%, 0.06)",
                background: "var(--card)",
                borderRadius: "16px",
              }}
              whileHover={{ y: -6, boxShadow: "0 24px 50px -10px hsla(288, 30%, 25%, 0.18)" }}
              transition={{ duration: 0.3 }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-[3px]"
                style={{ background: "linear-gradient(90deg, hsl(38, 70%, 55%), hsl(288, 72%, 38%))" }}
              />
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold tracking-wider" style={{ background: "hsl(38, 70%, 55%)" }}>
                  EW
                </div>
                <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: "hsl(38, 70%, 55%)" }}>
                  E-Woman Conference
                </span>
                <h3 className="font-serif text-2xl font-bold text-foreground leading-snug">
                  Annual Conference Equipping Women Globally
                </h3>
                <p className="text-muted-foreground text-sm leading-[1.7]">
                  An annual gathering equipping women globally to rise in identity, leadership and purpose.
                </p>
              </div>
              <div className="mt-8">
                <a href="https://www.e-womanconference.online" target="_blank" rel="noopener noreferrer">
                  <Button size="xl" className="w-full bg-transparent border-2 border-primary text-primary font-semibold tracking-wide rounded-xl hover:bg-primary/5 transition-all duration-300">
                    Explore E-Woman
                  </Button>
                </a>
              </div>
            </motion.div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
