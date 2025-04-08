import { exportLinks } from '@/app/functions/export-links'
import { unwrapEither } from '@/infra/shared/either'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const exportLinkRoute: FastifyPluginAsyncZod = async server => {
  server.get(
    '/links/exports',
    {
      schema: {
        summary: 'Export links',
        tags: ['Links'],
        response: {
          200: z.object({
            csvURL: z.string(),
          }),
        },
      },
    },
    async (_, reply) => {
      const result = await exportLinks()

      const { csvURL } = unwrapEither(result)

      return reply.status(200).send({ csvURL })
    }
  )
}
