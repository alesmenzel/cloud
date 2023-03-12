import { CloudInstance, CloudOptions, CloudPoint } from './types';

export class Cloud<Item> implements CloudInstance<Item> {
  _options: Required<CloudOptions<Item>>;

  /**
   * Cloud class is the orchestrator of generating up to specified number of random points
   * and then checking if the randomly generated points collide with existing objects.
   */
  constructor(options: CloudOptions<Item>) {
    this._options = {
      attempts: 10,
      width: 100,
      height: 100,
      ...options,
    };

    this.update();
  }

  /**
   * Update the cloud settings and reset the cloud.
   */
  update(options?: Partial<CloudOptions<Item>>, reset = true) {
    this._options = { ...this._options, ...options };

    const { width, height, randomizer, collider } = this._options;
    randomizer.update?.({ width, height }, reset);
    collider.update?.({ width, height }, reset);
  }

  reset(): void {
    const { randomizer, collider } = this._options;
    randomizer.reset?.();
    collider.reset?.();
  }

  /**
   * Calculate the next object position
   */
  next(item: Item): CloudPoint | null {
    const { randomizer, collider } = this._options;

    let i = 0;
    while (i < this._options.attempts) {
      const { x, y, rotation } = randomizer.next({
        index: i,
        attempts: this._options.attempts,
        item,
      });

      if (!collider.intersects({ x, y, rotation, item })) {
        return { x, y, rotation };
      }

      i += 1;
    }

    return null;
  }
}
