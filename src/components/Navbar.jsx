export default function Navbar() {
  return (
    <nav className="w-full bg-[#8F6E56] px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - TGIS Logo */}
        <div className="flex items-center">
          <img src="/tgis-logo.png" alt="TGIS Logo" className="h-16 w-auto" />
        </div>

        {/* Center - Title */}
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-bold text-white font-['Inter']">
            HYDROTERRAIN MAP
          </h1>
        </div>

        {/* Right side - Indasu Logo */}
        <div className="flex items-center">
          <img
            src="/indasu-logo.png"
            alt="Indasu Logo"
            className="h-16 w-auto"
          />
        </div>
      </div>
    </nav>
  );
}
