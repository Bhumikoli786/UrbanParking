import React, { useState } from 'react';
import { Vehicle, SavedLocation, VehicleType, FuelType } from '../../types';
import { authService } from '../../services/authService';
import { Car, Zap, Plus, Trash2, CheckCircle2, MapPin, Briefcase, Home, Heart, X } from 'lucide-react';

interface VehicleGarageProps {
  onRefresh: () => void;
  onSelectLocationForSearch?: (address: string) => void;
}

export const VehicleGarage: React.FC<VehicleGarageProps> = ({
  onRefresh,
  onSelectLocationForSearch,
}) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(authService.getVehicles());
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>(authService.getSavedLocations());

  // Add Vehicle Modal State
  const [isAddVehModalOpen, setIsAddVehModalOpen] = useState(false);
  const [nickname, setNickname] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [makeModel, setMakeModel] = useState('');
  const [type, setType] = useState<VehicleType>('car');
  const [fuelType, setFuelType] = useState<FuelType>('petrol');

  // Add Location Modal State
  const [isAddLocModalOpen, setIsAddLocModalOpen] = useState(false);
  const [locName, setLocName] = useState('');
  const [locAddress, setLocAddress] = useState('');
  const [locIcon, setLocIcon] = useState<'home' | 'briefcase' | 'heart' | 'map-pin'>('briefcase');

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleNumber.trim() || !makeModel.trim()) return;

    authService.addVehicle({
      nickname: nickname.trim() || makeModel.trim(),
      vehicleNumber: vehicleNumber.toUpperCase().trim(),
      type,
      makeModel: makeModel.trim(),
      fuelType,
    });

    setVehicles(authService.getVehicles());
    setIsAddVehModalOpen(false);
    setNickname('');
    setVehicleNumber('');
    setMakeModel('');
    onRefresh();
  };

  const handleRemoveVehicle = (id: string) => {
    authService.removeVehicle(id);
    setVehicles(authService.getVehicles());
    onRefresh();
  };

  const handleSetDefault = (id: string) => {
    authService.setDefaultVehicle(id);
    setVehicles(authService.getVehicles());
    onRefresh();
  };

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locName.trim() || !locAddress.trim()) return;

    authService.addSavedLocation({
      name: locName.trim(),
      address: locAddress.trim(),
      latitude: 19.0664,
      longitude: 72.8679,
      iconType: locIcon,
    });

    setSavedLocations(authService.getSavedLocations());
    setIsAddLocModalOpen(false);
    setLocName('');
    setLocAddress('');
    onRefresh();
  };

  const handleRemoveLocation = (id: string) => {
    authService.removeSavedLocation(id);
    setSavedLocations(authService.getSavedLocations());
    onRefresh();
  };

  return (
    <div className="space-y-8">
      {/* VEHICLES SECTION */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900">
              My Vehicle Garage
            </h3>
            <p className="text-xs text-slate-500">
              Registered license plates for automatic barrier ANPR check-ins.
            </p>
          </div>
          <button
            onClick={() => setIsAddVehModalOpen(true)}
            className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Vehicle
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map(v => (
            <div
              key={v.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                v.isDefault
                  ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
                      v.type === 'ev' ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {v.type === 'ev' ? <Zap className="w-6 h-6" /> : <Car className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base text-slate-900">{v.nickname}</h4>
                        {v.isDefault && (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono font-bold text-slate-600 tracking-wider">
                        {v.vehicleNumber}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveVehicle(v.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                    title="Remove Vehicle"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span className="capitalize">{v.type}</span>
                  <span>·</span>
                  <span>{v.makeModel}</span>
                  <span>·</span>
                  <span className="capitalize">{v.fuelType}</span>
                </div>
              </div>

              {!v.isDefault && (
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => handleSetDefault(v.id)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Set as Default
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SAVED LOCATIONS SECTION */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900">
              Saved Locations & Quick Parking
            </h3>
            <p className="text-xs text-slate-500">
              One-tap search around your frequent destinations like Home, Office, or Gym.
            </p>
          </div>
          <button
            onClick={() => setIsAddLocModalOpen(true)}
            className="py-2 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Place
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {savedLocations.map(loc => {
            const Icon = loc.iconType === 'home' ? Home : loc.iconType === 'briefcase' ? Briefcase : Heart;
            return (
              <div
                key={loc.id}
                className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col justify-between hover:border-blue-400 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                      <Icon className="w-4 h-4" />
                    </div>
                    <button
                      onClick={() => handleRemoveLocation(loc.id)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{loc.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{loc.address}</p>
                </div>

                {onSelectLocationForSearch && (
                  <button
                    onClick={() => onSelectLocationForSearch(loc.address)}
                    className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-800 text-left"
                  >
                    Find Parking Nearby →
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {isAddVehModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddVehicle} className="bg-white rounded-3xl max-w-md w-full p-6 text-slate-900 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h4 className="font-bold text-lg">Add New Vehicle</h4>
              <button type="button" onClick={() => setIsAddVehModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Vehicle License Plate *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MH 02 EQ 7824"
                  value={vehicleNumber}
                  onChange={e => setVehicleNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl uppercase font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Vehicle Nickname</label>
                <input
                  type="text"
                  placeholder="e.g. Daily Nexon EV or My City Bike"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Make & Model *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tata Nexon EV Max, Hyundai Creta"
                  value={makeModel}
                  onChange={e => setMakeModel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Vehicle Category</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                  >
                    <option value="car">Car (Hatchback/Sedan)</option>
                    <option value="suv">SUV</option>
                    <option value="motorcycle">Motorcycle / Scooter</option>
                    <option value="ev">Electric Vehicle (EV)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Fuel Type</label>
                  <select
                    value={fuelType}
                    onChange={e => setFuelType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                  >
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric (EV)</option>
                    <option value="cng">CNG</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={() => setIsAddVehModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800"
              >
                Save Vehicle
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Location Modal */}
      {isAddLocModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddLocation} className="bg-white rounded-3xl max-w-md w-full p-6 text-slate-900 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h4 className="font-bold text-lg">Save New Location</h4>
              <button type="button" onClick={() => setIsAddLocModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Location Label *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Office, Gym, Client HQ"
                  value={locName}
                  onChange={e => setLocName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Address / Landmark *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. World Trade Centre, Cuffe Parade, Mumbai"
                  value={locAddress}
                  onChange={e => setLocAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Icon Style</label>
                <div className="flex gap-2">
                  {[
                    { id: 'briefcase', label: 'Work', icon: Briefcase },
                    { id: 'home', label: 'Home', icon: Home },
                    { id: 'heart', label: 'Fav', icon: Heart },
                  ].map(item => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setLocIcon(item.id as any)}
                        className={`flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 ${
                          locIcon === item.id
                            ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" /> {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={() => setIsAddLocModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800"
              >
                Save Place
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
