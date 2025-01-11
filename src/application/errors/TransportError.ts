/**
 * @description Used when something was malformed or wrong with a Transport.
 */
export class TransportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TransportError';
    this.message = message;
    this.cause = { statusCode: 400 };
  }
}
