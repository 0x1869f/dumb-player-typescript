let id = 1

export function getId(): string {
  const current = id

  id = current + 1

  return current.toString()
}
