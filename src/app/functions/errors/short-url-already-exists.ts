export class ShortUrlAlreadyExists extends Error {
  constructor(shortURL: string) {
    super(`Short URL: '${shortURL}' already exists`)
  }
}
