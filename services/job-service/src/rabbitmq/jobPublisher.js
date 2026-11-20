import { publish } from '#shared/rabbitmq/publisher.js';

export async function publishJobCreated(jobData) {
  try {
    await publish({
      exchange: 'job_exchange',
      routingKey: 'job.created',
      data: jobData,
    });
    console.log(`[RabbitMQ Publisher] Đã publish event job.created cho jobId: ${jobData.jobId}`);

    // Chỉ kích hoạt quét và gửi thông báo tới ứng viên khi tin tuyển dụng ở trạng thái PUBLISHED (không gửi khi là DRAFT)
    if (jobData?.status === 'PUBLISHED') {
      matchAndNotifyCandidates(jobData).catch((err) => {
        console.warn('[Job Matcher] Bỏ qua lỗi ngầm khi match ứng viên:', err.message);
      });
      notifyCompanyFollowers(jobData).catch((err) => {
        console.warn('[Job Publisher] Bỏ qua lỗi thông báo người theo dõi công ty:', err.message);
      });
    } else {
      console.log(`[Job Matcher] Bỏ qua gợi ý ứng viên vì tin ${jobData?.jobId} ở trạng thái: ${jobData?.status}`);
    }
  } catch (error) {
    console.error('[RabbitMQ Publisher] Lỗi publish job.created:', error.message);
  }
}

export async function matchAndNotifyCandidates(jobData) {
  try {
    // Chặn tuyệt đối nếu tin tuyển dụng không ở trạng thái PUBLISHED (ví dụ DRAFT, CLOSED, AUTO_HIDDEN)
    if (!jobData || jobData.status !== 'PUBLISHED') {
      console.log(`[Job Matcher] Tin tuyển dụng ${jobData?.jobId} ở trạng thái "${jobData?.status}", không gửi thông báo gợi ý tới ứng viên.`);
      return;
    }
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

      // Không gửi gợi ý việc làm nếu ứng viên đã nộp đơn vào tin tuyển dụng này
      try {
        const appRes = await fetch(`http://localhost:5005/api/v1/applications/internal/check/${jobData.jobId}/${userId}`);
        if (appRes.ok) {
          const appJson = await appRes.json();
          if (appJson?.data?.hasApplied) {
            console.log(`[Job Matcher] Ứng viên ${userId} đã ứng tuyển vào job ${jobData.jobId}, bỏ qua gợi ý.`);
            continue;
          }
        }
      } catch {
        // Bỏ qua lỗi ngầm nếu application-service tạm thời không phản hồi
      }

      await publish({
        exchange: exchangeName,
        routingKey: 'job.matched',
        data: {
          eventId: `job-match-${jobData.jobId}-${userId}`,
          recipientId: userId,
          jobId: jobData.jobId,
          jobTitle: jobData.title,
          status: jobData.status,
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

export async function notifyCompanyFollowers(jobData) {
  try {
    if (!jobData || jobData.status !== 'PUBLISHED' || !jobData.companyId) {
      return;
    }
    const exchangeName = process.env.RABBITMQ_EXCHANGE || 'job_search_topic_exchange';

    // 1. Lấy thông tin công ty và danh sách người theo dõi từ company-service
    let companyName = '';
    let followerUserIds = [];

    try {
      const [cRes, fRes] = await Promise.all([
        fetch(`http://localhost:5004/api/v1/companies/${jobData.companyId}`),
        fetch(`http://localhost:5004/api/v1/companies/internal/${jobData.companyId}/followers`),
      ]);

      if (cRes.ok) {
        const cJson = await cRes.json();
        companyName = cJson?.data?.companyName || '';
      }

      if (fRes.ok) {
        const fJson = await fRes.json();
        followerUserIds = fJson?.data?.userIds || [];
      }
    } catch (fetchErr) {
      console.warn('[Company Follower Notifier] Không thể kết nối company-service:', fetchErr.message);
      return;
    }

    if (!Array.isArray(followerUserIds) || followerUserIds.length === 0) {
      return;
    }

    // 2. Bắn sự kiện company.job_posted đến từng người theo dõi
    for (const followerId of followerUserIds) {
      if (followerId === jobData.userId) continue;

      await publish({
        exchange: exchangeName,
        routingKey: 'company.job_posted',
        data: {
          eventId: `company-job-${jobData.jobId}-${followerId}`,
          recipientId: followerId,
          jobId: jobData.jobId,
          jobTitle: jobData.title,
          companyId: jobData.companyId,
          companyName,
          title: `Công ty bạn theo dõi vừa đăng việc làm mới`,
          message: `${companyName || 'Công ty bạn đang theo dõi'} vừa đăng tuyển vị trí mới: "${jobData.title}". Xem chi tiết và ứng tuyển ngay!`,
          targetUrl: `/jobs/${jobData.jobId}`,
        },
      });
    }

    console.log(`[Company Follower Notifier] Đã gửi thông báo việc làm mới của "${companyName}" tới ${followerUserIds.length} người theo dõi.`);
  } catch (err) {
    console.warn('[Company Follower Notifier] Lỗi phát thông báo người theo dõi:', err.message);
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

