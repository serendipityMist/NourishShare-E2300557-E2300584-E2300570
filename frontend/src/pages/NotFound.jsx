import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-lg paper-texture text-center">
      <span className="material-symbols-outlined text-primary text-[64px] mb-md">search_off</span>
      <h1 className="font-headline-lg text-headline-lg text-primary mb-sm">Page not found</h1>
      <p className="font-body-md text-on-surface-variant mb-lg max-w-md">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link to="/">
        <Button icon="home">Back to Home</Button>
      </Link>
    </div>
  );
}
