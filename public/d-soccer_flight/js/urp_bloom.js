// 원본 URP Bloom(Unity 2022.3 · URP 14 · PostProcessPass.SetupBloom / Bloom.shader)을 three 로 옮김 — 같은 순서·같은 값.
// 1) 반 크기로 문턱 거르기(가장 밝은 채널 · 부드러운 무릎 = 문턱의 절반)  2) 반씩 줄이며 가로 9탭 · 세로 5탭 흐림
// 3) 가장 작은 것부터 올라오며 lerp(위 단, 아래 단, scatter)  4) 원래 그림에 세기만큼 더함(색 보정 없음 — 원본 Volume 에 Tonemapping 없음)
// 원본 값(Volume: Bloom): threshold 5.19(감마 → 선형 37.43) · intensity 1.63 · scatter 0.12(→ 0.05~0.95 사이 0.158) · clamp 65472
//   · skipIterations 1 · maxIterations 6 · downscale Half · highQualityFiltering 끔
import * as THREE from "three";
import { Pass, FullScreenQuad } from "three/addons/postprocessing/Pass.js";

const gammaToLinear = (v) => (v <= 0.04045 ? v / 12.92 : v < 1 ? ((v + 0.055) / 1.055) ** 2.4 : v ** 2.2); // Unity Mathf.GammaToLinearSpace
export const URP_BLOOM = { threshold: 5.19, intensity: 1.63, scatter: 0.12, clamp: 65472, skip: 1, maxIter: 6 };

const VS = "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
const FS = {
  // Bloom.shader FragPrefilter (HQ 끔: 한 번의 겹선형 읽기)
  prefilter: `uniform sampler2D tSrc; uniform vec4 params; varying vec2 vUv;
    void main() {
      vec3 c = min(vec3(params.y), texture2D(tSrc, vUv).rgb);
      float br = max(c.r, max(c.g, c.b));
      float soft = clamp(br - params.z + params.w, 0.0, 2.0 * params.w);
      soft = (soft * soft) / (4.0 * params.w + 1e-4);
      c *= max(br - params.z, soft) / max(br, 1e-4);
      gl_FragColor = vec4(max(c, 0.0), 1.0);
    }`,
  // FragBlurH: 원본 한 단 위(2배 큰) 그림을 2텍셀 간격 9탭으로
  blurH: `uniform sampler2D tSrc; uniform vec2 texel; varying vec2 vUv;
    void main() {
      float t = texel.x * 2.0;
      vec3 c = texture2D(tSrc, vUv - vec2(t * 4.0, 0.0)).rgb * 0.01621622 + texture2D(tSrc, vUv - vec2(t * 3.0, 0.0)).rgb * 0.05405405
        + texture2D(tSrc, vUv - vec2(t * 2.0, 0.0)).rgb * 0.12162162 + texture2D(tSrc, vUv - vec2(t, 0.0)).rgb * 0.19459459
        + texture2D(tSrc, vUv).rgb * 0.22702703 + texture2D(tSrc, vUv + vec2(t, 0.0)).rgb * 0.19459459
        + texture2D(tSrc, vUv + vec2(t * 2.0, 0.0)).rgb * 0.12162162 + texture2D(tSrc, vUv + vec2(t * 3.0, 0.0)).rgb * 0.05405405
        + texture2D(tSrc, vUv + vec2(t * 4.0, 0.0)).rgb * 0.01621622;
      gl_FragColor = vec4(c, 1.0);
    }`,
  // FragBlurV: 겹선형 읽기를 이용한 5탭
  blurV: `uniform sampler2D tSrc; uniform vec2 texel; varying vec2 vUv;
    void main() {
      float t = texel.y;
      vec3 c = texture2D(tSrc, vUv - vec2(0.0, t * 3.23076923)).rgb * 0.07027027 + texture2D(tSrc, vUv - vec2(0.0, t * 1.38461538)).rgb * 0.31621622
        + texture2D(tSrc, vUv).rgb * 0.22702703 + texture2D(tSrc, vUv + vec2(0.0, t * 1.38461538)).rgb * 0.31621622
        + texture2D(tSrc, vUv + vec2(0.0, t * 3.23076923)).rgb * 0.07027027;
      gl_FragColor = vec4(c, 1.0);
    }`,
  // FragUpsample (HQ 끔): lerp(위 단, 아래 단, scatter)
  upsample: `uniform sampler2D tSrc; uniform sampler2D tLow; uniform float scatter; varying vec2 vUv;
    void main() { gl_FragColor = vec4(mix(texture2D(tSrc, vUv).rgb, texture2D(tLow, vUv).rgb, scatter), 1.0); }`,
  // UberPost: color += bloom × intensity (tint 흰색)
  composite: `uniform sampler2D tSrc; uniform sampler2D tLow; uniform float intensity; varying vec2 vUv;
    void main() { vec4 c = texture2D(tSrc, vUv); gl_FragColor = vec4(c.rgb + texture2D(tLow, vUv).rgb * intensity, c.a); }`,
};

