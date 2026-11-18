// 원본 3D 장면의 빛 — 배포판 level1 의 RenderSettings · Directional Light 값을 three 로 옮김
//   주변광: Skybox 모드 · ambientProbe(L2 구면 조화 27개, Unity 셰이더용 다항식 계수 = ShadeSH9 가 곧 바탕색에 곱해지는 값)
//   해: 흰색 · 세기 1 · 진행 방향(Unity 세계) (0.433, −0.5, 0.75) · 부드러운 그림자 세기 1
// 좌표: three 세계 = Unity 세계의 z 뒤집기(카메라가 Unity −z 에서 +z 를 봄 → three +z 에서 −z 를 봄)
// 세기: Unity 는 확산 반사에 1/π 를 안 씀 → three 빛 세기 = π × Unity 세기, 주변광은 아래 SH 변환이 맞춰 줌
import * as THREE from "three";

// RenderSettings.m_AmbientProbe — sh[0..8] 빨강 · [9..17] 초록 · [18..26] 파랑 (Unity 순서: 1, y, z, x, xy, yz, 3z²−1, xz, x²−y²)
const PROBE = [
  0.18386909, -0.00491387, -0.01110834, -0.00641387, -0.00497471, -0.00861582, 0.01298795, 0.01865388, 0.02831353,
  0.22901776, 0.0411938, -0.01746941, -0.01008604, -0.0079125, -0.01370443, 0.01810559, 0.02696838, 0.03888462,
  0.30311173, 0.12272544, -0.02987579, -0.01725144, -0.01401479, -0.02427291, 0.02270203, 0.03825857, 0.04611865,
];
export const SUN = { dir: [0.433, -0.5, 0.75], intensity: 1 }; // Unity 세계 진행 방향

/** Unity ShadeSH9 다항식 계수 → three 빛(복사) 구면 조화 계수.
 *  three 의 확산 = Σ sᵢ·Yᵢ·Aᵢ / π (A = π, 2π/3, π/4) 가 Unity ShadeSH9(n′) 와 같아지게 풀고, z 홀수 항은 z 뒤집기로 부호를 바꿈 */
export function unitySH() {
  const sh = new THREE.SphericalHarmonics3();
  const k = [Math.PI / 0.886227, Math.PI / 1.023328, -Math.PI / 1.023328, Math.PI / 1.023328,
    Math.PI / 0.858086, -Math.PI / 0.858086, (3 * Math.PI) / 0.743125, -Math.PI / 0.858086, Math.PI / 0.429043];
  for (let i = 0; i < 9; i++) sh.coefficients[i].set(PROBE[i] * k[i], PROBE[9 + i] * k[i], PROBE[18 + i] * k[i]);
  return sh;
}

/** 주변광·반사용 환경 그림: 위 구면 조화를 방향마다 펼친 등장방형(64×32) → PMREM. (원본 반사도 같은 하늘에서 옴 · 세기 1) */
export function unityEnvironment(renderer) {
  const sh = unitySH(), W = 64, H = 32, data = new Uint16Array(W * H * 4), d = new THREE.Vector3(), c = new THREE.Vector3();
  const half = THREE.DataUtils.toHalfFloat;
  for (let j = 0; j < H; j++) {
    const th = ((j + 0.5) / H - 0.5) * Math.PI;
    for (let i = 0; i < W; i++) {
      const ph = ((i + 0.5) / W - 0.5) * 2 * Math.PI;
      d.set(Math.cos(ph) * Math.cos(th), Math.sin(th), Math.sin(ph) * Math.cos(th));
      sh.getAt(d, c);
      data.set([half(Math.max(0, c.x)), half(Math.max(0, c.y)), half(Math.max(0, c.z)), half(1)], (j * W + i) * 4);
    }
  }
  const tex = new THREE.DataTexture(data, W, H, THREE.RGBAFormat, THREE.HalfFloatType); // 반정밀: WebGL2 어디서나 겹선형 읽기 됨(Mac 포함)
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.LinearSRGBColorSpace;
  tex.magFilter = tex.minFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  const pm = new THREE.PMREMGenerator(renderer);
  const env = pm.fromEquirectangular(tex).texture;
  tex.dispose(); pm.dispose();
  return env;
}

/** 해: three 위치 = −(z 뒤집은 진행 방향) */
export function unitySun() {
  const [x, y, z] = SUN.dir;
  const sun = new THREE.DirectionalLight(0xffffff, Math.PI * SUN.intensity);
  sun.position.set(-x, -y, z).normalize().multiplyScalar(2);
  return sun;
}
