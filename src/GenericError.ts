enum ErrorsCode {
  UNKNOWN,
  NOT_FOUND,
  FORBIDDEN,
  NOT_AUTHENTICATED,
  QUERY_TOO_COMPLEX,
  BAD_REQUEST
}

class GenericError extends Error {
  constructor(public code: keyof typeof ErrorsCode, message?: string) {
    super();

    this.message = message || code
  }
}

export default GenericError