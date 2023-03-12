import {
  CloudPoint,
  CloudRandomizer,
  CloudRandomizerInput,
  RandomRandomizerRotation,
} from '../types';
import { random } from '../utils';

export interface ArchimedeanRandomRandomizerTransform {
  (point: CloudPoint): CloudPoint;
}

export interface ArchimedeanRandomRandomizerOptions<Item> {
  width?: number;
  height?: number;
  transform?: ArchimedeanRandomRandomizerTransform;
  rotation?: RandomRandomizerRotation<Item>;
}

export interface ArchimedeanRandomRandomizerInstanceOptions<Item> {
  width: number;
  height: number;
  transform?: ArchimedeanRandomRandomizerTransform;
  rotation?: RandomRandomizerRotation<Item>;
}

const MAX_ANGLE = 2 * Math.PI;

export class ArchimedeanRandomRandomizer<Item> implements CloudRandomizer<Item> {
  _options: ArchimedeanRandomRandomizerInstanceOptions<Item>;
  _radius: number;
  _centerX: number;
  _centerY: number;

  /**
   * Generate points on archimedean spiral from the center. Points are generated in random angle.
   * Each attempt points are generated further.
   */
  constructor(options: ArchimedeanRandomRandomizerOptions<Item>) {
    this._options = {
      width: 100,
      height: 100,
      ...options,
    };

    const { width, height } = this._options;
    this._centerX = width / 2;
    this._centerY = height / 2;
    this._radius = Math.max(width / 2, height / 2);
  }

  update(options: Partial<ArchimedeanRandomRandomizerOptions<Item>>): void {
    this._options = { ...this._options, ...options };

    const { width, height } = this._options;
    this._centerX = width / 2;
    this._centerY = height / 2;
    this._radius = Math.max(width / 2, height / 2);
  }

  next({ index, attempts, item }: CloudRandomizerInput<Item>): CloudPoint {
    const { width, height, transform, rotation } = this._options;

    const percentage = index / attempts;
    const angle = random(0, MAX_ANGLE);
    const x = this._centerX + percentage * this._radius * Math.cos(angle);
    const y = this._centerY + percentage * this._radius * Math.sin(angle);
    const point: CloudPoint = {
      x,
      y,
      rotation: rotation ? rotation({ x, y, width, height, index, attempts, item }) : 0,
    };

    if (transform) return transform(point);
    return point;
  }
}
