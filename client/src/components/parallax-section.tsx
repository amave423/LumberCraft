import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ParallaxSectionProps {
  children: ReactNode;
  backgroundImage: string;
  className?: string;
  overlay?: string;
  minHeight?: string;
}

export default function ParallaxSection({ 
  children, 
  backgroundImage, 
  className,
  overlay = "bg-black/50",
  minHeight = "min-h-screen"
}: ParallaxSectionProps) {
  return (
    <section 
      className={cn("relative w-full", minHeight, className)}
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
      }}
    >
      <div className={cn("absolute inset-0", overlay)} />
      <div className="relative z-10 w-full h-full flex items-center justify-center py-16">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </div>
    </section>
  );
}
