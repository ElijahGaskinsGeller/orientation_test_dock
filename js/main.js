

import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';

console.log(THREE);


let scene = new THREE.Scene();


let camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);

camera.position.z = 0;


let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.domElement.id = "canvas";

let frameCount = 30;
let loadedFrames = 0;
let lastLoadedFrames = 0;



//NOTE: LOADER


let audioListener = new THREE.AudioListener();
camera.add(audioListener);

let music = new THREE.Audio(audioListener);

let audioLoader = new THREE.AudioLoader();
audioLoader.load("./music/sittin_on_the_dock_of_the_bay.opus", function(buffer) {

	music.setBuffer(buffer);
	music.setLoop(true);
	music.setVolume(.5);

});


let loadScene = new THREE.Scene();
let textMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
let loadFont = null;
let loadedFramesText = null;


let fontLoader = new FontLoader();

let loadTextMesh = null;

fontLoader.load("rec/optimer_bold.typeface.json", function(font) {

	loadFont = font;

	console.log(font);

	let loadTextGeometry = new TextGeometry("Loading Frames...", { font: loadFont, size: 1, depth: 0 });
	loadTextGeometry.computeBoundingBox();
	let centerOffset = - 0.5 * (loadTextGeometry.boundingBox.max.x - loadTextGeometry.boundingBox.min.x);


	loadTextMesh = new THREE.Mesh(loadTextGeometry, textMaterial);


	loadTextMesh.position.x = centerOffset;
	loadTextMesh.position.z = -10;
	loadTextMesh.rotation.y = Math.PI * 2;


	let frameText = new TextGeometry(loadedFrames + "/" + frameCount, { font: loadFont, size: 1, depth: 0 });
	frameText.computeBoundingBox();
	let frameCenterOffset = - 0.5 * (frameText.boundingBox.max.x - frameText.boundingBox.min.x);
	loadedFramesText = new THREE.Mesh(frameText, textMaterial);

	loadedFramesText.position.x = frameCenterOffset;
	loadedFramesText.position.y = -2;
	loadedFramesText.position.z = -10;
	loadedFramesText.rotation.y = Math.PI * 2;



	loadScene.add(loadTextMesh);
	loadScene.add(loadedFramesText);

});



let geometry = new THREE.BoxGeometry(1, 1, 1);
let material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
let cube = new THREE.Mesh(geometry, material);
cube.position.z = -10;


let controls = new PointerLockControls(camera, renderer.domElement);
controls.minPolarAngle = Math.PI / 10;
controls.maxPolarAngle = Math.PI;



let environmentFrames = [];
for (let i = 0; i < frameCount; i++) {

	let currentFrame = (i + 1).toString();

	if (currentFrame.length == 1) {
		currentFrame = "000" + currentFrame;
	} else if (currentFrame.length == 2) {
		currentFrame = "00" + currentFrame;
	} else if (currentFrame.length == 3) {
		currentFrame = "0" + currentFrame;
	}

	let currentEnvironment = new THREE.CubeTextureLoader()
		.setPath("./imgs/")
		.load([
			currentFrame + '.left.jpg',
			currentFrame + '.right.jpg',
			currentFrame + '.top.jpg',
			currentFrame + '.bottom.jpg',
			currentFrame + '.back.jpg',
			currentFrame + '.front.jpg',

		], function(texture) {

			renderer.initTexture(texture);
			loadedFrames++;

		});


	environmentFrames.push(currentEnvironment);

}


scene.background = environmentFrames[0];






let canvas = document.getElementById("canvas");
window.addEventListener("mousedown", function(e) {
	console.log(e);
	if (loadedFrames === frameCount) {

		if (!playing) {
			camera.rotation.y = Math.PI;
			playing = true;
			music.play();
			soundIcon.classList.add("display");
		}


		if (e.target === canvas) {
			controls.lock();
		}
	}
});

window.addEventListener("mouseup", function() {
	controls.unlock();
});

window.addEventListener("touchstart", function() {
	controls.lock();
});

window.addEventListener("touchend", function() {
	controls.unlock();

});



function OnWindowResize(e) {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);


}


let frameTime = 1000 / 6;
let currentFrameTime = 0;
let currentFrame = 0;

let lastFrameTime = 0;
let playing = false;

function animate(time) {

	let deltaTime = time - lastFrameTime;
	lastFrameTime = time;

	if (playing) {

		currentFrameTime += deltaTime;
		if (currentFrameTime >= frameTime) {
			currentFrame++;
			currentFrameTime = 0;
			if (currentFrame >= frameCount) {
				currentFrame = 0;
			}
		}


		scene.background = environmentFrames[currentFrame];

		cube.rotation.x += 0.01;
		cube.rotation.y += 0.01;
		renderer.render(scene, camera);

		cube.position.z = Math.sin(time / 1000) * 10;
		cube.position.x = Math.cos(time / 1000) * 10;

	} else {

		if (lastLoadedFrames !== loadedFrames && loadFont !== null) {

			let frameText = null;

			if (loadedFrames === frameCount) {
				loadScene.remove(loadTextMesh);
				frameText = new TextGeometry("Click To Play", { font: loadFont, size: 1, depth: 0 });
			} else {
				frameText = new TextGeometry(loadedFrames + "/" + frameCount, { font: loadFont, size: 1, depth: 0 });
			}


			frameText.computeBoundingBox();
			let frameCenterOffset = - 0.5 * (frameText.boundingBox.max.x - frameText.boundingBox.min.x);
			//loadedFramesText = new THREE.Mesh(frameText, textMaterial);
			loadedFramesText.geometry = frameText;

			loadedFramesText.position.x = frameCenterOffset;
			loadedFramesText.position.y = -2;
			loadedFramesText.position.z = -10;
			loadedFramesText.rotation.y = Math.PI * 2;

		}



		renderer.render(loadScene, camera);

	}

	requestAnimationFrame(animate);
}



window.addEventListener("resize", OnWindowResize);

//renderer.setAnimationLoop(animate);

animate();

let soundIcon = document.getElementById("icon-sound");
let muteIcon = document.getElementById("icon-mute");


soundIcon.addEventListener("click", function(e) {

	soundIcon.classList.remove("display");
	muteIcon.classList.add("display");

	music.setVolume(0);

});

muteIcon.addEventListener("click", function(e) {

	muteIcon.classList.remove("display");
	soundIcon.classList.add("display");
	music.setVolume(.5);

});


