// 将 Hex 颜色 (#3b82f6) 转换为 HSL 字符串 (217 91% 60%)
export function hexToHsl(hex: string): string {
    let c = hex.substring(1).split('');
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    const color = parseInt(c.join(''), 16);
    let r = (color >> 16) & 255;
    let g = (color >> 8) & 255;
    let b = color & 255;
  
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
  
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
  
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  }

/**
 * Change cors limit resource to none cors resource
 * @param url
 */
export function toCorsUrl(url: string): string {
  const p = url.split('/')
  let t = ''
  for (let i = 0; i < p.length; i++) {
    if (i == 2) {
      t +=
        p[i].replaceAll('-', '--').replaceAll('.', '-') +
        atob('LnRyYW5zbGF0ZS5nb29n') +
        '/'
    } else {
      if (i != p.length - 1) {
        t += p[i] + '/'
      } else {
        t += p[i]
      }
    }
  }
  return encodeURI(t)
}

export function isValidIgUrl(url: any) {
  if (typeof url !== 'string') {
    return false
  }
  return /^(https?:\/\/)?(www\.)?instagram\.com\/(p|reel|tv)\/[a-zA-Z0-9_\-]+(\/(\?[^#]*)?)?(#.*)?$/.test(
    url
  )
}

/**
 * download file from url
 * @param url
 * @param filename
 */
export async function downloadVideo(url: string, filename: string) {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const videoBlob = new Blob([blob], { type: 'video/mp4' })
    const videoUrl = URL.createObjectURL(videoBlob)

    const link = document.createElement('a')
    link.href = videoUrl
    link.download = `${filename}.mp4`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(videoUrl)
  } catch (error) {
    console.error('Error downloading file:', error)
  }
}