import { Button } from "@/components/ui/button";

const books = [
  {
    title: "L’Épouse VIP",
    description:
      "A faith-filled guide offering divine wisdom for the 21st-century wife.",
    image: "/images/books/book-1.jpg",
    link: "https://amzn.eu/d/0aeQWVI9",
  },
  {
    title: "My Bulletproof Marriage",
    description:
      "Practical strategies for building an unshakeable, purpose-driven marriage.",
    image: "/images/books/book-2.jpg",
    link: "https://amzn.eu/d/09SXD326",
  },
  {
    title: "Everyday a Honeymoon",
    description:
      "Daily secrets to help you cultivate joy, intimacy, and strength in your marriage.",
    image: "/images/books/book-3.jpg",
    link: "https://amzn.eu/d/0b1vTxnt",
  },
  {
    title: "The Attraction Code",
    description:
      "Ten powerful secrets to help you attract the right partner with clarity and confidence.",
    image: "/images/books/book-4.jpg",
    link: "https://amzn.eu/d/043wwGle",
  },
  {
    title: "The VIP Wife",
    description:
      "Godly wisdom designed to empower wives to thrive spiritually and relationally.",
    image: "/images/books/book-5.jpg",
    link: "https://amzn.eu/d/04zvoEfY",
  },
];

const Books = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Books by Delphine Nforgwei
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Faith-based resources designed to strengthen marriages, deepen purpose,
            and empower women to live intentionally.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {books.map((book, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:-translate-y-1 transition-all duration-300"
            >
              <img
                src={book.image}
                alt={book.title}
                className="w-full h-[360px] object-cover rounded-lg mb-6"
              />

              <h2 className="text-xl font-semibold text-foreground mb-3">
                {book.title}
              </h2>

              <p className="text-muted-foreground text-sm mb-6">
                {book.description}
              </p>

              <a href={book.link} target="_blank" rel="noopener noreferrer">
                <Button className="w-full">Buy on Amazon</Button>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Books;
