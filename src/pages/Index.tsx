import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/FadeIn";
import heroBg from "@/assets/hero-bg.jpg";
import delHero from "@/assets/del-hero.jpg";
import delAbout from "@/assets/del-about2.jpg";

const Index = () => {
  return (
    <>
      {/* ── Hero ── */}
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
                <motion.h1
                  className="font-serif text-[2.8rem] sm:text-[3.4rem] lg:text-[4rem] xl:text-[4.5rem] font-bold text-primary-foreground leading-[1.1] tracking-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                >
                  Delphine Mah Nforgwei
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

                <motion.p
                  className="text-sm sm:text-[0.85rem] text-primary-foreground/65 font-medium tracking-[0.2em] uppercase"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
                >
                  Author&nbsp;&nbsp;·&nbsp;&nbsp;Speaker&nbsp;&nbsp;·&nbsp;&nbsp;Family Transformation Leader
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

              <motion.p
                className="text-base sm:text-lg text-primary-foreground/70 leading-[1.7]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.55, ease: "easeOut" }}
              >
                Empowering individuals, strengthening families, and raising leaders who influence nations.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 pt-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}
              >
                <Link to="/programs">
                  <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
                    <Button
                      size="xl"
                      className="bg-primary text-primary-foreground font-semibold tracking-wide rounded-xl shadow-[0_6px_24px_-6px_hsl(288,72%,38%,0.5)] hover:shadow-[0_10px_32px_-6px_hsl(288,72%,38%,0.65)] transition-shadow duration-300"
                    >
                      Explore the Work
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/connect">
                  <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
                    <Button
                      size="xl"
                      className="bg-transparent border-2 border-purple-soft text-purple-soft font-semibold tracking-wide rounded-xl hover:bg-purple-soft/10 transition-all duration-300"
                    >
                      Join the Movement
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
                  <img src={delHero} alt="Portrait of Delphine Mah Nforgwei" className="w-full h-full object-cover" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* ── Authority Proof ── */}
      <section className="py-[100px] lg:py-[120px] bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          <FadeIn variant="fade-up">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: "hsl(38, 70%, 55%)" }}>
                Authority &amp; Impact
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-foreground leading-tight">
                A Life Dedicated to Transformation
              </h2>
            </div>
          </FadeIn>

          {/* Stats row */}
          <FadeIn variant="fade-up" delay={0.15}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 max-w-3xl mx-auto mb-20 divide-y sm:divide-y-0 sm:divide-x divide-border">
              {[
                { stat: "15+", label: "Years", sub: "Ministry, coaching & mentorship" },
                { stat: "5", label: "Books", sub: "Authored on faith, marriage & purpose" },
                { stat: "2", label: "Global Platforms", sub: "Built to impact families worldwide" },
              ].map(({ stat, label, sub }) => (
                <div key={label} className="text-center px-8 py-8 sm:py-4 space-y-1">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="font-serif text-5xl font-bold leading-none" style={{ color: "hsl(288, 72%, 38%)" }}>
                      {stat}
                    </span>
                    <span className="font-serif text-xl font-semibold text-foreground/70 leading-none">{label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground tracking-wide">{sub}</p>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* Book covers */}
          <FadeIn variant="fade-up" delay={0.25}>
            <div className="space-y-6">
              <p className="text-center text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: "hsl(38, 70%, 55%)" }}>
                Published Works
              </p>
              <div className="flex gap-4 sm:gap-6 justify-center flex-wrap">
                {[1, 2, 3, 4, 5].map((n) => (
                  <motion.div
                    key={n}
                    className="w-[90px] sm:w-[110px] flex-shrink-0 rounded-xl overflow-hidden shadow-md"
                    style={{ border: "1px solid hsla(288, 20%, 88%, 0.5)" }}
                    whileHover={{ y: -6, boxShadow: "0 16px 40px -8px hsla(288, 30%, 30%, 0.2)" }}
                    transition={{ duration: 0.25 }}
                  >
                    <img
                      src={`/images/books/book-${n}.jpg`}
                      alt={`Delphine Nforgwei Book ${n}`}
                      className="w-full aspect-[2/3] object-cover"
                    />
                  </motion.div>
                ))}
              </div>
              <div className="text-center pt-2">
                <Link to="/books">
                  <motion.div className="inline-block" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
                    <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary/5 font-semibold tracking-wide">
                      View All Books
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* ── About Preview ── */}
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
                <img src={delAbout} alt="Delphine Mah Nforgwei portrait" className="w-full h-full object-cover" />
              </motion.div>
            </FadeIn>

            <FadeIn variant="fade-up" delay={0.15}>
              <div className="max-w-xl space-y-6">
                <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: "hsl(38, 70%, 55%)" }}>
                  About Delphine
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-foreground leading-tight">
                  A Woman Called to Transform Lives.
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground leading-[1.7]">
                  Delphine Mah Nforgwei is a Pastor, Relationship Coach, Author, and Founder of the E-Woman Conference. She is committed to helping women rediscover purpose, strengthen their marriages, and lead boldly in every sphere of life.
                </p>
                <p className="text-base sm:text-lg text-muted-foreground leading-[1.7]">
                  Through conferences, mentorship programs, and global speaking engagements, she equips women with clarity, confidence, and conviction to rise into their God-ordained calling.
                </p>
                <div className="pt-4">
                  <Link to="/about">
                    <motion.div className="inline-block" whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
                      <Button
                        size="xl"
                        className="bg-transparent border-2 border-purple-soft text-purple-soft font-semibold tracking-wide rounded-xl hover:bg-purple-soft/10 transition-all duration-300"
                      >
                        Learn More About Delphine
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* ── Transformation Framework ── */}
      <section className="py-[100px] lg:py-[120px] bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          <FadeIn variant="fade-up">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-5">
              <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: "hsl(38, 70%, 55%)" }}>
                The Transformation Framework
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-foreground leading-tight">
                A Clear Path. A Proven Approach.
              </h2>
              <p className="text-base text-muted-foreground leading-[1.7]">
                Delphine's teachings focus on restoring identity, strengthening families and raising leaders who influence nations.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {[
              { num: "01", title: "Identity", desc: "Helping individuals discover their true purpose and calling — so they live with clarity, confidence and conviction." },
              { num: "02", title: "Family", desc: "Equipping couples and families to build strong, thriving homes rooted in love, wisdom and intentional commitment." },
              { num: "03", title: "Leadership", desc: "Raising leaders who influence communities, institutions and nations — through Spirit-led vision and strategic action." },
            ].map(({ num, title, desc }, i) => (
              <FadeIn key={num} variant="fade-up" delay={i * 0.12}>
                <motion.div
                  className="relative rounded-2xl p-8 lg:p-10 flex flex-col gap-5 h-full"
                  style={{
                    border: "1px solid hsla(288, 20%, 90%, 0.6)",
                    boxShadow: "0 4px 20px -4px hsla(288, 20%, 30%, 0.06)",
                    background: "var(--card)",
                    borderRadius: "16px",
                  }}
                  whileHover={{
                    y: -6,
                    boxShadow: "0 20px 40px -8px hsla(288, 30%, 30%, 0.15)",
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className="absolute top-0 left-8 right-8 h-[2px] rounded-full"
                    style={{ background: "linear-gradient(90deg, hsl(288, 72%, 38%), hsl(38, 70%, 55%), transparent)" }}
                  />
                  <span className="font-serif text-4xl font-bold leading-none" style={{ color: "hsla(288, 72%, 38%, 0.15)" }}>
                    {num}
                  </span>
                  <div className="space-y-3">
                    <h3 className="font-serif text-2xl font-bold text-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-[1.7]">{desc}</p>
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* ── Services ── */}
      <section className="py-[100px] lg:py-[120px] bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          <FadeIn variant="fade-up">
            <div className="text-center max-w-2xl mx-auto mb-20 space-y-5">
              <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: "hsl(38, 70%, 55%)" }}>
                Services
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.85rem] font-bold text-foreground leading-tight">
                How Delphine Serves Women &amp; Families
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-10 max-w-4xl mx-auto">
            {[
              { title: "Speaking Engagements", description: "Dynamic keynote sessions, conferences, and global events focused on leadership, faith, and purpose.", slug: "speaking" },
              { title: "Coaching & Mentorship", description: "Personal and group coaching programs helping women grow in clarity, confidence, and calling.", slug: "arise-align" },
              { title: "E-Woman Conference", description: "A transformational gathering equipping women to lead boldly in every sphere of life.", external: "https://www.e-womanconference.online" },
              { title: "School of Marriage Counseling & Coaching", description: "Training and mentorship for women seeking deeper relational wisdom and impact.", slug: "marriage-school" },
            ].map((service, index) => (
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
                  <Link to={`/connect?program=${service.slug}`} className="block h-full">
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
              <Link to="/programs">
                <motion.div className="inline-block" whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
                  <Button size="xl" className="bg-transparent border-2 border-purple-soft text-purple-soft font-semibold tracking-wide rounded-xl hover:bg-purple-soft/10 transition-all duration-300">
                    Explore All Programs
                  </Button>
                </motion.div>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* ── Media, Speaking & Global Impact ── */}
      <section className="py-[100px] lg:py-[120px] bg-secondary/30">
        <div className="container mx-auto px-6 lg:px-12">
          <FadeIn variant="fade-up">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-5">
              <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: "hsl(38, 70%, 55%)" }}>
                Media, Speaking &amp; Global Impact
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-foreground leading-tight">
                A Voice on Stages Around the World
              </h2>
              <p className="text-base text-muted-foreground leading-[1.7]">
                Delphine Nforgwei is an international speaker and transformational leader, empowering individuals, families and communities through teaching, mentorship and leadership development.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-12">
            {[
              { src: "/images/gallery/2.jpg", caption: "Leadership Conference" },
              { src: "/images/gallery/5.jpg", caption: "Family Transformation Summit" },
              { src: "/images/gallery/9.jpg", caption: "Women's Leadership Gathering" },
              { src: "/images/gallery/14.jpg", caption: "Global Mentorship Sessions" },
            ].map(({ src, caption }, i) => (
              <FadeIn key={caption} variant="scale-in" delay={i * 0.1}>
                <motion.div
                  className="group relative rounded-2xl overflow-hidden"
                  style={{ border: "1px solid hsla(288, 20%, 88%, 0.4)", borderRadius: "16px" }}
                  whileHover={{ scale: 1.02, boxShadow: "0 16px 40px -8px hsla(288, 30%, 20%, 0.2)" }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src={src}
                    alt={caption}
                    className="w-full h-56 sm:h-64 object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 px-4 py-3"
                    style={{ background: "linear-gradient(to top, hsla(288, 40%, 10%, 0.9), transparent)" }}
                  >
                    <p className="text-xs font-medium text-white/90 tracking-wide">{caption}</p>
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>

          <FadeIn variant="fade-up" delay={0.2}>
            <div className="text-center">
              <Link to="/contact">
                <motion.div className="inline-block" whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
                  <Button size="xl" className="bg-primary text-primary-foreground font-semibold tracking-wide rounded-xl hover:opacity-90 shadow-[0_6px_24px_-6px_hsl(288,72%,38%,0.4)] hover:shadow-[0_10px_32px_-6px_hsl(288,72%,38%,0.55)] transition-shadow duration-300">
                    Invite Delphine to Speak
                  </Button>
                </motion.div>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* ── The Ecosystem ── */}
      <section className="py-[100px] lg:py-[120px] bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          <FadeIn variant="fade-up">
            <div className="max-w-3xl mx-auto text-center space-y-6 mb-16">
              <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: "hsl(38, 70%, 55%)" }}>
                The Ecosystem
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.85rem] font-bold text-foreground leading-tight">
                Platforms Built to Impact Families, Leaders and Nations
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-[1.7]">
                Through strategic platforms and initiatives, Delphine equips individuals, families and leaders to build stronger homes and communities.
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

      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* ── Authority Strip ── */}
      <section className="py-[100px] lg:py-[120px] bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          <FadeIn variant="fade-up">
            <div className="text-center mb-12 space-y-3">
              <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: "hsl(38, 70%, 55%)" }}>
                Impact Across Communities
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                Reaching People. Changing Lives.
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { src: "/images/gallery/1.jpg", alt: "Community gathering" },
              { src: "/images/gallery/4.jpg", alt: "Conference audience" },
              { src: "/images/gallery/6.jpg", alt: "Ministry session" },
              { src: "/images/gallery/10.jpg", alt: "Leadership event" },
              { src: "/images/gallery/15.jpg", alt: "Women's empowerment gathering" },
            ].map(({ src, alt }, i) => (
              <FadeIn key={src} variant="scale-in" delay={i * 0.08}>
                <motion.div
                  className="rounded-xl overflow-hidden aspect-square"
                  style={{ border: "1px solid hsla(288, 20%, 88%, 0.4)", borderRadius: "12px" }}
                  whileHover={{ scale: 1.04, boxShadow: "0 12px 30px -6px hsla(288, 30%, 20%, 0.18)" }}
                  transition={{ duration: 0.3 }}
                >
                  <img src={src} alt={alt} className="w-full h-full object-cover" />
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* ── Lives Transformed ── */}
      <section className="py-[100px] lg:py-[120px] bg-secondary/30">
        <div className="container mx-auto px-6 lg:px-12">
          <FadeIn variant="fade-up">
            <div className="text-center max-w-2xl mx-auto mb-20 space-y-5">
              <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: "hsl(38, 70%, 55%)" }}>
                Lives Transformed
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-foreground leading-tight">
                Stories of Change
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {[
              { quote: "Delphine's mentorship transformed my marriage and my mindset. I now lead with clarity and confidence.", name: "Program Participant" },
              { quote: "The E-Woman Conference shifted my entire perspective on purpose. It was life-changing.", name: "Conference Attendee" },
              { quote: "Her coaching is both spiritually grounded and strategically practical.", name: "Leadership Client" },
            ].map((testimonial, index) => (
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

      {/* ── Closing CTA ── */}
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
                Ready to Rise Into Your Next Season?
              </h2>
              <p className="text-base sm:text-lg text-primary-foreground/70 leading-[1.7]">
                Take the next step toward clarity, confidence, and purpose.
              </p>
              <div className="pt-4 flex flex-col items-center gap-5">
                <Link to="/connect">
                  <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
                    <Button
                      size="xl"
                      className="bg-primary-foreground text-purple-deep font-semibold tracking-wide rounded-xl hover:-translate-y-0.5 transition-all duration-300"
                      style={{ boxShadow: "0 6px 24px -4px hsla(0, 0%, 100%, 0.2)" }}
                    >
                      Book a Discovery Call
                    </Button>
                  </motion.div>
                </Link>
                <Link
                  to="/events"
                  className="text-sm text-primary-foreground/60 underline underline-offset-4 hover:text-primary-foreground/90 transition-colors duration-300"
                >
                  Or Explore Upcoming Events
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
};

export default Index;
