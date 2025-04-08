export class LinkByShortUrlNotFound extends Error {
  constructor(shortURL: string) {
    super(`Link with short URL ${shortURL} not found`)
  }
}
