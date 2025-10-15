import { NextResponse } from "next/server"
import { getInterestTags } from "@/app/lib/interests"

export async function GET() {
  const tags = await getInterestTags()
  return NextResponse.json(
    {
      code: 200,
      message: "success",
      data: tags,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=600, s-maxage=600, stale-while-revalidate=300",
      },
    },
  )
}
