export function buildSortTrace(values, algorithm) {
  const work = [...values]
  const frames = []
  let comparisons = 0
  let swaps = 0
  const record = (pair) => frames.push({ values: [...work], comparisons, swaps, pair })

  if (algorithm === 'Bubble sort') {
    for (let end = work.length - 1; end > 0; end -= 1) {
      let moved = false
      for (let i = 0; i < end; i += 1) {
        comparisons += 1
        if (work[i] > work[i + 1]) { [work[i], work[i + 1]] = [work[i + 1], work[i]]; swaps += 1; moved = true }
        record([i, i + 1])
      }
      if (!moved) break
    }
  } else if (algorithm === 'Selection sort') {
    for (let start = 0; start < work.length - 1; start += 1) {
      let smallest = start
      for (let i = start + 1; i < work.length; i += 1) {
        comparisons += 1
        if (work[i] < work[smallest]) smallest = i
        record([smallest, i])
      }
      if (smallest !== start) { [work[start], work[smallest]] = [work[smallest], work[start]]; swaps += 1; record([start, smallest]) }
    }
  } else if (algorithm === 'Insertion sort') {
    for (let i = 1; i < work.length; i += 1) {
      let cursor = i
      while (cursor > 0) {
        comparisons += 1
        if (work[cursor - 1] > work[cursor]) { [work[cursor - 1], work[cursor]] = [work[cursor], work[cursor - 1]]; swaps += 1 }
        else { record([cursor - 1, cursor]); break }
        record([cursor - 1, cursor])
        cursor -= 1
      }
    }
  } else if (algorithm === 'Merge sort') {
    const merge = (start, end) => {
      if (end - start < 2) return
      const middle = Math.floor((start + end) / 2)
      merge(start, middle); merge(middle, end)
      const left = work.slice(start, middle)
      const right = work.slice(middle, end)
      let a = 0; let b = 0; let write = start
      while (a < left.length && b < right.length) {
        comparisons += 1
        const leftIndex = start + a
        const rightIndex = middle + b
        if (left[a] <= right[b]) work[write++] = left[a++]
        else work[write++] = right[b++]
        record([leftIndex, rightIndex])
      }
      while (a < left.length) { work[write++] = left[a++]; record([write - 1]) }
      while (b < right.length) { work[write++] = right[b++]; record([write - 1]) }
    }
    merge(0, work.length)
  } else {
    throw new Error(`Unsupported sorting algorithm: ${algorithm}`)
  }
  return frames
}
