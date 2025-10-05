// // 404 for unknown routes
// exports.notFound = (req, res, next) => {
//   res.status(404).json({
//     success: false,
//     message: `Route not found: ${req.method} ${req.originalUrl}`
//   });
// };

// // Centralized error handler
// exports.errorHandler = (err, req, res, next) => {
//   console.error('ERROR:', err);
//   const status = err.statusCode || 500;
//   res.status(status).json({
//     success: false,
//     message: err.message || 'Internal server error'
//   });
// };


// We will deal with it later