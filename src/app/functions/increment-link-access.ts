import { LinkByIdNotFound } from '@/app/functions/errors/link-by-id-not-found'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, makeLeft, makeRight } from '@/infra/shared/either'
import { eq, sql } from 'drizzle-orm'
import { z } from 'zod'

const inputSchema = z.object({
  id: z.string().uuid(),
})

type Input = z.input<typeof inputSchema>

type Output = {
  link: typeof schema.links.$inferSelect
}

export async function incrementLinkAccess(
  input: Input
): Promise<Either<LinkByIdNotFound, Output>> {
  const { id } = inputSchema.parse(input)

  const linkExists = await db.query.links.findFirst({
    where: (links, { eq }) => eq(links.id, id),
  })

  if (!linkExists) {
    return makeLeft(new LinkByIdNotFound(id))
  }

  const [result] = await db
    .update(schema.links)
    .set({ accessCount: sql`${schema.links.accessCount} + 1` })
    .where(eq(schema.links.id, id))
    .returning()

  return makeRight({ link: result })
}
