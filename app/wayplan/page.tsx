// app/wayplan/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../_lib/supabaseClient';

interface AdcodeData {
  [province: string]: {
    [city: string]: {
      [region: string]: string;
    };
  };
}

interface Waypoint {
  region: string;
  adcode: string;
}

export default function WayPlanPage() {
  const [adcodeData, setAdcodeData] = useState<AdcodeData>({});
  const [provinces, setProvinces] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');

  const [wayName, setWayName] = useState<string>('');
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/adcode.json')
      .then((res) => res.json())
      .then((data) => {
        setAdcodeData(data);
        setProvinces(Object.keys(data));
      });
  }, []);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const province = e.target.value;
    setSelectedProvince(province);
    setSelectedCity('');
    setSelectedRegion('');
    if (province && adcodeData[province]) {
      setCities(Object.keys(adcodeData[province]));
    } else {
      setCities([]);
    }
    setRegions([]);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = e.target.value;
    setSelectedCity(city);
    setSelectedRegion('');
    if (selectedProvince && city && adcodeData[selectedProvince]?.[city]) {
      setRegions(Object.keys(adcodeData[selectedProvince][city]));
    } else {
      setRegions([]);
    }
  };

  const handleAddWaypoint = () => {
    if (!selectedProvince || !selectedCity || !selectedRegion) {
      alert('Please select a complete region.');
      return;
    }
    const adcode = adcodeData[selectedProvince][selectedCity][selectedRegion];
    const newWaypoint: Waypoint = {
      region: `${selectedProvince} - ${selectedCity} - ${selectedRegion}`,
      adcode: adcode,
    };
    setWaypoints([...waypoints, newWaypoint]);
    // Reset selectors
    setSelectedProvince('');
    setSelectedCity('');
    setSelectedRegion('');
    setCities([]);
    setRegions([]);
  };

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

    const regions = waypoints.map(wp => wp.region);
    const adcodes = waypoints.map(wp => wp.adcode);

    const { error } = await supabase
      .from('saved_ways')
      .insert([{ name: wayName, way: regions, sid: adcodes }]);

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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create a New Way Plan</h1>

      <div className="space-y-4 md:space-y-0 md:flex md:space-x-4 mb-4">
        {/* Province Selector */}
        <select
          value={selectedProvince}
          onChange={handleProvinceChange}
          className="block w-full md:w-1/3 p-2 border rounded bg-gray-800 text-white"
        >
          <option value="">Select Province</option>
          {provinces.map((prov) => (
            <option key={prov} value={prov}>
              {prov}
            </option>
          ))}
        </select>

        {/* City Selector */}
        <select
          value={selectedCity}
          onChange={handleCityChange}
          disabled={!selectedProvince}
          className="block w-full md:w-1/3 p-2 border rounded bg-gray-800 text-white disabled:opacity-50"
        >
          <option value="">Select City</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        {/* Region Selector */}
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          disabled={!selectedCity}
          className="block w-full md:w-1/3 p-2 border rounded bg-gray-800 text-white disabled:opacity-50"
        >
          <option value="">Select Region</option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleAddWaypoint}
        disabled={!selectedRegion}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        Add Waypoint
      </button>

      <hr className="my-6" />

      <h2 className="text-xl font-semibold mb-2">Current Route</h2>
      <div className="mb-4">
        <input
          type="text"
          value={wayName}
          onChange={(e) => setWayName(e.target.value)}
          placeholder="Enter Route Name"
          className="p-2 border rounded w-full md:w-1/2 bg-gray-700 text-white"
        />
      </div>

      <ul className="list-disc pl-5 mb-4">
        {waypoints.map((wp, index) => (
          <li key={index} className="mb-1">
            {wp.region} (Adcode: {wp.adcode})
          </li>
        ))}
      </ul>

      <button
        onClick={handleSave}
        disabled={waypoints.length === 0 || !wayName.trim() || isSaving}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {isSaving ? 'Saving...' : 'Save Route to Supabase'}
      </button>
    </div>
  );
}
