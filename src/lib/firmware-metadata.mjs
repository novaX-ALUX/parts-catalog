import { existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// publicDir comes from Astro's resolved config, never the bundled module location.
export function readFirmwareMetadata(publicDir, webPath) {
  if (typeof webPath !== 'string' || !webPath.startsWith('/firmware/') || /[\\?#%]/.test(webPath) || webPath.split('/').includes('..')) {
    throw new Error(`Invalid public firmware path: ${webPath}`);
  }
  const root = path.resolve(fileURLToPath(new URL(publicDir)));
  const filename = path.resolve(root, `.${webPath}`);
  if (!filename.startsWith(`${root}${path.sep}`)) throw new Error('Firmware path escapes publicDir');
  const stat = statSync(filename); // Missing input must stop the build, not silently downgrade it.
  if (!stat.isFile() || !stat.size) throw new Error(`Empty/non-file firmware: ${webPath}`);
  return {
    size: `${Math.round(stat.size / 1024).toLocaleString('en-US')} KB`,
    signed: existsSync(`${filename}.aff4t10.json`),
  };
}
