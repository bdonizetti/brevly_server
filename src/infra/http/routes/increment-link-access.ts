import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { incrementLinkAccess } from '@/app/functions/increment-link-access'
import { isRight, unwrapEither } from '@/infra/shared/either'
import { SLUG_REGEX } from '@/utils/slug'

export const incrementLinkAccessRoute: FastifyPluginAsyncZod = async server => {
  server.patch(
    '/links/:id/increment',
    {
      schema: {
        summary: 'Increment link access count',
        tags: ['Links'],
        params: z.object({
          id: z.string().uuid(),
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
      const { id } = request.params

      const result = await incrementLinkAccess({ id })

      if (isRight(result)) {
        return reply.status(200).send({ link: unwrapEither(result).link })
      }

      const error = unwrapEither(result)

      switch (error.constructor.name) {
        case 'LinkByIdNotFound':
          return reply.status(404).send({ message: error.message })
      }
    }
  )
}
