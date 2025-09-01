// app/routeplan/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../_lib/supabaseClient';
import Loading from '../_lib/Loading';
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

export default function RoutePlanPage() {
  // Data states
  const [provinces, setProvinces] = useState<string[]>([]);
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
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingRegions, setIsLoadingRegions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial provinces
  useEffect(() => {
    async function fetchProvinces() {
      try {
        setIsLoadingProvinces(true);
        const res = await fetch('/api/locations/provinces');
        if (!res.ok) throw new Error('Failed to fetch provinces');
        const data = await res.json();
        setProvinces(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoadingProvinces(false);
      }
    }
    fetchProvinces();
  }, []);

  // Handle province selection
  const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const province = e.target.value;
    setSelectedProvince(province);
    setSelectedCity('');
    setSelectedRegion('');
    setCities([]);
    setRegions([]);

    if (province) {
      try {
        setIsLoadingCities(true);
        const res = await fetch(`/api/locations/cities?province=${province}`);
        if (!res.ok) throw new Error('Failed to fetch cities');
        const data = await res.json();
        setCities(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoadingCities(false);
      }
    }
  };

  // Handle city selection
  const handleCityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = e.target.value;
    setSelectedCity(city);
    setSelectedRegion('');
    setRegions([]);

    if (selectedProvince && city) {
      try {
        setIsLoadingRegions(true);
        const res = await fetch(`/api/locations/regions?province=${selectedProvince}&city=${city}`);
        if (!res.ok) throw new Error('Failed to fetch regions');
        const data = await res.json();
        setRegions(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoadingRegions(false);
      }
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

      {isLoadingProvinces ? <Loading /> : (
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
      )}

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