const mat = (fs, uniforms) => new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: fs, uniforms, depthTest: false, depthWrite: false });
const rt = () => new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false });

export class URPBloomPass extends Pass {
  constructor(o = URP_BLOOM) {
    super();
    const th = gammaToLinear(o.threshold);
    this.o = o;
    this.m = {
      prefilter: mat(FS.prefilter, { tSrc: { value: null }, params: { value: new THREE.Vector4(lerp(0.05, 0.95, o.scatter), o.clamp, th, th * 0.5) } }),
      blurH: mat(FS.blurH, { tSrc: { value: null }, texel: { value: new THREE.Vector2() } }),
      blurV: mat(FS.blurV, { tSrc: { value: null }, texel: { value: new THREE.Vector2() } }),
      upsample: mat(FS.upsample, { tSrc: { value: null }, tLow: { value: null }, scatter: { value: lerp(0.05, 0.95, o.scatter) } }),
      composite: mat(FS.composite, { tSrc: { value: null }, tLow: { value: null }, intensity: { value: o.intensity } }),
    };
    this.quad = new FullScreenQuad();
    this.down = []; this.tmp = []; this.up = [];
  }

  setSize(w, h) {
    // PostProcessPass.SetupBloom: tw = 폭 >> 1 · 단 수 = clamp(floor(log2(max) − 1) − skip, 1, max)
    let tw = Math.max(1, w >> 1), th = Math.max(1, h >> 1);
    const n = Math.min(this.o.maxIter, Math.max(1, Math.floor(Math.log2(Math.max(tw, th)) - 1) - this.o.skip));
    for (const t of [...this.down, ...this.tmp, ...this.up]) t.dispose();
    this.down = []; this.tmp = []; this.up = [];
    for (let i = 0; i < n; i++) {
      for (const list of [this.down, this.tmp, this.up]) { const t = rt(); t.setSize(tw, th); list.push(t); }
      tw = Math.max(1, tw >> 1); th = Math.max(1, th >> 1);
    }
  }

  draw(renderer, m, target) { this.quad.material = m; renderer.setRenderTarget(target); this.quad.render(renderer); }

  render(renderer, writeBuffer, readBuffer) {
    const { m, down, tmp, up } = this, n = down.length;
    m.prefilter.uniforms.tSrc.value = readBuffer.texture;
    this.draw(renderer, m.prefilter, down[0]);
    for (let i = 1; i < n; i++) {
      m.blurH.uniforms.tSrc.value = down[i - 1].texture;
      m.blurH.uniforms.texel.value.set(1 / down[i - 1].width, 1 / down[i - 1].height);
      this.draw(renderer, m.blurH, tmp[i]);
      m.blurV.uniforms.tSrc.value = tmp[i].texture;
      m.blurV.uniforms.texel.value.set(1 / tmp[i].width, 1 / tmp[i].height);
      this.draw(renderer, m.blurV, down[i]);
    }
    for (let i = n - 2; i >= 0; i--) {
      m.upsample.uniforms.tSrc.value = down[i].texture;
      m.upsample.uniforms.tLow.value = (i === n - 2 ? down[i + 1] : up[i + 1]).texture;
      this.draw(renderer, m.upsample, up[i]);
    }
    m.composite.uniforms.tSrc.value = readBuffer.texture;
    m.composite.uniforms.tLow.value = (n > 1 ? up[0] : down[0]).texture;
    this.draw(renderer, m.composite, this.renderToScreen ? null : writeBuffer);
  }

  dispose() {
    for (const t of [...this.down, ...this.tmp, ...this.up]) t.dispose();
    Object.values(this.m).forEach((x) => x.dispose());
    this.quad.dispose();
  }
}

function lerp(a, b, t) { return a + (b - a) * t; }
