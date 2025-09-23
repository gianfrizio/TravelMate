import { NextResponse } from 'next/server';
import { destinations } from '@/data/destinations';

// Simple seeded RNG (mulberry32) when a seed query param is provided
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStringToInt(str: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

function shuffle<T>(arr: T[], rng: () => number) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function weightedSampleWithoutReplacement<T>(items: T[], weights: number[], k: number, rng: () => number) {
  const chosen: T[] = [];
  const available = items.slice();
  const w = weights.slice();

  k = Math.min(k, available.length);

  for (let s = 0; s < k; s++) {
    const total = w.reduce((a, b) => a + b, 0);
    if (total <= 0) break;
    let r = rng() * total;
    let idx = 0;
    while (r > w[idx]) {
      r -= w[idx];
      idx++;
    }
    chosen.push(available[idx]);
    // remove chosen
    available.splice(idx, 1);
    w.splice(idx, 1);
  }

  return chosen;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const params = url.searchParams;
    const n = Math.max(1, Math.min(20, parseInt(params.get('n') || '3', 10)));
    const continent = params.get('continent');
    const type = params.get('type');
    const budget = params.get('budget');
    const seedParam = params.get('seed');
    const weighted = params.get('weighted') === '1' || params.get('weighted') === 'true';
    const diversity = params.get('diversity') === '1' || params.get('diversity') === 'true';
    const topActivities = Math.max(1, Math.min(10, parseInt(params.get('activities') || '3', 10)));

    let pool = destinations.filter((d) => {
      if (continent && d.continent && d.continent.toLowerCase() !== continent.toLowerCase()) return false;
      if (type && d.type && d.type.toLowerCase() !== type.toLowerCase()) return false;
      if (budget && d.budget && d.budget.toLowerCase() !== budget.toLowerCase()) return false;
      return true;
    });

    if (!pool.length) {
      return NextResponse.json({ error: 'No destinations matching filters' }, { status: 404 });
    }

    const rng = seedParam ? mulberry32(hashStringToInt(seedParam)) : Math.random;

    // If diversity requested, try to pick from different continents first
    let selected = [] as typeof destinations;

    if (diversity) {
      const byContinent: Record<string, typeof destinations> = {};
      for (const d of pool) {
        const key = (d.continent || 'unknown').toLowerCase();
        byContinent[key] = byContinent[key] || [];
        byContinent[key].push(d);
      }

      const continentKeys = Object.keys(byContinent);
      // Shuffle continent order
      const shuffledContKeys = shuffle(continentKeys, rng);

      // Round-robin pick one from each continent until we reach n
      let i = 0;
      while (selected.length < n && Object.keys(byContinent).length) {
        const ck = shuffledContKeys[i % shuffledContKeys.length];
        const list = byContinent[ck];
        if (list && list.length) {
          // pick random from list
          const pick = list.splice(Math.floor(rng() * list.length), 1)[0];
          selected.push(pick);
        } else {
          // remove empty continent bucket from rotation
          const idx = shuffledContKeys.indexOf(ck);
          if (idx >= 0) shuffledContKeys.splice(idx, 1);
        }
        i++;
        // safety break
        if (i > 1000) break;
      }

      // if we still need more, fill with weighted or random picks from remaining pool
      if (selected.length < n) {
        const remaining = pool.filter((p) => !selected.find((s) => s.id === p.id));
        if (weighted) {
          const weights = remaining.map((r) => Math.max(0.1, (r.rating || 1)));
          selected = selected.concat(weightedSampleWithoutReplacement(remaining, weights, n - selected.length, rng));
        } else {
          selected = selected.concat(shuffle(remaining, rng).slice(0, n - selected.length));
        }
      }
    } else {
      // no diversity requested
      if (weighted) {
        const weights = pool.map((p) => Math.max(0.1, (p.rating || 1)));
        selected = weightedSampleWithoutReplacement(pool, weights, n, rng as any);
      } else {
        selected = shuffle(pool, rng as any).slice(0, n);
      }
    }

    // For each selected destination, pick up to `topActivities` activities (randomized but stable if seeded)
    const results = selected.map((d) => {
      const activities = d.activities || [];
      const chosenActivities = shuffle(activities, rng as any).slice(0, Math.min(topActivities, activities.length));
      return { ...d, activities: chosenActivities };
    });

    return NextResponse.json({ count: results.length, results });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
