import jobViewHistoryRepository from '../repositories/jobViewHistory.repository.js';
import jobPostRepository from '../repositories/jobPost.repository.js';
import prisma from '../config/prisma.js';
import companyMessageBroker from '../rabbitmq/companyConsumer.js';
import { NotFoundError } from '#shared/utils/errors.util.js';

class JobViewHistoryService {
  async recordView(userId, jobId) {
    const job = await jobPostRepository.findById(jobId);
    if (!job) {
      throw new NotFoundError('Tin tuyển dụng không tồn tại');
    }

    return await jobViewHistoryRepository.upsert(userId, jobId);
  }

  async getViewHistory(userId, queryParams = {}) {
    const { page = 1, limit = 10 } = queryParams;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * take;

    const { total, items } = await jobViewHistoryRepository.findByUserId(userId, {
      skip,
      take,
      orderBy: { viewedAt: 'desc' },
    });

    return {
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take) || 1,
      },
      data: items,
    };
  }

  async getViewCountByJob(jobId) {
    const count = await jobViewHistoryRepository.countViewsByJobId(jobId);
    return { jobId, viewsCount: count };
  }

  async removeViewHistory(userId, jobId) {
    try {
      return await jobViewHistoryRepository.delete(userId, jobId);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Không tìm thấy lịch sử xem tin này');
      }
      throw error;
    }
  }

  async clearViewHistory(userId) {
    return await jobViewHistoryRepository.clearByUserId(userId);
  }

  async getRecruiterViewsAnalytics(userId, { timeRange = '7d' } = {}) {
    if (!userId) {
      return {
        totalCurrentViews: 0,
        totalPrevViews: 0,
        viewsGrowth: '+0%',
        chartViews: [],
        viewsPerJob: {},
      };
    }

    let companyId = null;
    try {
      companyId = await companyMessageBroker.getCompanyIdByUserId(userId);
    } catch (err) {
      console.warn('[JobViewHistoryService] Broker error:', err.message);
    }

    if (!companyId) {
      try {
        const cRes = await fetch(`http://localhost:5004/api/v1/companies/internal/by-recruiter/${userId}`);
        if (cRes.ok) {
          const cJson = await cRes.json();
          companyId = cJson.data?.companyId || null;
        }
      } catch (httpErr) {
        console.warn('[JobViewHistoryService] HTTP error:', httpErr.message);
      }
    }

    const where = companyId ? { OR: [{ companyId }, { userId }] } : { userId };
    const jobs = await prisma.jobPost.findMany({
      where,
      select: { jobId: true },
    });

    const jobIds = jobs.map((j) => j.jobId);
    if (!jobIds.length) {
      return {
        totalCurrentViews: 0,
        totalPrevViews: 0,
        viewsGrowth: '+0%',
        chartViews: [],
        viewsPerJob: {},
      };
    }

    const now = new Date();
    let startDate = new Date();
    let prevStartDate;
    let prevEndDate;
    let buckets = [];

    if (timeRange === '7d') {
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);

      prevEndDate = new Date(startDate.getTime() - 1);
      prevStartDate = new Date(startDate);
      prevStartDate.setDate(startDate.getDate() - 7);

      for (let i = 0; i < 7; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        const dayOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()];
        const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = `${dayOfWeek} (${dateStr})`;
        const startBucket = new Date(d);
        startBucket.setHours(0, 0, 0, 0);
        const endBucket = new Date(d);
        endBucket.setHours(23, 59, 59, 999);
        buckets.push({ label, start: startBucket, end: endBucket, views: 0 });
      }
    } else if (timeRange === '30d') {
      startDate.setDate(now.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);

      prevEndDate = new Date(startDate.getTime() - 1);
      prevStartDate = new Date(startDate);
      prevStartDate.setDate(startDate.getDate() - 30);

      const daysPerWeek = [7, 7, 7, 9];
      let currentWeekStart = new Date(startDate);
      for (let i = 0; i < 4; i++) {
        const startBucket = new Date(currentWeekStart);
        const endBucket = new Date(currentWeekStart);
        endBucket.setDate(endBucket.getDate() + daysPerWeek[i] - 1);
        endBucket.setHours(23, 59, 59, 999);
        buckets.push({ label: `Tuần ${i + 1}`, start: startBucket, end: endBucket, views: 0 });
        currentWeekStart.setDate(currentWeekStart.getDate() + daysPerWeek[i]);
      }
    } else if (timeRange === 'quarter') {
      startDate.setDate(now.getDate() - 89);
      startDate.setHours(0, 0, 0, 0);

      prevEndDate = new Date(startDate.getTime() - 1);
      prevStartDate = new Date(startDate);
      prevStartDate.setDate(startDate.getDate() - 90);

      for (let i = 0; i < 3; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i * 30);
        const startBucket = new Date(d);
        startBucket.setHours(0, 0, 0, 0);
        const endBucket = new Date(d);
        endBucket.setDate(endBucket.getDate() + 29);
        endBucket.setHours(23, 59, 59, 999);
        const monthNum = d.getMonth() + 1;
        buckets.push({ label: `Tháng ${monthNum}`, start: startBucket, end: endBucket, views: 0 });
      }
    } else {
      startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0);

      prevStartDate = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0);
      prevEndDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);

      for (let q = 1; q <= 4; q++) {
        const startBucket = new Date(now.getFullYear(), (q - 1) * 3, 1, 0, 0, 0);
        const endBucket = new Date(now.getFullYear(), q * 3, 0, 23, 59, 59);
        buckets.push({ label: `Quý ${q}`, start: startBucket, end: endBucket, views: 0 });
      }
    }

    const [currentViews, prevViews, viewRecords, viewsGrouped] = await Promise.all([
      prisma.jobViewHistory.count({
        where: {
          jobId: { in: jobIds },
          viewedAt: { gte: startDate, lte: now },
        },
      }),
      prisma.jobViewHistory.count({
        where: {
          jobId: { in: jobIds },
          viewedAt: { gte: prevStartDate, lte: prevEndDate },
        },
      }),
      prisma.jobViewHistory.findMany({
        where: {
          jobId: { in: jobIds },
          viewedAt: { gte: startDate, lte: now },
        },
        select: { viewedAt: true, jobId: true },
      }),
      prisma.jobViewHistory.groupBy({
        by: ['jobId'],
        where: { jobId: { in: jobIds } },
        _count: { userId: true },
      }),
    ]);

    for (const record of viewRecords) {
      const vTime = new Date(record.viewedAt).getTime();
      const b = buckets.find((bucket) => vTime >= bucket.start.getTime() && vTime <= bucket.end.getTime());
      if (b) {
        b.views += 1;
      }
    }

    const viewsPerJob = {};
    for (const g of viewsGrouped) {
      viewsPerJob[g.jobId] = g._count.userId;
    }

    const growthVal = prevViews > 0
      ? ((currentViews - prevViews) / prevViews) * 100
      : (currentViews > 0 ? 100 : 0);
    const viewsGrowth = `${growthVal >= 0 ? '+' : ''}${Math.round(growthVal)}%`;

    return {
      totalCurrentViews: currentViews,
      totalPrevViews: prevViews,
      viewsGrowth,
      chartViews: buckets.map((b) => ({ label: b.label, views: b.views })),
      viewsPerJob,
    };
  }
}

export default new JobViewHistoryService();

