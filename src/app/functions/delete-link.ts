import { LinkByIdNotFound } from '@/app/functions/errors/link-by-id-not-found'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, makeLeft, makeRight } from '@/infra/shared/either'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const inputSchema = z.object({
  id: z.string().uuid(),
})

type Input = z.input<typeof inputSchema>

export async function deleteLink(
  input: Input
): Promise<Either<LinkByIdNotFound, null>> {
  const { id } = inputSchema.parse(input)

  const linkExists = await db.query.links.findFirst({
    where: (links, { eq }) => eq(links.id, id),
  })

  if (!linkExists) {
    return makeLeft(new LinkByIdNotFound(id))
  }

  await db.delete(schema.links).where(eq(schema.links.id, id))

  return makeRight(null)
}
