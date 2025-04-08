import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { getLinkByShortUrl } from '@/app/functions/get-link-by-short-url'
import { isRight, unwrapEither } from '@/infra/shared/either'
import { SLUG_REGEX } from '@/utils/slug'

export const getLinkRoute: FastifyPluginAsyncZod = async server => {
  server.get(
    '/links/:shortURL',
    {
      schema: {
        summary: 'Get a link by its short URL',
        tags: ['Links'],
        params: z.object({
          shortURL: z.string().regex(SLUG_REGEX),
        }),
        response: {
          200: z.object({
            link: z.object({
              id: z.string(),
              originalURL: z.string(),
              shortURL: z.string().regex(SLUG_REGEX),
              accessCount: z.number(),
              createdAt: z.date(),
            }),
          }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { shortURL } = request.params

      const result = await getLinkByShortUrl({ shortURL })

      if (isRight(result)) {
        return reply.status(200).send({ link: unwrapEither(result).link })
      }

      const error = unwrapEither(result)

      switch (error.constructor.name) {
        case 'LinkByShortUrlNotFound':
          return reply.status(404).send({ message: error.message })
      }
    }
  )
}
