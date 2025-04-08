import type { schema } from '@/infra/db/schemas'
import { type Either, makeRight } from '@/infra/shared/either'

import { db } from '@/infra/db'

type Output = {
  links: Array<typeof schema.links.$inferSelect>
}

export async function getLinks(): Promise<Either<never, Output>> {
  const links = await db.query.links.findMany({
    orderBy: (links, { desc }) => desc(links.createdAt),
  })

  return makeRight({ links })
}
