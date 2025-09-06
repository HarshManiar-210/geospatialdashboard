import { useDispatch, useSelector } from "react-redux";
import { TreePine, Layers, Waves, MapPin } from "lucide-react";
import { toggleMapPopup, closeMapPopup } from "../store/mapSlice";

export default function Sidebar() {
  const dispatch = useDispatch();
  const active = useSelector((state) =>
    state.map.showMapPopup ? "Map" : null
  );

  const buttons = [
    { id: "Theme", label: "Theme", icon: <TreePine size={24} /> },
    { id: "Layers", label: "Layers", icon: <Layers size={24} /> },
    { id: "Water", label: "Water Shade Basin", icon: <Waves size={24} /> },
    { id: "Map", label: "Map", icon: <MapPin size={24} /> },
  ];

  const handleClick = (id) => {
    if (id === "Map") {
      dispatch(toggleMapPopup());
    } else {
      dispatch(closeMapPopup());
    }
  };

  return (
    <div className="flex flex-col items-center bg-[#8B6B55] text-white h-screen w-20 p-4 gap-6 rounded-xl">
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
