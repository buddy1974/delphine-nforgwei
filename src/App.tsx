import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import About from "./pages/About";
import Programs from "./pages/Programs";
import Books from "./pages/Books";
import Events from "./pages/Events";
import GalleryPage from "./pages/GalleryPage";
import Contact from "./pages/Contact";
import Connect from "./pages/Connect";
import ThankYou from "./pages/ThankYou";
import NotFound from "./pages/NotFound";
import OsPage from "./pages/OsPage";
import { BlogIndex, BlogPost } from "./pages/Blog";
import { OsEventsIndex, OsEventDetail } from "./pages/OsEvents";
import OsPreview from "./pages/OsPreview";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/books" element={<Books />} />
            <Route path="/events" element={<Events />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/connect" element={<Connect />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/p/:slug" element={<OsPage />} />
            <Route path="/blog" element={<BlogIndex />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/os-events" element={<OsEventsIndex />} />
            <Route path="/os-events/:slug" element={<OsEventDetail />} />
            <Route path="/os-preview/delphine" element={<OsPreview />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
