// app/routeplan/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase, getCitiesByProvince, getRegionsByProvinceAndCity } from '../_lib/supabaseClient';
// import Loading from '../_lib/Loading';
import ErrorComponent from '../_lib/Error';

interface Region {
  region: string;
  adcode: string;
}

// Updated Waypoint interface to distinguish between saved data and display data
interface Waypoint {
  region: string;      // Simple name for saving, e.g., "双流区"
  adcode: string;
  displayName: string; // Full name for display, e.g., "四川省 - 成都市 - 双流区"
}


// use province data locally
const provinces = [
  "安徽省","澳门特别行政区","北京市","重庆市","福建省","甘肃省","广东省","广西壮族自治区","贵州省","海南省","河北省","河南省","黑龙江省","湖北省","湖南省","吉林省","江苏省","江西省","辽宁省","内蒙古自治区","宁夏回族自治区","青海省","山东省","山西省","陕西省","上海市","四川省","台湾省","天津市","西藏自治区","香港特别行政区","新疆维吾尔自治区","云南省","浙江省"
];



export default function RoutePlanPage() {
  // Data states
  const [cities, setCities] = useState<string[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);

  // Selection states
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');

  // Route states
  const [wayName, setWayName] = useState<string>('');
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);

  // UI states
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingRegions, setIsLoadingRegions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle province selection
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const province = e.target.value;
    setSelectedProvince(province);
    setSelectedCity('');
    setSelectedRegion('');
    setCities([]);
    setRegions([]);

    if (province) {
      setIsLoadingCities(true);
      // Fetch cities from Supabase
      getCitiesByProvince(province).then(fetchedCities => {
        setCities(fetchedCities);
        setIsLoadingCities(false);
      });
    }
  };

  // Handle city selection
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = e.target.value;
    setSelectedCity(city);
    setSelectedRegion('');
    setRegions([]);

    if (selectedProvince && city) {
      setIsLoadingRegions(true);
      // Fetch regions from Supabase
      getRegionsByProvinceAndCity(selectedProvince, city).then(regions => {
        setRegions(regions);
        setIsLoadingRegions(false);
      });
    }
  };

  // Add waypoint to the list
  const handleAddWaypoint = () => {
    if (!selectedRegion) {
      alert('Please select a region.');
      return;
    }
    const regionData = regions.find(r => String(r.adcode) === selectedRegion);
    
    if (!regionData) {
      console.error("Could not find selected region data.", { selectedRegion, regions });
      alert("An error occurred. The selected region could not be found.");
      return;
    }

    const newWaypoint: Waypoint = {
      region: regionData.region, // Save the simple region name
      adcode: String(regionData.adcode),
      displayName: `${selectedProvince} - ${selectedCity} - ${regionData.region}`, // Use full name for display
    };
    setWaypoints([...waypoints, newWaypoint]);
    
    // Reset selectors for next entry
    setSelectedProvince('');
    setSelectedCity('');
    setSelectedRegion('');
    setCities([]);
    setRegions([]);
  };

  // Save the entire route to Supabase
  const handleSave = async () => {
    if (!wayName.trim()) {
      alert('Please enter a route name.');
      return;
    }
    if (waypoints.length === 0) {
      alert('Please add at least one waypoint.');
      return;
    }

    setIsSaving(true);
    // Now we send the simple region names to the database
    const regionNames = waypoints.map(wp => wp.region);
    const adcodes = waypoints.map(wp => wp.adcode);

    const { error } = await supabase
      .from('saved_ways')
      .insert([{ name: wayName, way: regionNames, sid: adcodes }]);

    if (error) {
      console.error('Error saving route:', error);
      alert(`Failed to save route: ${error.message}`);
    } else {
      alert('Route saved successfully!');
      setWayName('');
      setWaypoints([]);
    }
    setIsSaving(false);
  };

  if (error) return <ErrorComponent message={error} />;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create a New Route Plan (Supabase)</h1>

      <div className="space-y-4 md:space-y-0 md:flex md:space-x-4 mb-4">
        <select value={selectedProvince} onChange={handleProvinceChange} className="block w-full md:w-1/3 p-2 border rounded bg-gray-800 text-white">
          <option value="">Select Province</option>
          {provinces.map((prov) => <option key={prov} value={prov}>{prov}</option>)}
        </select>

        <select value={selectedCity} onChange={handleCityChange} disabled={!selectedProvince || isLoadingCities} className="block w-full md:w-1/3 p-2 border rounded bg-gray-800 text-white disabled:opacity-50">
          <option value="">{isLoadingCities ? 'Loading...' : 'Select City'}</option>
          {cities.map((city) => <option key={city} value={city}>{city}</option>)}
        </select>

        <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} disabled={!selectedCity || isLoadingRegions} className="block w-full md:w-1/3 p-2 border rounded bg-gray-800 text-white disabled:opacity-50">
          <option value="">{isLoadingRegions ? 'Loading...' : 'Select Region'}</option>
          {regions.map((reg) => <option key={reg.adcode} value={reg.adcode}>{reg.region}</option>)}
        </select>
      </div>

      <button onClick={handleAddWaypoint} disabled={!selectedRegion} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
        Add Waypoint
      </button>

      <hr className="my-6" />

      <h2 className="text-xl font-semibold mb-2">Current Route</h2>
      <div className="mb-4">
        <input type="text" value={wayName} onChange={(e) => setWayName(e.target.value)} placeholder="Enter Route Name" className="p-2 border rounded w-full md:w-1/2 bg-gray-700 text-white" />
      </div>

      <ul className="list-disc pl-5 mb-4">
        {waypoints.map((wp, index) => (
          <li key={index} className="mb-1">
            {/* Display the full name for clarity */}
            {wp.displayName} (Adcode: {wp.adcode})
          </li>
        ))}
      </ul>

      <button onClick={handleSave} disabled={waypoints.length === 0 || !wayName.trim() || isSaving} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
        {isSaving ? 'Saving...' : 'Save Route to Supabase'}
      </button>
    </div>
  );
}