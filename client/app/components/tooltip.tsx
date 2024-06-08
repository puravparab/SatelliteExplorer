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
	const item_style = "flex flex-row w-full gap-x-3 py-1 text-md";
	const val_style = "text-gray-400";
	const name_url = `https://www.google.com/search?q=${name}`;
	return (
		<div className="flex flex-col bg-gray-900">
			<div className={item_style}>
				<p>Name:</p>
				<a href={name_url} target="_blank"><p className={val_style}>{name}</p></a>
			</div>
			<div className={item_style}>
				<p>Norad ID:</p>
				<p className={val_style}>{norad_id}</p>
			</div>
			<div className={item_style}>
				<p>Launch Date:</p>
				<p className={val_style}>{launch_date}</p>
			</div>
			<div className={item_style}>
				<p>Orbital Period:</p>
				<p className={val_style}>{orbital_period}</p>
			</div>
			<div className={item_style}>
				<p>Status:</p>
				<p className={val_style}>{status}</p>
			</div>
			<div className={item_style}>
				<p>Country:</p>
				<p className={val_style}>{country}</p>
			</div>
		</div>
	);
};