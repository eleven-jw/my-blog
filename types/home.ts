export type StatItem = {
  label: string
  value: string | number
  change?: string
  changeVariant?: "up" | "down"
}

export type Props = {
  items: StatItem[]
}
