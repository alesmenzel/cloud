import { MASK_COLOR, WordColliderMask, WordColliderMaskOptions } from '../colliders/word-collider';

export class HearthWordColliderMask implements WordColliderMask {
  _options: Required<WordColliderMaskOptions>;
  inverted: boolean;

  constructor(options?: WordColliderMaskOptions) {
    this._options = { inverted: true, ...options };
    this.inverted = this._options.inverted;
  }

  generate(context: CanvasRenderingContext2D) {
    const { width, height } = context.canvas;
    const x = width / 2;
    const y = 0;

    context.beginPath();
    const topCurveHeight = height * 0.3;
    context.moveTo(x, y + topCurveHeight);
    // top left curve
    context.bezierCurveTo(x, y, x - width / 2, y, x - width / 2, y + topCurveHeight);

    // bottom left curve
    context.bezierCurveTo(
      x - width / 2,
      y + (height + topCurveHeight) / 2,
      x,
      y + (height + topCurveHeight) / 2,
      x,
      y + height
    );

    // bottom right curve
    context.bezierCurveTo(
      x,
      y + (height + topCurveHeight) / 2,
      x + width / 2,
      y + (height + topCurveHeight) / 2,
      x + width / 2,
      y + topCurveHeight
    );

    // top right curve
    context.bezierCurveTo(x + width / 2, y, x, y, x, y + topCurveHeight);

    context.closePath();
    context.fillStyle = MASK_COLOR;
    context.fill();
  }
}
