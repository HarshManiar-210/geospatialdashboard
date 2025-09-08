import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";

export default function GlobalLoader() {
  const { isLoading: riverLoading, loadingMessage: riverMessage } = useSelector(
    (state) => state.river
  );
  const { isLoading: layersLoading, loadingMessage: layersMessage } =
    useSelector((state) => state.layers);

  // Show loader if any part of the app is loading
  const isLoading = riverLoading || layersLoading;
  const message = riverMessage || layersMessage || "Loading...";

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-xl p-6 shadow-2xl max-w-sm mx-4">
        <div className="flex items-center gap-4">
          <Loader2 className="h-8 w-8 text-[#8B6B55] animate-spin" />
          <div>
            <h3 className="font-semibold text-gray-900">Loading</h3>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        </div>

        {/* Progress bar animation */}
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-[#8B6B55] h-2 rounded-full animate-pulse"
            style={{ width: "60%" }}
          ></div>
        </div>
      </div>
    </div>
  );
}

