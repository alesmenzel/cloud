import { MASK_COLOR, WordColliderMask, WordColliderMaskOptions } from '../colliders/word-collider';

export class CircleWordColliderMask implements WordColliderMask {
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

    context.beginPath();
    context.fillStyle = MASK_COLOR;
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }
}
