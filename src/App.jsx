import { useState } from "react";
import "./App.css";
import MapComponent from "./components/MapComponent";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <Navbar
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={handleMobileMenuToggle}
      />

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[2000] lg:hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={handleMobileMenuClose}
          />
          <div className="relative w-full max-w-sm h-full">
            <Sidebar isMobile={true} onClose={handleMobileMenuClose} />
          </div>
        </div>
      )}

      <div className="flex">
        <div className="flex-shrink-0 p-4 hidden lg:block">
          <Sidebar />
        </div>
        <div className="flex-1">
          {/* Your main map or content goes here */}
          <div className="h-screen w-full p-4 lg:pl-0">
            <MapComponent />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
