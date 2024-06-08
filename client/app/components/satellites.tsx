import { Root } from 'react-dom/client';
import * as THREE from 'three';
import * as satellite from 'satellite.js';

import { Satellite, TooltipData, SelectedSatelliteData } from '../utilities/interfaces';
import { showHoverToolTip } from './tooltip';
import { calculateSatPosition, calculateOrbitalPeriod } from '../utilities/satellites';

// Render satellites in the scene
export const renderSatellites = async (
	scene: THREE.Scene, 
	camera: THREE.PerspectiveCamera, 
	renderer: THREE.WebGLRenderer, 
	grayscale: THREE.Mesh, 
	filePath: string, 
	onSatelliteSelect: (satelliteData: SelectedSatelliteData) => void
) => {
	try {
		// TEMPORARY
		// read from tle.json
		const res = await fetch(filePath);
		const data: {[key: string]: { tle: string[] }} = await res.json();
		
		const satelliteData: Satellite[] = Object.keys(data).map((norad_id) => {
      const { tle } = data[norad_id];
      const satrec = satellite.twoline2satrec(tle[0], tle[1]);
      return { norad_id: parseInt(norad_id), tle, satrec };
    });

		console.log("total satellites", satelliteData.length);

		const geometry = new THREE.SphereGeometry(0.01, 16, 16);
		const material = new THREE.MeshBasicMaterial({ color: 0xbbf2a4 });
		const instancedMesh = new THREE.InstancedMesh(geometry, material, satelliteData.length);
		const dummy = new THREE.Object3D();

		// Create an InstancedBufferAttribute for the radii
		const radii = new THREE.InstancedBufferAttribute(new Float32Array(satelliteData.length), 0.01);
		instancedMesh.instanceMatrix.needsUpdate = true;
		instancedMesh.geometry.setAttribute('radius', radii);
		
		scene.add(instancedMesh);

		/*
			RENDER SATELLITE ORBITS
		*/
		let hoveredOrbitLine: THREE.Line | null = null;
		let clickOrbitLine: THREE.Line | null = null;

		const renderOrbit = (satrec: satellite.SatRec, orbital_period: number, hover: boolean) => {
			const orbitPositions: THREE.Vector3[] = [];
			const date = new Date();
			const orbitalPeriod = calculateOrbitalPeriod(satrec); // in seconds
			if (orbitalPeriod){
				const minStep = 1;
				const step = Math.max(Math.floor(orbitalPeriod / (180 * 60)), minStep);
				for (let i = 0; i <= orbitalPeriod; i += step) {
					const future = new Date(date.getTime() + (i * 1000)); // datetime requires time in milliseconds
					const satData = calculateSatPosition(satrec, future);
					if (satData) {
						const { position } = satData;
						orbitPositions.push(position);
      		}
				}

				if (orbitPositions.length > 0) {
					const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPositions);
					const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xf9cb9c });
					if (hover){
						hoveredOrbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
						scene.add(hoveredOrbitLine);
					} else {
						clickOrbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
						scene.add(clickOrbitLine);
					}
				}
			}
		};
		// Remove orbit
		const clearOrbit = (hover: boolean) => {
			if (hover && hoveredOrbitLine){
				scene.remove(hoveredOrbitLine);
				hoveredOrbitLine = null;
			} else if (!hover && clickOrbitLine) {
				scene.remove(clickOrbitLine);
				clickOrbitLine = null;
			}
		};

		/* 
			USER ACTIONS: HOVER AND CLICK
		*/
		// set raycaster
		const raycaster = new THREE.Raycaster();
		raycaster.near = camera.near; // min distance detecting sats
		raycaster.far = camera.far; // max distance detecting sats
		
		// If user hovers on a satellite
		const handleSatHover = (event: MouseEvent) => {
			clearOrbit(true); // clear previous tooltip
			showHoverToolTip(HoverTooltipRoot, null); // clear previous orbit

			// get pointer/mouse location
      const pointer = new THREE.Vector2();
      pointer.x = (event.offsetX / renderer.domElement.clientWidth) * 2 - 1;
  		pointer.y = -(event.offsetY / renderer.domElement.clientHeight) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObject(instancedMesh);
      if (intersects.length > 0) {
        const instanceId = intersects[0].instanceId; // get the first sat that the cursor hovers
        if (instanceId !== undefined) {
          const sat = satelliteData[instanceId];
					const satData = calculateSatPosition(sat.satrec, new Date);
					if (satData) {
						const { position } = satData;
						// Check if the satellite is occluded by the Earth
						const earthRaycaster = new THREE.Raycaster();
						earthRaycaster.set(position, camera.position.clone().sub(position).normalize());
						const earthIntersects = earthRaycaster.intersectObject(grayscale);

						// The satellite is not occluded by the Earth, so render its orbit
						if (earthIntersects.length === 0) {
							console.log("norad id", sat.norad_id);
							const orbital_period = calculateOrbitalPeriod(sat.satrec);
							if (orbital_period){
								const tooltipData: TooltipData = {
									norad_id: sat.norad_id,
									orbital_period: orbital_period / 60,
									x: event.clientX,
									y: event.clientY
								};
								showHoverToolTip(HoverTooltipRoot,  tooltipData);
								renderOrbit(sat.satrec, orbital_period, true);
							}
						}
					}
        }
      }
    };
		window.addEventListener('pointermove', handleSatHover);

		// If user click on a satellite
		const handleSatClick = (event: MouseEvent) => {
			// get pointer/mouse location
      const pointer = new THREE.Vector2();
      pointer.x = (event.offsetX / renderer.domElement.clientWidth) * 2 - 1;
  		pointer.y = -(event.offsetY / renderer.domElement.clientHeight) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObject(instancedMesh);
      if (intersects.length > 0) {
        const instanceId = intersects[0].instanceId; // get the first sat that the cursor hovers
        if (instanceId !== undefined) {
          const sat = satelliteData[instanceId];
					const satData = calculateSatPosition(sat.satrec, new Date);
					if (satData) {
						const { position } = satData;
						// Check if the satellite is occluded by the Earth
						const earthRaycaster = new THREE.Raycaster();
						earthRaycaster.set(position, camera.position.clone().sub(position).normalize());
						const earthIntersects = earthRaycaster.intersectObject(grayscale);

						// The satellite is not occluded by the Earth, so render its orbit
						if (earthIntersects.length === 0) {
							console.log("norad id", sat.norad_id);
							const orbital_period = calculateOrbitalPeriod(sat.satrec);
							if (orbital_period){
								showHoverToolTip(MainTooltipRoot, null); // clear previous tooltip
								clearOrbit(false); // clear previous orbit
								const canvasRect = renderer.domElement.getBoundingClientRect();
								const tooltipData: TooltipData = {
									norad_id: sat.norad_id,
									orbital_period: orbital_period / 60,
									x: pointer.x + canvasRect.left,
									y: pointer.y + canvasRect.top
								};

								const selectedSatelliteData: SelectedSatelliteData = {
									name: "temp",
									norad_id: sat.norad_id,
									launch_date: "temp",
									orbital_period: `${(orbital_period / 60).toFixed(2)} minutes`,
									status: "temp",
									country: "temp",
								};
								onSatelliteSelect(selectedSatelliteData);
		
								renderOrbit(sat.satrec, orbital_period, false);
								showHoverToolTip(MainTooltipRoot, tooltipData);
							}
						}
					}
        }
      }
    };
		window.addEventListener('click', handleSatClick);

		/*
			TOOLTIP
		*/
		// shows up when user hovers or clicks on a satellite
		let HoverTooltipRoot: { root: Root | null, setRoot: (root: Root | null) => void } = { root: null, setRoot: () => {} };
		let MainTooltipRoot: { root: Root | null, setRoot: (root: Root | null) => void } = { root: null, setRoot: () => {} };
		HoverTooltipRoot.setRoot = (root: Root | null) => {HoverTooltipRoot.root = root;};
		MainTooltipRoot.setRoot = (root: Root | null) => {MainTooltipRoot.root = root;};


		/*
			ANIMATION LOOP
		*/
		const animate = () => {
			requestAnimationFrame(animate);
			satelliteData.forEach((sat, index) => {
				const { satrec } = sat;
				const satData = calculateSatPosition(satrec, new Date);
				if (satData) {
					const { position, radius } = satData;
					dummy.position.copy(position);
					dummy.scale.setScalar(0.3 * radius); // Scale the dummy object based on the radius
					dummy.updateMatrix();
					instancedMesh.setMatrixAt(index, dummy.matrix);
					radii.setX(index, radius); // Update the radius value for the instance
				}
			});
			instancedMesh.instanceMatrix.needsUpdate = true;
			radii.needsUpdate = true; // Mark the radii attribute as needing update
		};
		animate();

		return () => {
      window.removeEventListener('pointermove', handleSatHover);
			window.removeEventListener('click', handleSatClick);
    };
	}
	catch (error){
		console.error('Error: ', error);
	}
}