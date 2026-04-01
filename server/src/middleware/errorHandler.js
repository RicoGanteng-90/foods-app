import AppError from '../utils/AppError.js';

export default (err, req, res, next) => {
  if (!(err instanceof AppError)) {
    err = new AppError(err.message || 'Internal Server Error', {
      type: 'error',
      code: 'INTERNAL_SERVER_ERROR',
    });
  }

  console.error(`[${err.ts}] ${err.name} ${err.code}: ${err.message}`, {
    context: err.context,
    stack: err.type ? err.stack : undefined,
  });

  const statusMap = {
    not_found: 404,
    unauthorized: 401,
    forbidden: 403,
    conflict: 409,
    validation: 422,
    error: 500,
  };

  res.status(statusMap[err.type] ?? 500).json({
    success: false,
    message: err.message,
    code: err.code,
    caution: err.caution,
    ts: err.ts,
  });
};
