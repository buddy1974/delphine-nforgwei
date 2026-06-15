import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/FadeIn";

export interface TestimonialItem {
  quote: string;
  name: string;
}

export interface TestimonialsSectionProps {
  title?: string;
  subtitle?: string;
  items?: TestimonialItem[];
}

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  { quote: "Delphine's mentorship transformed my marriage and my mindset. I now lead with clarity and confidence.", name: "Program Participant" },
  { quote: "The E-Woman Conference shifted my entire perspective on purpose. It was life-changing.", name: "Conference Attendee" },
  { quote: "Her coaching is both spiritually grounded and strategically practical.", name: "Leadership Client" },
];

export function TestimonialsSection({
  title = "Stories of Change",
  subtitle = "Lives Transformed",
  items = DEFAULT_TESTIMONIALS,
}: TestimonialsSectionProps) {
  return (
    <section className="py-[100px] lg:py-[120px] bg-secondary/30">
      <div className="container mx-auto px-6 lg:px-12">
        <FadeIn variant="fade-up">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-5">
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: "hsl(38, 70%, 55%)" }}>
              {subtitle}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-foreground leading-tight">
              {title}
            </h2>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {items.map((testimonial, index) => (
            <FadeIn key={index} variant="fade-up" delay={index * 0.12}>
              <motion.div
                className="bg-card rounded-2xl p-8"
                style={{
                  border: "1px solid hsla(288, 20%, 90%, 0.6)",
                  boxShadow: "0 4px 20px -4px hsla(288, 20%, 30%, 0.06)",
                  borderRadius: "16px",
                }}
                whileHover={{ y: -6, boxShadow: "0 20px 40px -8px hsla(288, 30%, 30%, 0.13)" }}
                transition={{ duration: 0.3 }}
              >
                <p className="font-serif text-base italic text-foreground/85 leading-[1.75] mb-6">
                  "{testimonial.quote}"
                </p>
                <span className="text-sm font-medium text-muted-foreground">— {testimonial.name}</span>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
