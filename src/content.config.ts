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

const fc = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/fc' }),
  schema: baseSchema
});

const esc = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/esc' }),
  schema: baseSchema
});

const gnss = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/gnss' }),
  schema: baseSchema
});

const camera = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/camera' }),
  schema: baseSchema
});

const motor = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/motor' }),
  schema: baseSchema.extend({
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
