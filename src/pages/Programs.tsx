import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/FadeIn";

/* ── Data ── */

const identityCards = [
  {
    title: "Arise to Align — Group Coaching",
    desc: "A focused transformational coaching experience designed to help women discover identity, clarify calling, overcome procrastination, and move from stagnation to strategic action.",
    cta: "Apply Now",
    slug: "arise-align",
  },
  {
    title: "The 12 Pillars of Elevation",
    desc: "A deep coaching framework covering spiritual growth, emotional maturity, leadership development, and personal transformation — designed to build women who influence with conviction.",
    cta: "Learn More",
    slug: "12-pillars",
  },
  {
    title: "Streamline Your Business",
    desc: "Strategic guidance for women entrepreneurs who want to align purpose with profitability and scale toward six figures without compromising faith or family.",
    cta: "Start the Conversation",
    slug: "streamline-business",
  },
];

const marriageCards = [
  {
    title: "Wives on Fire Community",
    bullets: [
      "Powerful prayer sessions",
      "Book reviews & guided discussions",
      "Emotional growth & intentional communication",
      "Tools to rekindle love and strengthen their marriage",
    ],
    intro: "A vibrant, prayer-centered sisterhood for married women seeking:",
    cta: "Join the Community",
    slug: "wives-on-fire",
  },
  {
    title: "Singles on Fire Community",
    desc: "Preparing single women for intentional relationships through emotional maturity, self-awareness, and identity clarity before partnership.",
    cta: "Join the Community",
    slug: "singles-on-fire",
  },
  {
    title: "School of Marriage Counseling & Coaching",
    desc: "A training ground for emerging marriage counselors and coaches called to restore homes using biblical wisdom and practical tools.",
    cta: "Enroll Now",
    slug: "marriage-school",
  },
];

const leadershipCards = [
  {
    title: "Private Mentorship",
    desc: "High-level mentorship for women in ministry, leadership, business, and marriage seeking strategic and Spirit-led guidance.",
    cta: "Apply for Mentorship",
    slug: "mentorship",
  },
  {
    title: "E-Woman Conference",
    desc: "A global empowerment movement redefining leadership, faith, and purpose — gathering women from Cameroon to the United States and beyond.",
    cta: "View Conference",
    slug: "",
    external: "https://ewomanconference.com",
  },
  {
    title: "Speaking Engagements",
    bullets: [
      "Women in Leadership",
      "Marriage & Relationship Restoration",
      "Identity & Purpose Alignment",
      "Faith-Driven Influence",
    ],
    intro: "Invite Delphine to speak on:",
    cta: "Invite Delphine",
    slug: "speaking",
  },
];

const testimonials = [
  {
    quote: "Wives on Fire changed the atmosphere of my marriage. I learned how to pray with intention and love with purpose.",
    name: "Fri Loveline",
    tag: "Wives on Fire",
  },
  {
    quote: "Through Delphine's coaching, my marriage was restored. What was broken became the foundation of something beautiful.",
    name: "Beatrice Munang",
    tag: "Marriage Transformation",
  },
  {
    quote: "I finally set SMART goals, discovered my calling, and stopped living on autopilot. This coaching gave me clarity I didn't know I needed.",
    name: "Coaching Client",
    tag: "Purpose & Clarity",
  },
];

/* ── Card component ── */

interface ProgramCardProps {
  title: string;
  desc?: string;
  intro?: string;
  bullets?: string[];
  cta: string;
  slug?: string;
  external?: string;
  accent?: boolean;
  index?: number;
}

