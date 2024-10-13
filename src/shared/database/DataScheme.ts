export type DataSchema = {
  coins: number
}

export const check = (value: unknown): DataSchema => {
  assert(typeOf(value) === "table", "Data must be a table")

  return {
    coins: (value as Record<string, any>).coins
  }
}