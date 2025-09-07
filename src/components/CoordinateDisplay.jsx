import { Send } from "lucide-react";

export default function CoordinateDisplay({ coordinates }) {
  if (!coordinates) return null;

  const { lat, lng } = coordinates;

  return (
    <div className="hidden sm:block absolute bottom-4 right-4 bg-[#8B6B55] rounded-lg px-4 py-2 shadow-lg z-[9999] cursor-default pointer-events-none">
      <div className="flex items-center gap-2 text-white text-sm font-bold">
        <Send size={16} className="text-white" />
        <span>
          {lat.toFixed(6)}, {lng.toFixed(6)}
        </span>
      </div>
    </div>
  );
}
