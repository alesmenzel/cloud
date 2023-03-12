import {
  CloudPoint,
  CloudRandomizer,
  CloudRandomizerInput,
  CloudRandomizerOptions,
  RandomRandomizerRotation,
} from '../types';
import { random } from '../utils';

export interface RandomRandomizerTransform {
  (point: CloudPoint): CloudPoint;
}

export interface RandomRandomizerOptions<Item> {
  width: number;
  height: number;
  transform?: RandomRandomizerTransform;
  rotation?: RandomRandomizerRotation<Item>;
}

export class RandomRandomizer<Item> implements CloudRandomizer<Item> {
  _options: RandomRandomizerOptions<Item>;

  /**
   * Default randomizer that generates random points on the given plane (width x height)
   * Use transform function to transform the random points, e.g. you can round them, or align them to grid.
   */
  constructor(options: RandomRandomizerOptions<Item>) {
    this._options = options;
  }

  update(options: Partial<CloudRandomizerOptions>): void {
    this._options = { ...this._options, ...options };
  }

  next(options: CloudRandomizerInput<Item>): CloudPoint {
    const { width, height, transform, rotation } = this._options;

    const point: CloudPoint = {
      x: random(0, width),
      y: random(0, height),
      rotation: 0,
    };

    point.rotation = rotation ? rotation({ x: point.x, y: point.y, width, height, ...options }) : 0;

    if (transform) return transform(point);
    return point;
  }
}
