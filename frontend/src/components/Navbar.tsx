import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();
  if (pathname !== '/') return null; // Recommend/Results have their own headers

  return (
    <nav className="relative z-10 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link
          to="/"
          className="text-white font-black text-lg tracking-tight inline-block transition-transform duration-200 hover:scale-[1.03]"
        >
          Course<span className="text-amber-400">Finder</span>
        </Link>
        <div className="flex gap-6 text-sm font-mono">
          {[
            { to: '/', label: 'Home' },
            { to: '/recommend', label: 'Get Started' },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="relative text-slate-400 hover:text-amber-400 transition-colors duration-150 group"
            >
              {link.label}
              <span className="absolute left-0 -bottom-1 h-px w-0 bg-amber-400 transition-all duration-200 group-hover:w-full" />
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
