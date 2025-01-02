import * as THREE from "three";
import { Reflector } from "three/examples/jsm/Addons.js";
import TWEEN, { Tween, update as updateTween } from "tween";

const images = [
  "socrates.jpg",
  "stars.jpg",
  "wave.jpg",
  "spring.jpg",
  "mountain.jpg",
  "sunday.jpg",
];

const titles = [
  "The Death of Socrates",
  "Starry Night",
  "The Great Wave off Kanagawa",
  "Effect of Spring, Giverny",
  "Mount Corcoran",
  "A Sunday on La Grande Jatte",
];

const artists = [
  "Jacaus-Louis David",
  "Vincent van Gogh",
  "Katsushika Hokusai",
  "Claude Monet",
  "Albert Bierstadt",
  "Georges Seurat",
];

const textureLoader = new THREE.TextureLoader();

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const rootNode = new THREE.Object3D();
scene.add(rootNode);

const leftArrowTexture = textureLoader.load("left.jpg");
const rightArrowTexture = textureLoader.load("right.jpg");

let count = 6;
for (let i = 0; i < count; i++) {
  const texture = textureLoader.load(images[i]);
  texture.colorSpace = THREE.SRGBColorSpace;

  const baseNode = new THREE.Object3D();
  baseNode.rotation.y = (i / count) * Math.PI * 2;
  rootNode.add(baseNode);

  const border = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 2.2, 0.09),
    new THREE.MeshStandardMaterial({ color: 0x202020 })
  );
  border.name = `border-${i}`;
  border.position.z = -4;
  baseNode.add(border);

  const artwork = new THREE.Mesh(
    new THREE.BoxGeometry(3, 2, 0.1),
    new THREE.MeshStandardMaterial({
      map: texture,
    })
  );
  artwork.name = `artwork-${i}`;
  artwork.position.z = -4;
  baseNode.add(artwork);

  const leftArrow = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.3, 0.01),
    new THREE.MeshStandardMaterial({
      map: leftArrowTexture,
      transparent: true,
    })
  );
  leftArrow.name = `left-arrow-${i}`;
  leftArrow.userData = i === count - 1 ? 0 : i + 1;
  leftArrow.position.set(-1.8, 0, -4);
  baseNode.add(leftArrow);

  const rightArrow = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.3, 0.01),
    new THREE.MeshStandardMaterial({
      map: rightArrowTexture,
      transparent: true,
    })
  );
  rightArrow.name = `right-arrow-${i}`;
  rightArrow.userData = i === 0 ? count - 1 : i - 1;
  rightArrow.position.set(1.8, 0, -4);
  baseNode.add(rightArrow);
}

const spotlight = new THREE.SpotLight(0xffffff, 100.0, 10.0, 0.65, 1);
spotlight.position.set(0, 5, 0);
spotlight.target.position.set(0, 0.5, -5);
scene.add(spotlight);
scene.add(spotlight.target);

const mirror = new Reflector(new THREE.CircleGeometry(10, 32), {
  textureWidth: window.innerWidth,
  textureHeight: window.innerHeight,
  color: 0x404040,
});
mirror.rotateX(-Math.PI / 2);
mirror.position.y = -1.1;
scene.add(mirror);

function rotateGallery(direction, newIndex) {
  const deltaY = (direction / count) * 2 * Math.PI;

  new Tween(rootNode.rotation)
    .to({ y: rootNode.rotation.y + deltaY })
    .easing(TWEEN.Easing.Quadratic.InOut)
    .start()
    .onStart(() => {
      document.getElementById("title").style.opacity = 0;
      document.getElementById("artist").style.opacity = 0;
    })
    .onComplete(() => {
      document.getElementById("title").innerText = titles[newIndex];
      document.getElementById("artist").innerText = artists[newIndex];

      document.getElementById("title").style.opacity = 1;
      document.getElementById("artist").style.opacity = 1;
    });
}

function animate() {
  updateTween();
  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  mirror.getRenderTarget().setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener("click", (event) => {
  const raycaster = new THREE.Raycaster();

  const mouseNDC = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );
  raycaster.setFromCamera(mouseNDC, camera);

  const intersections = raycaster.intersectObjects(scene.children, true);
  if (intersections.length > 0) {
    const obj = intersections[0].object;
    const newIndex = obj.userData;
    if (obj.name.includes("left-arrow")) {
      rotateGallery(-1, newIndex);
    }
    if (obj.name.includes("right-arrow")) {
      rotateGallery(1, newIndex);
    }
  }
});

document.getElementById("title").innerText = titles[0];
document.getElementById("artist").innerText = artists[0];
