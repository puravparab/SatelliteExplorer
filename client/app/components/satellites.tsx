import { Satellite } from '../utilities/interfaces';
import * as THREE from 'three';
import * as satellite from 'satellite.js';

const renderSatellites = (scene: THREE.Scene, filePath: string) => {
	fetch(filePath)
		.then(res => res.json())
		.then(data => {
			const sat_positions = Object.keys(data).map(norad_id => {
				const { tle } = data[norad_id];
				const satrec = satellite.twoline2satrec(tle[0], tle[1]);
				const positionAndVelocity: any = satellite.propagate(satrec, new Date());

				// Check if positionAndVelocity is valid
        if (positionAndVelocity && positionAndVelocity.position && positionAndVelocity.velocity) {
          const positionGd = satellite.eciToGeodetic(positionAndVelocity.position, satellite.gstime(new Date()));
          return {
            norad_id,
            longitude: satellite.degreesLong(positionGd.longitude),
            latitude: satellite.degreesLat(positionGd.latitude),
            altitude: positionGd.height
          };
        }
        return null;
			}).filter(pos => pos !== null);

			sat_positions.forEach(sat => {
				if (sat) {
					const satMesh = new THREE.Mesh(
						new THREE.SphereGeometry(0.01, 32, 32),
						new THREE.MeshBasicMaterial({ color: 0x50C878 })
					);

					const phi = (90 - sat.latitude) * (Math.PI / 180);
					const theta = (sat.longitude + 180) * (Math.PI / 180);
					const radius = 1 + sat.altitude / 1000;

					satMesh.position.set(
						radius * Math.sin(phi) * Math.cos(theta),
						radius * Math.cos(phi),
						radius * Math.sin(phi) * Math.sin(theta)
					);

					scene.add(satMesh);
				}
			});
		})
		.catch(error => {
			console.error('Error: ', error);
		})
}

export default renderSatellites