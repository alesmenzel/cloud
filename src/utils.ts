import { CanvasHorizontalAlign } from './types';

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
export function create2DContext(
  width: number,
  height: number,
  options?: CanvasRenderingContext2DSettings
) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', options);
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
 * Invert color mask, any non-transparent color is considered to be mask
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
    const wasFilled = pixels[i + 3] > 0;
    pixels[i + 0] = 255;
    pixels[i + 1] = 0;
    pixels[i + 2] = 0;
    pixels[i + 3] = wasFilled ? 0 : 255;
  }
  const imageData = new ImageData(pixels, width, height);
  context.putImageData(imageData, 0, 0);
}

export type Point2D = {
  x: number;
  y: number;
};

/**
 * Rotate a point counter-clockwise around an origin point
 */
export function rotatePoint(point: Point2D, origin: Point2D, angleRadians: number) {
  // No rotation return the original point
  if (!angleRadians) return point;

  const x = point.x - origin.x;
  const y = point.y - origin.y;
  const x1 = x * Math.cos(angleRadians) - y * Math.sin(angleRadians);
  const y1 = y * Math.cos(angleRadians) + x * Math.sin(angleRadians);
  return { x: x1 + origin.x, y: y1 + origin.y };
}

/**
 * Convert angle in degrees to radians
 */
export function toRadians(value: number): number {
  return value * (Math.PI / 180);
}

/**
 * Calculate top/left x and y position for a point based on text align and baseline
 * NOTE: Axis y is inverted (↓ is +)
 */
export function calculatePosition(
  x: number,
  y: number,
  width: number,
  height: number,
  textAlign: CanvasTextAlign,
  textBaseline: CanvasHorizontalAlign
): Point2D {
  let realX = x;
  let realY = y;

  switch (textAlign) {
    case 'center': {
      realX -= width / 2;
      break;
    }
    case 'start':
    case 'left': {
      // noop
      break;
    }
    case 'end':
    case 'right': {
      realX -= width;
      break;
    }
    default: {
      break;
    }
  }

  switch (textBaseline) {
    case 'middle': {
      realY -= height / 2;
      break;
    }
    case 'top': {
      // noop
      break;
    }
    case 'bottom': {
      realY -= height;
      break;
    }
    default: {
      break;
    }
  }

  return { x: realX, y: realY };
}

export type BoundingBox = { x: number; y: number; width: number; height: number };

/**
 * Calculate bounding box based on given points
 */
export function getBoundingBox(...points: Point2D[]): BoundingBox {
  if (!points.length) throw new Error('Cannot calculate bounding box for no points!');

  const [firstPoints, ...otherPoints] = points;

  let minX = firstPoints.x;
  let maxX = firstPoints.x;
  let minY = firstPoints.y;
  let maxY = firstPoints.y;

  for (const point of otherPoints) {
    if (point.x < minX) minX = point.x;
    if (point.x > maxX) maxX = point.x;
    if (point.y < minY) minY = point.y;
    if (point.y > maxY) maxY = point.y;
  }

  const width = maxX - minX;
  const height = maxY - minY;
  return { x: minX, y: minY, width, height };
}

export function calculateMiddlePosition(point: Point2D, width: number, height: number): Point2D {
  return {
    x: point.x + width / 2,
    y: point.y - height / 2,
  };
}

/**
 * Calculate the actual text position based on horizontal/vertical alignment and rotation
 * When rotated, it returns the bounding box
 * NOTE: Axis y is inverted (↓ is +)
 */
export function getTextPosition(
  x: number,
  y: number,
  textSize: TextMetrics,
  textAlign: CanvasTextAlign,
  textBaseline: CanvasHorizontalAlign,
  angleRadians: number
): BoundingBox {
  const width = textSize.actualBoundingBoxRight + textSize.actualBoundingBoxLeft;
  const height = textSize.actualBoundingBoxAscent + textSize.actualBoundingBoxDescent;
  // ↓↓↓ top/left position
  const position = calculatePosition(x, y, width, height, textAlign, textBaseline);

  if (!angleRadians) {
    return {
      x: position.x,
      y: position.y,
      width,
      height,
    };
  }

  // Calculate position of the rectangle points after rotation
  const origin = { x, y };
  const p1 = rotatePoint(position, origin, angleRadians);
  const p2 = rotatePoint({ x: position.x + width, y: position.y }, origin, angleRadians);
  const p3 = rotatePoint({ x: position.x + width, y: position.y + height }, origin, angleRadians);
  const p4 = rotatePoint({ x: position.x, y: position.y + height }, origin, angleRadians);

  const boundingBox = getBoundingBox(p1, p2, p3, p4);

  return {
    x: boundingBox.x,
    y: boundingBox.y,
    width: boundingBox.width,
    height: boundingBox.height,
  };
}
