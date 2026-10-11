const googleStrategy = require('./google.strategy');
const facebookStrategy = require('./facebook.strategy');
const { BadRequestError } = require('../../utils/errors.util');

const strategies = {
  GOOGLE: googleStrategy,
  FACEBOOK: facebookStrategy,
};

/**
 * Factory lấy Strategy tương ứng với provider
 * @param {string} providerName - 'GOOGLE' | 'FACEBOOK' | ...
 */
function getOAuthStrategy(providerName) {
  if (!providerName || typeof providerName !== 'string') {
    throw new BadRequestError('Nhà cung cấp OAuth không hợp lệ');
  }

  const normalizedName = providerName.trim().toUpperCase();
  const strategy = strategies[normalizedName];

  if (!strategy) {
    throw new BadRequestError(
      `Hệ thống chưa hỗ trợ đăng nhập bằng '${providerName}'. Hiện chỉ hỗ trợ: ${Object.keys(strategies).join(', ')}`
    );
  }

  return strategy;
}

module.exports = {
  getOAuthStrategy,
};

