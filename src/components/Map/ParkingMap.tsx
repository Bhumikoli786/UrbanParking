import React, { useState } from 'react';
import { ParkingFacility } from '../../types';
import { Navigation, Zap, Compass, Crosshair, ZoomIn, ZoomOut, Layers } from 'lucide-react';

interface ParkingMapProps {
  facilities: ParkingFacility[];
  selectedFacility: ParkingFacility | null;
  onSelectFacility: (facility: ParkingFacility) => void;
  navigationFacility?: ParkingFacility | null;
  isNavigating?: boolean;
}

export const ParkingMap: React.FC<ParkingMapProps> = ({
  facilities,
  selectedFacility,
  onSelectFacility,
  navigationFacility,
  isNavigating = false,
}) => {
  const [zoom, setZoom] = useState(1);
  const [mapStyle, setMapStyle] = useState<'standard' | 'dark' | 'satellite'>('standard');

  // Center around Mumbai BKC coordinates normalized to SVG viewport (800 x 600)
  // Base center: 19.0664, 72.8679
  const mapCenter = { lat: 19.0664, lng: 72.8679 };

  const projectToSvg = (lat: number, lng: number) => {
    // Proportional mapping to 800x600 viewBox
    const latSpan = 0.35;
    const lngSpan = 0.35;
    const x = 400 + ((lng - mapCenter.lng) / lngSpan) * 600;
    const y = 300 - ((lat - mapCenter.lat) / latSpan) * 500;
    return {
      x: Math.max(50, Math.min(750, x)),
      y: Math.max(50, Math.min(550, y)),
    };
  };

  const userPos = projectToSvg(19.0680, 72.8650);

  const getMarkerColor = (fac: ParkingFacility) => {
    if (fac.status === 'FULL') return '#ef4444'; // Red
    if (fac.status === 'LIMITED') return '#f59e0b'; // Amber
    if (fac.evChargingAvailable) return '#06b6d4'; // Cyan
    return '#10b981'; // Emerald
  };

  const navTargetPos = navigationFacility ? projectToSvg(navigationFacility.latitude, navigationFacility.longitude) : null;

  return (
    <div className="relative w-full h-[420px] md:h-[520px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 select-none shadow-sm">
      {/* Map Control Tools */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <div className="bg-white/95 backdrop-blur-md rounded-xl p-1 shadow-md border border-slate-200 flex flex-col items-center">
          <button
            onClick={() => setZoom(prev => Math.min(1.4, prev + 0.15))}
            className="w-9 h-9 flex items-center justify-center text-slate-700 hover:text-slate-950 hover:bg-slate-50 rounded-lg transition-colors"
            title="Zoom In"
            aria-label="Zoom in on map"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-5 h-px bg-slate-200 my-0.5" />
          <button
            onClick={() => setZoom(prev => Math.max(0.7, prev - 0.15))}
            className="w-9 h-9 flex items-center justify-center text-slate-700 hover:text-slate-950 hover:bg-slate-50 rounded-lg transition-colors"
            title="Zoom Out"
            aria-label="Zoom out on map"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => setMapStyle(s => (s === 'standard' ? 'dark' : s === 'dark' ? 'satellite' : 'standard'))}
          className="w-10 h-10 bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition-colors"
          title={`Switch map layer (Current: ${mapStyle})`}
          aria-label="Switch map layer"
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Map Status Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-md rounded-xl px-3 py-2 shadow-md border border-slate-200 hidden sm:flex items-center gap-4 text-xs font-medium text-slate-700">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" />
          <span>Limited</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm" />
          <span>Full</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-sm" />
          <span>EV Fast Hub</span>
        </div>
      </div>

      {/* Real-time Map Canvas */}
      <div
        className="w-full h-full transition-transform duration-300 origin-center"
        style={{ transform: `scale(${zoom})` }}
      >
        <svg
          viewBox="0 0 800 600"
          className={`w-full h-full ${
            mapStyle === 'dark' 
              ? 'bg-slate-900' 
              : mapStyle === 'satellite' 
              ? 'bg-[#1b272c]' 
              : 'bg-[#edf2f7]'
          }`}
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke={mapStyle === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}
                strokeWidth="1"
              />
            </pattern>
            {/* Pulsing ring filter */}
            <radialGradient id="userGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Grid background */}
          <rect width="800" height="600" fill="url(#grid)" />

          {/* Coastline / Creek / Waterway (Mahim Bay / Mithi River simulation) */}
          <path
            d="M 50,0 Q 140,240 180,360 T 120,600 L 0,600 L 0,0 Z"
            fill={mapStyle === 'dark' ? '#0f172a' : '#bfdbfe'}
            opacity={0.6}
          />

          {/* Urban Green Spaces / Parks (Bandra Reclamation, BKC City Park) */}
          <rect
            x="240"
            y="180"
            width="120"
            height="90"
            rx="16"
            fill={mapStyle === 'dark' ? '#14291f' : '#dcfce7'}
            opacity={0.7}
          />
          <text
            x="300"
            y="230"
            textAnchor="middle"
            fill={mapStyle === 'dark' ? '#4ade80' : '#15803d'}
            fontSize="10"
            fontWeight="600"
          >
            BKC Urban Park
          </text>

          {/* Major Expressways & Arterial Roads */}
          {/* Western Express Highway */}
          <path
            d="M 190,0 Q 220,200 240,400 T 260,600"
            fill="none"
            stroke={mapStyle === 'dark' ? '#334155' : '#cbd5e1'}
            strokeWidth="18"
            strokeLinecap="round"
          />
          <path
            d="M 190,0 Q 220,200 240,400 T 260,600"
            fill="none"
            stroke={mapStyle === 'dark' ? '#475569' : '#f8fafc'}
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Bandra-Kurla Link Road */}
          <path
            d="M 100,280 Q 320,310 650,290 T 780,260"
            fill="none"
            stroke={mapStyle === 'dark' ? '#334155' : '#cbd5e1'}
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path
            d="M 100,280 Q 320,310 650,290 T 780,260"
            fill="none"
            stroke={mapStyle === 'dark' ? '#475569' : '#f8fafc'}
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Cross Street 1 */}
          <path
            d="M 380,80 L 410,540"
            fill="none"
            stroke={mapStyle === 'dark' ? '#1e293b' : '#e2e8f0'}
            strokeWidth="8"
          />
          {/* Cross Street 2 */}
          <path
            d="M 520,100 L 540,520"
            fill="none"
            stroke={mapStyle === 'dark' ? '#1e293b' : '#e2e8f0'}
            strokeWidth="8"
          />
          {/* Avenue */}
          <path
            d="M 220,440 L 700,430"
            fill="none"
            stroke={mapStyle === 'dark' ? '#1e293b' : '#e2e8f0'}
            strokeWidth="8"
          />

          {/* Active Navigation Route (when navigating) */}
          {navTargetPos && isNavigating && (
            <g>
              <path
                d={`M ${userPos.x},${userPos.y} Q ${(userPos.x + navTargetPos.x) / 2 + 30},${
                  (userPos.y + navTargetPos.y) / 2 - 20
                } ${navTargetPos.x},${navTargetPos.y}`}
                fill="none"
                stroke="#2563eb"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="8 4"
                className="animate-pulse"
              />
              <path
                d={`M ${userPos.x},${userPos.y} Q ${(userPos.x + navTargetPos.x) / 2 + 30},${
                  (userPos.y + navTargetPos.y) / 2 - 20
                } ${navTargetPos.x},${navTargetPos.y}`}
                fill="none"
                stroke="#60a5fa"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </g>
          )}

          {/* Current User Location Dot */}
          <g transform={`translate(${userPos.x}, ${userPos.y})`}>
            <circle r="22" fill="url(#userGlow)" className="animate-ping" opacity={0.4} />
            <circle r="9" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />
            <circle r="4" fill="#ffffff" />
            {/* User heading cone */}
            <path d="M 0,-16 L -5,-10 L 5,-10 Z" fill="#2563eb" />
          </g>

          {/* Facilities Interactive Markers */}
          {facilities.map(facility => {
            const pos = projectToSvg(facility.latitude, facility.longitude);
            const isSelected = selectedFacility?.id === facility.id;
            const markerColor = getMarkerColor(facility);

            return (
              <g
                key={facility.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => onSelectFacility(facility)}
                className="cursor-pointer group"
              >
                {/* Glow ring if selected */}
                {isSelected && (
                  <circle
                    r="26"
                    fill="none"
                    stroke={markerColor}
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    className="animate-spin"
                    opacity={0.8}
                  />
                )}

                {/* Marker Pin Head */}
                <path
                  d="M 0,0 C -14,-14 -14,-28 0,-40 C 14,-28 14,-14 0,0 Z"
                  fill={isSelected ? '#0f172a' : '#ffffff'}
                  stroke={markerColor}
                  strokeWidth="3"
                  className="transition-transform group-hover:scale-110 drop-shadow-md"
                />

                {/* Center Badge / Content */}
                <circle
                  cx="0"
                  cy="-24"
                  r="10"
                  fill={markerColor}
                />

                {facility.evChargingAvailable ? (
                  <text
                    x="0"
                    y="-20.5"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="800"
                    className="font-mono"
                  >
                    ⚡
                  </text>
                ) : (
                  <text
                    x="0"
                    y="-20"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="800"
                    className="font-mono tabular-nums"
                  >
                    P
                  </text>
                )}

                {/* Floating pill with live count & price */}
                <g transform="translate(0, -50)">
                  <rect
                    x="-42"
                    y="-14"
                    width="84"
                    height="22"
                    rx="11"
                    fill="#0f172a"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1"
                    className="drop-shadow-lg"
                  />
                  <text
                    x="0"
                    y="1"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="600"
                    className="font-mono tabular-nums"
                  >
                    {facility.availableSlots} free · ₹{facility.pricePerHour}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Recenter / Geolocation Button */}
      <button
        onClick={() => setZoom(1)}
        className="absolute bottom-4 right-4 z-20 w-11 h-11 bg-white rounded-xl shadow-lg border border-slate-200 flex items-center justify-center text-blue-600 hover:bg-slate-50 transition-colors"
        title="Recenter to current location"
        aria-label="Recenter map"
      >
        <Crosshair className="w-5 h-5" />
      </button>
    </div>
  );
};
