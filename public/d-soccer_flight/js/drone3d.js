// 3D 드론 보기 — 원본 Unity 상태 탭 3D 칸을 옮김 (three.js). 정본: 이 파일(공개 API) · 빛 번짐 urp_bloom.js · 빛·주변광 unity_env.js
// 쓰기: const v = new Drone3D(div); await v.load(); v.setConnected(true); v.setAttitude(roll, pitch, yaw); v.setTeamColor("red"); v.setPositionRgb(r, g, b)
// 원본(배포판 level1 · ButtonManager.SerialConnect · DroneMove.Update · DroneLED · LEDSetting):
//   연결 전·후 그림이 다르다 — 연결 전 = RawCamera 그림(빛 번짐 없음 · 드론은 장면 그대로 180° 돌린 자세),
//   연결 후 = 캔버스 안 3D(빛 번짐 있음 · DroneMove 가 세계 회전을 Euler(pitch, −yaw, −roll) 로 덮어씀, Lerp(dt×100)).
//   모델은 원본 장면의 D_Soccer 를 그대로 꺼낸 것(tools/unity_model.py → assets/model/drone.glb · 1 = 1 m).
//   LED 재질은 원본 LED_*.mat 값(HDR 빛 수십~183)을 그대로 — 색 보정이 없어 가운데는 하얗게 잘리고 둘레만 번진다.
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { URPBloomPass } from "./urp_bloom.js";
import { unityEnvironment, unitySun } from "./unity_env.js";

// 원본 LED 재질(바탕색 sRGB · 빛 HDR 선형) — DroneLED.mat 순서 그대로
const LED = (base, e) => ({ base, e });
const TEAM = [LED([1, 0, 0], [183.155, 1.437, 1.437]), LED([0, 0, 1], [0.655, 0.655, 166.927])]; // LedType 1: LED_TeamRed · LED_Blue
const POS = [ // LedType 2: LED_Red · Blue · Green · Yellow · Cyan · White · Magenta
  LED([1, 0, 0], [95.875, 1.506, 1.506]), LED([0, 0, 1], [0.655, 0.655, 166.927]), LED([0, 1, 0], [1.73, 110.131, 10.379]),
  LED([1, 0.878, 0], [77.874, 77.874, 1.527]), LED([0, 1, 1], [0.538, 102.756, 102.756]), LED([1, 1, 1], [67.794, 67.794, 67.794]),
  LED([0.965, 0, 1], [108.401, 1.73, 110.131]),
];
const PANEL_BG = 0x373737;   // 원본 3D 칸 바탕 — 원본 화면에서 잰 값(55,55,55)
const PX_PER_M = { on: 1000, off: 1002.2 }; // 무대 px / m — 캔버스 안 배율 1000 · RawCamera(크기 3.15 ÷ 배율 9.2593 → 682px)
const RY_PI = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);

