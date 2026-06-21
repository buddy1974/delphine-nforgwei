import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/FadeIn";

export interface BookItem {
  n: number;
  src?: string;
  alt?: string;
}

export interface BooksStatItem {
  stat: string;
  label: string;
  sub: string;
}

export interface BooksSectionProps {
  sectionId?: string;
  title?: string;
  subtitle?: string;
  button_label?: string;
  button_url?: string;
  books?: BookItem[];
  stats?: BooksStatItem[];
}

const DEFAULT_BOOKS: BookItem[] = [
  { n: 1 },
  { n: 2 },
  { n: 3 },
  { n: 4 },
  { n: 5 },
];

const DEFAULT_STATS: BooksStatItem[] = [
  { stat: "15+", label: "Years", sub: "Ministry, coaching & mentorship" },
  { stat: "5", label: "Books", sub: "Authored on faith, marriage & purpose" },
  { stat: "2", label: "Global Platforms", sub: "Built to impact families worldwide" },
];

export function BooksSection({
  sectionId,
  title = "A Life Dedicated to Transformation",
  subtitle = "Authority & Impact",
  button_label = "View All Books",
  button_url = "/books",
  books = DEFAULT_BOOKS,
  stats = DEFAULT_STATS,
}: BooksSectionProps) {
  return (
    <section className="py-[100px] lg:py-[120px] bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        <FadeIn variant="fade-up">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
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
          </div>
        </FadeIn>

        {/* Stats row */}
        <FadeIn variant="fade-up" delay={0.15}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 max-w-3xl mx-auto mb-20 divide-y sm:divide-y-0 sm:divide-x divide-border">
            {stats.map(({ stat, label, sub }) => (
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
              {books.map((book) => {
                const src = book.src || `/images/books/book-${book.n}.jpg`;
                const alt = book.alt || `Delphine Nforgwei Book ${book.n}`;
                return (
                  <motion.div
                    key={book.n}
                    className="w-[90px] sm:w-[110px] flex-shrink-0 rounded-xl overflow-hidden shadow-md"
                    style={{ border: "1px solid hsla(288, 20%, 88%, 0.5)" }}
                    whileHover={{ y: -6, boxShadow: "0 16px 40px -8px hsla(288, 30%, 30%, 0.2)" }}
                    transition={{ duration: 0.25 }}
                  >
                    <img
                      src={src}
                      alt={alt}
                      className="w-full aspect-[2/3] object-cover"
                    />
                  </motion.div>
                );
              })}
            </div>
            <div className="text-center pt-2">
              <Link to={button_url || "/books"}>
                <motion.div className="inline-block" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
                  <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary/5 font-semibold tracking-wide">
                    {button_label}
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
