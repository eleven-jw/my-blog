import { formatDateTime, formatRelativeTime } from "@/lib/utils"

describe("formatRelativeTime", () => {
  const baseDate = new Date("2024-05-01T08:00:00Z")

  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(baseDate)
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  it("formats recent past in seconds", () => {
    const value = new Date(baseDate.getTime() - 45 * 1000)
    expect(formatRelativeTime(value)).toBe("45秒钟前")
  })

  it("formats future values in hours", () => {
    const value = new Date(baseDate.getTime() + 2 * 60 * 60 * 1000)
    expect(formatRelativeTime(value)).toBe("2小时后")
  })
})

describe("formatDateTime", () => {
  it("formats valid date like YYYY/MM/DD HH:mm", () => {
    const formatted = formatDateTime("2024-05-01T08:30:00Z")
    expect(formatted).toBe("2024/05/01 08:30")
  })

  it("returns empty string for invalid date input", () => {
    const formatted = formatDateTime("invalid-date")
    expect(formatted).toBe("")
  })
})
