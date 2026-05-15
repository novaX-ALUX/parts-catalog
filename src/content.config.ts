import { defineCollection, z } from 'astro:content';
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
  specs: z.array(specPair)
});

const motorThrustRow = z.object({
  throttle: z.string(),
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
  rows: z.array(motorThrustRow)
});

const firmwareItem = z.object({
  kind: z.string(),
  file: z.string(),
  version: z.string(),
  date: z.string().optional(),
  size: z.string().optional(),
  sha256: z.string().optional(),
  notes: z.string().optional()
});

const detailSchema = baseSchema.extend({
  description: z.string().optional(),
  pinoutImage: z.string().optional(),
  pinoutNotes: z.string().optional(),
  firmwareNotes: z.string().optional(),
  firmware: z.array(firmwareItem).optional(),
  configNotes: z.string().optional(),
  gallery: z.array(z.string()).optional()
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

const motor = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/motor' }),
  schema: detailSchema.extend({
    thrust: z.array(motorThrustTable).optional(),
    testConditions: z.string().optional()
  })
});

export const collections = { fc, esc, gnss, camera, motor };

export const CATEGORY_LABEL: Record<string, string> = {
  fc: 'Flight Controllers',
  gnss: 'GNSS',
  esc: 'ESC',
  motor: 'Motors',
  camera: 'Cameras & Gimbals'
};

export const CATEGORY_ORDER = ['fc', 'gnss', 'esc', 'motor', 'camera'] as const;
