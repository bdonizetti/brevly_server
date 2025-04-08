export class LinkByIdNotFound extends Error {
  constructor(id: string) {
    super(`Link with ID: '${id}' not found`)
  }
}
