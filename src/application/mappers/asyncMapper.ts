export function asyncMapper<T, P>(
  func: (item: T) => Promise<P>,
): (items: Array<T>) => Promise<Array<P>> {
  return (items: Array<T>): Promise<Array<P>> => Promise.all(items.map(func))
}
