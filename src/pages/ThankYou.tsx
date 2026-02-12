import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ThankYou = () => {
  return (
    <section className="py-28 lg:py-40 bg-secondary/30">
      <div className="container mx-auto px-6 lg:px-12">
        <div
          className="max-w-xl mx-auto text-center rounded-3xl p-10 sm:p-14 space-y-8"
          style={{
            background: "hsla(0, 0%, 100%, 0.7)",
            backdropFilter: "blur(20px)",
            border: "1px solid hsla(288, 20%, 90%, 0.5)",
            boxShadow: "0 8px 40px -12px hsla(288, 30%, 30%, 0.08)",
          }}
        >
          {/* Success check */}
          <div
            className="w-16 h-16 rounded-full mx-auto flex items-center justify-center animate-fade-in"
            style={{ background: "hsl(var(--purple-soft))" }}
          >
            <svg
              className="w-8 h-8 text-primary-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground leading-tight">
            Your Message Has Been Received
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Thank you for reaching out. A member of our team will respond shortly.
          </p>

          <div className="pt-4">
            <Link to="/">
              <Button
                size="xl"
                className="bg-primary text-primary-foreground font-semibold tracking-wide rounded-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                Return to Homepage
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ThankYou;
