import { Satellite } from '../utilities/interfaces';
import * as THREE from 'three';
import * as satellite from 'satellite.js';

const renderSatellites = (scene: THREE.Scene, filePath: string) => {
	fetch(filePath)
		.then(res => res.json())
		.then(data => {
			const instanceCount = Object.keys(data).length;
			console.log("total satellites", instanceCount)
			const geometry = new THREE.SphereGeometry(0.01, 32, 32);
			const material = new THREE.MeshBasicMaterial({ color: 0x50C878 })

			const instancedMesh = new THREE.InstancedMesh(geometry, material, instanceCount);
      const dummy = new THREE.Object3D();

			let count = 0;
			Object.keys(data).forEach((norad_id, index) => {
				const { tle } = data[norad_id];
				const satrec = satellite.twoline2satrec(tle[0], tle[1]);
				const positionAndVelocity: any = satellite.propagate(satrec, new Date());

				if (positionAndVelocity && positionAndVelocity.position && positionAndVelocity.velocity) {
					const positionGd = satellite.eciToGeodetic(positionAndVelocity.position, satellite.gstime(new Date()));
					const phi = (90 - satellite.degreesLat(positionGd.latitude)) * (Math.PI / 180);
					const theta = (satellite.degreesLong(positionGd.longitude) + 180) * (Math.PI / 180);
					const radius = 1 + positionGd.height / 1000;

					dummy.position.set(
						radius * Math.sin(phi) * Math.cos(theta),
						radius * Math.cos(phi),
						radius * Math.sin(phi) * Math.sin(theta)
					);
					dummy.updateMatrix();
					instancedMesh.setMatrixAt(index, dummy.matrix);

					count += 1;
				}
			});
			console.log("rendered satellites", count);
      scene.add(instancedMesh);
		})
		.catch(error => {
			console.error('Error: ', error);
		})
}

export default renderSatellites