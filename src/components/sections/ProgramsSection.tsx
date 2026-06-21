import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/FadeIn";

export interface ProgramItem {
  title: string;
  description: string;
  slug?: string;
  external?: string;
}

export interface ProgramsSectionProps {
  sectionId?: string;
  title?: string;
  subtitle?: string;
  button_label?: string;
  button_url?: string;
  items?: ProgramItem[];
}

const DEFAULT_ITEMS: ProgramItem[] = [
  { title: "Speaking Engagements", description: "Dynamic keynote sessions, conferences, and global events focused on leadership, faith, and purpose.", slug: "speaking" },
  { title: "Coaching & Mentorship", description: "Personal and group coaching programs helping women grow in clarity, confidence, and calling.", slug: "arise-align" },
  { title: "E-Woman Conference", description: "A transformational gathering equipping women to lead boldly in every sphere of life.", external: "https://www.e-womanconference.online" },
  { title: "School of Marriage Counseling & Coaching", description: "Training and mentorship for women seeking deeper relational wisdom and impact.", slug: "marriage-school" },
];

export function ProgramsSection({
  sectionId,
  title = "How Delphine Serves Women & Families",
  subtitle = "Services",
  button_label = "Explore All Programs",
  button_url = "/programs",
  items = DEFAULT_ITEMS,
}: ProgramsSectionProps) {
  return (
    <section className="py-[100px] lg:py-[120px] bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        <FadeIn variant="fade-up">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-5">
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
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-10 max-w-4xl mx-auto">
          {items.map((service, index) => (
            <FadeIn key={index} variant="fade-up" delay={index * 0.1}>
              {service.external ? (
                <a href={service.external} target="_blank" rel="noopener noreferrer" className="block h-full">
                  <motion.div
                    className="bg-card rounded-2xl p-8 h-full"
                    style={{
                      border: "1px solid hsla(288, 20%, 90%, 0.6)",
                      boxShadow: "0 4px 20px -4px hsla(288, 20%, 30%, 0.06)",
                      borderRadius: "16px",
                    }}
                    whileHover={{ y: -6, boxShadow: "0 20px 40px -8px hsla(288, 30%, 30%, 0.15)" }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-3">{service.title}</h3>
                    <p className="text-muted-foreground text-sm leading-[1.7]">{service.description}</p>
                  </motion.div>
                </a>
              ) : (
                <Link to={`/connect?program=${service.slug || ""}`} className="block h-full">
                  <motion.div
                    className="bg-card rounded-2xl p-8 h-full"
                    style={{
                      border: "1px solid hsla(288, 20%, 90%, 0.6)",
                      boxShadow: "0 4px 20px -4px hsla(288, 20%, 30%, 0.06)",
                      borderRadius: "16px",
                    }}
                    whileHover={{ y: -6, boxShadow: "0 20px 40px -8px hsla(288, 30%, 30%, 0.15)" }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-3">{service.title}</h3>
                    <p className="text-muted-foreground text-sm leading-[1.7]">{service.description}</p>
                  </motion.div>
                </Link>
              )}
            </FadeIn>
          ))}
        </div>

        <FadeIn variant="fade-up" delay={0.2}>
          <div className="text-center mt-16">
            <Link to={button_url || "/programs"}>
              <motion.div className="inline-block" whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
                <Button size="xl" className="bg-transparent border-2 border-purple-soft text-purple-soft font-semibold tracking-wide rounded-xl hover:bg-purple-soft/10 transition-all duration-300">
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
