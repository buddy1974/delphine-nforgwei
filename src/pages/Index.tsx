import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";
import delHero from "@/assets/del-hero.jpg";
import delAbout from "@/assets/del-about2.jpg";

const Index = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[94vh] flex items-center overflow-hidden py-20 lg:py-28">
        {/* Background */}
        <div className="absolute inset-0">
          <img src={heroBg} alt="Elegant purple background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-purple-deep/75" />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-deep/80 via-purple-deep/50 to-transparent" />
        </div>

        {/* Content — split layout */}
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            {/* Left — Text */}
            <div className="max-w-xl lg:max-w-lg xl:max-w-xl space-y-10">
              <div className="space-y-6 animate-fade-in">
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground leading-[1.15] tracking-tight">
                  Delphine Mah Nforgwei
                </h1>

                {/* Gold accent divider */}
                <div
                  className="w-24 h-[2px] rounded-full animate-fade-in"
                  style={{
                    background: "linear-gradient(90deg, hsl(38, 70%, 55%), hsl(38, 60%, 75%), transparent)",
                    animationDelay: "0.3s",
                    animationFillMode: "both",
                  }}
                />

                <p
                  className="text-sm sm:text-[0.85rem] text-primary-foreground/65 font-medium tracking-[0.18em] uppercase animate-fade-in"
                  style={{ animationDelay: "0.2s", animationFillMode: "both" }}
                >
                  Author&nbsp;&nbsp;·&nbsp;&nbsp;Speaker&nbsp;&nbsp;·&nbsp;&nbsp;Family Transformation Leader
                </p>

                {/* Founder credibility lines */}
                <div
                  className="space-y-1 animate-fade-in"
                  style={{ animationDelay: "0.28s", animationFillMode: "both" }}
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
                </div>
              </div>

              <p
                className="text-base sm:text-lg text-primary-foreground/70 leading-relaxed animate-fade-in"
                style={{ animationDelay: "0.4s", animationFillMode: "both" }}
              >
                Empowering individuals, strengthening families, and raising leaders who influence nations.
              </p>

              <div
                className="flex flex-col sm:flex-row gap-4 pt-2 animate-fade-in"
                style={{ animationDelay: "0.6s", animationFillMode: "both" }}
              >
                <Link to="/programs">
                  <Button
                    size="xl"
                    className="bg-primary text-primary-foreground font-semibold tracking-wide rounded-lg hover:scale-[1.02] hover:shadow-[0_8px_30px_-6px_hsl(288,72%,38%,0.45)] transition-all duration-300"
                  >
                    Explore the Work
                  </Button>
                </Link>
                <Link to="/connect">
                  <Button
                    size="xl"
                    className="bg-transparent border-2 border-purple-soft text-purple-soft font-semibold tracking-wide rounded-lg hover:bg-purple-soft/10 transition-all duration-300"
                  >
                    Join the Movement
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right — Portrait */}
            <div
              className="flex justify-center lg:justify-end animate-fade-in"
              style={{ animationDelay: "0.5s", animationFillMode: "both" }}
            >
              <div className="relative">
                <div
                  className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] lg:w-[400px] lg:h-[400px] rounded-full overflow-hidden shadow-2xl"
                  style={{
                    border: "3px solid hsla(288, 55%, 55%, 0.3)",
                    boxShadow: "0 25px 60px -15px hsla(288, 60%, 30%, 0.4), inset 0 0 30px hsla(288, 50%, 40%, 0.08)",
                  }}
                >
                  <img src={delHero} alt="Portrait of Delphine Mah Nforgwei" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Authority Proof Section */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span
              className="inline-block text-xs font-semibold tracking-[0.2em] uppercase"
              style={{ color: "hsl(38, 70%, 55%)" }}
            >
              Authority &amp; Impact
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-foreground leading-tight">
              A Life Dedicated to Transformation
            </h2>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 max-w-3xl mx-auto mb-20 divide-y sm:divide-y-0 sm:divide-x divide-border">
            {[
              { stat: "15+", label: "Years", sub: "Ministry, coaching & mentorship" },
              { stat: "5", label: "Books", sub: "Authored on faith, marriage & purpose" },
              { stat: "2", label: "Global Platforms", sub: "Built to impact families worldwide" },
            ].map(({ stat, label, sub }) => (
              <div key={label} className="text-center px-8 py-8 sm:py-4 space-y-1">
                <div className="flex items-baseline justify-center gap-1">
                  <span
                    className="font-serif text-5xl font-bold leading-none"
                    style={{ color: "hsl(288, 72%, 38%)" }}
                  >
                    {stat}
                  </span>
                  <span className="font-serif text-xl font-semibold text-foreground/70 leading-none">
                    {label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground tracking-wide">{sub}</p>
              </div>
            ))}
          </div>

          {/* Book covers */}
          <div className="space-y-6">
            <p
              className="text-center text-xs font-semibold tracking-[0.2em] uppercase"
              style={{ color: "hsl(38, 70%, 55%)" }}
            >
              Published Works
            </p>
            <div className="flex gap-4 sm:gap-6 justify-center flex-wrap">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className="w-[90px] sm:w-[110px] flex-shrink-0 rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:-translate-y-1"
                  style={{ border: "1px solid hsla(288, 20%, 88%, 0.5)" }}
                >
                  <img
                    src={`/images/books/book-${n}.jpg`}
                    alt={`Delphine Nforgwei Book ${n}`}
                    className="w-full aspect-[2/3] object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="text-center pt-2">
              <Link to="/books">
                <Button
                  variant="outline"
                  className="border-primary/40 text-primary hover:bg-primary/5 font-semibold tracking-wide"
                >
                  View All Books
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* About Preview Section */}
      <section className="relative py-20 lg:py-28 bg-secondary/40">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            {/* Left — Portrait */}
            <div className="flex justify-center lg:justify-start">
              <div
                className="relative w-[300px] h-[380px] sm:w-[340px] sm:h-[430px] lg:w-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-elegant"
                style={{ border: "2px solid hsla(288, 40%, 72%, 0.25)" }}
              >
                <img src={delAbout} alt="Delphine Mah Nforgwei portrait" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Right — Text */}
            <div className="max-w-xl space-y-6">
              <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: "hsl(38, 70%, 55%)" }}>
                About Delphine
              </span>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-foreground leading-tight">
                A Woman Called to Transform Lives.
              </h2>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Delphine Mah Nforgwei is a Pastor, Relationship Coach, Author, and Founder of the E-Woman Conference. She is committed to helping women rediscover purpose, strengthen their marriages, and lead boldly in every sphere of life.
              </p>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Through conferences, mentorship programs, and global speaking engagements, she equips women with clarity, confidence, and conviction to rise into their God-ordained calling.
              </p>

              <div className="pt-4">
                <Link to="/about">
                  <Button
                    size="xl"
                    className="bg-transparent border-2 border-purple-soft text-purple-soft font-semibold tracking-wide rounded-lg hover:bg-purple-soft/10 transition-all duration-300"
                  >
                    Learn More About Delphine
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Transformation Framework Section */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-5">
            <span
              className="inline-block text-xs font-semibold tracking-[0.2em] uppercase"
              style={{ color: "hsl(38, 70%, 55%)" }}
            >
              The Transformation Framework
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-foreground leading-tight">
              A Clear Path. A Proven Approach.
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Delphine's teachings focus on restoring identity, strengthening families and raising leaders who influence nations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {[
              {
                num: "01",
                title: "Identity",
                desc: "Helping individuals discover their true purpose and calling — so they live with clarity, confidence and conviction.",
              },
              {
                num: "02",
                title: "Family",
                desc: "Equipping couples and families to build strong, thriving homes rooted in love, wisdom and intentional commitment.",
              },
              {
                num: "03",
                title: "Leadership",
                desc: "Raising leaders who influence communities, institutions and nations — through Spirit-led vision and strategic action.",
              },
            ].map(({ num, title, desc }) => (
              <div
                key={num}
                className="relative rounded-2xl p-8 lg:p-10 flex flex-col gap-5"
                style={{
                  border: "1px solid hsla(288, 20%, 90%, 0.6)",
                  boxShadow: "0 4px 20px -4px hsla(288, 20%, 30%, 0.06)",
                  background: "var(--card)",
                }}
              >
                {/* Top accent line */}
                <div
                  className="absolute top-0 left-8 right-8 h-[2px] rounded-full"
                  style={{
                    background: "linear-gradient(90deg, hsl(288, 72%, 38%), hsl(38, 70%, 55%), transparent)",
                  }}
                />
                <span
                  className="font-serif text-4xl font-bold leading-none"
                  style={{ color: "hsla(288, 72%, 38%, 0.15)" }}
                >
                  {num}
                </span>
                <div className="space-y-3">
                  <h3 className="font-serif text-2xl font-bold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Services Section */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-5">
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: "hsl(38, 70%, 55%)" }}>
              Services
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.85rem] font-bold text-foreground leading-tight">
              How Delphine Serves Women &amp; Families
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-10 max-w-4xl mx-auto">
            {[
              { title: "Speaking Engagements", description: "Dynamic keynote sessions, conferences, and global events focused on leadership, faith, and purpose.", slug: "speaking" },
              { title: "Coaching & Mentorship", description: "Personal and group coaching programs helping women grow in clarity, confidence, and calling.", slug: "arise-align" },
              { title: "E-Woman Conference", description: "A transformational gathering equipping women to lead boldly in every sphere of life.", external: "https://www.e-womanconference.online" },
              { title: "School of Marriage Counseling & Coaching", description: "Training and mentorship for women seeking deeper relational wisdom and impact.", slug: "marriage-school" },
            ].map((service, index) => (
              <div key={index}>
                {service.external ? (
                  <a href={service.external} target="_blank" rel="noopener noreferrer" className="block">
                    <div
                      className="bg-card rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 h-full"
                      style={{
                        border: "1px solid hsla(288, 20%, 90%, 0.6)",
                        boxShadow: "0 4px 20px -4px hsla(288, 20%, 30%, 0.06)",
                      }}
                    >
                      <h3 className="font-serif text-xl font-semibold text-foreground mb-3">{service.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
                    </div>
                  </a>
                ) : (
                  <Link to={`/connect?program=${service.slug}`} className="block">
                    <div
                      className="bg-card rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 h-full"
                      style={{
                        border: "1px solid hsla(288, 20%, 90%, 0.6)",
                        boxShadow: "0 4px 20px -4px hsla(288, 20%, 30%, 0.06)",
                      }}
                    >
                      <h3 className="font-serif text-xl font-semibold text-foreground mb-3">{service.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
                    </div>
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Link to="/programs">
              <Button
                size="xl"
                className="bg-transparent border-2 border-purple-soft text-purple-soft font-semibold tracking-wide rounded-lg hover:bg-purple-soft/10 transition-all duration-300"
              >
                Explore All Programs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Media, Speaking & Global Impact Section */}
      <section className="py-20 lg:py-28 bg-secondary/30">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-5">
            <span
              className="inline-block text-xs font-semibold tracking-[0.2em] uppercase"
              style={{ color: "hsl(38, 70%, 55%)" }}
            >
              Media, Speaking &amp; Global Impact
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-foreground leading-tight">
              A Voice on Stages Around the World
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Delphine Nforgwei is an international speaker and transformational leader, empowering individuals, families and communities through teaching, mentorship and leadership development.
            </p>
          </div>

          {/* 4-card image grid with captions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-12">
            {[
              { src: "/images/gallery/2.jpg", caption: "Leadership Conference" },
              { src: "/images/gallery/5.jpg", caption: "Family Transformation Summit" },
              { src: "/images/gallery/9.jpg", caption: "Women's Leadership Gathering" },
              { src: "/images/gallery/14.jpg", caption: "Global Mentorship Sessions" },
            ].map(({ src, caption }) => (
              <div
                key={caption}
                className="group relative rounded-2xl overflow-hidden"
                style={{ border: "1px solid hsla(288, 20%, 88%, 0.4)" }}
              >
                <img
                  src={src}
                  alt={caption}
                  className="w-full h-56 sm:h-64 object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                {/* Caption overlay */}
                <div
                  className="absolute bottom-0 left-0 right-0 px-4 py-3"
                  style={{ background: "linear-gradient(to top, hsla(288, 40%, 10%, 0.85), transparent)" }}
                >
                  <p className="text-xs font-medium text-white/90 tracking-wide">{caption}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/contact">
              <Button
                size="xl"
                className="bg-primary text-primary-foreground font-semibold tracking-wide rounded-lg hover:opacity-90 transition-all duration-300"
              >
                Invite Delphine to Speak
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* The Ecosystem Section */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-3xl mx-auto text-center space-y-6 mb-16">
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: "hsl(38, 70%, 55%)" }}>
              The Ecosystem
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.85rem] font-bold text-foreground leading-tight">
              Platforms Built to Impact Families, Leaders and Nations
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Through strategic platforms and initiatives, Delphine equips individuals, families and leaders to build stronger homes and communities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* SMCC */}
            <div
              className="rounded-2xl p-10 flex flex-col justify-between"
              style={{
                border: "1px solid hsla(288, 20%, 90%, 0.6)",
                boxShadow: "0 4px 20px -4px hsla(288, 20%, 30%, 0.06)",
                background: "var(--card)",
              }}
            >
              <div className="space-y-4">
                <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: "hsl(38, 70%, 55%)" }}>
                  SMCC
                </span>
                <h3 className="font-serif text-2xl font-bold text-foreground leading-snug">
                  School of Marriage Counseling &amp; Coaching
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Professional training and certification for marriage counselors and relationship coaches.
                </p>
              </div>
              <div className="mt-8">
                <a href="https://www.smcc.solutions" target="_blank" rel="noopener noreferrer">
                  <Button
                    size="xl"
                    className="w-full bg-primary text-primary-foreground font-semibold tracking-wide rounded-lg hover:opacity-90 transition-all duration-300"
                  >
                    Explore SMCC
                  </Button>
                </a>
              </div>
            </div>

            {/* E-Woman */}
            <div
              className="rounded-2xl p-10 flex flex-col justify-between"
              style={{
                border: "1px solid hsla(288, 20%, 90%, 0.6)",
                boxShadow: "0 4px 20px -4px hsla(288, 20%, 30%, 0.06)",
                background: "var(--card)",
              }}
            >
              <div className="space-y-4">
                <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: "hsl(38, 70%, 55%)" }}>
                  E-Woman Conference
                </span>
                <h3 className="font-serif text-2xl font-bold text-foreground leading-snug">
                  Annual Conference Equipping Women Globally
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  An annual gathering equipping women globally to rise in identity, leadership and purpose.
                </p>
              </div>
              <div className="mt-8">
                <a href="https://www.e-womanconference.online" target="_blank" rel="noopener noreferrer">
                  <Button
                    size="xl"
                    className="w-full bg-transparent border-2 border-primary text-primary font-semibold tracking-wide rounded-lg hover:bg-primary/5 transition-all duration-300"
                  >
                    Explore E-Woman
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Authority Strip — Impact Across Communities */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-12 space-y-3">
            <span
              className="inline-block text-xs font-semibold tracking-[0.2em] uppercase"
              style={{ color: "hsl(38, 70%, 55%)" }}
            >
              Impact Across Communities
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground leading-tight">
              Reaching People. Changing Lives.
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { src: "/images/gallery/1.jpg", alt: "Community gathering" },
              { src: "/images/gallery/4.jpg", alt: "Conference audience" },
              { src: "/images/gallery/6.jpg", alt: "Ministry session" },
              { src: "/images/gallery/10.jpg", alt: "Leadership event" },
              { src: "/images/gallery/15.jpg", alt: "Women's empowerment gathering" },
            ].map(({ src, alt }) => (
              <div
                key={src}
                className="rounded-xl overflow-hidden aspect-square"
                style={{ border: "1px solid hsla(288, 20%, 88%, 0.4)" }}
              >
                <img src={src} alt={alt} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Testimonials Section */}
      <section className="py-20 lg:py-28 bg-secondary/30">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-5">
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: "hsl(38, 70%, 55%)" }}>
              Lives Transformed
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-foreground leading-tight">
              Stories of Change
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {[
              { quote: "Delphine's mentorship transformed my marriage and my mindset. I now lead with clarity and confidence.", name: "Program Participant" },
              { quote: "The E-Woman Conference shifted my entire perspective on purpose. It was life-changing.", name: "Conference Attendee" },
              { quote: "Her coaching is both spiritually grounded and strategically practical.", name: "Leadership Client" },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1"
                style={{
                  border: "1px solid hsla(288, 20%, 90%, 0.6)",
                  boxShadow: "0 4px 20px -4px hsla(288, 20%, 30%, 0.06)",
                }}
              >
                <p className="font-serif text-base italic text-foreground/85 leading-relaxed mb-6">
                  "{testimonial.quote}"
                </p>
                <span className="text-sm font-medium text-muted-foreground">— {testimonial.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" aria-hidden="true" />
          <div className="absolute inset-0 bg-purple-deep/90" />
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.85rem] font-bold text-primary-foreground leading-tight">
              Ready to Rise Into Your Next Season?
            </h2>

            <p className="text-base sm:text-lg text-primary-foreground/70 leading-relaxed">
              Take the next step toward clarity, confidence, and purpose.
            </p>

            <div className="pt-4 flex flex-col items-center gap-5">
              <Link to="/connect">
                <Button
                  size="xl"
                  className="bg-primary-foreground text-purple-deep font-semibold tracking-wide rounded-lg hover:-translate-y-0.5 transition-all duration-300"
                  style={{ boxShadow: "0 4px 20px -4px hsla(0, 0%, 100%, 0.15)" }}
                >
                  Book a Discovery Call
                </Button>
              </Link>

              <Link
                to="/events"
                className="text-sm text-primary-foreground/60 underline underline-offset-4 hover:text-primary-foreground/90 transition-colors duration-300"
              >
                Or Explore Upcoming Events
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
