class Admin {
  constructor({
    userId,
    id,
    createdAt,
    updatedAt,
  } = {}) {
    this.userId = userId || id;
    this.createdAt = createdAt ? new Date(createdAt) : undefined;
    this.updatedAt = updatedAt ? new Date(updatedAt) : undefined;
  }

  toResponseFormat() {
    return {
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = Admin;

