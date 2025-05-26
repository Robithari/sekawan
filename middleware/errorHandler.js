// Middleware penanganan error global
module.exports = (err, req, res, next) => {
    console.error(err.stack); // Log error ke console

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Terjadi kesalahan pada server';

    res.status(statusCode).json({
        success: false,
        error: message,
    });
};
