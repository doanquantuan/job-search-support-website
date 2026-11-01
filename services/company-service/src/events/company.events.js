import EventEmitter from 'node:events';

class CompanyEventEmitter extends EventEmitter { }

const companyEvents = new CompanyEventEmitter();

companyEvents.on('verification.submitted', (payload) => {
  console.log(`[Event: verification.submitted] Doanh nghiệp '${payload.companyName}' (MST: ${payload.taxCode}) đã nộp hồ sơ xác thực bởi Recruiter ${payload.recruiterId}`);
});

export default companyEvents;
export { companyEvents };
