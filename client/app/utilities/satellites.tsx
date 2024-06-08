import * as THREE from 'three';
import * as satellite from 'satellite.js';

const EARTH_RADIUS = 6378 // in Kilometers

// Calculate and return the satellite's current longitude, lattitude and altitude
export const calculateSatPosition = (satrec: satellite.SatRec, date: Date) => {
	const positionAndVelocity: any = satellite.propagate(satrec, date);
	if (positionAndVelocity && positionAndVelocity.position && positionAndVelocity.velocity) {
		const positionGd = satellite.eciToGeodetic(positionAndVelocity.position, satellite.gstime(new Date()));
		const phi = (90 - satellite.degreesLat(positionGd.latitude)) * (Math.PI / 180);
		const theta = (satellite.degreesLong(positionGd.longitude)) * (Math.PI / 180);
		const radius = 1 + positionGd.height / EARTH_RADIUS;

		return {
			position: 
				new THREE.Vector3 (
				radius * Math.sin(phi) * Math.cos(theta), // x
				radius * Math.cos(phi), // y
				-radius * Math.sin(phi) * Math.sin(theta) // z (negating seems to display orbits correctly)
			),
			radius
		};
	}
	return null;
}

// Calculate the satellite's orbital period (seconds to complete one orbit)
export const calculateOrbitalPeriod = (satrec: satellite.SatRec) => {
  const meanMotion = satrec.no; // Mean motion (radians per minute)
  if (meanMotion > 0) {
		/* Calculate number of orbits in a day
			1440 = total minutes in a day
			2 * PI = radians in a circle
		*/
    const orbitsPerDay = meanMotion * (1440 / (2 * Math.PI));
		/* Return orbital period in seconds
			86400 = number of seconds in a day
		*/
    return 86400 / orbitsPerDay;
  }
  return null;
};