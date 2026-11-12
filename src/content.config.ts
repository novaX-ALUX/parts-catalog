import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const specPair = z.object({
  key: z.string(),
  value: z.string()
});

const baseSchema = z.object({
  name: z.string(),
  tagline: z.string().optional(),
  image: z.string().optional(),
  pictureKey: z.string().optional(),
  datasheet: z.string().optional(),
  order: z.number().default(999),
  hidden: z.boolean().optional().default(false), // exclude from public catalog card + product page (update tool still lists firmware)
  comingSoon: z.boolean().optional().default(false), // announced but not released — "Coming Soon" badge on card + product page
  ndaa: z.boolean().optional().default(false), // NDAA-compliant build offered — "NDAA Available" badge on card + product page
  specs: z.array(specPair)
});

// Connector pin definition shown as a table in the Pinout tab.
// `mapping` is the firmware-side name (e.g. "SERIAL1 · UART7"), `type` the housing (e.g. "JST-GH 6P").
const pinRow = z.object({
  pin: z.union([z.string(), z.number()]),
  signal: z.string(),
  function: z.string()
});

const pinConnector = z.object({
  name: z.string(),
  type: z.string().optional(),
  mapping: z.string().optional(),
  pins: z.array(pinRow)
});

const motorThrustRow = z.object({
  throttle: z.string(),
  rpm: z.string().optional(),
  voltage: z.string().optional(),
  thrust: z.string().optional(),
  torque: z.string().optional(),
  current: z.string().optional(),
  power: z.string().optional(),
  eff: z.string().optional(),
  temp: z.string().optional()
});

const motorThrustTable = z.object({
  propeller: z.string(),
  // ESC used on the test stand (e.g. "BLDC ESC", "FOC ESC") — shown in the
  // chart title and table heading so datasets from different drives stay distinct.
  esc: z.string().optional(),
  // Extra line shown under the table (e.g. full-throttle peak summary).
  note: z.string().optional(),
  rows: z.array(motorThrustRow)
});

const firmwareItem = z.object({
  kind: z.string(),
  file: z.string(),
  version: z.string(),
  date: z.string().optional(),
  size: z.string().optional(),
  sha256: z.string().optional(),
  notes: z.string().optional(),
  // Web Update tool routing. `method` selects the flashing engine:
  //   'dfu'       — STM32 ROM bootloader over WebUSB (full boot+app .hex, BOOT0)
  //   'ardupilot' — ArduPilot/PX4 bootloader over Web Serial (app .apj/.bin)
  //   'novax-fc'  — custom FC bootloader over Web Serial (REBOOT_BL + SYNC/ERASE/PROGRAM/CRC)
  // `webPath` is a same-origin path under public/ the browser loads (release URLs
  // are CORS-blocked, so the flashable image is mirrored locally). When absent the
  // asset is download-only and not offered in the Update tool.
  //   'esc-setup' — ESC firmware file stored in the ESC Setup handheld over Web Serial (it updates ESCs over CAN)
  //   'esc-setup-self' — the ESC Setup handheld's own firmware over Web Serial (no DFU driver)
  method: z.enum(['dfu', 'ardupilot', 'novax-fc', 'esc-setup', 'esc-setup-self']).optional(),
  webPath: z.string().optional()
});

const configParam = z.object({
  name: z.string(),
  value: z.string(),
  note: z.string().optional(),
  // Optional group heading; rows sharing a section render under one sub-header.
  section: z.string().optional()
});

