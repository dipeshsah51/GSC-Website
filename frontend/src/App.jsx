import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ScrollToTop from "./components/common/ScrollToTop";
import FloatingActions from "./components/common/FloatingActions";

import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import ServiceDetails from "./pages/ServiceDetails";
import Team from "./pages/Team";
import Projects from "./pages/Projects";
import Gallery from "./pages/Gallery";
import Testimonials from "./pages/Testimonials";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import RequestQuote from "./pages/RequestQuote";
import CompanyPrivacy from "./pages/CompanyPrivacy";
import CompanyTerms from "./pages/CompanyTerms";
import AdminPortal from "./pages/AdminPortal";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:slug" element={<ServiceDetails />} />
        <Route path="/team" element={<Team />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/request-quote" element={<RequestQuote />} />
        <Route path="/admin" element={<AdminPortal />} />
        <Route path="/admin/login" element={<AdminPortal />} />
        <Route path="/privacy-policy" element={<CompanyPrivacy />} />
        <Route path="/terms" element={<CompanyTerms />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
      <FloatingActions />
    </BrowserRouter>
  );
}

export default App;