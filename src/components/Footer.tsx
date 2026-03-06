import { Link } from "react-router-dom";
import { Facebook, Instagram, MessageCircle } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

const quickLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Programs", path: "/programs" },
  { label: "Books", path: "/books" },
  { label: "Events", path: "/events" },
  { label: "Gallery", path: "/gallery" },
  { label: "Contact", path: "/contact" },
];

const Footer = () => {
  return (
    <footer>
      {/* White logo bar */}
      <div className="bg-white py-10 flex justify-center border-b border-gray-100">
        <div style={{ maxWidth: 260 }}>
          <BrandLogo variant="color" />
        </div>
      </div>

      {/* Main footer — dark */}
      <div className="bg-purple-deep text-primary-foreground">
      <div className="container mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand + Ecosystem */}
          <div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed max-w-xs">
              Empowering lives through purpose, faith, and transformation.
            </p>
            <p className="text-primary-foreground/40 text-xs mt-5 mb-2 uppercase tracking-widest">
              Part of the DRIMP Foundation ecosystem
            </p>
            <div className="space-y-1.5">
              <a href="https://www.drimpfoundation.org" target="_blank" rel="noopener noreferrer" className="block text-xs text-primary-foreground/55 hover:text-primary-foreground/90 transition-colors">
                DRIMP Foundation
              </a>
              <a href="https://www.smcc.solutions" target="_blank" rel="noopener noreferrer" className="block text-xs text-primary-foreground/55 hover:text-primary-foreground/90 transition-colors">
                SMCC — School of Marriage Counseling & Coaching
              </a>
              <a href="https://www.e-womanconference.online" target="_blank" rel="noopener noreferrer" className="block text-xs text-primary-foreground/55 hover:text-primary-foreground/90 transition-colors">
                E-Woman Conference
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Connect</h4>
            <div className="flex gap-4 mb-6">
              <a href="https://wa.me/237677938198" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors" aria-label="WhatsApp"><MessageCircle size={18} /></a>
              <a href="https://www.facebook.com/profile.php?id=100069101528488" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors" aria-label="Facebook"><Facebook size={18} /></a>
              <a href="https://www.instagram.com/delphine.nforgwei" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors" aria-label="Instagram"><Instagram size={18} /></a>
            </div>
            <a href="https://wa.me/237677938198" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              <MessageCircle size={16} />
              +237 6 77 93 81 98
            </a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10 text-center">
          <p className="text-sm text-primary-foreground/50">
            © {new Date().getFullYear()} Delphine Mah Nforgwei. All rights reserved.
          </p>
        </div>
      </div>
      </div>
    </footer>
  );
};

export default Footer;
