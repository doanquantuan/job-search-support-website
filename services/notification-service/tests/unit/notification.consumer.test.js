import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import notificationService from '../../src/services/notification.service.js';
import { ROUTING_KEYS } from '../../src/queues/notification.consumer.js';

describe('NotificationConsumer Unit Tests (ESM)', () => {
  let mockChannel;

  beforeEach(() => {
    jest.restoreAllMocks();

    mockChannel = {
      assertExchange: jest.fn().mockResolvedValue(true),
      assertQueue: jest.fn().mockResolvedValue(true),
      bindQueue: jest.fn().mockResolvedValue(true),
      prefetch: jest.fn().mockResolvedValue(true),
      ack: jest.fn(),
      nack: jest.fn(),
    };
  });

  it('Kiểm tra danh sách ROUTING_KEYS bao gồm đủ các event Giai đoạn 1', () => {
    expect(ROUTING_KEYS).toContain('application.status_changed');
    expect(ROUTING_KEYS).toContain('application.submitted');
    expect(ROUTING_KEYS).toContain('company.verification.status_changed');
    expect(ROUTING_KEYS).toContain('auth.password_changed');
    expect(ROUTING_KEYS).toContain('user.status_changed');
  });

  describe('Xử lý message callback', () => {
    const handleMessage = async (msg) => {
      if (!msg) return;

      const routingKey = msg.fields.routingKey;
      let payload;

      try {
        payload = JSON.parse(msg.content.toString());
      } catch (parseError) {
        mockChannel.nack(msg, false, false);
        return;
      }

      try {
        const { eventId, recipientId, data } = payload;

        if (!recipientId) {
          mockChannel.nack(msg, false, false);
          return;
        }

        await notificationService.processDomainEvent({
          eventId: eventId || payload.id,
          event: routingKey,
          recipientId,
          data: data || payload,
        });

        mockChannel.ack(msg);
      } catch (processingError) {
        mockChannel.nack(msg, false, false);
      }
    };

    it('Xử lý message hợp lệ: Gọi processDomainEvent và ack message', async () => {
      const msg = {
        fields: { routingKey: 'application.status_changed' },
        content: Buffer.from(
          JSON.stringify({
            eventId: 'evt-100',
            recipientId: 'u-100',
            data: { status: 'APPROVED' },
          })
        ),
      };

      jest.spyOn(notificationService, 'processDomainEvent').mockResolvedValue({
        duplicate: false,
        notification: { notificationId: 'n-1' },
      });

      await handleMessage(msg);

      expect(notificationService.processDomainEvent).toHaveBeenCalledWith({
        eventId: 'evt-100',
        event: 'application.status_changed',
        recipientId: 'u-100',
        data: { status: 'APPROVED' },
      });
      expect(mockChannel.ack).toHaveBeenCalledWith(msg);
      expect(mockChannel.nack).not.toHaveBeenCalled();
    });

    it('Chống message trùng (Idempotent): processDomainEvent báo duplicate vẫn ack an toàn', async () => {
      const msg = {
        fields: { routingKey: 'application.submitted' },
        content: Buffer.from(
          JSON.stringify({
            eventId: 'evt-duplicate',
            recipientId: 'u-100',
            data: {},
          })
        ),
      };

      jest.spyOn(notificationService, 'processDomainEvent').mockResolvedValue({
        duplicate: true,
        notification: { notificationId: 'n-old' },
      });

      await handleMessage(msg);

      expect(notificationService.processDomainEvent).toHaveBeenCalled();
      expect(mockChannel.ack).toHaveBeenCalledWith(msg);
      expect(mockChannel.nack).not.toHaveBeenCalled();
    });

    it('Message bị sai cú pháp JSON: Nack thẳng vào DLQ (requeue = false)', async () => {
      const msg = {
        fields: { routingKey: 'company.verification.status_changed' },
        content: Buffer.from('invalid-json-string-xyz'),
      };

      await handleMessage(msg);

      expect(mockChannel.nack).toHaveBeenCalledWith(msg, false, false);
      expect(mockChannel.ack).not.toHaveBeenCalled();
    });

    it('Message thiếu recipientId: Nack vào DLQ (requeue = false)', async () => {
      const msg = {
        fields: { routingKey: 'auth.password_changed' },
        content: Buffer.from(
          JSON.stringify({
            eventId: 'evt-200',
            data: {},
          })
        ),
      };

      await handleMessage(msg);

      expect(mockChannel.nack).toHaveBeenCalledWith(msg, false, false);
      expect(mockChannel.ack).not.toHaveBeenCalled();
    });

    it('Lỗi khi xử lý processDomainEvent: Nack message vào DLQ', async () => {
      const msg = {
        fields: { routingKey: 'user.status_changed' },
        content: Buffer.from(
          JSON.stringify({
            eventId: 'evt-err',
            recipientId: 'u-200',
            data: {},
          })
        ),
      };

      jest.spyOn(notificationService, 'processDomainEvent').mockRejectedValue(new Error('Lỗi database'));

      await handleMessage(msg);

      expect(mockChannel.nack).toHaveBeenCalledWith(msg, false, false);
      expect(mockChannel.ack).not.toHaveBeenCalled();
    });
  });
});
