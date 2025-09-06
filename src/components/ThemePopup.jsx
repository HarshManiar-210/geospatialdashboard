import { X, ChevronDown, TreePine, Droplets, Mountain } from "lucide-react";
import { useState } from "react";

const iconMap = {
  TreePine: TreePine,
  Droplets: Droplets,
  Mountain: Mountain,
};

export default function ThemePopup({
  themes,
  selectedTheme,
  selectedSubTheme,
  onClose,
  onThemeChange,
  onSubThemeChange,
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const currentTheme = themes.find((theme) => theme.id === selectedTheme);
  const CurrentIcon = currentTheme ? iconMap[currentTheme.icon] : TreePine;

  const handleThemeSelect = (themeId) => {
    onThemeChange(themeId);
    setIsDropdownOpen(false);
  };

  return (
    <div className="absolute top-4 left-4 bg-white shadow-lg rounded-xl p-4 w-64 z-[1000]">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-bold text-lg text-[#8B6B55]">Select Theme</h2>
        <button onClick={onClose}>
          <X size={20} className="text-gray-600 hover:text-black" />
        </button>
      </div>

      {/* Main Theme Dropdown */}
      <div className="relative mb-4">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <CurrentIcon size={20} className="text-green-600" />
            <span className="text-sm font-medium">
              {currentTheme?.label}
              {currentTheme?.isDefault && (
                <span className="ml-2 text-xs text-gray-500">(default)</span>
              )}
            </span>
          </div>
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Options */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
            {themes.map((theme) => {
              const IconComponent = iconMap[theme.icon];
              return (
                <button
                  key={theme.id}
                  onClick={() => handleThemeSelect(theme.id)}
                  className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors ${
                    selectedTheme === theme.id ? "bg-gray-100" : ""
                  }`}
                >
                  <IconComponent
                    size={20}
                    className={
                      theme.id === "landuse"
                        ? "text-green-600"
                        : theme.id === "hydrology"
                        ? "text-blue-600"
                        : "text-orange-600"
                    }
                  />
                  <span className="text-sm font-medium">{theme.label}</span>
                  {theme.isDefault && (
                    <span className="ml-auto text-xs text-gray-500">
                      (default)
                    </span>
                  )}
                  {selectedTheme === theme.id && (
                    <span className="ml-auto text-green-600">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Sub-theme Selection for Terrain */}
      {selectedTheme === "terrain" && currentTheme?.subThemes && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Select Sub-theme:
          </h3>
          {currentTheme.subThemes.map((subTheme) => (
            <label
              key={subTheme.id}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="subTheme"
                value={subTheme.id}
                checked={selectedSubTheme === subTheme.id}
                onChange={() => onSubThemeChange(subTheme.id)}
                className="w-4 h-4 text-[#8B6B55] bg-gray-100 border-gray-300"
              />
              <span className="text-sm text-gray-700">{subTheme.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
