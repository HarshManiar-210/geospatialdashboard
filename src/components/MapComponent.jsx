import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useSelector, useDispatch } from "react-redux";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ZoomControl from "./ZoomControl";
import MapLayerPopup from "./MapLayerPopup";
import { closeMapPopup, setActiveLayer } from "../store/mapSlice";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const tileUrls = {
  osm: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  satellite:
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  terrain:
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
  hybrid: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
};

export default function MapComponent() {
  const center = [23.2803, 74.2684];
  const dispatch = useDispatch();
  const { showMapPopup, activeLayer } = useSelector((state) => state.map);

  const handleLayerChange = (layerId) => {
    dispatch(setActiveLayer(layerId));
  };

  const handleClosePopup = () => {
    dispatch(closeMapPopup());
  };

  return (
    <div className="relative h-screen w-full border rounded-xl overflow-hidden">
      <MapContainer
        center={center}
        zoom={8}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          url={tileUrls[activeLayer]}
          attribution="&copy; OpenStreetMap contributors"
        />
        <Marker position={center}>
          <Popup>Custom Center Point</Popup>
        </Marker>
        <ZoomControl />
      </MapContainer>

      {showMapPopup && (
        <MapLayerPopup
          activeLayer={activeLayer}
          onClose={handleClosePopup}
          onChange={handleLayerChange}
        />
      )}
    </div>
  );
}
