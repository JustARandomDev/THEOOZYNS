const TAU = Math.PI * 2;
const { sin, cos, floor, sqrt, abs, max, min, atan2, PI } = Math;

const HUE: number[] = new Array(1024);
for (let i = 0; i < 1024; i++) {
  const h = i / 1024;
  const s = floor(h * 6);
  const f = h * 6 - s;
  const q = 1 - f;
  let r = 0, g = 0, b = 0;
  if (s === 0) { r = 255; g = f * 255; b = 0; }
  else if (s === 1) { r = q * 255; g = 255; b = 0; }
  else if (s === 2) { r = 0; g = 255; b = f * 255; }
  else if (s === 3) { r = 0; g = q * 255; b = 255; }
  else if (s === 4) { r = f * 255; g = 0; b = 255; }
  else { r = 255; g = 0; b = q * 255; }
  HUE[i] = (floor(r) << 16) | (floor(g) << 8) | floor(b);
}

function hueRGB(h: number, bright: number): [number, number, number] {
  const b = bright < 0 ? 0 : bright > 1 ? 1 : bright;
  const idx = floor(((h % 1) + 1) * 1024) % 1024;
  const v = HUE[idx];
  return [
    floor(((v >> 16) & 0xff) * b),
    floor(((v >> 8) & 0xff) * b),
    floor((v & 0xff) * b),
  ];
}

let rngState = 1;
function seedRNG(s: number) {
  rngState = Math.imul(s, 2654435761) >>> 0;
  if (rngState <= 0) rngState = 1;
}
function rnd() {
  rngState = (Math.imul(rngState, 1664525) + 1013904223) >>> 0;
  return rngState / 4294967296;
}
const rF = (lo: number, hi: number) => lo + rnd() * (hi - lo);
const rI = (lo: number, hi: number) => floor(rnd() * (hi - lo + 1)) + lo;

type GeneFn = (x: number, y: number, t: number, p: number[]) => number;
type ComboFn = (a: number, b: number) => number;
type ColorFn = (v: number, v2: number, t: number) => [number, number];

const GENES: GeneFn[] = [
  (x, y, t, p) => sin(x * p[0] + t * p[2]),
  (x, y, t, p) => cos(y * p[1] + t * p[2]),
  (x, y, t, p) => sin(x * p[0] + y * p[1] + t * p[2]),
  (x, y, t, p) => cos(x * p[1] - y * p[0] + t * p[2]),
  (x, y, t, p) => sin(sqrt(x * x + y * y + 0.001) * p[0] - t * p[2]),
  (x, y, t, p) => cos(sqrt(x * x + y * y + 0.001) * p[1] + t * p[2]),
  (x, y, t, p) => sin(x * p[0]) * cos(y * p[1] + t * p[2]),
  (x, y, t, p) =>
    sin((x + y) * p[0] + t * p[2]) * sin((x - y) * p[1] - t * p[2]),
  (x, y, t, p) => sin(x * x * p[0] + y * y * p[1] + t * p[2]),
  (x, y, t, p) => sin((x * x - y * y) * p[0] + t * p[2]),
  (x, y, t, p) =>
    sin(
      sqrt(x * x + y * y + 0.001) * p[0] +
        atan2(y + 0.001, x + 0.001) * p[1] +
        t * p[2],
    ),
  (x, y, t, p) => cos((x + y) * p[0] + sin(t * p[2]) * p[1]),
];

const COMBINATORS: ComboFn[] = [
  (a, b) => (a + b) * 0.5,
  (a, b) => a * b,
  (a, b) => abs(a - b),
  (a, b) => sin(a + b),
  (a, b) => (a + b + a * b) * 0.33,
  (a, b) => max(a, b),
  (a, b) => min(a, b),
  (a, b) => sin(a * b * PI),
];

const COLOR_FNS: ColorFn[] = [
  (v, v2, t) => [(v * 0.5 + 0.5 + t * 0.07) % 1, 0.5 + v2 * 0.4],
  (v, v2, t) => [(abs(v) + t * 0.05) % 1, 0.4 + abs(v2) * 0.5],
  (v, v2, t) => [(v * v2 * 0.5 + 0.5 + t * 0.09) % 1, max(0.2, abs(v) * 0.8)],
  (v, v2, t) => [(sin(v * PI + t) * 0.5 + 0.5) % 1, 0.5 + abs(v2) * 0.3],
  (v, v2, t) => [((v + v2) * 0.3 + t * 0.06) % 1, 0.4 + abs(v * v2) * 0.5],
];

