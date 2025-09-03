import { Home, MessageCircle, Settings, Crown } from "lucide-react";
import { useLocation, Link } from "react-router-dom";

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Swipe", path: "/swipe", color: "text-neon-cyan" },
    { icon: MessageCircle, label: "Matches", path: "/matches", color: "text-neon-cyan" },
    { icon: Settings, label: "Settings", path: "/settings", color: "text-neon-cyan" },
    { icon: Crown, label: "Upgrade", path: "/upgrade", color: "text-radiant-gold" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-700/50 z-50">
      <div className="flex justify-around items-center py-2 px-4">
        {navItems.map(({ icon: Icon, label, path, color }) => {
          const isActive = location.pathname === path;
          
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all duration-300 ${
                isActive 
                  ? `${color} bg-slate-800/60 shadow-neon` 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon size={20} className={isActive ? "glow-cyan" : ""} />
              <span className="text-xs font-medium">{label}</span>
              {label === "Upgrade" && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-radiant-gold rounded-full animate-pulse"></div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;