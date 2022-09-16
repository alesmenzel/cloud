import { CloudPoint, CloudRandomizer, CloudRandomizerOptions } from '../types';
import { random } from '../utils';

export interface RandomRandomizerTransform {
  (point: CloudPoint): CloudPoint;
}

export interface RandomRandomizerOptions {
  width: number;
  height: number;
  transform?: RandomRandomizerTransform;
}

export class RandomRandomizer<Item> implements CloudRandomizer<Item> {
  _options: RandomRandomizerOptions;

  /**
   * Default randomizer that generates random points on the given plane (width x height)
   * Use transform function to transform the random points, e.g. you can round them, or align them to grid.
   */
  constructor(options: RandomRandomizerOptions) {
    this._options = options;
  }

  update(options: Partial<CloudRandomizerOptions>): void {
    this._options = { ...this._options, ...options };
  }

  next(): CloudPoint {
    const { width, height, transform } = this._options;
    const point = {
      x: random(0, width),
      y: random(0, height),
    };
    if (transform) return transform(point);
    return point;
  }
}
