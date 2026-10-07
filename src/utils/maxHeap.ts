/**
 * Generic MaxHeap Priority Queue Implementation in TypeScript
 * CleanTrack - Municipal Waste Logistics Dispatch Engine
 *
 * Implements binary heap algorithms with:
 * - O(log N) insert
 * - O(log N) extractMax
 * - O(1) peek
 * - O(N) buildHeap (bottom-up Floyd's heap construction)
 */

export class MaxHeap<T> {
  private heap: T[];
  private compare: (a: T, b: T) => number;

  /**
   * @param compareFn Returns > 0 if a has higher priority than b, < 0 if b > a, 0 if equal
   */
  constructor(compareFn: (a: T, b: T) => number, initialItems?: T[]) {
    this.heap = [];
    this.compare = compareFn;

    if (initialItems && initialItems.length > 0) {
      this.buildHeap(initialItems);
    }
  }

  public size(): number {
    return this.heap.length;
  }

  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  public peek(): T | null {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  public insert(item: T): void {
    this.heap.push(item);
    this.siftUp(this.heap.length - 1);
  }

  public extractMax(): T | null {
    if (this.isEmpty()) return null;
    const max = this.heap[0];
    const last = this.heap.pop();

    if (this.heap.length > 0 && last !== undefined) {
      this.heap[0] = last;
      this.siftDown(0);
    }

    return max;
  }

  public buildHeap(items: T[]): void {
    this.heap = [...items];
    const firstNonLeaf = Math.floor((this.heap.length - 2) / 2);
    for (let i = firstNonLeaf; i >= 0; i--) {
      this.siftDown(i);
    }
  }

  public toSortedArray(): T[] {
    const clone = this.clone();
    const sorted: T[] = [];
    while (!clone.isEmpty()) {
      const top = clone.extractMax();
      if (top !== null) sorted.push(top);
    }
    return sorted;
  }

  public clone(): MaxHeap<T> {
    const newHeap = new MaxHeap<T>(this.compare);
    newHeap.heap = [...this.heap];
    return newHeap;
  }

  public getRawHeap(): readonly T[] {
    return this.heap;
  }

  private siftUp(index: number): void {
    let curr = index;
    while (curr > 0) {
      const parent = Math.floor((curr - 1) / 2);
      if (this.compare(this.heap[curr], this.heap[parent]) > 0) {
        this.swap(curr, parent);
        curr = parent;
      } else {
        break;
      }
    }
  }

  private siftDown(index: number): void {
    let curr = index;
    const length = this.heap.length;

    while (true) {
      const left = 2 * curr + 1;
      const right = 2 * curr + 2;
      let largest = curr;

      if (left < length && this.compare(this.heap[left], this.heap[largest]) > 0) {
        largest = left;
      }

      if (right < length && this.compare(this.heap[right], this.heap[largest]) > 0) {
        largest = right;
      }

      if (largest !== curr) {
        this.swap(curr, largest);
        curr = largest;
      } else {
        break;
      }
    }
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }
}
