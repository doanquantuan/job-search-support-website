const tokenService = require('../services/token.service');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors.util');

const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith('Bearer ')) {
            throw new UnauthorizedError('Token không hợp lệ');
        }

        const token = authHeader.split(' ')[1];

        const payload = tokenService.verifyAccessToken(token);

        req.user = payload;

        next();
    } catch (error) {
        next(error);
    }
};

const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new ForbiddenError('Bạn không có quyền truy cập');
        }

        next();
    };
};


module.exports = {
    authenticateToken,
    authorizeRole
};