export type Writable<T> = {-readonly[E in keyof T]: T[E]}
