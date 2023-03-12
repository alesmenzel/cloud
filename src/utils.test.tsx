import { CanvasHorizontalAlign } from './types';
import {
  BoundingBox,
  calculatePosition,
  getBoundingBox,
  getTextPosition,
  Point2D,
  rotatePoint,
  toRadians,
} from './utils';

describe('utils', () => {
  describe('toRadians()', () => {
    it.each([
      [-30, -0.5235987755982988],
      [0, 0],
      [30, 0.5235987755982988],
      [60, 1.0471975511965976],
      [90, 1.5707963267948966],
      [120, 2.0943951023931953],
      [150, 2.6179938779914944],
      [180, 3.141592653589793],
      [210, 3.6651914291880923],
      [240, 4.1887902047863905],
      [270, 4.71238898038469],
      [300, 5.235987755982989],
      [330, 5.759586531581287],
      [360, 6.283185307179586],
      [390, 6.806784082777885],
      [420, 7.3303828583761845],
      [12.5, 0.2181661564992912],
    ])('converts %s to radians', (degrees, expected) => {
      expect(toRadians(degrees)).toEqual(expected);
    });
  });

  describe('rotatePoint()', () => {
    it.each([
      [{ x: 0, y: 0 }, { x: 0, y: 0 }, toRadians(0), { x: 0, y: 0 }],
      [{ x: 100, y: 100 }, { x: 0, y: 0 }, toRadians(0), { x: 100, y: 100 }],
      [{ x: 100, y: 100 }, { x: 0, y: 0 }, toRadians(90), { x: -100, y: 100 }],
      [{ x: 100, y: 100 }, { x: 0, y: 0 }, toRadians(180), { x: -100, y: -100 }],
      [{ x: 100, y: 100 }, { x: 0, y: 0 }, toRadians(270), { x: 100, y: -100 }],
      [{ x: 100, y: 100 }, { x: 0, y: 0 }, toRadians(360), { x: 100, y: 100 }],
      [{ x: 100, y: 100 }, { x: 50, y: 50 }, toRadians(0), { x: 100, y: 100 }],
      [{ x: 100, y: 100 }, { x: 50, y: 50 }, toRadians(90), { x: 0, y: 100 }],
      [{ x: 100, y: 100 }, { x: 50, y: 50 }, toRadians(180), { x: -0, y: 0 }],
      [{ x: 100, y: 100 }, { x: 50, y: 50 }, toRadians(270), { x: 100, y: -0 }],
      [{ x: 100, y: 100 }, { x: 50, y: 50 }, toRadians(360), { x: 100, y: 100 }],
      [{ x: 100, y: 100 }, { x: 200, y: 100 }, toRadians(0), { x: 100, y: 100 }],
      [{ x: 100, y: 100 }, { x: 200, y: 100 }, toRadians(90), { x: 200, y: 0 }],
      [{ x: 100, y: 100 }, { x: 200, y: 100 }, toRadians(180), { x: 300, y: 100 }],
      [{ x: 100, y: 100 }, { x: 200, y: 100 }, toRadians(270), { x: 200, y: 200 }],
      [{ x: 100, y: 100 }, { x: 200, y: 100 }, toRadians(360), { x: 100, y: 100 }],
    ])('rotates point %s around origin %s by %s radians', (point, origin, angle, expected) => {
      const { x, y } = rotatePoint(point, origin, angle);
      // The calculation of rotatePoint is imprecise, but we only care about the overall value
      expect({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) }).toEqual(expected);
    });
  });

  describe('calculatePosition()', () => {
    it.each<[number, number, number, number, CanvasTextAlign, CanvasHorizontalAlign, Point2D]>([
      [100, 100, 200, 200, 'center', 'middle', { x: 0, y: 0 }],
      [100, 100, 200, 200, 'left', 'middle', { x: 100, y: 0 }],
      [100, 100, 200, 200, 'start', 'middle', { x: 100, y: 0 }],
      [100, 100, 200, 200, 'right', 'middle', { x: -100, y: 0 }],
      [100, 100, 200, 200, 'end', 'middle', { x: -100, y: 0 }],
      [100, 100, 200, 200, 'center', 'top', { x: 0, y: 100 }],
      [100, 100, 200, 200, 'left', 'top', { x: 100, y: 100 }],
      [100, 100, 200, 200, 'start', 'top', { x: 100, y: 100 }],
      [100, 100, 200, 200, 'right', 'top', { x: -100, y: 100 }],
      [100, 100, 200, 200, 'end', 'top', { x: -100, y: 100 }],
      [100, 100, 200, 200, 'center', 'bottom', { x: 0, y: -100 }],
      [100, 100, 200, 200, 'left', 'bottom', { x: 100, y: -100 }],
      [100, 100, 200, 200, 'start', 'bottom', { x: 100, y: -100 }],
      [100, 100, 200, 200, 'right', 'bottom', { x: -100, y: -100 }],
      [100, 100, 200, 200, 'end', 'bottom', { x: -100, y: -100 }],
    ])(
      'calculates position for %s, %s, %s, %s (x, y, width, height) when text-align is %s and baseline is %s',
      (x, y, width, height, textAlign, textBaseline, expected) => {
        expect(calculatePosition(x, y, width, height, textAlign, textBaseline)).toEqual(expected);
      }
    );
  });

  describe('getBoundingBox()', () => {
    it('throws an error when no points are given', () => {
      expect(() => getBoundingBox()).toThrow();
    });

    it.each([
      [
        [
          { x: 0, y: 10 },
          { x: 30, y: 0 },
        ],
        { x: 0, y: 0, width: 30, height: 10 },
      ],
      [
        [
          { x: 10, y: 10 },
          { x: 30, y: 30 },
        ],
        { x: 10, y: 10, width: 20, height: 20 },
      ],
      [
        [
          { x: 10, y: 10 },
          { x: 15, y: 25 },
          { x: 30, y: 30 },
        ],
        { x: 10, y: 10, width: 20, height: 20 },
      ],
    ])('returns bounding box for given points %o', (points, expected) => {
      expect(getBoundingBox(...points)).toEqual(expected);
    });
  });

  describe('getTextPosition()', () => {
    it.each<
      [number, number, TextMetrics, CanvasTextAlign, CanvasHorizontalAlign, number, BoundingBox]
    >([
      [
        100,
        100,
        {
          actualBoundingBoxRight: 100,
          actualBoundingBoxLeft: 0,
          actualBoundingBoxAscent: 100,
          actualBoundingBoxDescent: 0,
        } as TextMetrics,
        'center',
        'middle',
        0,
        { x: 50, y: 50, width: 100, height: 100 },
      ],
      [
        100,
        100,
        {
          actualBoundingBoxRight: 100,
          actualBoundingBoxLeft: 0,
          actualBoundingBoxAscent: 100,
          actualBoundingBoxDescent: 0,
        } as TextMetrics,
        'left',
        'middle',
        0,
        { x: 100, y: 50, width: 100, height: 100 },
      ],
      [
        100,
        100,
        {
          actualBoundingBoxRight: 100,
          actualBoundingBoxLeft: 0,
          actualBoundingBoxAscent: 100,
          actualBoundingBoxDescent: 0,
        } as TextMetrics,
        'start',
        'middle',
        0,
        { x: 100, y: 50, width: 100, height: 100 },
      ],
      [
        100,
        100,
        {
          actualBoundingBoxRight: 100,
          actualBoundingBoxLeft: 0,
          actualBoundingBoxAscent: 100,
          actualBoundingBoxDescent: 0,
        } as TextMetrics,
        'right',
        'middle',
        0,
        { x: 0, y: 50, width: 100, height: 100 },
      ],
      [
        100,
        100,
        {
          actualBoundingBoxRight: 100,
          actualBoundingBoxLeft: 0,
          actualBoundingBoxAscent: 100,
          actualBoundingBoxDescent: 0,
        } as TextMetrics,
        'end',
        'middle',
        0,
        { x: 0, y: 50, width: 100, height: 100 },
      ],
      [
        100,
        100,
        {
          actualBoundingBoxRight: 100,
          actualBoundingBoxLeft: 0,
          actualBoundingBoxAscent: 100,
          actualBoundingBoxDescent: 0,
        } as TextMetrics,
        'center',
        'top',
        0,
        { x: 50, y: 100, width: 100, height: 100 },
      ],
      [
        100,
        100,
        {
          actualBoundingBoxRight: 100,
          actualBoundingBoxLeft: 0,
          actualBoundingBoxAscent: 100,
          actualBoundingBoxDescent: 0,
        } as TextMetrics,
        'left',
        'top',
        0,
        { x: 100, y: 100, width: 100, height: 100 },
      ],
      [
        100,
        100,
        {
          actualBoundingBoxRight: 100,
          actualBoundingBoxLeft: 0,
          actualBoundingBoxAscent: 100,
          actualBoundingBoxDescent: 0,
        } as TextMetrics,
        'start',
        'top',
        0,
        { x: 100, y: 100, width: 100, height: 100 },
      ],
      [
        100,
        100,
        {
          actualBoundingBoxRight: 100,
          actualBoundingBoxLeft: 0,
          actualBoundingBoxAscent: 100,
          actualBoundingBoxDescent: 0,
        } as TextMetrics,
        'right',
        'top',
        0,
        { x: 0, y: 100, width: 100, height: 100 },
      ],
      [
        100,
        100,
        {
          actualBoundingBoxRight: 100,
          actualBoundingBoxLeft: 0,
          actualBoundingBoxAscent: 100,
          actualBoundingBoxDescent: 0,
        } as TextMetrics,
        'end',
        'top',
        0,
        { x: 0, y: 100, width: 100, height: 100 },
      ],
      [
        100,
        100,
        {
          actualBoundingBoxRight: 100,
          actualBoundingBoxLeft: 0,
          actualBoundingBoxAscent: 100,
          actualBoundingBoxDescent: 0,
        } as TextMetrics,
        'center',
        'bottom',
        0,
        { x: 50, y: 0, width: 100, height: 100 },
      ],
      [
        100,
        100,
        {
          actualBoundingBoxRight: 100,
          actualBoundingBoxLeft: 0,
          actualBoundingBoxAscent: 100,
          actualBoundingBoxDescent: 0,
        } as TextMetrics,
        'left',
        'bottom',
        0,
        { x: 100, y: 0, width: 100, height: 100 },
      ],
      [
        100,
        100,
        {
          actualBoundingBoxRight: 100,
          actualBoundingBoxLeft: 0,
          actualBoundingBoxAscent: 100,
          actualBoundingBoxDescent: 0,
        } as TextMetrics,
        'start',
        'bottom',
        0,
        { x: 100, y: 0, width: 100, height: 100 },
      ],
      [
        100,
        100,
        {
          actualBoundingBoxRight: 100,
          actualBoundingBoxLeft: 0,
          actualBoundingBoxAscent: 100,
          actualBoundingBoxDescent: 0,
        } as TextMetrics,
        'right',
        'bottom',
        0,
        { x: 0, y: 0, width: 100, height: 100 },
      ],
      [
        100,
        100,
        {
          actualBoundingBoxRight: 100,
          actualBoundingBoxLeft: 0,
          actualBoundingBoxAscent: 100,
          actualBoundingBoxDescent: 0,
        } as TextMetrics,
        'end',
        'bottom',
        0,
        { x: 0, y: 0, width: 100, height: 100 },
      ],
      [
        100,
        100,
        {
          actualBoundingBoxRight: 100,
          actualBoundingBoxLeft: 0,
          actualBoundingBoxAscent: 100,
          actualBoundingBoxDescent: 0,
        } as TextMetrics,
        'center',
        'middle',
        toRadians(60),
        {
          x: 31.69872981077806,
          y: 31.69872981077806,
          width: 136.6025403784439,
          height: 136.6025403784439,
        },
      ],
      [
        100,
        100,
        {
          actualBoundingBoxRight: 100,
          actualBoundingBoxLeft: 0,
          actualBoundingBoxAscent: 100,
          actualBoundingBoxDescent: 0,
        } as TextMetrics,
        'left',
        'top',
        toRadians(270),
        {
          x: 99.99999999999999,
          y: -1.4210854715202004e-14,
          width: 100.00000000000001,
          height: 100.00000000000001,
        },
      ],
    ])(
      'calculates text position for %s, %s (x, y), text metric: %o when text-align is %s and baseline is %s under %s angle (radians)',
      (x, y, textMetrics, textAlign, textBaseline, angle, expected) => {
        expect(getTextPosition(x, y, textMetrics, textAlign, textBaseline, angle)).toEqual(
          expected
        );
      }
    );
  });
});
