import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

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

/* ── Shared card component ── */

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
  return (
    <div
      className="rounded-xl border border-border bg-card p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden animate-fade-in"
      style={{
        animationDelay: `${index * 0.1}s`,
        animationFillMode: "backwards",
        ...(accent ? { boxShadow: "0 10px 40px -10px hsl(288 72% 25% / 0.15)" } : {}),
      }}
    >
      {accent && <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary/60 rounded-t-xl" />}
      <div>
        <h3 className="font-serif text-xl lg:text-[1.3rem] font-bold text-foreground mb-3 leading-snug">{title}</h3>
        {desc && <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>}
        {intro && <p className="text-muted-foreground text-sm leading-relaxed mb-2">{intro}</p>}
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
            <Button
              variant="outline"
              className="w-full border-primary/40 text-primary hover:bg-primary/5 font-semibold tracking-wide"
            >
              {cta}
            </Button>
          </a>
        ) : (
          <Link to={`/connect?program=${slug}`}>
            <Button
              variant="outline"
              className="w-full border-primary/40 text-primary hover:bg-primary/5 font-semibold tracking-wide"
            >
              {cta}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

/* ── Section header ── */

const SectionHeader = ({ label, headline, sub }: { label: string; headline: string; sub: string }) => (
  <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
    <span
      className="inline-block text-xs font-semibold tracking-[0.2em] uppercase"
      style={{ color: "hsl(38, 70%, 55%)" }}
    >
      {label}
    </span>
    <h2 className="font-serif text-3xl lg:text-[2.6rem] font-bold text-foreground leading-tight">{headline}</h2>
    <p className="text-muted-foreground text-[0.95rem]">{sub}</p>
  </div>
);

const Divider = () => <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />;

/* ── Page ── */

const Programs = () => (
  <>
    {/* Hero */}
    <section className="relative py-28 lg:py-40 gradient-purple-soft">
      <div className="container mx-auto px-6 lg:px-12 text-center max-w-3xl">
        <h1 className="font-serif text-4xl lg:text-[3.4rem] font-bold text-foreground leading-tight mb-5">
          Life-Changing Programs That Propel&nbsp;You
        </h1>
        <p className="text-lg lg:text-xl text-muted-foreground mb-8">
          Faith-based transformation for women ready to elevate in purpose, marriage, leadership, and legacy.
        </p>
        <p className="text-muted-foreground text-[0.92rem] leading-relaxed max-w-2xl mx-auto">
          With over 15 years of experience as a women's relationship and leadership coach — and as a John Maxwell
          Certified Speaker, Trainer, and Coach — Delphine Mah Nforgwei equips women with clarity, strategy, and
          spiritual grounding to thrive intentionally in every area of life.
        </p>
      </div>
    </section>

    {/* Section 1 — Identity & Purpose */}
    <section className="py-28 lg:py-36">
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
    <section className="py-28 lg:py-36 bg-secondary/30">
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
    <section className="py-28 lg:py-36 bg-secondary/60">
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
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="text-center space-y-4 px-4 animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "backwards" }}
            >
              <p className="font-serif text-[0.95rem] italic text-foreground/80 leading-relaxed">"{t.quote}"</p>
              <div>
                <span className="text-sm font-semibold text-foreground">{t.name}</span>
                <span className="block text-xs text-muted-foreground tracking-wide mt-0.5">{t.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <Divider />

    {/* Final Conversion Anchor */}
    <section className="py-32 lg:py-40">
      <div className="container mx-auto px-6 lg:px-12 text-center max-w-2xl space-y-8">
        <div
          className="w-16 h-[1.5px] mx-auto rounded-full"
          style={{ background: "linear-gradient(90deg, transparent, hsl(38, 70%, 55%), transparent)" }}
        />
        <h2 className="font-serif text-3xl lg:text-[2.6rem] font-bold text-foreground leading-tight">
          Your Next Level Is Not Accidental.
        </h2>
        <p className="text-muted-foreground text-[0.95rem]">
          Transformation requires intention. Intention requires action.
        </p>
        <Link to="/connect">
          <Button className="bg-primary text-primary-foreground font-semibold tracking-wide text-base px-10 py-6 rounded-lg hover:opacity-90 mt-4">
            Start the Conversation
          </Button>
        </Link>
      </div>
    </section>
  </>
);

export default Programs;
