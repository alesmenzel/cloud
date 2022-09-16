import { MASK_COLOR, WordColliderMask, WordColliderMaskOptions } from '../colliders/word-collider';

export class DoughnutWordColliderMask implements WordColliderMask {
  _options: Required<WordColliderMaskOptions>;
  inverted: boolean;

  constructor(options?: WordColliderMaskOptions) {
    this._options = { inverted: true, ...options };
    this.inverted = this._options.inverted;
  }

  generate(context: CanvasRenderingContext2D) {
    const { width, height } = context.canvas;
    const x = width / 2;
    const y = height / 2;
    const size = Math.min(width, height);
    const radius = size / 2;
    const thickness = radius * 0.8;

    context.beginPath();
    context.strokeStyle = MASK_COLOR;
    context.lineWidth = thickness;
    context.arc(x, y, radius - thickness / 2, 0, Math.PI * 2);
    context.stroke();
  }
}
