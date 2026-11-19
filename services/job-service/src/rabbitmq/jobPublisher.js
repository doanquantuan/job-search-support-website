import { publish } from '#shared/rabbitmq/publisher.js';

export async function publishJobCreated(jobData) {
  try {
    await publish({
      exchange: 'job_exchange',
      routingKey: 'job.created',
      data: jobData,
    });
    console.log(`[RabbitMQ Publisher] Đã publish event job.created cho jobId: ${jobData.jobId}`);

    // Kích hoạt quét và gửi thông báo tới ứng viên phù hợp
    matchAndNotifyCandidates(jobData).catch((err) => {
      console.warn('[Job Matcher] Bỏ qua lỗi ngầm khi match ứng viên:', err.message);
    });
  } catch (error) {
    console.error('[RabbitMQ Publisher] Lỗi publish job.created:', error.message);
  }
}

export async function matchAndNotifyCandidates(jobData) {
  try {
    const exchangeName = process.env.RABBITMQ_EXCHANGE || 'job_search_topic_exchange';
    const skills = Array.isArray(jobData.skills) ? jobData.skills.join(',') : '';

    // Lấy tên công ty từ company-service
    let companyName = '';
    if (jobData.companyId) {
      try {
        const cRes = await fetch(`http://localhost:5004/api/v1/companies/${jobData.companyId}`);
        if (cRes.ok) {
          const cJson = await cRes.json();
          companyName = cJson?.data?.companyName || '';
        }
      } catch {
        // bỏ qua lỗi nếu service không online
      }
    }

    // Gọi user-service để tìm ứng viên phù hợp kỹ năng
    const userSvcUrl = `http://localhost:5002/api/v1/job-seekers/internal/match-candidates${skills ? `?skills=${encodeURIComponent(skills)}` : ''}`;
    const res = await fetch(userSvcUrl);
    if (!res.ok) return;

    const json = await res.json();
    const userIds = json?.data?.userIds || [];

    // Bắn thông báo job.matched cho từng ứng viên phù hợp
    for (const userId of userIds) {
      if (userId === jobData.userId) continue;

      await publish({
        exchange: exchangeName,
        routingKey: 'job.matched',
        data: {
          eventId: `job-match-${jobData.jobId}-${userId}`,
          recipientId: userId,
          jobId: jobData.jobId,
          jobTitle: jobData.title,
          companyName,
          title: 'Gợi ý việc làm phù hợp với bạn',
          message: companyName
            ? `Việc làm mới "${jobData.title}" tại ${companyName} rất phù hợp với kỹ năng của bạn. Xem chi tiết và ứng tuyển ngay!`
            : `Việc làm mới "${jobData.title}" rất phù hợp với kỹ năng của bạn. Xem ngay!`,
        },
      });
    }

    console.log(`[Job Matcher] Đã gửi thông báo việc làm mới cho ${userIds.length} ứng viên phù hợp.`);
  } catch (err) {
    console.warn('[Job Matcher] Lỗi match và thông báo ứng viên:', err.message);
  }
}

export async function publishJobUpdated(jobData) {
  try {
    await publish({
      exchange: 'job_exchange',
      routingKey: 'job.updated',
      data: jobData,
    });
    console.log(`[RabbitMQ Publisher] Đã publish event job.updated cho jobId: ${jobData.jobId}`);
  } catch (error) {
    console.error('[RabbitMQ Publisher] Lỗi publish job.updated:', error.message);
  }
}

export async function publishJobStatusChanged(jobId, status) {
  try {
    await publish({
      exchange: 'job_exchange',
      routingKey: 'job.status_changed',
      data: { jobId, status },
    });
    console.log(`[RabbitMQ Publisher] Đã publish event job.status_changed cho jobId: ${jobId}`);
  } catch (error) {
    console.error('[RabbitMQ Publisher] Lỗi publish job.status_changed:', error.message);
  }
}

export async function publishJobReportAlert(alertData) {
  try {
    const exchangeName = process.env.RABBITMQ_EXCHANGE || 'job_search_topic_exchange';
    await publish({
      exchange: exchangeName,
      routingKey: 'job.report_alert',
      data: alertData,
    });
    console.log(`[RabbitMQ Publisher] Đã publish event job.report_alert cho jobId: ${alertData.jobId}`);
  } catch (error) {
    console.error('[RabbitMQ Publisher] Lỗi publish job.report_alert:', error.message);
  }
}

export async function publishJobAutoHidden(alertData) {
  try {
    const exchangeName = process.env.RABBITMQ_EXCHANGE || 'job_search_topic_exchange';
    await publish({
      exchange: exchangeName,
      routingKey: 'job.auto_hidden',
      data: alertData,
    });
    console.log(`[RabbitMQ Publisher] Đã publish event job.auto_hidden cho jobId: ${alertData.jobId}`);
  } catch (error) {
    console.error('[RabbitMQ Publisher] Lỗi publish job.auto_hidden:', error.message);
  }
}

export default {
  publishJobCreated,
  publishJobUpdated,
  publishJobStatusChanged,
  publishJobReportAlert,
  publishJobAutoHidden,
  matchAndNotifyCandidates,
};

