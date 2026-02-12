import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Home, Compass } from "lucide-react";
import aboutImg from "@/assets/del-about.jpg";

const milestones = [
  { title: "Founder", desc: "E-Woman Conference" },
  { title: "Founder", desc: "School of Marriage Counseling & Coaching" },
  { title: "International Speaker", desc: "Conferences & Summits Worldwide" },
  { title: "Published Author", desc: "Books & Devotionals" },
  { title: "Global Mentor", desc: "To Women Across Nations" },
  { title: "Advocate", desc: "Marriage & Leadership Development" },
];

const values = [
  {
    icon: Heart,
    title: "Faith",
    desc: "Everything begins with an unwavering trust in God's plan. Faith is the foundation upon which every calling is built and every purpose is revealed.",
  },
  {
    icon: Home,
    title: "Family",
    desc: "Strong families build strong communities. Nurturing marriages and homes is essential to lasting transformation and generational impact.",
  },
  {
    icon: Compass,
    title: "Purpose",
    desc: "Every woman carries a divine assignment. Walking in purpose means embracing clarity, courage, and the confidence to lead with intention.",
  },
];

const About = () => (
  <>
    {/* Hero Header */}
    <section className="relative py-28 lg:py-36 gradient-purple-soft">
      <div className="container mx-auto px-6 lg:px-12 text-center">
        <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-5">
          The Story Behind the Calling
        </h1>
        <p className="text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto">
          A journey of faith, leadership, and transformation.
        </p>
      </div>
    </section>

    {/* Biography */}
    <section className="py-24 lg:py-32">
      <div className="container mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-14 lg:gap-24 items-start">
        <div>
          <img
            src={aboutImg}
            alt="Delphine Mah Nforgwei portrait"
            className="w-full rounded-2xl shadow-elegant object-cover aspect-[3/4]"
          />
        </div>

        <div className="max-w-lg space-y-7 text-muted-foreground leading-relaxed text-[1.05rem]">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
            Delphine Mah Nforgwei
          </h2>

          <p>
            Delphine Mah Nforgwei is a woman of deep faith, extraordinary vision, and relentless
            purpose — a leadership coach, international speaker, author, and marriage counselor
            dedicated to empowering women globally.
          </p>

          <p>
            With decades of experience in ministry and leadership development, she has touched
            thousands of lives through conferences, coaching programs, and mentorship. Her approach
            blends biblical wisdom with practical strategy.
          </p>

          <p>
            She is the visionary founder of the E-Woman Conference and the School of Marriage
            Counseling & Coaching, equipping individuals and couples with tools to build thriving,
            God-centered marriages.
          </p>

          <p>
            As a published author, her writings challenge women to think beyond limitations and step
            boldly into their divine assignments. Her message is clear: every woman has a seat at the
            table of purpose.
          </p>
        </div>
      </div>
    </section>

    {/* Leadership & Impact */}
    <section className="py-24 lg:py-32 bg-secondary/50">
      <div className="container mx-auto px-6 lg:px-12 text-center">
        <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
          Leadership &amp; Impact
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto mb-16">
          Milestones of a life committed to purpose, service, and transformation.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {milestones.map((m) => (
            <div
              key={m.title + m.desc}
              className="rounded-xl border border-border bg-card p-8 text-left flex flex-col hover:-translate-y-0.5 transition-transform duration-300 overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary/70 rounded-t-xl" />
              <h3 className="text-[1.35rem] font-bold text-foreground tracking-tight leading-snug">{m.title}</h3>
              <p className="text-muted-foreground text-sm mt-2">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Core Values */}
    <section className="py-32 lg:py-40">
      <div className="container mx-auto px-6 lg:px-12 text-center">
        <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-20">
          Core Values
        </h2>

        <div className="grid md:grid-cols-3 gap-0 max-w-5xl mx-auto">
          {values.map((v, i) => (
            <div
              key={v.title}
              className={`flex flex-col items-center px-10 py-8 space-y-5 ${
                i < values.length - 1 ? "md:border-r md:border-border" : ""
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-primary/8 flex items-center justify-center">
                <v.icon className="w-5 h-5 text-primary/70" />
              </div>
              <div className="space-y-2">
                <h3 className="text-[1.7rem] lg:text-[1.9rem] font-bold text-foreground tracking-tight">{v.title}</h3>
                <div className="w-10 h-[2px] bg-primary/40 mx-auto rounded-full" />
              </div>
              <p className="text-muted-foreground leading-relaxed max-w-[16rem] mx-auto text-[0.95rem]">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Personal Note */}
    <section className="py-36 lg:py-44 gradient-purple-soft">
      <div className="container mx-auto px-6 lg:px-12 text-center max-w-[700px] relative">
        {/* Gold divider */}
        <div
          className="w-16 h-[1.5px] mx-auto mb-14 rounded-full"
          style={{ background: "linear-gradient(90deg, transparent, hsl(38, 70%, 55%), transparent)" }}
        />

        {/* Background quotation mark */}
        <span className="absolute top-16 left-1/2 -translate-x-1/2 text-[14rem] leading-none font-serif text-primary/[0.04] select-none pointer-events-none">
          &ldquo;
        </span>

        <blockquote className="relative font-serif italic text-[1.65rem] lg:text-[2.5rem] text-foreground leading-[1.35] mb-8">
          "My life's mission is to help women rise into the fullness of who God created them to be."
        </blockquote>

        <p className="text-xs font-semibold tracking-[0.3em] uppercase text-muted-foreground mb-14">
          Delphine Mah Nforgwei
        </p>

        <Link to="/connect">
          <Button variant="hero" size="xl">
            Book a Discovery Call
          </Button>
        </Link>
      </div>
    </section>
  </>
);

export default About;
