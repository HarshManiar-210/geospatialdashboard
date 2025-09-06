import "./App.css";
import MapComponent from "./components/MapComponent";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
function App() {
  return (
    <>
      <Navbar />
      <div className="flex">
        <div className="flex-shrink-0 p-4">
          <Sidebar />
        </div>
        <div className="flex-1">
          {/* Your main map or content goes here */}
          <div className="h-screen w-full p-4">
            <MapComponent />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
