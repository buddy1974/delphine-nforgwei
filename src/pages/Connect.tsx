import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const SERVICES = [
  { id: "coaching", label: "Coaching", icon: "✦", slugs: ["arise-align", "12-pillars"] },
  { id: "mentorship", label: "Mentorship", icon: "✧", slugs: ["mentorship", "streamline-business", "wives-on-fire", "singles-on-fire"] },
  { id: "prayer", label: "Prayer Request", icon: "🕊", slugs: [] },
  { id: "keynote", label: "Keynote Speaking", icon: "🎤", slugs: ["speaking"] },
  { id: "conference", label: "Conference Invitation", icon: "📋", slugs: ["conference"] },
  { id: "marriage", label: "School of Marriage Counseling & Coaching", icon: "💍", slugs: ["marriage-school"] },
  { id: "general", label: "General Inquiry", icon: "💬", slugs: [] },
] as const;

type ServiceId = (typeof SERVICES)[number]["id"];

/** Map program slugs → service id */
const SLUG_TO_SERVICE: Record<string, ServiceId> = {};
SERVICES.forEach((s) => s.slugs.forEach((slug) => { SLUG_TO_SERVICE[slug] = s.id; }));

/** Slug → human-readable program name for prefill context */
const SLUG_LABELS: Record<string, string> = {
  "arise-align": "Arise to Align — Group Coaching",
  "12-pillars": "The 12 Pillars of Elevation",
  "streamline-business": "Streamline Your Business",
  "wives-on-fire": "Wives on Fire Community",
  "singles-on-fire": "Singles on Fire Community",
  "marriage-school": "School of Marriage Counseling & Coaching",
  "mentorship": "Private Mentorship",
  "speaking": "Speaking Engagements",
  "conference": "Conference Invitation",
};

