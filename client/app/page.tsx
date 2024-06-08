"use client";

import { useState } from 'react';

import Earth from "./components/earth";
import Main from "./components/main";
import CurrentDate from "./components/date";
import { SelectedSatelliteData } from './utilities/interfaces';

export default function Home() {
  const [selectedSatellite, setSelectedSatellite] = useState<SelectedSatelliteData | null>(null);
  const handleSatelliteSelect = (satelliteData: SelectedSatelliteData | null) => {
    setSelectedSatellite(satelliteData);
  };

  return (
    <main className="flex h-screen flex-col items-center justify-start p-0 font-sans grainy-background">
      <div className="flex flex-row w-full h-full">
        <div className="w-4/6 my-4 mx-2">
          <Earth onSatelliteSelect={handleSatelliteSelect} />
        </div>

        <div className="flex flex-col w-2/6 m-4">
          <div className="w-full pb-4">
            <h1 className="mr-auto text-2xl">Satellite Explorer</h1>
            <CurrentDate />
          </div>
          
          <Main sectionName="Home" selectedSatellite={selectedSatellite} />
        </div>
      </div>
    </main>
  );
}
