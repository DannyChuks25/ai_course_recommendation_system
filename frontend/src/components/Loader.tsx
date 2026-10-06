import React from 'react';

interface LoaderProps {
  message?: string;
}

const Loader: React.FC<LoaderProps> = ({ message = 'Analyzing your profile...' }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-fadeIn">
      <div className="flex flex-col items-center gap-6 animate-scaleIn">
        {/* Orbital spinner */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-2 border-slate-800" />
          <div className="absolute inset-0 rounded-full border-t-2 border-amber-400 animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-slate-800" />
          <div
            className="absolute inset-2 rounded-full border-b-2 border-orange-500 animate-spin"
            style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
          </div>
        </div>

        <div className="text-center">
          <p className="text-amber-400 font-mono text-sm tracking-wider uppercase animate-pulse">
            {message}
          </p>
          <div className="flex gap-1 justify-center mt-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