const Connect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const formRef = useRef<HTMLDivElement>(null);

  const programSlug = searchParams.get("program") || "";
  const preselectedService = SLUG_TO_SERVICE[programSlug] || "";
  const programLabel = SLUG_LABELS[programSlug] || "";

  const [selectedService, setSelectedService] = useState<ServiceId | "">(preselectedService);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [message, setMessage] = useState(programLabel ? `I'm interested in: ${programLabel}` : "");
  const [contactMethod, setContactMethod] = useState<"email" | "whatsapp">("email");

  // Conditional fields
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [programType, setProgramType] = useState("");
  const [isConfidential, setIsConfidential] = useState("");

  const showEventFields = selectedService === "keynote" || selectedService === "conference";
  const showProgramField = selectedService === "coaching" || selectedService === "mentorship";
  const showConfidentialField = selectedService === "prayer";

  // Auto-scroll to form when arriving with a program query param
  useEffect(() => {
    if (preselectedService && formRef.current) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 400);
    }
  }, [preselectedService]);

  const handleServiceSelect = (id: ServiceId) => {
    setSelectedService(id);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  const validateEmail = (em: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !selectedService || !message.trim()) {
      toast({ title: "Missing Information", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    if (!validateEmail(email)) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const _formData = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        country: country.trim(),
        service: SERVICES.find((s) => s.id === selectedService)?.label ?? "",
        program: programLabel || undefined,
        message: message.trim(),
        contactMethod,
        ...(showEventFields && { eventDate, eventLocation }),
        ...(showProgramField && { programType }),
        ...(showConfidentialField && { isConfidential }),
      };

      navigate("/thank-you");
    } catch {
      toast({ title: "Submission Failed", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Service Selection */}
      <section className="py-20 lg:py-28 bg-secondary/30">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-5">
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: "hsl(38, 70%, 55%)" }}>
              Connect
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[2.85rem] font-bold text-foreground leading-tight">
              Let's Work Together
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {programLabel
                ? `You selected "${programLabel}." Confirm your interest below or choose a different service.`
                : "Select your area of interest and share a few details so we can serve you well."}
            </p>
          </div>

          {/* Service Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5 max-w-4xl mx-auto">
            {SERVICES.map((service) => (
              <button
                key={service.id}
                onClick={() => handleServiceSelect(service.id)}
                className={`group relative rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-0.5 cursor-pointer ${
                  selectedService === service.id
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-card text-foreground hover:shadow-md"
                }`}
                style={{
                  border:
                    selectedService === service.id
                      ? "2px solid hsl(var(--primary))"
                      : "1px solid hsla(288, 20%, 90%, 0.6)",
                }}
              >
                <span className="text-2xl block mb-3">{service.icon}</span>
                <span className="text-sm font-medium leading-snug block">{service.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section ref={formRef} className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          <div
            className="max-w-2xl mx-auto rounded-3xl p-8 sm:p-12"
            style={{
              background: "hsla(0, 0%, 100%, 0.7)",
              backdropFilter: "blur(20px)",
              border: "1px solid hsla(288, 20%, 90%, 0.5)",
              boxShadow: "0 8px 40px -12px hsla(288, 30%, 30%, 0.08)",
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" className="bg-background/60 focus:ring-primary/30" required />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="bg-background/60 focus:ring-primary/30" required />
              </div>

              {/* Phone & Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-foreground">Phone / WhatsApp</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+237 6 77 93 81 98" className="bg-background/60 focus:ring-primary/30" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-medium text-foreground">Country</Label>
                  <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Your country" className="bg-background/60 focus:ring-primary/30" />
                </div>
              </div>

              {/* Service (auto-filled) */}
              <div className="space-y-2">
                <Label htmlFor="service" className="text-sm font-medium text-foreground">
                  Service <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="service"
                  value={SERVICES.find((s) => s.id === selectedService)?.label ?? ""}
                  readOnly
                  placeholder="Select a service above"
                  className="bg-secondary/50 cursor-default"
                  required
                />
              </div>

              {/* Conditional: Event fields */}
              {showEventFields && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                  <div className="space-y-2">
                    <Label htmlFor="eventDate" className="text-sm font-medium text-foreground">Event Date</Label>
                    <Input id="eventDate" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="bg-background/60" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventLocation" className="text-sm font-medium text-foreground">Event Location</Label>
                    <Input id="eventLocation" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} placeholder="City, Country" className="bg-background/60" />
                  </div>
                </div>
              )}

              {/* Conditional: Program type */}
              {showProgramField && (
                <div className="space-y-2 animate-fade-in">
                  <Label htmlFor="programType" className="text-sm font-medium text-foreground">Program Format</Label>
                  <select
                    id="programType"
                    value={programType}
                    onChange={(e) => setProgramType(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background/60 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select format</option>
                    <option value="1:1">1:1 Program</option>
                    <option value="group">Group Program</option>
                  </select>
                </div>
              )}

              {/* Conditional: Confidential */}
              {showConfidentialField && (
                <div className="space-y-2 animate-fade-in">
                  <Label htmlFor="confidential" className="text-sm font-medium text-foreground">Is this confidential?</Label>
                  <select
                    id="confidential"
                    value={isConfidential}
                    onChange={(e) => setIsConfidential(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background/60 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              )}

              {/* Preferred Contact */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Preferred Contact Method</Label>
                <div className="flex gap-4">
                  {(["email", "whatsapp"] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setContactMethod(method)}
                      className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        contactMethod === method
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {method === "email" ? "Email" : "WhatsApp"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium text-foreground">
                  Message <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us more about what you're looking for…"
                  className="bg-background/60 min-h-[120px] focus:ring-primary/30"
                  required
                />
              </div>

              {/* Submit */}
              <div className="pt-4">
                <Button
                  type="submit"
                  size="xl"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-primary-foreground font-semibold tracking-wide rounded-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60"
                >
                  {isSubmitting ? "Sending…" : "Send Your Request"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Connect;
