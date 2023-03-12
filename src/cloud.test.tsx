import { Cloud } from './cloud';
import { CloudCollider, CloudPoint, CloudRandomizer } from './types';

class DummyRandomizer<Item> implements CloudRandomizer<Item> {
  next(): CloudPoint {
    return { x: 10, y: 10, rotation: 0 };
  }
}

class DummyCollider<Item> implements CloudCollider<Item> {
  intersects(): boolean {
    return false;
  }
}

describe('Cloud', () => {
  it('creates instance of Cloud', () => {
    expect(
      () =>
        new Cloud({
          width: 100,
          height: 100,
          randomizer: new DummyRandomizer(),
          collider: new DummyCollider(),
        })
    ).not.toThrow();
  });

  it('generates points', () => {
    const cloud = new Cloud<string>({
      width: 100,
      height: 100,
      randomizer: new DummyRandomizer(),
      collider: new DummyCollider(),
    });
    expect(cloud.next('first')).toEqual({ x: 10, y: 10, rotation: 0 });
    expect(cloud.next('second')).toEqual({ x: 10, y: 10, rotation: 0 });
    expect(cloud.next('third')).toEqual({ x: 10, y: 10, rotation: 0 });
  });
});
