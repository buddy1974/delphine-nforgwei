import { Link } from "react-router-dom";

const upcomingEvents = [
  {
    title: "Marriage Coaching – From First Steps to Forever",
    date: "Saturday, 17 January 2026 | 10:00 AM",
    location: "Hilltop Faith Headquarters, Entrée Eldorado, Nkomo",
    image: "/images/events/e-1.jpg",
    desc: "An intensive marriage coaching session equipping couples and individuals with practical and spiritual tools for lasting unions."
  },
  {
    title: "School of Marriage Counseling & Coaching (SMCC Cohort 7)",
    date: "Dec 8, 2025 – Jan 12, 2026 | Mondays | 7:30–9:00 PM (WAT)",
    location: "Zoom",
    image: "/images/events/e-2.jpg",
    desc: "Certification-based training for aspiring marriage counselors and relationship coaches. Certificates issued upon completion."
  },
  {
    title: "E-Woman Conference 2026 – The Excelling Woman",
    date: "13–14 March 2026",
    location: "Hilton Hotel, Yaoundé, Cameroon",
    image: "/images/events/e-5.jpg",
    desc: "The annual flagship empowerment gathering raising spiritually grounded, purpose-driven women."
  }
];

const pastEvents = [
  {
    title: "E-Woman Conference 2025 – Yaoundé",
    date: "28 Feb – 1 Mar 2025",
    location: "Hilton Hotel, Yaoundé",
    image: "/images/events/e-4.jpg",
    desc: "A transformational two-day experience gathering women in power, prayer, and leadership development."
  },
  {
    title: "E-Woman Conference USA – Delaware Edition",
    date: "25–26 July 2025",
    location: "USA – Delaware",
    image: "/images/events/e-3.jpg",
    desc: "The international expansion of the E-Woman movement bringing empowerment to the United States."
  },
  {
    title: "Intentional Woman Conference 2025 – Arise & Shine",
    date: "23 August 2025 | 9:00 AM",
    location: "Krystal Palace, Douala",
    image: "/images/events/e-3.jpg",
    desc: "A powerful gathering focused on intentional living, clarity, and bold womanhood in leadership."
  }
];

const Events = () => (
  <section className="py-24">
    <div className="container mx-auto px-6 lg:px-12">

      <div className="text-center mb-16">
        <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
          Events
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore upcoming gatherings and revisit powerful moments from past conferences.
          Stay connected — new events are announced regularly.
        </p>
      </div>

      {/* Upcoming */}
      <div className="mb-20">
        <h2 className="text-3xl font-semibold mb-10">Upcoming Events</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {upcomingEvents.map((event, i) => (
            <div key={i} className="bg-card rounded-2xl shadow-md overflow-hidden">
              <img src={event.image} alt={event.title} className="w-full h-72 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                <p className="text-sm text-muted-foreground mb-1">{event.date}</p>
                <p className="text-sm text-muted-foreground mb-4">{event.location}</p>
                <p className="text-sm mb-4">{event.desc}</p>
                <Link to="/connect">
                  <button className="bg-primary text-primary-foreground px-5 py-2 rounded-lg">
                    Register Interest
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Past */}
      <div>
        <h2 className="text-3xl font-semibold mb-10">Past Events</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {pastEvents.map((event, i) => (
            <div key={i} className="bg-card rounded-2xl shadow-md overflow-hidden">
              <img src={event.image} alt={event.title} className="w-full h-72 object-cover opacity-90" />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                <p className="text-sm text-muted-foreground mb-1">{event.date}</p>
                <p className="text-sm text-muted-foreground mb-4">{event.location}</p>
                <p className="text-sm">{event.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  </section>
);

export default Events;
