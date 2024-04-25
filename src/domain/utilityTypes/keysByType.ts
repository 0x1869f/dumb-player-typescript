export type KeysByType<T, E> = { [P in keyof T]: T[P] extends E ? P : never }[keyof T]
