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
              sec === section ? 'text-lime-200 bg-gray-900' : 'bg-gray-950 hover:bg-gray-900'
            }`}
          >
            {sec}
          </div>
        ))}
			</div>
			
			{section === "Home" && 
				<>
					<div className="flex flex-col w-80 bg-gray-900 text-md p-4 gap-2">
						<h2 className='text-xl'>Selected Satellite:</h2>
						{selectedSatellite && <SelectedSatellite {...selectedSatellite} />}
					</div>
				</>
			}
			</div> 
	);
};

export default Main;