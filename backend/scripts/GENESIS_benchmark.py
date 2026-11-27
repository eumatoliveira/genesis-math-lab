"""Reproduce the GENESIS report's independent finite checks and sampling benchmark."""
import csv
import json
import math
import platform
import random
import statistics
import sys
from pathlib import Path
from time import perf_counter_ns

SIZE = 72
POINTS = [(x, y) for y in range(SIZE) for x in range(SIZE)]
TILES = [[(x + i, y + j) for j in range(4) for i in range(4)]
         for y in range(0, SIZE, 4) for x in range(0, SIZE, 4)]
PILOT = [tile[5] for tile in TILES]
METHODS = ('dense', 'pilot', 'random', 'adaptive')


def evaluate(method, field, seed):
    if method == 'adaptive':
        values = [field(*point) for point in PILOT]
        order = sorted(range(len(TILES)), key=values.__getitem__, reverse=True)
        return max(max(values), max(field(*point) for index in order[:42]
                                    for point in TILES[index] if point != PILOT[index]))
    if method == 'random':
        points = random.Random(1000 + seed).sample(POINTS, 954)
    else:
        points = POINTS if method == 'dense' else PILOT
    return max(field(*point) for point in points)


def benchmark():
    rows = []
    budgets = dict(zip(METHODS, (5184, 324, 954, 954)))
    for sigma in (0.45, 1.5, 4.0):
        for seed in range(60):
            rng = random.Random(seed)
            cx, cy = rng.randrange(SIZE), rng.randrange(SIZE)

            def field(x, y):
                return math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / (2 * sigma * sigma))

            order = list(METHODS)
            rng.shuffle(order)
            for method in order:
                trials = []
                for _ in range(3):
                    start = perf_counter_ns()
                    peak = evaluate(method, field, seed)
                    trials.append((perf_counter_ns() - start) / 1e6)
                rows.append(dict(sigma_grid_units=sigma, seed=seed, center_x=cx, center_y=cy,
                                 method=method, evaluations=budgets[method], peak=peak,
                                 exact_peak=int(peak == 1.0), peak_abs_error=1.0 - peak,
                                 ms_1=trials[0], ms_2=trials[1], ms_3=trials[2],
                                 median_ms=statistics.median(trials)))
    return rows


def finite_checks():
    orbit = [27]
    while orbit[-1] != 1:
        n = orbit[-1]
        orbit.append(3 * n + 1 if n % 2 else n // 2)
    primes = [k for k in range(2, 1201) if all(k % d for d in range(2, math.isqrt(k) + 1))]
    prime_set = set(primes)
    gold = {e: sum(e - p in prime_set for p in primes if p <= e // 2)
            for e in range(4, 1201, 2)}
    fermat = 2 ** 32 + 1
    euler = sum(x ** 5 for x in (27, 84, 110, 133))
    faces = [44 ** 2 + 117 ** 2, 44 ** 2 + 240 ** 2, 117 ** 2 + 240 ** 2]
    diagonal_sq = 44 ** 2 + 117 ** 2 + 240 ** 2
    assert (len(orbit) - 1, max(orbit), orbit.index(max(orbit))) == (111, 9232, 77)
    assert len(gold) == 599 and min(gold.values()) >= 1
    assert fermat == 641 * 6700417 and euler == 144 ** 5 and diagonal_sq - math.isqrt(diagonal_sq) ** 2 == 325
    return dict(orbit=orbit, goldbach=gold, fermat=fermat, euler=euler,
                faces=faces, diagonal_sq=diagonal_sq)


if __name__ == '__main__':
    folder = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).parent
    rows = benchmark()
    with (folder / 'GENESIS_benchmark.csv').open('w', newline='', encoding='utf8') as output:
        writer = csv.DictWriter(output, fieldnames=rows[0])
        writer.writeheader()
        writer.writerows(rows)
    (folder / 'GENESIS_verification.json').write_text(json.dumps(
        dict(runtime=sys.version.split()[0], platform=platform.platform(),
             processor=platform.processor(), checks=finite_checks()), indent=2), encoding='utf8')
