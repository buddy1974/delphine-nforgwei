import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast({ title: "Missing Information", description: "Please fill in Name, Email, and Message.", variant: "destructive" });
      return;
    }
    const subject = encodeURIComponent(`Message from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}${phone ? `\nPhone / WhatsApp: ${phone}` : ""}\n\nMessage:\n${message}`
    );
    window.location.href = `mailto:nforgweimah@gmail.com?subject=${subject}&body=${body}`;
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
  };

  return (
    <>
      {/* Hero */}
      <section className="py-20 lg:py-28 bg-secondary/30">
        <div className="container mx-auto px-6 lg:px-12 text-center max-w-2xl space-y-5">
          <span
            className="inline-block text-xs font-semibold tracking-[0.2em] uppercase"
            style={{ color: "hsl(38, 70%, 55%)" }}
          >
            Contact
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-[2.85rem] font-bold text-foreground leading-tight">
            Connect with Delphine
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            For speaking engagements, mentorship inquiries, or partnership opportunities, reach out below.
          </p>
        </div>
      </section>

      {/* Form + WhatsApp */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-xl mx-auto space-y-8">

            {/* WhatsApp CTA — prominent above form */}
            <a
              href="https://wa.me/237677938198"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:opacity-90"
              style={{ background: "#25D366" }}
            >
              <MessageCircle size={20} />
              Chat on WhatsApp
            </a>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground tracking-widest uppercase">or send a message</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Form card */}
            <div
              className="rounded-3xl p-8 sm:p-12"
              style={{
                background: "hsla(0, 0%, 100%, 0.7)",
                backdropFilter: "blur(20px)",
                border: "1px solid hsla(288, 20%, 90%, 0.5)",
                boxShadow: "0 8px 40px -12px hsla(288, 30%, 30%, 0.08)",
              }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-foreground">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="bg-background/60"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="bg-background/60"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                    Phone / WhatsApp
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+237 6 00 00 00 00"
                    className="bg-background/60"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-medium text-foreground">
                    Message <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us how we can help…"
                    className="bg-background/60 min-h-[140px]"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  size="xl"
                  className="w-full bg-primary text-primary-foreground font-semibold tracking-wide rounded-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  Send Message
                </Button>
              </form>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
