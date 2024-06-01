"use client"

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import renderSatellites from './satellites';

const Earth: React.FC = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

	useEffect(() => {
		if (canvasRef.current && containerRef.current){
			const container = containerRef.current;
			const width = container.clientWidth;
      const height = container.clientHeight;

			const scene = new THREE.Scene();

			// set camera
			const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
			camera.position.z = 6;

			// create renderer
			const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
			rendererRef.current = renderer;
			renderer.setClearColor('rgb(2, 2, 2)');
			
			const earthGroup = new THREE.Group();
			scene.add(earthGroup);
			new OrbitControls(camera, renderer.domElement);
			
			// add mesh and materials
			// lights
			const geometry = new THREE.IcosahedronGeometry(1, 12);
      const lights_texture = new THREE.TextureLoader().load('./assets/textures/earth_lights.jpg');
      const lights_material = new THREE.MeshBasicMaterial({ map: lights_texture });
			const lights = new THREE.Mesh(geometry, lights_material);
			earthGroup.add(lights);
			// grayscale
      const grayscale_texture = new THREE.TextureLoader().load('./assets/textures/earth_grayscale.jpg');
      const grayscale_material = new THREE.MeshStandardMaterial({ map: grayscale_texture, blending: THREE.AdditiveBlending});
			const grayscale = new THREE.Mesh(geometry, grayscale_material);
			earthGroup.add(grayscale);
			
			// lights
			const ambientLight = new THREE.AmbientLight(0x4e5cd7, 1);
			earthGroup.add(ambientLight);

			// create animation
			const animate = () => {
				requestAnimationFrame(animate);
				// uncomment for earth rotation
				// lights.rotation.y += 0.001;
				// grayscale.rotation.y += 0.001;
				renderer.render(scene, camera);
			};
			animate();

			// Resize canvas
			const resizeCanvas = () => {
				const width = container.clientWidth;
				const height = container.clientHeight;
				camera.aspect = width / height;
				camera.updateProjectionMatrix();
				renderer.setSize(width, height);
			};
			resizeCanvas(); // Initial resize
			window.addEventListener('resize', resizeCanvas);

			// render satellites
      renderSatellites(scene, '/data/tle.json');

			return () => {if (rendererRef.current) {rendererRef.current.dispose();}}; // Clean up on component unmount
		}
	}, []);

	return (
		<div ref={containerRef} className="w-full h-full border-2 border-zinc-600 rounded-md ">
      <canvas ref={canvasRef} className="rounded-lg cursor-pointer"/>
    </div>
	);
}

export default Earth;