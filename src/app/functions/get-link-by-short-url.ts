import { LinkByShortUrlNotFound } from '@/app/functions/errors/link-by-short-url-not-found'
import { db } from '@/infra/db'
import type { schema } from '@/infra/db/schemas'
import { type Either, makeLeft, makeRight } from '@/infra/shared/either'
import { z } from 'zod'

const inputSchema = z.object({
  shortURL: z.string(),
})

type Input = z.input<typeof inputSchema>

type Output = {
  link: typeof schema.links.$inferSelect
}

export async function getLinkByShortUrl(
  input: Input
): Promise<Either<LinkByShortUrlNotFound, Output>> {
  const { shortURL } = inputSchema.parse(input)

  const link = await db.query.links.findFirst({
    where: (links, { eq }) => eq(links.shortURL, shortURL),
  })

  if (!link) {
    return makeLeft(new LinkByShortUrlNotFound(shortURL))
  }

  return makeRight({ link })
}
