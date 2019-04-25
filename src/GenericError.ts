enum ErrorsCode {
  UNKNOWN,
  NOT_FOUND,
  FORBIDDEN,
  NOT_AUTHENTICATED,
}

class GenericError extends Error {
  constructor(public code: keyof typeof ErrorsCode, message?: string) {
    super();

    this.message = message || code
  }
}

export default GenericError