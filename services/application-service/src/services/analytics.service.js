import prisma from '../config/prisma.js';

class AnalyticsService {
  /**
   * Tính toán phân tích & thống kê tuyển dụng cho Recruiter
   */
  async getRecruiterAnalytics(recruiterId, { timeRange = '7d', jobId = null, isAdmin = false } = {}) {
    let jobWhere = {};
    if (!isAdmin) {
      let companyId = null;
      const localJob = await prisma.jobPost.findFirst({
        where: { recruiterId, companyId: { not: null } },
        select: { companyId: true },
      });
      if (localJob?.companyId) {
        companyId = localJob.companyId;
      } else {
        try {
          const cRes = await fetch(`http://localhost:5004/api/v1/companies/internal/by-recruiter/${recruiterId}`);
          if (cRes.ok) {
            const cJson = await cRes.json();
            companyId = cJson.data?.companyId || null;
          }
        } catch (_e) {}
      }

      // Lấy danh sách tin tuyển dụng thuộc về Recruiter / Công ty
      jobWhere = companyId
        ? { OR: [{ companyId }, { recruiterId }] }
        : { recruiterId };
    }

    if (jobId && jobId !== 'all') {
      jobWhere.jobId = jobId;
    }

    const recruiterJobs = await prisma.jobPost.findMany({
      where: jobWhere,
      select: {
        jobId: true,
        title: true,
        status: true,
        createdAt: true,
      },
    });

    const jobIds = recruiterJobs.map((j) => j.jobId);

    // Chuẩn bị các mốc thời gian
    const now = new Date();
    let startDate = new Date();
    let prevStartDate = new Date();
    let prevEndDate = new Date();
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
        buckets.push({ label, start: startBucket, end: endBucket, apps: 0, views: 0 });
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
        buckets.push({ label: `Tuần ${i + 1}`, start: startBucket, end: endBucket, apps: 0, views: 0 });
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
        buckets.push({ label: `Tháng ${monthNum}`, start: startBucket, end: endBucket, apps: 0, views: 0 });
      }
    } else {
      // year
      startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
      prevStartDate = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0);
      prevEndDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);

      for (let q = 1; q <= 4; q++) {
        const startBucket = new Date(now.getFullYear(), (q - 1) * 3, 1, 0, 0, 0);
        const endBucket = new Date(now.getFullYear(), q * 3, 0, 23, 59, 59);
        buckets.push({ label: `Quý ${q}`, start: startBucket, end: endBucket, apps: 0, views: 0 });
      }
    }

    // 2. Nếu Recruiter chưa có tin đăng nào -> Trả về cấu trúc mặc định rỗng an toàn
    if (!jobIds.length) {
      return {
        timeRange,
        kpis: {
          views: 0,
          viewsGrowth: '+0%',
          applications: 0,
          applicationsGrowth: '+0%',
          conversionRate: '0.0%',
          conversionGrowth: '+0.0%',
          hired: 0,
          hiredGrowth: '+0',
        },
        chart: buckets.map((b) => ({ label: b.label, views: 0, apps: 0 })),
        funnel: [
          { stage: 'APPLIED', label: '1. Hồ sơ mới nộp (Applied)', count: 0, pct: 0, color: 'bg-sky-500' },
          { stage: 'VIEWED', label: '2. Đã xem xét / Thẩm định (Viewed)', count: 0, pct: 0, color: 'bg-indigo-500' },
          { stage: 'REVIEWING', label: '3. Đang đánh giá chuyên môn (Reviewing)', count: 0, pct: 0, color: 'bg-purple-500' },
          { stage: 'INTERVIEW', label: '4. Mời phỏng vấn (Interview)', count: 0, pct: 0, color: 'bg-amber-500' },
          { stage: 'HIRED', label: '5. Trúng tuyển chính thức (Hired)', count: 0, pct: 0, color: 'bg-emerald-500' },
        ],
        insight: 'Chưa có dữ liệu tuyển dụng trong khoảng thời gian này. Hãy đăng tin tuyển dụng mới để bắt đầu theo dõi hiệu quả.',
        jobPerformances: [],
      };
    }

    // 3. Gọi internal API sang job-service để lấy dữ liệu Lượt xem (views)
    let viewsData = {
      totalCurrentViews: 0,
      totalPrevViews: 0,
      viewsGrowth: '+0%',
      chartViews: [],
      viewsPerJob: {},
    };

    try {
      const jobViewsUrl = `http://localhost:5003/api/v1/job-views/recruiter/analytics?userId=${recruiterId}&timeRange=${timeRange}`;
      const res = await fetch(jobViewsUrl);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          viewsData = json.data;
        }
      }
    } catch (err) {
      console.warn('[AnalyticsService] Không thể kết nối tới job-service lấy views, fallback 0:', err.message);
    }

    // 4. Truy vấn dữ liệu đơn ứng tuyển (applications) từ DB application-service
    const appWhere = { jobId: { in: jobIds } };

    const [
      currentAppsCount,
      prevAppsCount,
      currentPeriodApps,
      allAppsInJobs,
      appsGroupedByJob,
    ] = await Promise.all([
      // Tổng đơn trong kỳ hiện tại
      prisma.application.count({
        where: {
          ...appWhere,
          appliedAt: { gte: startDate, lte: now },
        },
      }),
      // Tổng đơn trong kỳ trước
      prisma.application.count({
        where: {
          ...appWhere,
          appliedAt: { gte: prevStartDate, lte: prevEndDate },
        },
      }),
      // Chi tiết đơn nộp trong kỳ hiện tại (để gom vào chart)
      prisma.application.findMany({
        where: {
          ...appWhere,
          appliedAt: { gte: startDate, lte: now },
        },
        select: { applicationId: true, appliedAt: true, jobId: true },
      }),
      // Toàn bộ đơn của các tin tuyển dụng (kèm lịch sử để tính phễu ATS)
      prisma.application.findMany({
        where: appWhere,
        select: {
          applicationId: true,
          applicationStatus: true,
          appliedAt: true,
          statusHistories: {
            select: { applicationStatus: true },
          },
        },
      }),
      // Đếm số đơn theo từng jobId
      prisma.application.groupBy({
        by: ['jobId'],
        where: appWhere,
        _count: { applicationId: true },
      }),
    ]);

    // Gom đơn nộp vào từng bucket biểu đồ
    for (const app of currentPeriodApps) {
      const aTime = new Date(app.appliedAt).getTime();
      const b = buckets.find((bucket) => aTime >= bucket.start.getTime() && aTime <= bucket.end.getTime());
      if (b) {
        b.apps += 1;
      }
    }

    // Đồng bộ views từ job-service vào buckets
    if (Array.isArray(viewsData.chartViews)) {
      viewsData.chartViews.forEach((cv, idx) => {
        if (buckets[idx]) {
          buckets[idx].views = cv.views || 0;
        }
      });
    }

    // 5. Tính toán KPI Tăng trưởng
    const currentViews = viewsData.totalCurrentViews || 0;
    const prevViews = viewsData.totalPrevViews || 0;
    const viewsGrowth = viewsData.viewsGrowth || '+0%';

    const appsGrowthVal = prevAppsCount > 0
      ? ((currentAppsCount - prevAppsCount) / prevAppsCount) * 100
      : (currentAppsCount > 0 ? 100 : 0);
    const applicationsGrowth = `${appsGrowthVal >= 0 ? '+' : ''}${Math.round(appsGrowthVal)}%`;

    const convRateNum = currentViews > 0 ? (currentAppsCount / currentViews) * 100 : 0;
    const prevConvRateNum = prevViews > 0 ? (prevAppsCount / prevViews) * 100 : 0;
    const conversionRate = `${convRateNum.toFixed(1)}%`;
    const convGrowthNum = convRateNum - prevConvRateNum;
    const conversionGrowth = `${convGrowthNum >= 0 ? '+' : ''}${convGrowthNum.toFixed(1)}%`;

    // 6. Tính toán Phễu Tuyển dụng ATS (Theo Lựa Chọn 1 - Chuẩn hóa theo Schema hiện có)
    const totalAppsAll = allAppsInJobs.length;
    let viewedCount = 0;
    let reviewingCount = 0;
    let interviewCount = 0;
    let hiredCount = 0;

    for (const app of allAppsInJobs) {
      const status = app.applicationStatus;
      const historyStatuses = (app.statusHistories || []).map((h) => h.applicationStatus);
      const allReached = new Set([status, ...historyStatuses]);

      if (allReached.has('VIEWED') || allReached.has('REVIEWING') || allReached.has('INTERVIEW') || allReached.has('HIRED')) {
        viewedCount++;
      }
      if (allReached.has('REVIEWING') || allReached.has('INTERVIEW') || allReached.has('HIRED')) {
        reviewingCount++;
      }
      if (allReached.has('INTERVIEW') || allReached.has('HIRED')) {
        interviewCount++;
      }
      if (status === 'HIRED') {
        hiredCount++;
      }
    }

    const calcPct = (count) => (totalAppsAll > 0 ? Math.round((count / totalAppsAll) * 100) : 0);

    const funnel = [
      { stage: 'APPLIED', label: '1. Hồ sơ mới nộp (Applied)', count: totalAppsAll, pct: totalAppsAll > 0 ? 100 : 0, color: 'bg-sky-500' },
      { stage: 'VIEWED', label: '2. Đã xem xét / Thẩm định (Viewed)', count: viewedCount, pct: calcPct(viewedCount), color: 'bg-indigo-500' },
      { stage: 'REVIEWING', label: '3. Đang đánh giá chuyên môn (Reviewing)', count: reviewingCount, pct: calcPct(reviewingCount), color: 'bg-purple-500' },
      { stage: 'INTERVIEW', label: '4. Mời phỏng vấn (Interview)', count: interviewCount, pct: calcPct(interviewCount), color: 'bg-amber-500' },
      { stage: 'HIRED', label: '5. Trúng tuyển chính thức (Hired)', count: hiredCount, pct: calcPct(hiredCount), color: 'bg-emerald-500' },
    ];

    // Đếm số tuyển được trong kỳ hiện tại so với kỳ trước để ra thẻ KPI số 4
    const currentHiredInPeriod = allAppsInJobs.filter(
      (a) => a.applicationStatus === 'HIRED' && new Date(a.appliedAt) >= startDate && new Date(a.appliedAt) <= now
    ).length;
    const prevHiredInPeriod = allAppsInJobs.filter(
      (a) => a.applicationStatus === 'HIRED' && new Date(a.appliedAt) >= prevStartDate && new Date(a.appliedAt) <= prevEndDate
    ).length;
    const hiredDiff = currentHiredInPeriod - prevHiredInPeriod;
    const hiredGrowth = `${hiredDiff >= 0 ? '+' : ''}${hiredDiff} nhân sự thành công`;

    // 7. Tạo câu nhận xét (insight) tự động
    const interviewPct = calcPct(interviewCount);
    let insight = `Hiệu suất chuyển đổi hồ sơ sang phỏng vấn của doanh nghiệp bạn đạt mức ${interviewPct}%, vận hành ổn định.`;
    if (interviewPct >= 30) {
      insight = `Hiệu suất chuyển đổi phỏng vấn của doanh nghiệp bạn đạt mức ${interviewPct}%, cao hơn so với mặt bằng chung thị trường tuyển dụng.`;
    } else if (interviewPct < 15 && totalAppsAll > 0) {
      insight = `Tỷ lệ vào vòng phỏng vấn hiện ở mức ${interviewPct}%. Hãy xem xét tối ưu yêu cầu tuyển dụng để thu hút thêm ứng viên phù hợp.`;
    }

    // 8. Bảng hiệu quả chi tiết theo từng tin tuyển dụng
    const appsPerJobMap = {};
    for (const g of appsGroupedByJob) {
      appsPerJobMap[g.jobId] = g._count.applicationId;
    }

    const jobPerformances = recruiterJobs.map((job) => {
      const views = viewsData.viewsPerJob?.[job.jobId] || 0;
      const apps = appsPerJobMap[job.jobId] || 0;
      const convRate = views > 0 ? parseFloat(((apps / views) * 100).toFixed(1)) : 0.0;
      const rating = convRate >= 8.0 ? 'Rất tốt' : convRate >= 4.0 ? 'Đạt yêu cầu' : 'Cần tối ưu';

      return {
        id: job.jobId,
        title: job.title,
        industry: 'Công nghệ thông tin',
        status: job.status,
        views,
        apps,
        convRate,
        rating,
      };
    });

    return {
      timeRange,
      kpis: {
        views: currentViews,
        viewsGrowth,
        applications: currentAppsCount,
        applicationsGrowth,
        conversionRate,
        conversionGrowth,
        hired: currentHiredInPeriod,
        hiredGrowth,
      },
      chart: buckets.map((b) => ({ label: b.label, views: b.views, apps: b.apps })),
      funnel,
      insight,
      jobPerformances,
    };
  }
}

export default new AnalyticsService();
