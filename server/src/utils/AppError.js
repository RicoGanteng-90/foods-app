class AppError extends Error {
  constructor(
    message,
    { type = 'error', code = null, caution = null, context = {} } = {}
  ) {
    super(message);
    this.name = this.constructor.name;
    this.type = type;
    this.code = code;
    this.caution = caution ?? message;
    this.context = context;
    this.ts = new Date().toISOString();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default AppError;