const detailSchema = baseSchema.extend({
  description: z.string().optional(),
  pinoutImage: z.string().optional(),
  // Multiple pinout/diagram images shown stacked in the Pinout tab.
  // When present this takes priority over the single `pinoutImage`.
  pinoutImages: z.array(z.string()).optional(),
  pinoutNotes: z.string().optional(),
  pinTable: z.array(pinConnector).optional(),
  firmwareNotes: z.string().optional(),
  firmware: z.array(firmwareItem).optional(),
  configNotes: z.string().optional(),
  // Configuration tab extras: diagrams shown above the notes and a
  // parameter table (e.g. ArduPilot setup parameters). Each image may be a
  // bare path, or an object with a caption (rendered as "Figure N — caption").
  configImages: z.array(z.union([
    z.string(),
    z.object({ src: z.string(), caption: z.string().optional() })
  ])).optional(),
  configParams: z.array(configParam).optional(),
  gallery: z.array(z.union([                       // path, or { src, caption } (e.g. isometric + six views)
    z.string(),
    z.object({ src: z.string(), caption: z.string().optional() })
  ])).optional(),
  // User manuals shown in the Manual tab, one per language. `file` is a PDF under public/;
  // its page overview image sits next to it with the same name and a .png extension.
  manuals: z.array(z.object({ label: z.string(), file: z.string() })).optional(),
  // Rotatable 3D model (glTF binary under public/models/, meshopt allowed) shown in the 3D tab.
  model3d: z.string().regex(/^\/models\/[^?#%]+\.glb$/).optional()
});

const fc = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/fc' }),
  schema: detailSchema
});

const esc = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/esc' }),
  schema: detailSchema
});

const gnss = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/gnss' }),
  schema: detailSchema
});

const camera = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/camera' }),
  schema: detailSchema
});

const pmu = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pmu' }),
  schema: detailSchema
});

const motor = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/motor' }),
  schema: detailSchema.extend({
    thrust: z.array(motorThrustTable).optional(),
    testConditions: z.string().optional()
  })
});

// Radio controllers (EdgeTX transmitters). The firmware tab and the Update tool's DFU list work as for FCs.
const rc = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/rc' }),
  schema: detailSchema
});

// Desktop programs on the Tool page, one JSON file per program. The installers are assets of a
// GitHub release on this (public) catalog repository: they stay out of git and the Pages site, and
// an older release is never deleted. `npm run validate:remote` downloads each file and checks its SHA-256.
const toolFile = z.object({
  kind: z.string(), // the Type column, OS first: "Windows installer", "macOS (Intel + Apple silicon)"
  file: z.string().regex(/^https:\/\/github\.com\/novaX-ALUX\/parts-catalog\/releases\/download\/[^/]+\/[^/\s]+$/),
  bytes: z.number().int().positive(),
  sha256: z.string().regex(/^[0-9a-f]{64}$/),
  notes: z.string().optional()
});

const tools = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/tools' }),
  schema: z.object({
    name: z.string(),
    order: z.number().default(999),
    usedFor: z.string(),
    summary: z.string(),
    // side tab picture (app icon, or the product it serves) and screenshots, site paths under public/
    icon: z.string().regex(/^\/images\/[^?#%]+\.png$/),
    shots: z.array(z.object({ src: z.string().regex(/^\/images\/[^?#%]+\.png$/), caption: z.string() })).default([]),
    comingSoon: z.boolean().optional().default(false),
    // newest first; each one is a GitHub release whose page carries the change notes
    releases: z.array(z.object({
      version: z.string(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      changes: z.string(),
      notes: z.string().regex(/^https:\/\/github\.com\/novaX-ALUX\/parts-catalog\/releases\/tag\/[^/\s]+$/),
      files: z.array(toolFile).min(1)
    })).default([])
  })
});

export const collections = { fc, esc, gnss, camera, motor, pmu, rc, tools };

export const CATEGORY_LABEL: Record<string, string> = {
  fc: 'Flight Controllers',
  gnss: 'GNSS',
  esc: 'ESC',
  pmu: 'PMU',
  motor: 'Motors',
  camera: 'Cameras & Gimbals',
  rc: 'Radio Controllers'
};

export const CATEGORY_ORDER = ['fc', 'gnss', 'esc', 'pmu', 'motor', 'camera', 'rc'] as const;
