import {
  HeroSection,
  BooksSection,
  AboutSection,
  TransformationSection,
  ProgramsSection,
  EventsSection,
  EcosystemSection,
  GallerySection,
  TestimonialsSection,
  ContactSection,
} from "@/components/sections";

const Index = () => {
  return (
    <>
      <HeroSection />

      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Authority Proof — Books & Stats */}
      <BooksSection />

      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* About Preview */}
      <AboutSection />

      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Transformation Framework */}
      <TransformationSection />

      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Services */}
      <ProgramsSection />

      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Media, Speaking & Global Impact */}
      <EventsSection />

      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* The Ecosystem */}
      <EcosystemSection />

      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Authority Strip — Gallery */}
      <GallerySection />

      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Lives Transformed — Testimonials */}
      <TestimonialsSection />

      {/* Closing CTA */}
      <ContactSection />
    </>
  );
};

export default Index;
