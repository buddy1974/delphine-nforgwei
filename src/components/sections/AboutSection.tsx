import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/FadeIn";
import delAbout from "@/assets/del-about2.jpg";

export interface AboutSectionProps {
  sectionId?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  body2?: string;
  image_url?: string;
  button_label?: string;
  button_url?: string;
}

export function AboutSection({
  sectionId,
  title = "A Woman Called to Transform Lives.",
  subtitle = "About Delphine",
  body = "Delphine Mah Nforgwei is a Pastor, Relationship Coach, Author, and Founder of the E-Woman Conference. She is committed to helping women rediscover purpose, strengthen their marriages, and lead boldly in every sphere of life.",
  body2 = "Through conferences, mentorship programs, and global speaking engagements, she equips women with clarity, confidence, and conviction to rise into their God-ordained calling.",
  image_url,
  button_label = "Learn More About Delphine",
  button_url = "/about",
}: AboutSectionProps) {
  const aboutSrc = image_url || delAbout;

  return (
    <section className="relative py-[100px] lg:py-[120px] bg-secondary/40">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <FadeIn variant="scale-in" className="flex justify-center lg:justify-start">
            <motion.div
              className="relative w-[300px] h-[380px] sm:w-[340px] sm:h-[430px] lg:w-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-elegant"
              style={{ border: "2px solid hsla(288, 40%, 72%, 0.25)" }}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.4 }}
            >
              <img src={aboutSrc} alt="Delphine Mah Nforgwei portrait" className="w-full h-full object-cover" />
            </motion.div>
          </FadeIn>

          <FadeIn variant="fade-up" delay={0.15}>
            <div className="max-w-xl space-y-6">
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
                className="text-base sm:text-lg text-muted-foreground leading-[1.7]"
                data-editable="true"
                data-field="body"
                data-section-id={sectionId}
              >
                {body}
              </p>
              {body2 && (
                <p className="text-base sm:text-lg text-muted-foreground leading-[1.7]">
                  {body2}
                </p>
              )}
              <div className="pt-4">
                <Link to={button_url || "/about"}>
                  <motion.div className="inline-block" whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
                    <Button
                      size="xl"
                      className="bg-transparent border-2 border-purple-soft text-purple-soft font-semibold tracking-wide rounded-xl hover:bg-purple-soft/10 transition-all duration-300"
                    >
                      {button_label}
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