function makeParams(): number[] {
  const p = new Array(8);
  for (let i = 0; i < 8; i++) p[i] = rF(1, 7) * (rnd() > 0.5 ? 1 : -1);
  p[2] = rF(0.3, 2);
  return p;
}

export type Genome = {
  seed: number;
  numGenes: number;
  genes: GeneFn[];
  params: number[][];
  combinators: ComboFn[];
  colorFn: ColorFn;
  spaceScale: number;
  timeScale: number;
  ox: number;
  oy: number;
  colorGeneIdx: number;
  colorParams: number[];
};

export function buildGenome(seed: number): Genome {
  seedRNG(seed);
  const numGenes = rI(3, 5);
  const G: Genome = {
    seed,
    numGenes,
    genes: new Array(numGenes),
    params: new Array(numGenes),
    combinators: new Array(numGenes - 1),
    colorFn: COLOR_FNS[rI(0, COLOR_FNS.length - 1)],
    spaceScale: rF(0.8, 3.3),
    timeScale: rF(0.12, 1.1),
    ox: rF(0.05, 0.35),
    oy: rF(0.05, 0.35),
    colorGeneIdx: rI(0, GENES.length - 1),
    colorParams: makeParams(),
  };
  for (let i = 0; i < numGenes; i++) {
    G.genes[i] = GENES[rI(0, GENES.length - 1)];
    G.params[i] = makeParams();
  }
  for (let i = 0; i < numGenes - 1; i++) {
    G.combinators[i] = COMBINATORS[rI(0, COMBINATORS.length - 1)];
  }
  G.colorParams[2] = rF(0.1, 1);
  return G;
}

function evalGenome(G: Genome, x: number, y: number, t: number) {
  const sx = (x + G.ox) * G.spaceScale;
  const sy = (y + G.oy) * G.spaceScale;
  const lt = t * G.timeScale;
  let v = G.genes[0](sx, sy, lt, G.params[0]);
  for (let i = 1; i < G.numGenes; i++) {
    v = G.combinators[i - 1](v, G.genes[i](sx, sy, lt, G.params[i]));
  }
  if (v > 2) v = 2;
  else if (v < -2) v = -2;
  let v2 = GENES[G.colorGeneIdx](
    sx * 1.2,
    sy * 1.2,
    lt * G.colorParams[2],
    G.colorParams,
  );
  if (v2 > 2) v2 = 2;
  else if (v2 < -2) v2 = -2;
  const [h, bright] = G.colorFn(v, v2, t * 0.05);
  return hueRGB(h, bright);
}

export type ArtConfig = {
  width?: number;
  height?: number;
  seed?: number;
  autoMode?: boolean;
  duration?: number;
  blendTime?: number;
  speedMult?: number;
  glowEnabled?: boolean;
  monoEnabled?: boolean;
  invertColors?: boolean;
  strobeEnabled?: boolean;
  symmetryMode?: "none" | "x" | "y" | "both";
  kaleidoEnabled?: boolean;
};

export class ProceduralArt {
  width: number;
  height: number;
  seed: number;
  autoMode: boolean;
  duration: number;
  blendTime: number;
  speedMult: number;
  glowEnabled: boolean;
  monoEnabled: boolean;
  invertColors: boolean;
  strobeEnabled: boolean;
  symmetryMode: "none" | "x" | "y" | "both";
  kaleidoEnabled: boolean;

  sceneTime = 0;
  t = 0;
  transitioning = false;
  currentSeed: number;
  nextSeed: number;
  currentG: Genome;
  nextG: Genome;

  private _x: Float32Array;
  private _y: Float32Array;

