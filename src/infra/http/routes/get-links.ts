import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { getLinks } from '@/app/functions/get-links'
import { unwrapEither } from '@/infra/shared/either'
import { SLUG_REGEX } from '@/utils/slug'

export const getLinksRoute: FastifyPluginAsyncZod = async server => {
  server.get(
    '/links',
    {
      schema: {
        summary: 'Get all links',
        tags: ['Links'],
        response: {
          200: z.object({
            links: z.array(
              z.object({
                id: z.string(),
                originalURL: z.string(),
                shortURL: z.string().regex(SLUG_REGEX),
                accessCount: z.number(),
                createdAt: z.date(),
              })
            ),
          }),
        },
      },
    },
    async (_, reply) => {
      const result = await getLinks()

      const { links } = unwrapEither(result)

      return reply.status(200).send({ links })
    }
  )
}
