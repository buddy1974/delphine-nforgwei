import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";
import delHero from "@/assets/del-hero.jpg";

export interface HeroSectionProps {
  sectionId?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  image_url?: string;
  button_label?: string;
  button_url?: string;
  button2_label?: string;
  button2_url?: string;
}

export function HeroSection({
  sectionId,
  title = "Delphine Mah Nforgwei",
  subtitle = "Author  ·  Speaker  ·  Family Transformation Leader",
  body = "Empowering individuals, strengthening families, and raising leaders who influence nations.",
  image_url,
  button_label = "Explore the Work",
  button_url = "/programs",
  button2_label = "Join the Movement",
  button2_url = "/connect",
}: HeroSectionProps) {
  const portraitSrc = image_url || delHero;

  return (
    <section className="relative min-h-[94vh] flex items-center overflow-hidden py-24 lg:py-32">
      {/* Background layers */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" aria-hidden="true" />
        <div className="absolute inset-0 bg-purple-deep/80" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-deep/85 via-purple-deep/55 to-transparent" />

        {/* Floating blobs */}
        <motion.div
          className="absolute top-1/3 right-[12%] w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{
            background: "hsl(38, 70%, 55%)",
            opacity: 0.08,
            filter: "blur(100px)",
          }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.08, 0.13, 0.08] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-24 -left-16 w-[360px] h-[360px] rounded-full pointer-events-none"
          style={{
            background: "hsl(288, 72%, 58%)",
            opacity: 0.1,
            filter: "blur(90px)",
          }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.1, 0.16, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute top-[-60px] left-[30%] w-[280px] h-[280px] rounded-full pointer-events-none"
          style={{
            background: "hsl(288, 60%, 50%)",
            opacity: 0.07,
            filter: "blur(80px)",
          }}
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          {/* Left — Text */}
          <div className="max-w-xl lg:max-w-lg xl:max-w-xl space-y-10">
            <div className="space-y-6">
              {/* P1D.1: data-editable on inner span, not on motion.h1 */}
              <motion.h1
                className="font-serif text-[2.8rem] sm:text-[3.4rem] lg:text-[4rem] xl:text-[4.5rem] font-bold text-primary-foreground leading-[1.1] tracking-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <span
                  data-editable="true"
                  data-field="title"
                  data-section-id={sectionId}
                >
                  {title}
                </span>
              </motion.h1>

              <motion.div
                className="w-24 h-[2px] rounded-full"
                style={{
                  background: "linear-gradient(90deg, hsl(38, 70%, 55%), hsl(38, 60%, 75%), transparent)",
                }}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              />

              {/* P1D.1: data-editable on inner span, not on motion.p */}
              <motion.p
                className="text-sm sm:text-[0.85rem] text-primary-foreground/65 font-medium tracking-[0.2em] uppercase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
              >
                <span
                  data-editable="true"
                  data-field="subtitle"
                  data-section-id={sectionId}
                >
                  {subtitle}
                </span>
              </motion.p>

              <motion.div
                className="space-y-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.45, ease: "easeOut" }}
              >
                <p className="text-[0.7rem] text-primary-foreground/40 tracking-[0.2em] uppercase">
                  Founder &amp; Visionary
                </p>
                <p className="text-sm text-primary-foreground/70 font-medium">
                  SMCC — School of Marriage Counseling &amp; Coaching
                </p>
                <p className="text-sm text-primary-foreground/70 font-medium">
                  E-Woman Conference
                </p>
              </motion.div>
            </div>

            {/* P1D.1: data-editable on inner span, not on motion.p */}
            <motion.p
              className="text-base sm:text-lg text-primary-foreground/70 leading-[1.7]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55, ease: "easeOut" }}
            >
              <span
                data-editable="true"
                data-field="body"
                data-section-id={sectionId}
              >
                {body}
              </span>
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 pt-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}
            >
              <Link to={button_url || "/programs"}>
                <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
                  <Button
                    size="xl"
                    className="bg-primary text-primary-foreground font-semibold tracking-wide rounded-xl shadow-[0_6px_24px_-6px_hsl(288,72%,38%,0.5)] hover:shadow-[0_10px_32px_-6px_hsl(288,72%,38%,0.65)] transition-shadow duration-300"
                  >
                    {button_label}
                  </Button>
                </motion.div>
              </Link>
              <Link to={button2_url || "/connect"}>
                <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
                  <Button
                    size="xl"
                    className="bg-transparent border-2 border-purple-soft text-purple-soft font-semibold tracking-wide rounded-xl hover:bg-purple-soft/10 transition-all duration-300"
                  >
                    {button2_label}
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>

          {/* Right — Portrait */}
          <motion.div
            className="flex justify-center lg:justify-end"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          >
            <div className="relative">
              {/* Glow ring */}
              <div
                className="absolute inset-[-12px] rounded-full opacity-30"
                style={{ background: "radial-gradient(circle, hsl(288, 72%, 55%), transparent 70%)", filter: "blur(20px)" }}
              />
              <motion.div
                className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] lg:w-[410px] lg:h-[410px] rounded-full overflow-hidden shadow-2xl"
                style={{
                  border: "3px solid hsla(288, 55%, 55%, 0.35)",
                  boxShadow: "0 30px 70px -15px hsla(288, 60%, 30%, 0.5), inset 0 0 30px hsla(288, 50%, 40%, 0.08)",
                }}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <img src={portraitSrc} alt="Portrait of Delphine Mah Nforgwei" className="w-full h-full object-cover" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
