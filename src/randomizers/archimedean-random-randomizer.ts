import { CloudPoint, CloudRandomizer, CloudRandomizerInput } from '../types';
import { random } from '../utils';

export interface ArchimedeanRandomRandomizerTransform {
  (point: CloudPoint): CloudPoint;
}

export interface ArchimedeanRandomRandomizerOptions {
  width: number;
  height: number;
  transform?: ArchimedeanRandomRandomizerTransform;
}

const MAX_ANGLE = 2 * Math.PI;

export class ArchimedeanRandomRandomizer<Item> implements CloudRandomizer<Item> {
  _options: ArchimedeanRandomRandomizerOptions;
  _radius: number;
  _centerX: number;
  _centerY: number;

  /**
   * Generate points on archimedean spiral from the center. Points are generated in random angle.
   * Each attempt points are generated further.
   */
  constructor(options: ArchimedeanRandomRandomizerOptions) {
    this._options = options;

    const { width, height } = this._options;
    this._centerX = width / 2;
    this._centerY = height / 2;
    this._radius = Math.max(width / 2, height / 2);
  }

  update(options: Partial<ArchimedeanRandomRandomizerOptions>): void {
    this._options = { ...this._options, ...options };

    const { width, height } = this._options;
    this._centerX = width / 2;
    this._centerY = height / 2;
    this._radius = Math.max(width / 2, height / 2);
  }

  next({ index, attempts }: CloudRandomizerInput<Item>): CloudPoint {
    const { transform } = this._options;
    const percentage = index / attempts;
    const angle = random(0, MAX_ANGLE);
    const x = this._centerX + percentage * this._radius * Math.cos(angle);
    const y = this._centerY + percentage * this._radius * Math.sin(angle);
    const point = { x, y };
    if (transform) return transform(point);
    return point;
  }
}
