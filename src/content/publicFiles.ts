import { statSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { media, type ProjectId, type PublicImage } from './site';


declare const verifiedImage: unique symbol;
export type VerifiedPublicImage = PublicImage & { readonly [verifiedImage]: true };

// Reject external URLs, traversal and missing local files 
export function publicFile(path: string | undefined, extension: RegExp): string | undefined {
  const source = path?.trim();
  if (!source || !/^\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+\.[A-Za-z0-9]+$/.test(source) || !extension.test(source)) return undefined;
  const base = resolve(process.cwd(), 'public');
  const file = resolve(base, source.slice(1));
  if (!file.startsWith(base + sep)) return undefined;
  try { return statSync(file).isFile() ? source : undefined; }
  catch { return undefined; }
}

export const publicImage = (asset: PublicImage | undefined): VerifiedPublicImage | undefined =>
  asset && publicFile(asset.src, /\.(?:avif|webp|png|jpe?g|svg)$/i) ? asset as VerifiedPublicImage : undefined;

export const publicPdf = (path: string | undefined): string | undefined =>
  publicFile(path, /\.pdf$/i);

// Resolve a project's configured images once; missing paths are intentionally omitted.
export const projectImages = (project: ProjectId): VerifiedPublicImage[] => {
  const { cover, gallery } = media.projects[project];
  return [cover, ...gallery].flatMap(image => {
    const verified = publicImage(image);
    return verified ? [verified] : [];
  });
};
