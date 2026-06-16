"use client";

/**
 * Reads an uploaded image file and returns a downscaled PNG data URL safe to
 * keep in localStorage and embed in the PDF. Logos are flattened to PNG (which
 * @react-pdf renders) and capped in size so the saved config stays small.
 */
export async function fileToLogoDataUrl(file: File): Promise<string> {
  const MAX_W = 360;
  const MAX_H = 160;

  const sourceUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new window.Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("That file isn't a usable image."));
    el.src = sourceUrl;
  });

  const scale = Math.min(1, MAX_W / img.width, MAX_H / img.height);
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available.");
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/png");
}
