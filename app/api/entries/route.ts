import { NextRequest, NextResponse } from "next/server"
import { createEntryInDatabase, listEntriesFromDatabase } from "@/lib/server/entries-service"
import type { NewFishingEntry } from "@/lib/entries/types"
import { isDatabaseConfigured } from "@/lib/server/prisma"
import { withApiHandler } from "@/lib/api/handler"
import { ApiErrors } from "@/lib/api/errors"
import { auth } from "@/lib/auth"

export const runtime = "nodejs"

export const GET = withApiHandler("GET", "/api/entries", async () => {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(ApiErrors.databaseNotConfigured, { status: 503 })
  }

  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json(ApiErrors.unauthorized, { status: 401 })
  }

  const entries = await listEntriesFromDatabase(userId)
  return NextResponse.json(entries)
})

export const POST = withApiHandler("POST", "/api/entries", async (request: NextRequest) => {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(ApiErrors.databaseNotConfigured, { status: 503 })
  }

  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json(ApiErrors.unauthorized, { status: 401 })
  }

  const payload = (await request.json()) as NewFishingEntry
  const createdEntry = await createEntryInDatabase(payload, userId)
  return NextResponse.json(createdEntry, { status: 201 })
})
