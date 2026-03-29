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
    error: 500,
    warn: 400,
    info: 200,
    success: 200,
  };

  res.status(statusMap[err.type] ?? 500).json({
    success: false,
    type: err.type,
    code: err.code,
    caution: err.caution,
    ts: err.ts,
  });
};
