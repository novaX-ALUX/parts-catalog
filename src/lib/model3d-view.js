// Interactive 3D model for the product page's 3D tab (three.js, loaded on demand by Model3D.astro).
// The .glb may be meshopt-compressed (gltf-transform optimize --compress meshopt); the decoder
// ships with three, so nothing is fetched from a CDN. Coordinates are glTF (Y up, metres).
import {
  Box3, DirectionalLight, NeutralToneMapping, PMREMGenerator, PerspectiveCamera, Scene, Sphere, Vector3, WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

// Default view: from the front-left, above the board (x right, y up, z toward the viewer).
const VIEW_DIR = new Vector3(-0.55, 0.95, 1.0).normalize();

export function mountModel(root) {
  const canvas = root.querySelector('canvas');
  const status = root.querySelector('.m3-status');
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = NeutralToneMapping; // keeps the connector yellow and mask green close to the product photo

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const sun = new DirectionalLight(0xffffff, 0.9);
  scene.add(sun);

  const camera = new PerspectiveCamera(30, 1, 0.001, 100);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.8;
  controls.addEventListener('start', () => { controls.autoRotate = false; });

  let home = null;
  const resetView = () => {
    if (!home) return;
    camera.position.copy(home.position);
    controls.target.copy(home.target);
    controls.update();
  };
  canvas.addEventListener('dblclick', resetView);

  const resize = () => {
    const w = root.clientWidth;
    const h = root.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(root);
  resize();

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(root);
  renderer.setAnimationLoop(() => {
    if (!visible) return;
    controls.update();
    sun.position.copy(camera.position);
    renderer.render(scene, camera);
  });

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  loader.load(root.dataset.src, (gltf) => {
    const model = gltf.scene;
    const box = new Box3().setFromObject(model);
    const centre = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3()).length();
    model.position.sub(centre);
    scene.add(model);
    camera.near = size / 100;
    camera.far = size * 20;
    camera.updateProjectionMatrix();
    // Fit the bounding sphere into the narrower of the two view angles; a flat board fills it at ~0.75.
    const r = box.getBoundingSphere(new Sphere()).radius;
    const vHalf = (camera.fov * Math.PI) / 360;
    const hHalf = Math.atan(Math.tan(vHalf) * camera.aspect);
    const dist = (r / Math.sin(Math.min(vHalf, hHalf))) * 0.75;
    home = { position: VIEW_DIR.clone().multiplyScalar(dist), target: new Vector3() };
    controls.minDistance = size * 0.3;
    controls.maxDistance = size * 4;
    resetView();
    status.hidden = true;
  }, (ev) => {
    if (ev.total) status.textContent = `Loading 3D model… ${Math.round((100 * ev.loaded) / ev.total)} %`;
  }, () => {
    status.textContent = '3D model could not be loaded.';
  });
}
