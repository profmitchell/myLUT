export const generateLUT = async (
  sourceImage: HTMLImageElement,
  resolution: '17x17x17' | '33x33x33' | '64x64x64',
  onProgress: (progress: number) => void
): Promise<Uint8Array> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Could not get canvas context');
  
  canvas.width = sourceImage.width;
  canvas.height = sourceImage.height;
  ctx.drawImage(sourceImage, 0, 0);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const size = resolution === '17x17x17' ? 17 : resolution === '33x33x33' ? 33 : 64;
  const lutSize = size * size * size * 3;
  const lut = new Uint8Array(lutSize);
  
  // Calculate average colors for each LUT node using multiple samples
  let lutIndex = 0;
  const sampleSize = 5; // Number of samples per color value
  const sampleOffset = 2; // Offset for sampling grid

  for (let b = 0; b < size; b++) {
    for (let g = 0; g < size; g++) {
      for (let r = 0; r < size; r++) {
        const progress = (lutIndex / lutSize) * 100;
        onProgress(progress);
        
        let totalR = 0, totalG = 0, totalB = 0;
        let sampleCount = 0;

        // Sample multiple points around the target color
        for (let sx = -sampleOffset; sx <= sampleOffset; sx++) {
          for (let sy = -sampleOffset; sy <= sampleOffset; sy++) {
            const x = Math.floor((r / size) * canvas.width) + sx;
            const y = Math.floor((g / size) * canvas.height) + sy;

            // Skip samples outside image bounds
            if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;

            const pixelIndex = (y * canvas.width + x) * 4;
            totalR += imageData.data[pixelIndex];
            totalG += imageData.data[pixelIndex + 1];
            totalB += imageData.data[pixelIndex + 2];
            sampleCount++;
          }
        }

        // Calculate weighted average of samples
        lut[lutIndex++] = Math.round(totalR / sampleCount);
        lut[lutIndex++] = Math.round(totalG / sampleCount);
        lut[lutIndex++] = Math.round(totalB / sampleCount);
      }
    }
  }

  // Smooth the LUT using a 3D box filter
  const smoothedLut = new Uint8Array(lutSize);
  const smoothRadius = 1;

  for (let b = 0; b < size; b++) {
    for (let g = 0; g < size; g++) {
      for (let r = 0; r < size; r++) {
        let sumR = 0, sumG = 0, sumB = 0;
        let count = 0;

        // Apply 3D smoothing filter
        for (let sb = -smoothRadius; sb <= smoothRadius; sb++) {
          for (let sg = -smoothRadius; sg <= smoothRadius; sg++) {
            for (let sr = -smoothRadius; sr <= smoothRadius; sr++) {
              const nb = b + sb;
              const ng = g + sg;
              const nr = r + sr;

              if (nb < 0 || nb >= size || ng < 0 || ng >= size || nr < 0 || nr >= size) continue;

              const index = (nb * size * size + ng * size + nr) * 3;
              sumR += lut[index];
              sumG += lut[index + 1];
              sumB += lut[index + 2];
              count++;
            }
          }
        }

        const outIndex = (b * size * size + g * size + r) * 3;
        smoothedLut[outIndex] = Math.round(sumR / count);
        smoothedLut[outIndex + 1] = Math.round(sumG / count);
        smoothedLut[outIndex + 2] = Math.round(sumB / count);
      }
    }
  }
  
  return smoothedLut;
};

export const applyLUT = (
  image: HTMLImageElement,
  lut: Uint8Array,
  resolution: '17x17x17' | '33x33x33' | '64x64x64',
  strength: number = 1
): ImageData => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Could not get canvas context');
  
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const size = resolution === '17x17x17' ? 17 : resolution === '33x33x33' ? 33 : 64;
  
  // Apply LUT with trilinear interpolation
  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];
    
    // Convert RGB values to LUT coordinates
    const rNorm = r / 255 * (size - 1);
    const gNorm = g / 255 * (size - 1);
    const bNorm = b / 255 * (size - 1);
    
    // Get the eight surrounding LUT points
    const r0 = Math.floor(rNorm);
    const g0 = Math.floor(gNorm);
    const b0 = Math.floor(bNorm);
    const r1 = Math.min(r0 + 1, size - 1);
    const g1 = Math.min(g0 + 1, size - 1);
    const b1 = Math.min(b0 + 1, size - 1);
    
    // Calculate interpolation weights
    const rw = rNorm - r0;
    const gw = gNorm - g0;
    const bw = bNorm - b0;
    
    // Get the eight corner values
    const getLutValue = (r: number, g: number, b: number, offset: number) => {
      return lut[(b * size * size + g * size + r) * 3 + offset];
    };
    
    // Perform trilinear interpolation for each color channel
    const interpolate = (offset: number) => {
      const c00 = getLutValue(r0, g0, b0, offset) * (1 - rw) + getLutValue(r1, g0, b0, offset) * rw;
      const c01 = getLutValue(r0, g0, b1, offset) * (1 - rw) + getLutValue(r1, g0, b1, offset) * rw;
      const c10 = getLutValue(r0, g1, b0, offset) * (1 - rw) + getLutValue(r1, g1, b0, offset) * rw;
      const c11 = getLutValue(r0, g1, b1, offset) * (1 - rw) + getLutValue(r1, g1, b1, offset) * rw;
      
      const c0 = c00 * (1 - gw) + c10 * gw;
      const c1 = c01 * (1 - gw) + c11 * gw;
      
      return c0 * (1 - bw) + c1 * bw;
    };
    
    // Interpolate and blend with original values based on strength
    imageData.data[i] = r + (interpolate(0) - r) * strength;
    imageData.data[i + 1] = g + (interpolate(1) - g) * strength;
    imageData.data[i + 2] = b + (interpolate(2) - b) * strength;
  }
  
  return imageData;
};

export const exportLUTFile = (lut: Uint8Array, resolution: '17x17x17' | '33x33x33' | '64x64x64'): string => {
  const size = resolution === '17x17x17' ? 17 : resolution === '33x33x33' ? 33 : 64;
  let content = `# Created with myLUT Generator\n`;
  content += `# LUT size ${size}x${size}x${size}\n`;
  content += `LUT_3D_SIZE ${size}\n\n`;
  
  let index = 0;
  for (let b = 0; b < size; b++) {
    for (let g = 0; g < size; g++) {
      for (let r = 0; r < size; r++) {
        const red = lut[index++] / 255;
        const green = lut[index++] / 255;
        const blue = lut[index++] / 255;
        content += `${red.toFixed(6)} ${green.toFixed(6)} ${blue.toFixed(6)}\n`;
      }
    }
  }
  
  return content;
};