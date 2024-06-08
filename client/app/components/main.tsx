"use client";

import { useState } from 'react';
import { SelectedSatellite } from './tooltip';
import { SelectedSatelliteData } from '../utilities/interfaces';

const Main: React.FC<{
	sectionName: string; 
	selectedSatellite: SelectedSatelliteData  | null
}> = ({ 
	sectionName, 
	selectedSatellite
}) => {
	const [section, setSection] = useState(sectionName);
	const sections = ['Home', 'Search', 'Saved', 'Settings'];

	return (
		<div className="w-full flex flex-col">
			<div className="flex flex-row">
				{sections.map((sec) => (
          <div
            key={sec}
            onClick={() => setSection(sec)}
            className={`px-3 py-2 cursor-pointer text-md ${
              sec === section ? 'text-lime-200 bg-slate-900' : 'bg-slate-950 hover:bg-slate-900'
            }`}
          >
            {sec}
          </div>
        ))}
			</div>

			<div className="flex flex-col w-full bg-slate-900 text-md p-4 gap-2">
				<h2 className='text-xl'>Satellite of the Day:</h2>
				<div>
					<p>Name: SPUTNIK 1</p>
				</div>
				<div>
					<p>Norad ID: 2</p>
				</div>
				<div>
					<p>Launch Date: 4th October 1957</p>
				</div>
				<div>
					<p>Orbital Period: 938 minutes</p>
				</div>
				<div>
					<p>Status: Decomissioned</p>
				</div>
				<div>
					<p>Country: Soviet Union</p>
				</div>
			</div>

			<div className="w-full">
				{selectedSatellite && <SelectedSatellite {...selectedSatellite} />}
			</div>
		</div>
	);
};

export default Main;