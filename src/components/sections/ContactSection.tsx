import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/FadeIn";
import heroBg from "@/assets/hero-bg.jpg";

export interface ContactSectionProps {
  title?: string;
  body?: string;
  button_label?: string;
  button_url?: string;
  secondary_label?: string;
  secondary_url?: string;
}

export function ContactSection({
  title = "Ready to Rise Into Your Next Season?",
  body = "Take the next step toward clarity, confidence, and purpose.",
  button_label = "Book a Discovery Call",
  button_url = "/connect",
  secondary_label = "Or Explore Upcoming Events",
  secondary_url = "/events",
}: ContactSectionProps) {
  return (
    <section className="relative py-[100px] lg:py-[120px] overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" aria-hidden="true" />
        <div className="absolute inset-0 bg-purple-deep/90" />
        {/* Subtle blob accent */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full opacity-10 pointer-events-none"
          style={{ background: "hsl(38, 70%, 55%)", filter: "blur(80px)" }}
        />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <FadeIn variant="scale-in">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.85rem] font-bold text-primary-foreground leading-tight">
              {title}
            </h2>
            <p className="text-base sm:text-lg text-primary-foreground/70 leading-[1.7]">
              {body}
            </p>
            <div className="pt-4 flex flex-col items-center gap-5">
              <Link to={button_url || "/connect"}>
                <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
                  <Button
                    size="xl"
                    className="bg-primary-foreground text-purple-deep font-semibold tracking-wide rounded-xl hover:-translate-y-0.5 transition-all duration-300"
                    style={{ boxShadow: "0 6px 24px -4px hsla(0, 0%, 100%, 0.2)" }}
                  >
                    {button_label}
                  </Button>
                </motion.div>
              </Link>
              <Link
                to={secondary_url || "/events"}
                className="text-sm text-primary-foreground/60 underline underline-offset-4 hover:text-primary-foreground/90 transition-colors duration-300"
              >
                {secondary_label}
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