export class Drone3D {
  constructor(el, { modelUrl = new URL("../assets/model/drone.glb", import.meta.url).href } = {}) {
    this.el = el;
    this.modelUrl = modelUrl;
    this.target = RY_PI.clone();
    this.connected = false;
    this.yawOffset = 0;
    this.propSpeed = [0, 0, 0, 0];
    this.props = [];
    this.teamMeshes = [];
    this.posMeshes = [];

    const r = (this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" }));
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.NoToneMapping; // 원본 Volume 에 Tonemapping 없음 → 1 넘는 값은 잘림
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFShadowMap; // 원본 Soft Shadows — three 0.187 은 PCFSoft 를 없애고 PCF + radius 로 부드럽게
    // 그림판은 칸 크기 그대로 — 안 정하면 화면 배율(125%·150%)만큼 커져 아래·오른쪽이 잘린다(2026-11-10 이사님 화면)
    r.domElement.style.cssText = "display:block;width:100%;height:100%";
    el.appendChild(r.domElement);

    const s = (this.scene = new THREE.Scene());
    s.background = new THREE.Color(PANEL_BG);
    s.environment = unityEnvironment(r);
    s.environmentIntensity = 1; // 원본 ambientIntensity 1 · reflectionIntensity 1
    // 그림판이 끊겼다 살아나면(그래픽 드라이버 재시작·HP 숨은 화면) PMREM 결과가 사라짐 → 주변광을 다시 만든다(안 하면 보호망이 어둡게 나옴)
    r.domElement.addEventListener("webglcontextrestored", () => { s.environment = unityEnvironment(r); });
    const sun = (this.sun = unitySun());
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.bias = -0.0002;
    sun.shadow.normalBias = 0.002;
    sun.shadow.radius = 3;
    const sc = sun.shadow.camera;
    sc.left = sc.bottom = -0.3; sc.right = sc.top = 0.3; sc.near = 0.5; sc.far = 4;
    s.add(sun);

    // 직교 카메라 — 드론 원점(D_Soccer)이 칸 가운데(원본 Background·DroneRawImage 가운데)
    const cam = (this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 10));
    cam.position.set(0, 0, 3);
    this.root = new THREE.Group(); // 원본 D-Soccer_IDLE New 의 세계 회전
    this.turn = new THREE.Group(); // 장면 좌표 → three: Unity 쪽 180° 를 여기서 한 번 돌려 둠
    this.turn.rotation.y = Math.PI;
    this.root.add(this.turn);
    this.root.quaternion.copy(RY_PI);
    s.add(this.root);

    // 마우스로 돌리기·확대는 없음 — 원본 코드에 3D 칸 마우스 처리가 없다(Input 쓰는 곳: LED 편집·모터 번호 끌기·모터 키 정지뿐)

    // 4배 MSAA 로 그린 뒤 원본 URP Bloom(연결 때만 — 연결 전 RawCamera 그림에는 후처리 없음) → sRGB
    const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
    this.composer = new EffectComposer(r, rt);
    this.composer.addPass(new RenderPass(s, cam));
    this.bloom = new URPBloomPass();
    this.bloom.enabled = false;
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    this.timer = new THREE.Timer();
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(el);
    this.resize();
    r.setAnimationLoop(() => this.frame());
  }

