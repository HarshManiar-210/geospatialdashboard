import { Menu, X } from "lucide-react";

export default function Navbar({ isMobileMenuOpen, onMobileMenuToggle }) {
  return (
    <nav className="w-full bg-[#8F6E56] px-4 py-3 lg:px-4 lg:py-2 relative z-[1000]">
      <div className="flex items-center justify-between">
        {/* Left side - TGIS Logo */}
        <div className="flex items-center">
          <img
            src="/tgis-logo.png"
            alt="TGIS Logo"
            className="h-8 w-auto lg:h-10"
          />
        </div>

        {/* Center - Title */}
        <div className="flex-1 text-center">
          <h1 className="text-sm lg:text-2xl font-bold text-white font-['Inter']">
            HYDROTERRAIN MAP
          </h1>
        </div>

        {/* Right side - Mobile Menu Button / Desktop Indasu Logo */}
        <div className="flex items-center">
          {/* Mobile Menu Button */}
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden text-white p-2 hover:bg-[#a17e65] rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Desktop Indasu Logo */}
          <img
            src="/indasu-logo.png"
            alt="Indasu Logo"
            className="hidden lg:block h-20 w-auto"
          />
        </div>
      </div>
    </nav>
  );
}
