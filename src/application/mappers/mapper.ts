function *mapperWithGenerator<T, P>(func: (item: T) => P, items: Array<T>) {
  for (const item of items) {
    yield func(item)
  }
}

export function mapper<T, P>(
  func: (item: T) => P,
): (items: Array<T>) => Array<P> {
  return (items: Array<T>): Array<P> => {
    const generator = mapperWithGenerator(func, items)

    return [...generator]
  }
}