const ProgramCard = ({ title, desc, intro, bullets, cta, slug, external, accent, index = 0 }: ProgramCardProps) => {
  const content = (
    <motion.div
      className="rounded-2xl border border-border bg-card p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden h-full"
      style={{
        borderRadius: "16px",
        boxShadow: accent
          ? "0 6px 24px -6px hsl(288 72% 25% / 0.12)"
          : "0 4px 16px -4px hsla(288, 20%, 30%, 0.06)",
      }}
      whileHover={{
        y: -6,
        boxShadow: "0 20px 40px -8px hsla(288, 30%, 30%, 0.15)",
      }}
      transition={{ duration: 0.3 }}
    >
      {accent && <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary/60 rounded-t-xl" />}
      <div>
        <h3 className="font-serif text-xl lg:text-[1.3rem] font-bold text-foreground mb-3 leading-snug">{title}</h3>
        {desc && <p className="text-muted-foreground text-sm leading-[1.7]">{desc}</p>}
        {intro && <p className="text-muted-foreground text-sm leading-[1.7] mb-2">{intro}</p>}
        {bullets && (
          <ul className="space-y-1 mt-1">
            {bullets.map((b) => (
              <li key={b} className="text-muted-foreground text-sm leading-relaxed flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "hsl(38, 70%, 55%)" }} />
                {b}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-8">
        {external ? (
          <a href={external} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="w-full border-primary/40 text-primary hover:bg-primary/5 font-semibold tracking-wide rounded-xl transition-all duration-300 hover:scale-[1.02]">
              {cta}
            </Button>
          </a>
        ) : (
          <Link to={`/connect?program=${slug}`}>
            <Button variant="outline" className="w-full border-primary/40 text-primary hover:bg-primary/5 font-semibold tracking-wide rounded-xl transition-all duration-300 hover:scale-[1.02]">
              {cta}
            </Button>
          </Link>
        )}
      </div>
    </motion.div>
  );

  return (
    <FadeIn variant="fade-up" delay={index * 0.1}>
      {content}
    </FadeIn>
  );
};

/* ── Section header ── */

const SectionHeader = ({ label, headline, sub }: { label: string; headline: string; sub: string }) => (
  <FadeIn variant="fade-up">
    <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
      <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: "hsl(38, 70%, 55%)" }}>
        {label}
      </span>
      <h2 className="font-serif text-3xl lg:text-[2.6rem] font-bold text-foreground leading-tight">{headline}</h2>
      <p className="text-muted-foreground text-[0.95rem] leading-[1.7]">{sub}</p>
    </div>
  </FadeIn>
);

const Divider = () => <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />;

/* ── Page ── */

const Programs = () => (
  <>
    {/* Hero */}
    <section className="relative py-[100px] lg:py-[140px] gradient-purple-soft overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full opacity-[0.06] pointer-events-none"
        style={{ background: "hsl(288, 72%, 38%)", filter: "blur(80px)" }}
      />
      <FadeIn variant="slide-up">
        <div className="container mx-auto px-6 lg:px-12 text-center max-w-3xl relative z-10">
          <h1 className="font-serif text-4xl lg:text-[3.4rem] font-bold text-foreground leading-tight mb-5 tracking-tight">
            Life-Changing Programs That Propel&nbsp;You
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground mb-8 leading-[1.7]">
            Faith-based transformation for women ready to elevate in purpose, marriage, leadership, and legacy.
          </p>
          <p className="text-muted-foreground text-[0.92rem] leading-[1.7] max-w-2xl mx-auto">
            With over 15 years of experience as a women's relationship and leadership coach — and as a John Maxwell
            Certified Speaker, Trainer, and Coach — Delphine Mah Nforgwei equips women with clarity, strategy, and
            spiritual grounding to thrive intentionally in every area of life.
          </p>
        </div>
      </FadeIn>
    </section>

    {/* Section 1 — Identity & Purpose */}
    <section className="py-[100px] lg:py-[120px]">
      <div className="container mx-auto px-6 lg:px-12">
        <SectionHeader
          label="Identity & Purpose Alignment"
          headline="Arise & Align"
          sub="Clarity before expansion. Identity before influence."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {identityCards.map((c, i) => (
            <ProgramCard key={c.title} {...c} index={i} />
          ))}
        </div>
      </div>
    </section>

    <Divider />

    {/* Section 2 — Marriage & Relationships */}
    <section className="py-[100px] lg:py-[120px] bg-secondary/30">
      <div className="container mx-auto px-6 lg:px-12">
        <SectionHeader
          label="Marriage & Relationship Restoration"
          headline="Strong Marriages. Strong Legacy."
          sub="Healing homes. Restoring vision. Rebuilding families."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {marriageCards.map((c, i) => (
            <ProgramCard key={c.title} {...c} accent index={i} />
          ))}
        </div>
      </div>
    </section>

    <Divider />

    {/* Section 3 — Leadership & Global Impact */}
    <section className="py-[100px] lg:py-[120px] bg-secondary/60">
      <div className="container mx-auto px-6 lg:px-12">
        <SectionHeader
          label="Leadership & Global Impact"
          headline="Women of Influence"
          sub="From personal growth to global platforms."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {leadershipCards.map((c, i) => (
            <ProgramCard key={c.title} {...c} accent index={i} />
          ))}
        </div>
      </div>
    </section>

    <Divider />

    {/* Testimonial Strip */}
    <section className="py-[100px] lg:py-[120px]">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <FadeIn key={t.name} variant="fade-up" delay={i * 0.12}>
              <div className="text-center space-y-4 px-4">
                <p className="font-serif text-[0.95rem] italic text-foreground/80 leading-[1.75]">"{t.quote}"</p>
                <div>
                  <span className="text-sm font-semibold text-foreground">{t.name}</span>
                  <span className="block text-xs text-muted-foreground tracking-wide mt-0.5">{t.tag}</span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>

    <Divider />

    {/* SMCC Funnel CTA */}
    <section className="py-[100px] lg:py-[120px] bg-secondary/30">
      <div className="container mx-auto px-6 lg:px-12 text-center max-w-2xl space-y-6">
        <FadeIn variant="scale-in">
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: "hsl(38, 70%, 55%)" }}>
            School of Marriage Counseling & Coaching
          </span>
          <h2 className="font-serif text-3xl lg:text-[2.6rem] font-bold text-foreground leading-tight mt-4">
            Become a Certified Marriage Counselor
          </h2>
          <p className="text-muted-foreground text-[0.95rem] leading-[1.7] max-w-xl mx-auto mt-4">
            For those called to guide couples and strengthen families, the School of Marriage Counseling &amp; Coaching (SMCC) provides professional training and certification.
          </p>
          <div className="mt-6">
            <a href="https://www.smcc.solutions" target="_blank" rel="noopener noreferrer">
              <motion.div className="inline-block" whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
                <Button className="bg-primary text-primary-foreground font-semibold tracking-wide text-base px-10 py-6 rounded-xl hover:opacity-90 shadow-[0_6px_24px_-6px_hsl(288,72%,38%,0.4)] hover:shadow-[0_10px_32px_-6px_hsl(288,72%,38%,0.55)] transition-shadow duration-300">
                  Explore SMCC Certification
                </Button>
              </motion.div>
            </a>
          </div>
        </FadeIn>
      </div>
    </section>

    <Divider />

    {/* Global CTA Block */}
    <section className="py-[100px] lg:py-[120px] bg-background">
      <div className="container mx-auto px-6 lg:px-12 text-center max-w-2xl space-y-8">
        <FadeIn variant="fade-up">
          <div
            className="w-16 h-[1.5px] mx-auto rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, hsl(38, 70%, 55%), transparent)" }}
          />
          <h2 className="font-serif text-3xl lg:text-[2.6rem] font-bold text-foreground leading-tight mt-8">
            Ready for Your Next Step?
          </h2>
          <p className="text-muted-foreground text-[0.95rem] leading-[1.7] mt-4">
            Every transformation begins with a decision. Choose your next step below.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link to="/programs">
              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
                <Button className="bg-primary text-primary-foreground font-semibold tracking-wide px-8 py-5 rounded-xl hover:opacity-90">
                  Explore Programs
                </Button>
              </motion.div>
            </Link>
            <a href="https://www.e-womanconference.online" target="_blank" rel="noopener noreferrer">
              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
                <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary/5 font-semibold tracking-wide px-8 py-5 rounded-xl">
                  Attend the Conference
                </Button>
              </motion.div>
            </a>
            <Link to="/contact">
              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
                <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary/5 font-semibold tracking-wide px-8 py-5 rounded-xl">
                  Contact Delphine
                </Button>
              </motion.div>
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  </>
);

export default Programs;
