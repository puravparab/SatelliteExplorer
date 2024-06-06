import { TooltipData } from "../utilities/interfaces";

export const ToolTip: React.FC<TooltipData> = ({ norad_id, orbital_period, x, y }) => {
	return (
		<div 
			className="absolute bg-opacity-100 bg-slate-800 text-white p-2 text-xs pointer-events-none"
			style={{ left: x, top: y, width: 200}}
		>
			<p>Norad ID: {norad_id}</p>
			<p>Orbital Period: {orbital_period.toFixed(2)} minutes</p>
		</div>
	)
};