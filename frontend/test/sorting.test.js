import test from 'node:test'
import assert from 'node:assert/strict'
import { buildSortTrace } from '../src/features/sorting.js'

const algorithms = ['Bubble sort', 'Selection sort', 'Insertion sort', 'Merge sort']

for (const algorithm of algorithms) {
  test(`${algorithm} reaches an ordered result with duplicate values`, () => {
    const input = [5, 1, 4, 1, 3]
    const trace = buildSortTrace(input, algorithm)
    assert.deepEqual(trace.at(-1).values, [1, 1, 3, 4, 5])
    assert.deepEqual(input, [5, 1, 4, 1, 3], 'the provided input stays unchanged')
    assert.ok(trace.at(-1).comparisons > 0)
  })
}

test('merge sort counts comparisons and selection sort uses fewer swaps on reversed data', () => {
  const input = [6, 5, 4, 3, 2, 1]
  const merge = buildSortTrace(input, 'Merge sort').at(-1)
  const selection = buildSortTrace(input, 'Selection sort').at(-1)
  assert.ok(merge.comparisons > 0)
  assert.ok(selection.comparisons > merge.comparisons)
  assert.ok(selection.swaps <= input.length - 1)
})
