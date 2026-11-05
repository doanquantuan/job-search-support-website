class Notification {
  constructor(data) {
    this.notificationId = data.notificationId;
    this.userId = data.userId;
    this.title = data.title;
    this.content = data.content;
    this.type = data.type;
    this.isRead = Boolean(data.isRead);
    this.targetUrl = data.targetUrl || null;
    this.metadata = data.metadata || null;
    this.eventId = data.eventId || null;
    this.createdAt = data.createdAt;
  }

  belongsTo(userId) {
    return this.userId === userId;
  }

  toDTO() {
    return {
      notificationId: this.notificationId,
      userId: this.userId,
      title: this.title,
      content: this.content,
      type: this.type,
      isRead: this.isRead,
      targetUrl: this.targetUrl,
      metadata: this.metadata,
      createdAt: this.createdAt,
    };
  }
}

export default Notification;
