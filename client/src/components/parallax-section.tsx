import { ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ParallaxSectionProps {
  children: ReactNode;
  backgroundImage: string;
  className?: string;
  overlay?: string;
}

export default function ParallaxSection({ 
  children, 
  backgroundImage, 
  className,
  overlay = "bg-black/50"
}: ParallaxSectionProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section 
      className={cn("relative overflow-hidden", className)}
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        transform: `translateY(${scrollY * 0.5}px)`
      }}
    >
      <div className={cn("absolute inset-0", overlay)} />
      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
}
