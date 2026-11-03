
class BaseOAuthStrategy {
  constructor(name) {
    if (new.target === BaseOAuthStrategy) {
      throw new TypeError('Không thể khởi tạo trực tiếp BaseOAuthStrategy');
    }
    this.name = name;
  }

  async verifyToken(_token) {
    throw new Error(`Method verifyToken() chưa được implement cho ${this.name}`);
  }
}

export default BaseOAuthStrategy;

