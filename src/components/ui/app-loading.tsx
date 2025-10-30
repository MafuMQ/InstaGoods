import { useEffect, useState } from "react";
import { LoadingSpinner } from "./loading-spinner";

export function AppLoading() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide the CSS loader once React takes over
    document.body.classList.add('app-loaded');
    
    // Show React loading for a minimum time to ensure smooth transition
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary to-secondary flex flex-col items-center justify-center z-50">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
          InstaGoods
        </h1>
        <LoadingSpinner size="lg" className="border-white/30 border-t-white mx-auto mb-4" />
        <p className="text-white/90 text-lg">
          Connecting you to local businesses...
        </p>
      </div>
    </div>
  );
}