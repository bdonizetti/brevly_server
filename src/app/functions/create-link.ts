import { ShortUrlAlreadyExists } from '@/app/functions/errors/short-url-already-exists'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, makeLeft, makeRight } from '@/infra/shared/either'
import { SLUG_REGEX } from '@/utils/slug'
import { z } from 'zod'

const inputSchema = z.object({
  originalURL: z.string().url(),
  shortURL: z.string().regex(SLUG_REGEX),
})

type Input = z.input<typeof inputSchema>

type Output = {
  link: typeof schema.links.$inferSelect
}

export async function createLink(
  input: Input
): Promise<Either<ShortUrlAlreadyExists, Output>> {
  const { originalURL, shortURL } = inputSchema.parse(input)

  const linkExists = await db.query.links.findFirst({
    where: (links, { eq }) => eq(links.shortURL, shortURL),
  })

  if (linkExists) {
    return makeLeft(new ShortUrlAlreadyExists(shortURL))
  }

  const [result] = await db
    .insert(schema.links)
    .values({
      originalURL,
      shortURL,
    })
    .returning()

  return makeRight({ link: result })
}
