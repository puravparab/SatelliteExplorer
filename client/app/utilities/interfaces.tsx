import * as satellite from 'satellite.js';

export interface Satellite {
	norad_id: number,
	tle: string[],
	satrec: satellite.SatRec
};