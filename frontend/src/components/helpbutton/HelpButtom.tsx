import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

function HelpButtom() {
  return (
    <Link
      to="/ayuda"
      title="Guía de Ayuda"
      aria-label="Guía de Ayuda"
      className="inline-flex items-center justify-center p-2 rounded-xl text-violet-100 hover:bg-white/15 hover:text-white transition-colors"
    >
      <HelpCircle className="h-5 w-5" />
    </Link>
  );
}

export default HelpButtom;
