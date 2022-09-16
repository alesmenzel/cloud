/**
 * Generate a pseudo-random number in an given interval
 */
export function random(min: number, max: number): number {
  if (!Number.isFinite(min))
    throw new Error(
      `Cannot generate random number for interval <${min}, ${max}>. Minimum must be a finite number.`
    );
  if (!Number.isFinite(max))
    throw new Error(
      `Cannot generate random number for interval <${min}, ${max}>. Maximum must be a finite number.`
    );
  if (min > max)
    throw new Error(
      `Cannot generate random number for interval <${min}, ${max}>. Minimum must be bigger or equal to maximum.`
    );
  return min + Math.random() * (max - min);
}

/**
 * Create a new canvas with a 2D context
 */
export function create2DContext(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context)
    throw new Error('Cannot create 2D canvas context. Your device most likely doesnt support it.');
  return context;
}

/**
 * Clear the complete canvas context
 */
export function clearContext(context: CanvasRenderingContext2D) {
  return context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}

/**
 * Change context size
 */
export function changeSize(context: CanvasRenderingContext2D, width: number, height: number) {
  context.canvas.width = width;
  context.canvas.height = height;
}

/**
 * Round a number to given niceness
 * @example
 * ```
 * nice(0, 25) // 0
 * nice(25, 25) // 25
 * nice(27, 25) // 50
 * nice(1456, 25) // 1475
 * ```
 */
export function nice(value: number, niceness: number) {
  return Math.ceil(value / niceness) * niceness;
}

/**
 * Invert color mask (must use red color)
 */
export function invertMask(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas;
  let mask;
  try {
    mask = context.getImageData(0, 0, width, height).data;
  } catch (_) {
    return;
  }
  const pixels = new Uint8ClampedArray(mask);
  for (let i = 0; i < pixels.length; i += 4) {
    const wasRed = Boolean(pixels[i]);
    pixels[i + 0] = 255;
    pixels[i + 1] = 0;
    pixels[i + 2] = 0;
    pixels[i + 3] = wasRed ? 0 : 255;
  }
  const imageData = new ImageData(pixels, width, height);
  context.putImageData(imageData, 0, 0);
}

/**
 * Calculate the actual text position based on horizontal and vertical alignment
 */
export function getTextPosition(
  x: number,
  y: number,
  textSize: TextMetrics,
  textAlign: CanvasTextAlign,
  textBaseline: Extract<CanvasTextBaseline, 'middle' | 'top' | 'bottom'>
) {
  const width = textSize.actualBoundingBoxRight + textSize.actualBoundingBoxLeft;
  const height = textSize.actualBoundingBoxAscent + textSize.actualBoundingBoxDescent;
  let actualX = x;
  if (textAlign === 'center') {
    actualX = x - width / 2;
  }
  if (textAlign === 'right' || textAlign === 'end') {
    actualX = x - width;
  }
  let actualY = y;
  if (textBaseline === 'middle') {
    actualY = y - height / 2;
  }
  if (textBaseline === 'bottom') {
    actualY = y - height;
  }
  return { x: actualX, y: actualY, width, height };
}
