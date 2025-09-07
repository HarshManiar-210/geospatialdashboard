# Geospatial Dashboard

A comprehensive web-based geospatial dashboard for visualizing and analyzing spatial data of the Mahi River Basin region. This application provides interactive mapping capabilities with multiple themes, layer management, and statistical analysis tools.

## Features

### 🗺️ Interactive Mapping

- **Multi-theme Support**: Landuse, Terrain (Elevation, Slope, Aspect), and Hydrology themes
- **Layer Management**: Toggle visibility of boundaries, infrastructure, and thematic layers
- **Responsive Design**: Optimized for desktop and mobile devices
- **Coordinate Display**: Real-time mouse coordinate tracking

### 📊 Data Visualization

- **Dynamic Legends**: Context-aware legend display based on selected themes and layers
- **Statistical Analysis**: Comprehensive statistics popup for landuse data
- **Gradient Visualizations**: Detailed terrain analysis with color-coded gradients
- **Interactive Popups**: Layer-specific information and basin selection

### 🎨 User Interface

- **Modern UI/UX**: Clean, intuitive interface with Tailwind CSS
- **Collapsible Components**: Space-efficient design with expandable sections
- **Theme-based Styling**: Consistent color schemes across all components
- **Performance Optimized**: Lazy loading, memoization, and efficient rendering

## Technology Stack

- **Frontend**: React 18 with Vite
- **State Management**: Redux Toolkit
- **Mapping**: React-Leaflet with Leaflet
- **Styling**: Tailwind CSS
- **Data Visualization**: Chart.js
- **Geospatial Data**: GeoJSON, GeoTIFF
- **Build Tool**: Vite
- **Containerization**: Docker

## Project Structure

```
src/
├── components/           # React components
│   ├── MapComponent.jsx     # Main map container
│   ├── Legend.jsx           # Dynamic legend system
│   ├── Sidebar.jsx          # Navigation sidebar
│   ├── CoordinateDisplay.jsx # Mouse coordinates
│   ├── LayersPopup.jsx      # Layer management
│   ├── ThemePopup.jsx       # Theme selection
│   ├── StatisticsPopup.jsx  # Statistical analysis
│   └── WaterShadeBasinPopup.jsx # Basin selection
├── store/               # Redux store
│   ├── store.js            # Store configuration
│   ├── mapSlice.js         # Map state management
│   ├── layersSlice.js      # Layer visibility state
│   ├── themeSlice.js       # Theme selection state
│   ├── riverSlice.js       # River data management
│   └── waterShadeBasinSlice.js # Basin selection state
├── utils/               # Utility functions
│   ├── dataFormatter.js    # Data processing utilities
│   └── riverUtils.js       # River data utilities
└── assets/              # Static assets
```

## Data Sources

The application uses various geospatial datasets:

- **Boundaries**: District and Taluka boundaries
- **Infrastructure**: Roads, Railways, Canals
- **Terrain**: Elevation, Slope, Aspect (GeoTIFF)
- **Landuse**: Land cover classification
- **Hydrology**: River networks and basin boundaries

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd geospatialdashboard
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Docker Deployment

1. Build the Docker image:

```bash
docker build -t geospatial-dashboard .
```

2. Run the container:

```bash
docker run -p 80:80 geospatial-dashboard
```

## Usage

### Theme Selection

- Click the theme button to open the theme selection popup
- Choose from Landuse, Terrain, or Hydrology themes
- For Terrain theme, select sub-themes (Elevation, Slope, Aspect)

### Layer Management

- Use the layers popup to toggle individual layer visibility
- Layers are grouped into Boundaries and Infrastructure categories
- Individual layer selections override theme-based legends

### Statistical Analysis

- Available only for Landuse theme
- Select water shade basins to view detailed statistics
- View comprehensive charts and data analysis

### Legend System

- Dynamic legends adapt to selected themes and layers
- Detailed gradient legends for terrain analysis
- Auto-collapse when statistics popup is open

## Performance Optimizations

- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo, useMemo, useCallback for optimization
- **Efficient Rendering**: Optimized re-rendering strategies
- **Code Splitting**: Reduced initial bundle size

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

The project uses ESLint for code quality and consistency. Follow the established patterns for:

- Component structure
- State management with Redux Toolkit
- Styling with Tailwind CSS
- Geospatial data handling

## License

This is a proprietary project. All rights reserved.

## Support

For technical support or questions, please contact the development team.

---

**Note**: This application is designed for internal use and contains proprietary geospatial data. Ensure proper data handling and security measures are in place for production deployment.
