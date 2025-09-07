import { useDispatch, useSelector } from "react-redux";
import { TreePine, Layers, Waves, MapPin } from "lucide-react";
import { toggleMapPopup, closeMapPopup } from "../store/mapSlice";
import { toggleLayersPopup, closeLayersPopup } from "../store/layersSlice";
import { toggleThemePopup, closeThemePopup } from "../store/themeSlice";
import {
  toggleWaterShadeBasinPopup,
  closeWaterShadeBasinPopup,
} from "../store/waterShadeBasinSlice";

import { X } from "lucide-react";

export default function Sidebar({ isMobile = false, onClose }) {
  const dispatch = useDispatch();
  const active = useSelector((state) => {
    if (state.map.showMapPopup) return "Map";
    if (state.layers.showLayersPopup) return "Layers";
    if (state.theme.showThemePopup) return "Theme";
    if (state.waterShadeBasin.showWaterShadeBasinPopup) return "Water";
    return null;
  });

  const buttons = [
    { id: "Theme", label: "Theme", icon: <TreePine size={24} /> },
    { id: "Layers", label: "Layers", icon: <Layers size={24} /> },
    { id: "Water", label: "Water Shade Basin", icon: <Waves size={24} /> },
    { id: "Map", label: "Map", icon: <MapPin size={24} /> },
  ];

  const handleClick = (id) => {
    if (id === "Map") {
      dispatch(toggleMapPopup());
      dispatch(closeLayersPopup());
      dispatch(closeThemePopup());
      dispatch(closeWaterShadeBasinPopup());
    } else if (id === "Layers") {
      dispatch(toggleLayersPopup());
      dispatch(closeMapPopup());
      dispatch(closeThemePopup());
      dispatch(closeWaterShadeBasinPopup());
    } else if (id === "Theme") {
      dispatch(toggleThemePopup());
      dispatch(closeMapPopup());
      dispatch(closeLayersPopup());
      dispatch(closeWaterShadeBasinPopup());
    } else if (id === "Water") {
      dispatch(toggleWaterShadeBasinPopup());
      dispatch(closeMapPopup());
      dispatch(closeLayersPopup());
      dispatch(closeThemePopup());
    } else {
      dispatch(closeMapPopup());
      dispatch(closeLayersPopup());
      dispatch(closeThemePopup());
      dispatch(closeWaterShadeBasinPopup());
    }

    // Close mobile menu after selection
    if (isMobile && onClose) {
      onClose();
    }
  };

  if (isMobile) {
    return (
      <div className="h-full bg-white flex flex-col">
        {/* Mobile Header with logos and close */}
        <div className="flex items-center justify-between p-4 bg-[#8F6E56]">
          <div className="flex items-center gap-4">
            <img src="/tgis-logo.png" alt="TGIS Logo" className="h-6 w-auto" />
            <img
              src="/indasu-logo.png"
              alt="Indasu Logo"
              className="h-10 w-auto"
            />
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-[#a17e65] rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu Title */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Menu</span>
          </div>
        </div>

        {/* Mobile Menu Items */}
        <div className="flex-1 p-4">
          <div className="space-y-2">
            {buttons?.map((btn) => (
              <button
                key={btn.id}
                onClick={() => handleClick(btn.id)}
                className="flex items-center gap-4 w-full p-4 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                {btn.icon}
                <span className="text-base text-gray-700">{btn.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Desktop Sidebar
  return (
    <div className="flex flex-col items-center bg-[#8B6B55] text-white h-full w-20 p-4 gap-6 rounded-xl">
      {buttons?.map((btn) => (
        <button
          key={btn.id}
          onClick={() => handleClick(btn.id)}
          className={`flex flex-col items-center justify-center w-16 h-18 rounded-xl transition-all cursor-pointer ${
            active === btn.id ? "bg-white text-[#8B6B55]" : "hover:bg-[#a17e65]"
          }`}
        >
          {btn.icon}
          <span className="text-xs text-center">{btn.label}</span>
        </button>
      ))}
    </div>
  );
}
