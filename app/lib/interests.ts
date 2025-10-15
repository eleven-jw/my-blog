import { cache } from "react"

const INTEREST_TAGS = [
  "Frontend Development	",
  "Backend Development	",
  "Mobile Development	",
  "AI / Data Science",
  "Technical Writing	",
  "Open Source Contribution	",
  "Product Design	",
  "Reading",
  "Travel",
  "Music",
  "Photography",
  "Game",
]

export const getInterestTags = cache(async () => INTEREST_TAGS)

export default INTEREST_TAGS