  constructor(config: ArtConfig = {}) {
    this.width = config.width ?? 160;
    this.height = config.height ?? 160;
    this.seed = config.seed ?? floor(Math.random() * 9999900 + 100000);
    this.autoMode = config.autoMode ?? true;
    this.duration = config.duration ?? 6;
    this.blendTime = config.blendTime ?? 0.6;
    this.speedMult = config.speedMult ?? 1;
    this.glowEnabled = config.glowEnabled ?? false;
    this.monoEnabled = config.monoEnabled ?? false;
    this.invertColors = config.invertColors ?? false;
    this.strobeEnabled = config.strobeEnabled ?? false;
    this.symmetryMode = config.symmetryMode ?? "none";
    this.kaleidoEnabled = config.kaleidoEnabled ?? false;

    this.currentSeed = this.seed;
    this.currentG = buildGenome(this.currentSeed);
    this.nextSeed = floor(Math.random() * 9999900 + 100000);
    this.nextG = buildGenome(this.nextSeed);

    const w = this.width;
    const h = this.height;
    const halfW = w * 0.5;
    const halfH = h * 0.5;
    this._x = new Float32Array(w * h);
    this._y = new Float32Array(w * h);
    let i = 0;
    for (let py = 0; py < h; py++) {
      const yv = (py - halfH) / halfH;
      for (let px = 0; px < w; px++) {
        this._x[i] = (px - halfW) / halfW;
        this._y[i] = yv;
        i++;
      }
    }
  }

  startTransition(newSeed?: number) {
    if (this.transitioning) return;
    this.nextSeed = newSeed ?? floor(Math.random() * 9999900 + 100000);
    this.nextG = buildGenome(this.nextSeed);
    this.sceneTime = this.duration;
    this.transitioning = true;
  }

  render(imageData: ImageData, dt: number) {
    const ed = dt * this.speedMult;
    this.t += ed;
    this.sceneTime += ed;

    let blend = 0;
    if (this.sceneTime >= this.duration) {
      if (!this.transitioning && this.autoMode) {
        this.nextSeed = floor(Math.random() * 9999900 + 100000);
        this.nextG = buildGenome(this.nextSeed);
        this.transitioning = true;
      }
      blend = min(1, (this.sceneTime - this.duration) / this.blendTime);
      if (blend >= 1) {
        this.currentG = this.nextG;
        this.currentSeed = this.nextSeed;
        this.sceneTime = 0;
        this.transitioning = false;
        blend = 0;
      }
    }

    const strobeActive =
      this.strobeEnabled && floor(this.t * 8) % 2 === 0;
    const data = imageData.data;
    const w = this.width;
    const h = this.height;
    const xArr = this._x;
    const yArr = this._y;
    const tNow = this.t;
    const sym = this.symmetryMode;
    const kaleido = this.kaleidoEnabled;
    const slice = PI / 3;
    const halfSlice = slice * 0.5;

    let idx = 0;
    for (let i = 0; i < w * h; i++) {
      let evalX = xArr[i];
      let evalY = yArr[i];
      if (sym === "x" || sym === "both") evalX = abs(evalX);
      if (sym === "y" || sym === "both") evalY = abs(evalY);
      if (kaleido) {
        let angle = atan2(evalY, evalX);
        const r = sqrt(evalX * evalX + evalY * evalY);
        angle = ((angle % slice) + slice) % slice;
        if (angle > halfSlice) angle = slice - angle;
        evalX = cos(angle) * r;
        evalY = sin(angle) * r;
      }
      let [r, g, b] = evalGenome(this.currentG, evalX, evalY, tNow);
      if (blend > 0) {
        const [r2, g2, b2] = evalGenome(this.nextG, evalX, evalY, tNow);
        const inv = 1 - blend;
        r = floor(r * inv + r2 * blend);
        g = floor(g * inv + g2 * blend);
        b = floor(b * inv + b2 * blend);
      }
      if (this.glowEnabled) {
        const brightness = (r + g + b) / 3;
        const boost = 1 + (brightness / 255) * 0.25;
        r = min(255, floor(r * boost));
        g = min(255, floor(g * boost));
        b = min(255, floor(b * boost));
      }
      if (this.monoEnabled) {
        const gray = floor((r + g + b) / 3);
        r = gray;
        g = gray;
        b = gray;
      }
      if (this.invertColors) {
        r = 255 - r;
        g = 255 - g;
        b = 255 - b;
      }
      if (strobeActive) {
        r = floor(r * 0.3);
        g = floor(g * 0.3);
        b = floor(b * 0.3);
      }
      data[idx++] = r;
      data[idx++] = g;
      data[idx++] = b;
      data[idx++] = 255;
    }
    return this.currentSeed;
  }
}
