import { createRoot, Root } from 'react-dom/client';
import { TooltipData, SelectedSatelliteData } from "../utilities/interfaces";

export const ToolTip: React.FC<TooltipData> = ({
	norad_id, 
	orbital_period, 
	x, 
	y 
}) => {
	return (
		<div 
			className="absolute w-52 bg-opacity-100 bg-slate-800 text-white p-2 text-xs pointer-events-none"
			style={{ left: x, top: y}}
		>
			<p>Norad ID: {norad_id}</p>
			<p>Orbital Period: {orbital_period.toFixed(2)} minutes</p>
		</div>
	)
};

export const showHoverToolTip = (tooltipRoot: {root: Root | null, setRoot: (root: Root | null) => void }, tooltipData: TooltipData | null) => {
	const { root, setRoot } = tooltipRoot;
	if (!root){
		const container = document.createElement('div');
		document.body.appendChild(container);
		setRoot(createRoot(container));
	} else {
		root?.render(tooltipData ? <ToolTip {...tooltipData} /> : null);
	}
};

export const SelectedSatellite: React.FC<SelectedSatelliteData> = ({
	name,
	norad_id,
	launch_date,
	orbital_period,
	status,
	country
}) => {
	return (
		<div className="flex flex-row">
			<div>
				<p>Name: {name}</p>
			</div>
			<div>
				<p>Norad ID: {norad_id}</p>
			</div>
			<div>
				<p>Launch Date: {launch_date}</p>
			</div>
			<div>
				<p>Orbital Period: {orbital_period}</p>
			</div>
			<div>
				<p>Status: {status}</p>
			</div>
			<div>
				<p>Country: {country}</p>
			</div>
		</div>
	);
};