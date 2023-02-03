# Cloud

Cloud generator. Typically used for wordclouds.

## Installation

```bash
npm install @alesmenzel/cloud
```

### Usage

TODO

### React

Example of how to use wordcloud generator with React.

```tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { scaleLinear } from 'd3-scale';
import { faker } from '@faker-js/faker';
import {
  Cloud,
  CloudPoint,
  ArchimedeanRandomRandomizer,
  WordCollider,
  HearthWordColliderMask,
  random,
} from '@alesmenzel/cloud';
import { useCallback } from 'react';

const MIN_FONT_SIZE = 8
const MAX_FONT_SIZE = 50
const FONT = 'Roboto'

export type Word = { text: string; count: number };
export type Points<Item> = { index: number, point: CloudPoint; item: Item };

export function MyCloud() {
  // Ref to svg element so we can responsively change the wordcloud
  const ref = useRef(null);

  // List of words from some storage, e.g. from API
  const [words] = useState<Word[]>(Array.from({length: 200}).map(_ => ({
    text: faker.word.adjective(),
    count: random(1, 1000)
  })));

  // Points calculated by Cloud
  const [points, setPoints] = useState<Points<Word>[]>([]);

  // Set initial width/height and options
  const [cloud] = useState(
    () =>
      new Cloud<Word>({
        width: 100,
        height: 100,
        randomizer: new ArchimedeanRandomRandomizer({ width: 100, height: 100 }),
        collider: new WordCollider({
          width: 100,
          height: 100,
          font: FONT,
          textAlign: 'center',
          textBaseline: 'middle',
          mask: new HearthWordColliderMask(),
          gap: 2,
        }),
        attempts: 200,
      })
  );

  // Keep tract of the responsive cloud dimensions
  const [size, setSize] = useState({
    width: 100,
    height: 100,
  });

  // Scale word count to font size
  const fontScale = useMemo(() => {
    const max = words.reduce((acc, word) => Math.max(acc, word.count), 0);
    // Could use also scaleLog instead to make the smaller words bigger
    return scaleLinear().domain([1, max]).range([MIN_FONT_SIZE, MAX_FONT_SIZE]).clamp(true);
  }, [words]);

  // Update the cloud when dimensions change
  const { width, height } = size;
  
  // It is important to use layoutEffect here - see https://medium.com/@alesmenzel/reacts-useeffect-nightmare-4c56f105acc8
  useLayoutEffect(() => {
    cloud.update({ width, height });
    setPoints([])

    let i = 0;
    let animationHandle;

    function calculate() {
      const word = words[i];
      if (!word) return;

      const count = fontScale(word.count)
      const point = cloud.next({ text: word.text, count });

      if (point) {
        setPoints((points) => [...points, { index: i, point, item: { text: word.text, count } }]);
      }
      i += 1;
      animationHandle = requestAnimationFrame(calculate);
    }

    animationHandle = requestAnimationFrame(calculate);

    return () => {
      cancelAnimationFrame(animationHandle);
    };
  }, [cloud, width, height, words, fontScale]);

  // Update the dimensions
  useEffect(() => {
    if (!ref.current) return undefined;

    const { clientWidth, clientHeight } = ref.current;
    setSize({ width: clientWidth, height: clientHeight });

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentBoxSize) {
          const contentBoxSize = Array.isArray(entry.contentBoxSize)
            ? entry.contentBoxSize[0]
            : entry.contentBoxSize;
          setSize({ width: contentBoxSize.inlineSize, height: contentBoxSize.blockSize });
        }
      }
    });

    observer.observe(ref.current);
    return () => {
      observer.disconnect();
    };
  }, []);

  // Color words based on their size
  const colorScale = useMemo(() => {
    return scaleLinear()
      .domain([MIN_FONT_SIZE, MAX_FONT_SIZE])
      .range(['pink', 'darkred'])
      .clamp(true);
  }, []);

  // SVG doesnt support z indexes, move the hovered element to front
  const handleHover = useCallback((point) => {
    setPoints(points => [point, ...points.filter(p => p !== point)])
  }, [])

  // render the cloud with canvas/svg/html as you like
  // points: [{ point: { x: 263, y: 213 }, item: { text: string, count: number } }]
  return (
    // ResizeObserver on svg is broken :(
    <div className="resizer" ref={ref}>
      <svg width="100%" height="100%">
        {points.map((word) => {
          const { point, item, index } = word
          return (
          // Must be wrapped in a group, otherwise the hover animation use svg origin
          <g transform={`translate(${point.x} ${point.y})`} key={index}>
            {/* The text style must match the style used in Cloud otherwise the collision detection
             will not work correctly */}
            <text
              x={0}
              y={0}
              textAnchor="middle"
              alignmentBaseline="middle"
              fill={colorScale(item.count)}
              className='word'
              style={{
                font: `${item.count}px ${FONT}`,
              }}
              onMouseOver={() => handleHover(word)}
            >
              {item.text}
            </text>
          </g>
        )})}
      </svg>
    </div>
  );
}
```
