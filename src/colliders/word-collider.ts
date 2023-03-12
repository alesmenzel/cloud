import { CanvasHorizontalAlign, CloudCollider, CloudColliderInput } from '../types';
import {
  changeSize,
  clearContext,
  create2DContext,
  getTextPosition,
  invertMask,
  toRadians,
} from '../utils';

export interface WordColliderMask {
  inverted: boolean;
  generate(context: CanvasRenderingContext2D): void;
}

export interface WordColliderMaskOptions {
  inverted?: boolean;
}

export interface WordColliderConstraint {
  text: string;
  count: number;
}

export interface WordColliderRotation<Item extends WordColliderConstraint> {
  (item: Item): number;
}

export interface WordColliderOptions {
  width?: number;
  height?: number;
  font: string;
  weight?: string | number;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasHorizontalAlign;
  gap?: number;
  mask?: WordColliderMask | null;
}

export const MASK_COLOR = 'red';
export const EMOJI_REGEX = /\p{Extended_Pictographic}|\p{Emoji_Presentation}/u;
// Text metrics are not precise and some ascending/descending characters could be out of the bounds
export const BUFFER_PX = 10;

export function defaultRotation() {
  return 0;
}

/**
 * Collider that detects whether a given word is colliding with the already generated words
 */
export class WordCollider<Item extends WordColliderConstraint> implements CloudCollider<Item> {
  _options: Required<WordColliderOptions>;
  _context: CanvasRenderingContext2D;
  _intersectionContext: CanvasRenderingContext2D;

  constructor(options: WordColliderOptions) {
    this._options = {
      width: 100,
      height: 100,
      gap: 0,
      weight: 'normal',
      textAlign: 'center',
      textBaseline: 'middle',
      mask: null,
      ...options,
    };

    const { width, height } = this._options;
    this._context = create2DContext(width, height, { willReadFrequently: true });
    this._intersectionContext = create2DContext(width, height, { willReadFrequently: true });

    this._applyMask();
  }

  _applyMask() {
    const { mask } = this._options;
    if (mask) {
      this._context.save();
      mask.generate(this._context);
      this._context.restore();

      if (mask.inverted) {
        invertMask(this._context);
      }
    }
  }

  /**
   * Because emojis cannot be rendered with a stroke, we need to create a mask instead
   */
  _drawEmojiMask(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    gap: number,
    textAlign: CanvasTextAlign,
    textBaseline: CanvasHorizontalAlign
  ) {
    ctx.save();

    let realX = x;
    let realY = y;
    const realSize = size + 2 * gap;

    switch (textAlign) {
      case 'center': {
        realX -= size / 2 + gap;
        break;
      }
      case 'start':
      case 'left': {
        // noop
        break;
      }
      case 'end':
      case 'right': {
        realX -= size + gap;
        break;
      }
      default: {
        break;
      }
    }

    switch (textBaseline) {
      case 'middle': {
        realY -= size / 2 + gap;
        break;
      }
      case 'top': {
        // noop
        break;
      }
      case 'bottom': {
        realY -= size + gap;
        break;
      }
      default: {
        break;
      }
    }

    ctx.fillStyle = MASK_COLOR;
    ctx.fillRect(realX, realY, realSize, realSize);
    ctx.restore();
  }

  update(options: Partial<WordColliderOptions>, reset = true): void {
    this._options = { ...this._options, ...options };
    if (reset) {
      this.reset();
    }
  }

  /**
   * Reset the word collider to initial state
   */
  reset() {
    const { width, height } = this._options;
    clearContext(this._context);
    changeSize(this._context, width, height);
    clearContext(this._intersectionContext);
    changeSize(this._intersectionContext, width, height);
    this._applyMask();
  }

  intersects({ x, y, rotation: angleDegrees, item }: CloudColliderInput<Item>): boolean {
    const { text, count } = item;
    if (!text) return false;

    const { font, weight, textAlign, textBaseline, gap } = this._options;
    const ctx = this._context;
    const ictx = this._intersectionContext;
    const angleRadians = toRadians(angleDegrees);
    const isEmoji = EMOJI_REGEX.test(text);

    clearContext(ictx);

    ictx.save();

    ictx.font = `${weight} ${count}px ${font}`;
    ictx.textAlign = textAlign;
    ictx.textBaseline = textBaseline;
    ictx.fillStyle = MASK_COLOR;

    ictx.translate(x, y);
    if (angleRadians) ictx.rotate(angleRadians);

    const textSize = ictx.measureText(text);
    const textMetrics = getTextPosition(x, y, textSize, textAlign, textBaseline, angleRadians);

    // Intersects with the left/right (walls)
    if (textMetrics.x < 0 || textMetrics.x + textMetrics.width > ictx.canvas.width) {
      ictx.restore();
      return true;
    }
    // Intersects with the top/bottom
    if (textMetrics.y < 0 || textMetrics.y + textMetrics.height > ictx.canvas.height) {
      ictx.restore();
      return true;
    }

    // Emojis do not support stroke, so we need to create a custom mask
    if (isEmoji && gap) {
      this._drawEmojiMask(ictx, 0, 0, count, gap, textAlign, textBaseline);
    } else {
      ictx.strokeStyle = MASK_COLOR;
      ictx.lineWidth = 2 * gap; // stroke is centered
      ictx.strokeText(text, 0, 0);
      ictx.fillText(text, 0, 0);
    }

    ictx.restore();

    // Get image data of the word and compare them to the already placed/mask
    let painted;
    let itemPaint;
    try {
      const compareX = textMetrics.x - gap - BUFFER_PX;
      const compareY = textMetrics.y - gap - BUFFER_PX;
      const compareWidth = textMetrics.width + gap * 2 + BUFFER_PX * 2;
      const compareHeight = textMetrics.height + gap * 2 + BUFFER_PX * 2;

      painted = ctx.getImageData(compareX, compareY, compareWidth, compareHeight).data;
      itemPaint = ictx.getImageData(compareX, compareY, compareWidth, compareHeight).data;
    } catch (_) {
      return true; // 0px/0px canvas
    }

    // UInt8 [RGBA RGBA RGBA ...]
    for (let i = 0; i < painted.length; i += 4) {
      // Mask
      const maskAlpha = painted[i + 3];
      // New item
      const newItemAlpha = itemPaint[i + 3];
      // Return as intersecting when the same pixels are not transparent
      if (maskAlpha !== 0 && newItemAlpha !== 0) return true;
    }

    ctx.save();

    ctx.translate(x, y);
    if (angleRadians) ctx.rotate(angleRadians);

    ctx.font = `${weight} ${count}px ${font}`;
    ctx.textAlign = textAlign;
    ctx.textBaseline = textBaseline;
    ctx.fillStyle = MASK_COLOR;

    if (isEmoji && gap) {
      this._drawEmojiMask(ctx, 0, 0, count, gap, textAlign, textBaseline);
    } else {
      ctx.strokeStyle = MASK_COLOR;
      ctx.lineWidth = 2 * gap; // stroke is centered
      ctx.strokeText(text, 0, 0);
      ctx.fillText(text, 0, 0);
    }

    ctx.restore();

    return false;
  }
}
