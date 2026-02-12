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
                  className="font-serif text-xl sm:text-2xl text-primary-foreground/90 italic leading-relaxed animate-fade-in"
                  style={{ animationDelay: "0.2s", animationFillMode: "both" }}
                >
                  Empowering Women in Leadership, Marriage &amp; Purpose.
                </p>
              </div>

              <p
                className="text-base sm:text-lg text-primary-foreground/70 leading-relaxed animate-fade-in"
                style={{ animationDelay: "0.4s", animationFillMode: "both" }}
              >
                Pastor. Relationship Coach. Author. Founder of E-Woman Conference.
                Helping women rise boldly into their God-ordained calling.
              </p>

              <div
                className="flex flex-col sm:flex-row gap-4 pt-2 animate-fade-in"
                style={{ animationDelay: "0.6s", animationFillMode: "both" }}
              >
                <Link to="/connect">
                  <Button
                    size="xl"
                    className="bg-primary text-primary-foreground font-semibold tracking-wide rounded-lg hover:scale-[1.02] hover:shadow-[0_8px_30px_-6px_hsl(288,72%,38%,0.45)] transition-all duration-300"
                  >
                    Book a Discovery Call
                  </Button>
                </Link>
                <a href="https://ewomanconference.com" target="_blank" rel="noopener noreferrer">
                  <Button
                    size="xl"
                    className="bg-transparent border-2 border-purple-soft text-purple-soft font-semibold tracking-wide rounded-lg hover:bg-purple-soft/10 transition-all duration-300"
                  >
                    Join the E-Woman Conference
                  </Button>
                </a>
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

      {/* About Preview Section */}
      <section className="relative py-24 lg:py-32 bg-secondary/40">
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

      {/* Services Section */}
      <section className="py-28 lg:py-36 bg-background">
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
              { title: "E-Woman Conference", description: "A transformational gathering equipping women to lead boldly in every sphere of life.", external: "https://ewomanconference.com" },
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

      {/* Testimonials Section */}
      <section className="py-28 lg:py-36 bg-secondary/30">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-5">
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: "hsl(38, 70%, 55%)" }}>
              Testimonials
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-foreground leading-tight">
              What Women Are Saying
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
      <section className="relative py-28 lg:py-36 overflow-hidden">
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
