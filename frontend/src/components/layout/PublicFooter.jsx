import { Link } from 'react-router-dom';
import logoImg from '../../assets/logoo.png';

export default function PublicFooter() {
  return (
    <footer className="bg-surface-container py-xl border-t border-outline-variant">
      <div className="max-w-7xl mx-auto px-lg grid grid-cols-1 md:grid-cols-4 gap-xl">
        <div className="md:col-span-1">
          <div className="flex items-center gap-sm mb-md">
            <img src={logoImg} alt="NourishShare" className="h-24 w-24 rounded-lg object-cover" />
          </div>
          <p className="font-label-sm text-on-surface-variant mb-lg">
            A digital ecosystem for mindful consumption and food waste reduction in Malaysia.
          </p>
          <div className="flex gap-md">
            <a
              className="w-8 h-8 flex items-center justify-center border border-outline rounded-full text-primary hover:bg-primary hover:text-on-primary transition-all"
              href="#"
            >
              <span className="material-symbols-outlined text-sm">public</span>
            </a>
            <a
              className="w-8 h-8 flex items-center justify-center border border-outline rounded-full text-primary hover:bg-primary hover:text-on-primary transition-all"
              href="#"
            >
              <span className="material-symbols-outlined text-sm">share</span>
            </a>
          </div>
        </div>
        <div>
          <h4 className="font-label-md text-primary mb-md">Product</h4>
          <ul className="space-y-sm font-label-sm text-on-surface-variant">
            <li>
              <Link className="hover:text-primary" to="/features">
                Features
              </Link>
            </li>
            <li>
              <Link className="hover:text-primary" to="/how-it-works">
                How It Works
              </Link>
            </li>
            <li>
              <Link className="hover:text-primary" to="/register">
                Get Started
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-label-md text-primary mb-md">Company</h4>
          <ul className="space-y-sm font-label-sm text-on-surface-variant">
            <li>
              <Link className="hover:text-primary" to="/about">
                About Us
              </Link>
            </li>
            <li>
              <Link className="hover:text-primary" to="/contact">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-label-md text-primary mb-md">Contact</h4>
          <ul className="space-y-sm font-label-sm text-on-surface-variant">
            <li className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-sm">mail</span> hello@nourishshare.my
            </li>
            <li className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-sm">location_on</span> Kuala Lumpur, Malaysia
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-lg mt-xl pt-lg border-t border-outline-variant text-center">
        <p className="font-label-sm text-on-surface-variant/60">
          © 2026 NourishShare. Reducing food waste, one kitchen at a time.
        </p>
      </div>
    </footer>
  );
}
