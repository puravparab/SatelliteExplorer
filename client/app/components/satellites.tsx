import { Satellite } from '../utilities/interfaces';
import * as THREE from 'three';
import * as satellite from 'satellite.js';

const EARTH_RADIUS = 6378 // in Kilometers

// Calculate and return the satellite's current longitude, lattitude and altitude
const calculateSatPosition = (satrec: satellite.SatRec, date: Date) => {
	const positionAndVelocity: any = satellite.propagate(satrec, date);
	if (positionAndVelocity && positionAndVelocity.position && positionAndVelocity.velocity) {
		const positionGd = satellite.eciToGeodetic(positionAndVelocity.position, satellite.gstime(new Date()));
		const phi = (90 - satellite.degreesLat(positionGd.latitude)) * (Math.PI / 180);
		const theta = (satellite.degreesLong(positionGd.longitude)) * (Math.PI / 180);
		const radius = 1 + positionGd.height / EARTH_RADIUS;

		return new THREE.Vector3 (
			radius * Math.sin(phi) * Math.cos(theta),
			radius * Math.cos(phi),
			-radius * Math.sin(phi) * Math.sin(theta) // negating seems to display orbits correctly
		);
	}
	return null;
}

// Calculate the satellite's orbital period (seconds to complete one orbit)
const calculateOrbitalPeriod = (satrec: satellite.SatRec) => {
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

// Render satellites in the scene
const renderSatellites = async (scene: THREE.Scene, camera: THREE.Camera, grayscale: THREE.Mesh, filePath: string) => {
	try {
		// TEMPORARY
		// read from tle.json
		const res = await fetch(filePath);
		const data: {[key: string]: { tle: string[] }} = await res.json();
		
		const instanceCount = Object.keys(data).length;
		console.log("total satellites", instanceCount)

		const geometry = new THREE.SphereGeometry(0.006, 16, 16);
		const material = new THREE.MeshBasicMaterial({ color: 0x50C878 })
		const instancedMesh = new THREE.InstancedMesh(geometry, material, instanceCount);
		const dummy = new THREE.Object3D();

		const satelliteData: Satellite[] = []
		let count = 0;
		Object.keys(data).forEach((norad_id, index) => {
			const { tle } = data[norad_id];
			const satrec = satellite.twoline2satrec(tle[0], tle[1]);
			satelliteData.push({ norad_id: parseInt(norad_id), tle, satrec});
		});

		scene.add(instancedMesh);

		/*
			RENDER SATELLITE ORBITS
		*/
		let orbitLine: THREE.Line | null = null;
		const renderOrbit = (satrec: satellite.SatRec) => {
			const orbitPositions: THREE.Vector3[] = [];
			const date = new Date();
			const orbitalPeriod = calculateOrbitalPeriod(satrec); // in seconds
			if (orbitalPeriod){
				// get positions of the satellite at every interval i to render an orbit
				for (let i = 0; i <= orbitalPeriod; i++) {
					const future = new Date(date.getTime() + (i * 1000)); // datetime requires time in milliseconds
					const pos = calculateSatPosition(satrec, future);
					if (pos) {
						orbitPositions.push(pos)
					};
				}
				if (orbitPositions.length > 0) {
					const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPositions);
					const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 3 });
					orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
					scene.add(orbitLine);
				}
			}
		};
		// Remove orbit
		const clearOrbit = () => {
			if (orbitLine){
				scene.remove(orbitLine);
				orbitLine = null;
			}
		};

		// If user hovers on a satellite
		const handleMouseHover = (event: MouseEvent) => {
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(instancedMesh);
      if (intersects.length > 0) {
        const instanceId = intersects[0].instanceId;
        if (instanceId !== undefined) {
          const sat = satelliteData[instanceId];
					const satPosition = calculateSatPosition(sat.satrec, new Date);
					if (satPosition) {
						// Check if the satellite is occluded by the Earth
						const earthRaycaster = new THREE.Raycaster();
						earthRaycaster.set(satPosition, camera.position.clone().sub(satPosition).normalize());
						const earthIntersects = earthRaycaster.intersectObject(grayscale);
						// The satellite is not occluded by the Earth, so render its orbit
						if (earthIntersects.length === 0) {
							renderOrbit(sat.satrec);
							console.log("norad id", sat.norad_id);
						}
					}
        }
      }
    };
		window.addEventListener('mousemove', handleMouseHover);

		/*
			ANIMATION LOOP
		*/
		const animate = () => {
			requestAnimationFrame(animate);
			satelliteData.forEach((sat, index) => {
				const { satrec } = sat;
				const pos = calculateSatPosition(satrec, new Date);
				if (pos) {
					dummy.position.copy(pos);
					dummy.updateMatrix();
					instancedMesh.setMatrixAt(index, dummy.matrix);
				}
			});
			instancedMesh.instanceMatrix.needsUpdate = true;
		};
		animate();

		return () => {
      window.removeEventListener('mousemove', handleMouseHover);
    };
	}
	catch (error){
		console.error('Error: ', error);
	}
}

export default renderSatellites