  async load() {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    const gltf = await loader.loadAsync(this.modelUrl);
    const m = (this.model = gltf.scene);
    const team = TEAM.map(ledMaterial), pos = POS.map(ledMaterial);
    this.ledMats = { team, pos };
    m.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = o.receiveShadow = true;
      const name = o.material?.name;
      if (name === "LED_TeamRed") { this.teamMeshes.push(o); o.material = team[0]; } // 원본 처음 재질
      else if (name === "LED_Yellow") { this.posMeshes.push(o); o.material = pos[3]; }
    });
    for (let i = 1; i <= 4; i++) this.props.push(m.getObjectByName("prop" + i) || null);
    this.turn.add(m);
    this.root.updateMatrixWorld(true);
    this.props = this.props.map((p) => (p ? centerPivot(p) : null));
    this.loaded = true;
  }

  /** 연결 상태 — 원본 ButtonManager.SerialConnect: 연결되면 3D(빛 번짐) · 끊기면 RawCamera 그림(번짐 없음, 장면 자세) */
  setConnected(on) {
    this.connected = on;
    this.bloom.enabled = on;
    if (!on) { this.target.copy(RY_PI); this.root.quaternion.copy(RY_PI); }
    this.resize();
  }

  // 원본 DroneMove: 세계 회전 = Euler(pitch, −yaw, −roll) (Unity Z→X→Y · 왼손) → three(z 뒤집기): (−pitch, yaw, −roll) 'YXZ'
  setAttitude(roll, pitch, yaw) {
    const d = THREE.MathUtils.degToRad;
    this.target.setFromEuler(new THREE.Euler(-d(pitch), d(yaw - this.yawOffset), -d(roll), "YXZ"));
  }
  setYawOffset(deg) { this.yawOffset = deg; }
  resetAttitude() { this.target.copy(RY_PI); this.root.quaternion.copy(RY_PI); }

  /** 팀 LED — LEDSetting.TeamLED_Check: 빨강 0 · 파랑 1 */
  setTeamColor(name) { const m = this.ledMats?.team[name === "blue" ? 1 : 0]; if (m) this.teamMeshes.forEach((o) => (o.material = m)); }
  /** 포지션 LED — SerialManager.get_Position_LEDColor → LEDSetting.PositionLED_Check: 맞는 색이 없으면 그대로 */
  setPositionRgb(r, g, b) {
    const i = { "0,255,0": 2, "255,255,0": 3, "0,255,255": 4, "255,255,255": 5, "255,0,255": 6 }[`${r},${g},${b}`];
    const m = i == null ? null : this.ledMats?.pos[i];
    if (m) this.posMeshes.forEach((o) => (o.material = m));
  }
  setPropSpeed(i, rps) { this.propSpeed[i] = rps; }

  resize() {
    const w = this.el.clientWidth || 1, h = this.el.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.composer.setSize(w, h);
    const k = PX_PER_M[this.connected ? "on" : "off"], cam = this.camera; // 칸 px → m
    cam.left = -w / 2 / k; cam.right = w / 2 / k; cam.top = h / 2 / k; cam.bottom = -h / 2 / k;
    cam.updateProjectionMatrix();
  }

  frame() {
    this.timer.update();
    const dt = Math.min(this.timer.getDelta(), 0.1);
    if (this.connected) this.root.quaternion.slerp(this.target, Math.min(1, dt * 100)); // 원본 smoothness 100
    this.props.forEach((p, i) => { if (p && this.propSpeed[i]) p.pivot.rotateOnAxis(p.axis, this.propSpeed[i] * dt * Math.PI * 2); });
    // 칸이 숨어 있으면(다른 탭 · display:none) 그리지 않음 — 원본 Unity 도 탭이 꺼지면 그 칸은 안 그려짐. 자세·프로펠러는 위에서 계속 따라감
    if (!this.el.offsetParent) return;
    this.composer.render();
  }

  dispose() {
    this.renderer.setAnimationLoop(null);
    this.ro.disconnect();
    this.bloom.dispose();
    this.renderer.dispose();
    this.el.innerHTML = "";
  }
}

// 원본 URP Lit 재질: 바탕색(sRGB) · 매끈함 0.5 · 빛(HDR 선형)
function ledMaterial({ base, e }) {
  const mx = Math.max(...e);
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color().setRGB(base[0], base[1], base[2], THREE.SRGBColorSpace), roughness: 0.5, metalness: 0,
    emissive: new THREE.Color().setRGB(e[0] / mx, e[1] / mx, e[2] / mx, THREE.LinearSRGBColorSpace), emissiveIntensity: mx,
  });
}

// 프로펠러가 제자리에서 돌도록 회전 중심을 몸통 가운데로 옮김
function centerPivot(o) {
  const box = new THREE.Box3().setFromObject(o);
  const cw = box.getCenter(new THREE.Vector3());
  const cl = o.parent.worldToLocal(cw.clone());
  const pivot = new THREE.Group();
  pivot.name = o.name + "_pivot";
  o.parent.add(pivot);
  pivot.position.copy(cl);
  pivot.quaternion.identity();
  o.position.sub(cl);
  pivot.add(o);
  // 드론 위쪽(세계 +Y)을 부모 좌표로 바꾼 축 — 이 축으로 돌린다
  const q = o.parent.parent.getWorldQuaternion(new THREE.Quaternion()).invert();
  const axis = new THREE.Vector3(0, 1, 0).applyQuaternion(q).normalize();
  return { pivot, axis };
}
