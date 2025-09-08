import { useState, lazy, Suspense } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import GlobalLoader from "./components/GlobalLoader";

// Lazy load heavy components
const MapComponent = lazy(() => import("./components/OptimizedMapComponent"));

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
        <div className="flex-shrink-0 p-4 hidden lg:block h-screen">
          <Sidebar />
        </div>
        <div className="flex-1 h-screen">
          {/* Your main map or content goes here */}
          <div className="h-full w-full p-4 lg:pl-0">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B6B55] mx-auto mb-4"></div>
                    <p className="text-[#8B6B55] font-medium">Loading Map...</p>
                  </div>
                </div>
              }
            >
              <MapComponent />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Global Loader */}
      <GlobalLoader />
    </>
  );
}

export default App;
