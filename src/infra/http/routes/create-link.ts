import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { createLink } from '@/app/functions/create-link'
import { isRight, unwrapEither } from '@/infra/shared/either'
import { SLUG_REGEX } from '@/utils/slug'

export const createLinkRoute: FastifyPluginAsyncZod = async server => {
  server.post(
    '/links',
    {
      schema: {
        summary: 'Create a new short link',
        tags: ['Links'],
        body: z.object({
          originalURL: z.string().url(),
          shortURL: z.string().regex(SLUG_REGEX),
        }),
        response: {
          201: z.object({
            link: z.object({
              id: z.string(),
              originalURL: z.string(),
              shortURL: z.string().regex(SLUG_REGEX),
              accessCount: z.number(),
              createdAt: z.date(),
            }),
          }),
          400: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { originalURL, shortURL } = request.body

      const result = await createLink({ originalURL, shortURL })

      if (isRight(result)) {
        return reply.status(201).send({ link: unwrapEither(result).link })
      }

      const error = unwrapEither(result)

      switch (error.constructor.name) {
        case 'ShortUrlAlreadyExists':
          return reply.status(400).send({ message: error.message })
      }
    }
  )
}
