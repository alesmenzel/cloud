import { CloudCollider, CloudColliderInput } from '../types';
import { changeSize, clearContext, create2DContext, getTextPosition, invertMask } from '../utils';

export interface WordColliderMask {
  inverted: boolean;
  generate(context: CanvasRenderingContext2D): void;
}

export interface WordColliderMaskOptions {
  inverted?: boolean;
}

export interface WordColliderOptions {
  width: number;
  height: number;
  font: string;
  weight?: string | number;
  textAlign?: CanvasTextAlign;
  textBaseline?: Extract<CanvasTextBaseline, 'middle' | 'top' | 'bottom'>;
  gap?: number;
  mask?: WordColliderMask | null;
}

export interface WordColliderConstraint {
  text: string;
  count: number;
}

export const MASK_COLOR = 'red';
export const EMOJI_REGEX = /\p{Extended_Pictographic}/u;

/**
 * Collider that detects whether a given word is colliding with the already generated words
 */
export class WordCollider<Item extends WordColliderConstraint> implements CloudCollider<Item> {
  _options: Required<WordColliderOptions>;
  _context: CanvasRenderingContext2D;
  _intersectionContext: CanvasRenderingContext2D;

  constructor(options: WordColliderOptions) {
    this._options = {
      gap: 0,
      weight: 'normal',
      textAlign: 'center',
      textBaseline: 'middle',
      mask: null,
      ...options,
    };

    const { width, height } = this._options;
    this._context = create2DContext(width, height);
    this._intersectionContext = create2DContext(width, height);

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

  intersects({ x, y, item }: CloudColliderInput<Item>): boolean {
    const { text, count } = item;
    if (!text) return false;

    // Emoji doesnt support strokeText, so we make the emoji bigger for padding
    const isEmoji = EMOJI_REGEX.test(text);

    const ctx = this._intersectionContext;
    const { font, weight, textAlign, textBaseline, gap } = this._options;

    clearContext(ctx);

    ctx.font = `${weight} ${isEmoji ? count + gap : count}px ${font}`;
    ctx.textAlign = textAlign;
    ctx.textBaseline = textBaseline;
    ctx.fillStyle = MASK_COLOR;

    const textSize = ctx.measureText(text);
    const textMetrics = getTextPosition(x, y, textSize, textAlign, textBaseline);

    // Intersects with the left/right (walls)
    if (textMetrics.x < 0 || textMetrics.x + textMetrics.width > ctx.canvas.width) {
      return true;
    }
    // Intersects with the top/bottom
    if (textMetrics.y < 0 || textMetrics.y + textMetrics.height > ctx.canvas.height) {
      return true;
    }

    if (gap && !isEmoji) {
      ctx.strokeStyle = MASK_COLOR;
      ctx.lineWidth = 2 * gap; // stroke is centered
      ctx.strokeText(text, x, y);
    }
    ctx.fillText(text, x, y);

    // Get image data of the word and compare them to the already placed/mask
    let painted;
    let itemPaint;
    try {
      painted = this._context.getImageData(
        textMetrics.x - gap,
        textMetrics.y - gap,
        textMetrics.width + gap,
        textMetrics.height + gap
      ).data;
      itemPaint = ctx.getImageData(
        textMetrics.x - gap,
        textMetrics.y - gap,
        textMetrics.width + gap,
        textMetrics.height + gap
      ).data;
    } catch (_) {
      return true; // 0px/0px canvas
    }

    // UInt8 [RGBA RGBA RGBA ...]
    for (let i = 0; i < painted.length; i += 4) {
      // Mask
      const alpha = painted[i + 3];
      // New item
      const alpha2 = itemPaint[i + 3];
      // Return as intersecting when the same pixels are not transparent
      if (alpha !== 0 && alpha2 !== 0) return true;
    }

    this._context.font = `${weight} ${isEmoji ? count + gap : count}px ${font}`;
    this._context.textAlign = textAlign;
    this._context.textBaseline = textBaseline;
    this._context.fillStyle = MASK_COLOR;
    if (gap && !isEmoji) {
      this._context.strokeStyle = MASK_COLOR;
      this._context.lineWidth = 2 * gap; // stroke is centered
      this._context.strokeText(text, x, y);
    }
    this._context.fillText(text, x, y);

    return false;
  }
}
