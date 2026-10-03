class User {
  constructor({ id, email, fullName, avatar, passwordHash, role, status = 'ACTIVE', isVerified = false, createdAt, updatedAt }) {
    this.id = id;
    this.email = email;
    this.fullName = fullName;
    this.avatar = avatar;
    this.passwordHash = passwordHash;
    this.role = role;
    this.status = status;
    this.isVerified = isVerified;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  isBlocked() {
    return this.status === 'BLOCKED';
  }

  isActive() {
    return this.status === 'ACTIVE';
  }

  hasRole(role) {
    return this.role === role;
  }

  getPermissions() {
    return [];
  }

  toResponseFormat() {
    return {
      id: this.id,
      email: this.email,
      fullName: this.fullName,
      avatar: this.avatar,
      role: this.role,
      status: this.status,
      isVerified: this.isVerified,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = User;
