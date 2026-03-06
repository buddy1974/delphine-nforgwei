import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const upcomingEvents = [
  {
    title: "Marriage Coaching – From First Steps to Forever",
    date: "Saturday, 17 January 2026 | 10:00 AM",
    location: "Hilltop Faith Headquarters, Entrée Eldorado, Nkomo",
    image: "/images/events/e-1.jpg",
    desc: "An intensive marriage coaching session equipping couples and individuals with practical and spiritual tools for lasting unions.",
  },
  {
    title: "School of Marriage Counseling & Coaching (SMCC Cohort 7)",
    date: "Dec 8, 2025 – Jan 12, 2026 | Mondays | 7:30–9:00 PM (WAT)",
    location: "Zoom",
    image: "/images/events/e-2.jpg",
    desc: "Certification-based training for aspiring marriage counselors and relationship coaches. Certificates issued upon completion.",
  },
  {
    title: "E-Woman Conference 2026 – The Excelling Woman",
    date: "13–14 March 2026",
    location: "Hilton Hotel, Yaoundé, Cameroon",
    image: "/images/events/e-5.jpg",
    desc: "The annual flagship empowerment gathering raising spiritually grounded, purpose-driven women.",
  },
];

const pastEvents = [
  {
    title: "E-Woman Conference 2025 – Yaoundé",
    date: "28 Feb – 1 Mar 2025",
    location: "Hilton Hotel, Yaoundé",
    image: "/images/events/e-4.jpg",
    desc: "A transformational two-day experience gathering women in power, prayer, and leadership development.",
  },
  {
    title: "E-Woman Conference USA – Delaware Edition",
    date: "25–26 July 2025",
    location: "USA – Delaware",
    image: "/images/events/e-3.jpg",
    desc: "The international expansion of the E-Woman movement bringing empowerment to the United States.",
  },
  {
    title: "Intentional Woman Conference 2025 – Arise & Shine",
    date: "23 August 2025 | 9:00 AM",
    location: "Krystal Palace, Douala",
    image: "/images/events/e-3.jpg",
    desc: "A powerful gathering focused on intentional living, clarity, and bold womanhood in leadership.",
  },
];

const Divider = () => (
  <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
);

const Events = () => (
  <>
    {/* Page hero */}
    <section className="py-20 lg:py-28 bg-secondary/30">
      <div className="container mx-auto px-6 lg:px-12 text-center max-w-2xl space-y-5">
        <span
          className="inline-block text-xs font-semibold tracking-[0.2em] uppercase"
          style={{ color: "hsl(38, 70%, 55%)" }}
        >
          Events
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-[2.85rem] font-bold text-foreground leading-tight">
          Gatherings That Change Lives
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Explore upcoming events and revisit powerful moments from past conferences.
          Stay connected — new gatherings are announced regularly.
        </p>
      </div>
    </section>

    <Divider />

    {/* Upcoming events */}
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="mb-12">
          <span
            className="inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-3"
            style={{ color: "hsl(38, 70%, 55%)" }}
          >
            Coming Up
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">Upcoming Events</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {upcomingEvents.map((event, i) => (
            <div
              key={i}
              className="bg-card rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={{
                border: "1px solid hsla(288, 20%, 90%, 0.6)",
                boxShadow: "0 4px 20px -4px hsla(288, 20%, 30%, 0.06)",
              }}
            >
              <img src={event.image} alt={event.title} className="w-full h-60 object-cover" />
              <div className="p-6 space-y-3">
                <h3 className="font-serif text-lg font-semibold text-foreground leading-snug">{event.title}</h3>
                <p className="text-xs font-medium text-muted-foreground">{event.date}</p>
                <p className="text-xs text-muted-foreground">{event.location}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{event.desc}</p>
                <div className="pt-2">
                  <Link to="/contact">
                    <Button size="sm" className="bg-primary text-primary-foreground font-semibold tracking-wide rounded-lg hover:opacity-90">
                      Register Interest
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <Divider />

    {/* E-Woman Conference CTA */}
    <section
      className="py-20 lg:py-28"
      style={{ background: "hsla(288, 30%, 12%, 1)" }}
    >
      <div className="container mx-auto px-6 lg:px-12 text-center max-w-2xl space-y-6">
        <span
          className="inline-block text-xs font-semibold tracking-[0.2em] uppercase"
          style={{ color: "hsl(38, 70%, 55%)" }}
        >
          E-Woman Conference
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">
          Attend the E-Woman Conference
        </h2>
        <p className="text-white/70 text-base leading-relaxed">
          The E-Woman Conference gathers women from around the world for transformation, empowerment and spiritual growth.
        </p>
        <a href="https://www.e-womanconference.online" target="_blank" rel="noopener noreferrer">
          <Button className="bg-white text-purple-900 font-semibold tracking-wide text-base px-10 py-6 rounded-lg hover:opacity-90 mt-2">
            Register for the Conference
          </Button>
        </a>
      </div>
    </section>

    <Divider />

    {/* Past events */}
    <section className="py-20 lg:py-28 bg-secondary/30">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="mb-12">
          <span
            className="inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-3"
            style={{ color: "hsl(38, 70%, 55%)" }}
          >
            Looking Back
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">Past Events</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {pastEvents.map((event, i) => (
            <div
              key={i}
              className="bg-card rounded-2xl overflow-hidden"
              style={{
                border: "1px solid hsla(288, 20%, 90%, 0.6)",
                boxShadow: "0 4px 20px -4px hsla(288, 20%, 30%, 0.06)",
              }}
            >
              <img src={event.image} alt={event.title} className="w-full h-56 object-cover opacity-90" />
              <div className="p-6 space-y-2">
                <h3 className="font-serif text-lg font-semibold text-foreground leading-snug">{event.title}</h3>
                <p className="text-xs font-medium text-muted-foreground">{event.date}</p>
                <p className="text-xs text-muted-foreground">{event.location}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{event.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <Divider />

    {/* Global CTA Block */}
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-6 lg:px-12 text-center max-w-2xl space-y-8">
        <div
          className="w-16 h-[1.5px] mx-auto rounded-full"
          style={{ background: "linear-gradient(90deg, transparent, hsl(38, 70%, 55%), transparent)" }}
        />
        <h2 className="font-serif text-3xl lg:text-[2.6rem] font-bold text-foreground leading-tight">
          Ready for Your Next Step?
        </h2>
        <p className="text-muted-foreground text-[0.95rem]">
          Every transformation begins with a decision. Choose your next step below.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <Link to="/programs">
            <Button className="bg-primary text-primary-foreground font-semibold tracking-wide px-8 py-5 rounded-lg hover:opacity-90">
              Explore Programs
            </Button>
          </Link>
          <a href="https://www.e-womanconference.online" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary/5 font-semibold tracking-wide px-8 py-5 rounded-lg">
              Attend the Conference
            </Button>
          </a>
          <Link to="/contact">
            <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary/5 font-semibold tracking-wide px-8 py-5 rounded-lg">
              Contact Delphine
            </Button>
          </Link>
        </div>
      </div>
    </section>
  </>
);

export default Events;
