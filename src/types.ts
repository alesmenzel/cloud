export interface CloudPoint {
  x: number;
  y: number;
}

export interface CloudOptions<Item> {
  width: number;
  height: number;
  randomizer: CloudRandomizer<Item>;
  collider: CloudCollider<Item>;
  attempts?: number;
}

export interface CloudInstance<Item> {
  next(item: Item): CloudPoint | null;
  update(options: Partial<CloudOptions<Item>>, reset?: boolean): void;
  reset?(): void;
}

export interface CloudRandomizerInput<Item> {
  index: number;
  attempts: number;
  item: Item;
}

export interface CloudRandomizerOptions {
  width: number;
  height: number;
}

export interface CloudRandomizer<Item> {
  next(input: CloudRandomizerInput<Item>): CloudPoint;
  update?(options: Partial<CloudRandomizerOptions>, reset?: boolean): void;
  reset?(): void;
}

export interface CloudColliderInput<Item> {
  x: number;
  y: number;
  item: Item;
}

export interface CloudColliderOptions {
  width: number;
  height: number;
}

export interface CloudCollider<Item> {
  intersects(input: CloudColliderInput<Item>): boolean;
  update?(options: Partial<CloudColliderOptions>, reset?: boolean): void;
  reset?(): void;
}
