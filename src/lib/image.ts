// Resize + compress images in the browser so each one fits in a Firestore document (< 1 MiB).
function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (e) => {
      URL.revokeObjectURL(url)
      reject(e)
    }
    img.src = url
  })
}

function encode(img: HTMLImageElement, maxDim: number, quality: number) {
  const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight))
  const w = Math.round(img.naturalWidth * scale)
  const h = Math.round(img.naturalHeight * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, w, h)
  // Safari can't encode WebP and silently returns PNG; fall back to JPEG there.
  let dataUrl = canvas.toDataURL('image/webp', quality)
  if (!dataUrl.startsWith('data:image/webp')) dataUrl = canvas.toDataURL('image/jpeg', quality)
  return { dataUrl, w, h }
}

const MAX_BYTES = 850_000 // leave headroom under Firestore's 1 MiB doc limit

export async function compressPhoto(file: Blob) {
  const img = await loadImage(file)
  let full = encode(img, 1400, 0.8)
  for (const [dim, q] of [
    [1280, 0.72],
    [1100, 0.65],
    [900, 0.6],
  ] as const) {
    if (full.dataUrl.length <= MAX_BYTES) break
    full = encode(img, dim, q)
  }
  const thumb = encode(img, 240, 0.6)
  return { full: full.dataUrl, w: full.w, h: full.h, thumb: thumb.dataUrl }
}
