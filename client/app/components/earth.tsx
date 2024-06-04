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
			/*
				SCENE AND CANVAS
			*/
			const container = containerRef.current;
			const width = container.clientWidth;
      const height = container.clientHeight;

			const scene = new THREE.Scene();

			// set camera
			const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
			camera.position.z = 5;
			camera.position.y = 1;

			// create renderer
			const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
			rendererRef.current = renderer;
			renderer.shadowMap.enabled = false;
			renderer.setClearColor('rgb(2, 2, 2)');
			
			/*
				EARTH MESHES
			*/
			const earthGroup = new THREE.Group();
			scene.add(earthGroup);
			new OrbitControls(camera, renderer.domElement);

			// texture with lights
			const geometry = new THREE.IcosahedronGeometry(1, 12);
      const lights_texture = new THREE.TextureLoader().load('./assets/textures/earth_lights.jpg');
      const lights_material = new THREE.MeshBasicMaterial({ map: lights_texture });
			const lights = new THREE.Mesh(geometry, lights_material);
			earthGroup.add(lights);

			// grayscale texture
      const grayscale_texture = new THREE.TextureLoader().load('./assets/textures/earth_grayscale.jpg');
      const grayscale_material = new THREE.MeshStandardMaterial({ map: grayscale_texture, blending: THREE.AdditiveBlending, opacity: 0.8});
			const grayscale = new THREE.Mesh(geometry, grayscale_material);
			earthGroup.add(grayscale);
			
			earthGroup.rotation.y = Math.PI; // Rotate earth by 180 degress (pi radians)
			
			/*
				LIGHTS
			*/
			// const ambientLight = new THREE.AmbientLight(0x4e5cd7, 1);
			const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
			earthGroup.add(ambientLight);

			/*
				ANIMATION LOOP
			*/
			const animate = () => {
				requestAnimationFrame(animate);
				// uncomment if you want the earth to rotate
				// lights.rotation.y += 0.001;
				// grayscale.rotation.y += 0.001;
				renderer.render(scene, camera);
			};
			animate();

			/*
				CANVAS RESIZE
			*/
			const resizeCanvas = () => {
				const width = container.clientWidth;
				const height = container.clientHeight;
				camera.aspect = width / height;
				camera.updateProjectionMatrix();
				renderer.setSize(width, height);
			};
			resizeCanvas(); // Initial resize
			window.addEventListener('resize', resizeCanvas);

			/*
				SATELLITES
			*/
      renderSatellites(scene, camera, renderer, grayscale, '/data/tle.json');

			return () => {if (rendererRef.current) {rendererRef.current.dispose();}}; // Clean up on component unmount
		}
	}, []);

	return (
		<div ref={containerRef} className="w-full h-full border border-gray-700">
      <canvas ref={canvasRef} className="rounded-lg cursor-pointer"/>
    </div>
	);
}

export default Earth;