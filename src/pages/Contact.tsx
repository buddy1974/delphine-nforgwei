import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast({ title: "Missing Information", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      toast({ title: "Message Sent", description: "Thank you! We'll be in touch soon." });
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      toast({ title: "Failed", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="py-24 lg:py-32 bg-secondary/30">
        <div className="container mx-auto px-6 lg:px-12 text-center max-w-2xl space-y-5">
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: "hsl(38, 70%, 55%)" }}>
            Contact
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-[2.85rem] font-bold text-foreground leading-tight">
            Get in Touch
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Have a quick question or just want to say hello? Drop us a message below.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-6 lg:px-12">
          <div
            className="max-w-xl mx-auto rounded-3xl p-8 sm:p-12"
            style={{
              background: "hsla(0, 0%, 100%, 0.7)",
              backdropFilter: "blur(20px)",
              border: "1px solid hsla(288, 20%, 90%, 0.5)",
              boxShadow: "0 8px 40px -12px hsla(288, 30%, 30%, 0.08)",
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-foreground">Name <span className="text-destructive">*</span></Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="bg-background/60" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">Email <span className="text-destructive">*</span></Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="bg-background/60" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium text-foreground">Message <span className="text-destructive">*</span></Label>
                <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Your message…" className="bg-background/60 min-h-[120px]" required />
              </div>
              <Button type="submit" size="xl" disabled={isSubmitting} className="w-full bg-primary text-primary-foreground font-semibold tracking-wide rounded-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60">
                {isSubmitting ? "Sending…" : "Send Message"}
              </Button>
            </form>

            {/* WhatsApp + Connect link */}
            <div className="mt-10 pt-8 border-t border-border space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                You can also reach us via WhatsApp:{" "}
                <a href="https://wa.me/237677938198" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">
                  +237 6 77 93 81 98
                </a>
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                For coaching, speaking, or partnership inquiries, please use our{" "}
                <Link to="/connect" className="text-primary font-semibold hover:underline">
                  detailed intake form →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
