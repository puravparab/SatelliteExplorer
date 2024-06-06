import * as satellite from 'satellite.js';

export interface Satellite {
	norad_id: number,
	tle: string[],
	satrec: satellite.SatRec
};

export interface TooltipData {
	norad_id: number,
	orbital_period: number, // minutes
	// tooltip postition
	x: number,
	y: number
}