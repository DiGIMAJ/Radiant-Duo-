interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Logo = ({ size = "md", className = "" }: LogoProps) => {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-5xl"
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        {/* Crosshairs */}
        <div className="relative w-8 h-8 flex items-center justify-center">
          <div className="absolute w-6 h-0.5 bg-neon-cyan glow-cyan"></div>
          <div className="absolute w-0.5 h-6 bg-neon-cyan glow-cyan"></div>
          <div className="absolute w-4 h-4 border border-radiant-red rounded-full opacity-60"></div>
        </div>
      </div>
      <h1 className={`font-rajdhani font-bold ${sizeClasses[size]} bg-gradient-to-r from-radiant-red to-neon-cyan bg-clip-text text-transparent`}>
        <span className="text-radiant-red">RADIANT</span>
        <span className="text-neon-cyan">DUO</span>
      </h1>
    </div>
  );
};

export default Logo;