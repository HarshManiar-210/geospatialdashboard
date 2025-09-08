import { useSelector } from "react-redux";

export default function GlobalLoader() {
  const { isLoading: riverLoading } = useSelector((state) => state.river);
  const { isLoading: layersLoading } = useSelector((state) => state.layers);

  // Show loader if any part of the app is loading
  const isLoading = riverLoading || layersLoading;

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B6B55] mx-auto mb-4"></div>
        <p className="text-[#8B6B55] font-medium">Loading Map...</p>
      </div>
    </div>
  );
}
