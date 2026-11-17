import prisma from '../src/config/prisma.js';

const sampleCompanies = [
  {
    companyId: 'd10e0513-4876-43b9-b883-9366df65c821',
    recruiterId: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000001', // Khớp 100% với recruiter@joblink.vn
    companyName: 'FPT Software',
    description: 'FPT Software là công ty thành viên thuộc Tập đoàn FPT, nhà cung cấp dịch vụ công nghệ thông tin và chuyển đổi số hàng đầu tại Việt Nam và khu vực Châu Á - Thái Bình Dương. Với hơn 30.000 kỹ sư công nghệ trên toàn cầu.',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=200&fit=crop',
    website: 'https://fptsoftware.com',
    email: 'recruitment@fpt.com',
    phone: '024 7300 7300',
    taxCode: '0101659783',
    companySize: 'SIZE_1001_5000',
    industry: 'Công nghệ thông tin',
    province: 'Hà Nội',
    address: 'Tòa nhà FPT, Phố Duy Tân, Cầu Giấy, Hà Nội',
    verificationStatus: 'APPROVED',
  },
  {
    companyId: 'b27d8904-7a32-4e4b-97e2-45e69bf00f33',
    recruiterId: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000002', // Khớp với recruiter.vng@joblink.vn
    companyName: 'VNG Corporation',
    description: 'VNG là kỳ lân công nghệ đầu tiên tại Việt Nam, sáng lập năm 2004, phát triển mạnh mẽ trong 4 mảng chính: Trò chơi trực tuyến, Nền tảng kết nối (Zalo), Thanh toán điện tử (ZaloPay) và Điện toán đám mây.',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop',
    website: 'https://vng.com.vn',
    email: 'talent@vng.com.vn',
    phone: '028 3962 3888',
    taxCode: '0303885005',
    companySize: 'SIZE_1001_5000',
    industry: 'Công nghệ thông tin',
    province: 'TP. Hồ Chí Minh',
    address: 'VNG Campus, Đường số 13, KCX Tân Thuận, Quận 7, TP. Hồ Chí Minh',
    verificationStatus: 'APPROVED',
  },
  {
    companyId: 'c3f19472-8804-4c45-b461-71ec50ef9105',
    recruiterId: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000003', // Khớp với recruiter.momo@joblink.vn
    companyName: 'MoMo (M-Service)',
    description: 'MoMo là Siêu ứng dụng thanh toán hàng đầu Việt Nam với hơn 31 triệu người dùng, mang lại trải nghiệm thanh toán không dùng tiền mặt tiện lợi, an toàn và đa dạng tiện ích tài chính.',
    logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=200&h=200&fit=crop',
    website: 'https://momo.vn',
    email: 'hr@momo.vn',
    phone: '1900 545441',
    taxCode: '0304998365',
    companySize: 'SIZE_501_1000',
    industry: 'Fintech & Tài chính',
    province: 'TP. Hồ Chí Minh',
    address: 'Tòa nhà Phú Mỹ Hưng, Hoàng Văn Thái, Tân Phú, Quận 7, TP. Hồ Chí Minh',
    verificationStatus: 'APPROVED',
  },
  {
    companyId: 'a4b2c1d0-1234-4567-89ab-cdef01234567',
    recruiterId: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000004',
    companyName: 'Tập đoàn Viễn thông Viettel',
    description: 'Tập đoàn Công nghiệp - Viễn thông Quân đội Viettel là doanh nghiệp viễn thông và công nghệ số số 1 Việt Nam, dẫn đầu trong đổi mới sáng tạo hạ tầng viễn thông 5G, giải pháp số doanh nghiệp và an toàn thông tin.',
    logo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&h=200&fit=crop',
    website: 'https://viettel.vn',
    email: 'tuyendung@viettel.com.vn',
    phone: '024 6255 6789',
    taxCode: '0100109106',
    companySize: 'SIZE_1001_5000',
    industry: 'Viễn thông & Dịch vụ số',
    province: 'Hà Nội',
    address: 'Số 1 Trần Hữu Dực, Mỹ Đình 2, Nam Từ Liêm, Hà Nội',
    verificationStatus: 'APPROVED',
  },
  {
    companyId: 'e5f6a7b8-9876-4321-ba98-fedcba098765',
    recruiterId: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000005',
    companyName: 'Shopee Việt Nam',
    description: 'Shopee là sàn giao dịch thương mại điện tử hàng đầu tại Đông Nam Á và Đài Loan. Môi trường làm việc quốc tế, năng động, chuyên nghiệp và nhiều cơ hội thăng tiến cho nhân sự trẻ.',
    logo: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=200&h=200&fit=crop',
    website: 'https://careers.shopee.vn',
    email: 'careers@shopee.vn',
    phone: '028 7307 1229',
    taxCode: '0313339940',
    companySize: 'SIZE_1001_5000',
    industry: 'Thương mại điện tử',
    province: 'TP. Hồ Chí Minh',
    address: 'Tầng 17, Tòa nhà Saigon Centre Tower 2, 67 Lê Lợi, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    verificationStatus: 'APPROVED',
  },
  {
    companyId: 'f6e5d4c3-5678-4321-bcde-123456789abc',
    recruiterId: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000006',
    companyName: 'VinAI Research',
    description: 'VinAI là viện nghiên cứu trí tuệ nhân tạo hàng đầu khu vực, tập hợp đội ngũ chuyên gia, nhà khoa học xuất sắc nhằm phát triển các giải pháp AI đột phá về xe tự hành, thị giác máy tính và xử lý ngôn ngữ tự nhiên.',
    logo: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=200&h=200&fit=crop',
    website: 'https://vinai.io',
    email: 'job@vinai.io',
    phone: '024 3974 9999',
    taxCode: '0108920192',
    companySize: 'SIZE_201_500',
    industry: 'Trí tuệ nhân tạo (AI)',
    province: 'Hà Nội',
    address: 'Tòa nhà Symphony, Chu Huy Mân, Phúc Lợi, Long Biên, Hà Nội',
    verificationStatus: 'APPROVED',
  },

  // ── Doanh nghiệp Chờ duyệt GPKD (PENDING) để Admin thẩm định ──────────────
  {
    companyId: 'd5e6f7a8-1111-2222-3333-444444444444',
    recruiterId: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000005', // Khớp pending.ai@joblink.vn
    companyName: 'Công ty TNHH Giải pháp Đổi mới AI',
    description: 'Doanh nghiệp khởi nghiệp chuyên cung cấp giải pháp Generative AI và xử lý dữ liệu thông minh cho doanh nghiệp vừa và nhỏ.',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=200&fit=crop',
    website: 'https://aisolutions.example.vn',
    email: 'contact@aisolutions.example.vn',
    phone: '0901 234 567',
    taxCode: '0109988776',
    companySize: 'SIZE_1_50',
    industry: 'Công nghệ thông tin',
    province: 'Hà Nội',
    address: 'Tầng 5, Tòa nhà Detech, Số 8 Tôn Thất Thuyết, Cầu Giấy, Hà Nội',
    verificationStatus: 'PENDING',
    licenseUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    companyId: 'd5e6f7a8-5555-6666-7777-888888888888',
    recruiterId: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000005',
    companyName: 'Công ty Cổ phần Thương mại Số NextGen',
    description: 'Nền tảng bán buôn trực tuyến B2B kết nối chuỗi cung ứng nông sản và sản phẩm tiêu dùng nhanh.',
    logo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=200&fit=crop',
    website: 'https://nextgen.example.vn',
    email: 'contact@nextgen.example.vn',
    phone: '0933 888 999',
    taxCode: '0316655443',
    companySize: 'SIZE_51_200',
    industry: 'Thương mại điện tử',
    province: 'TP. Hồ Chí Minh',
    address: 'Số 45 Lê Duẩn, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    verificationStatus: 'PENDING',
    licenseUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },

  // ── Doanh nghiệp Bị từ chối GPKD (REJECTED) ────────────────────────────────
  {
    companyId: 'd5e6f7a8-9999-0000-aaaa-bbbbbbbbbbbb',
    recruiterId: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000007', // Khớp blocked.recruiter@joblink.vn
    companyName: 'Công ty Tài chính Toàn Cầu (Fintech Global)',
    description: 'Dịch vụ tư vấn đầu tư tài chính và cho vay tín chấp.',
    logo: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=200&h=200&fit=crop',
    website: 'https://fintechglobal.example.vn',
    email: 'info@fintechglobal.example.vn',
    phone: '0912 345 678',
    taxCode: '0318889991',
    companySize: 'SIZE_1_50',
    industry: 'Tài chính & Bảo hiểm',
    province: 'TP. Hồ Chí Minh',
    address: 'Số 100 Nguyễn Thị Minh Khai, Quận 3, TP. Hồ Chí Minh',
    verificationStatus: 'REJECTED',
    rejectionReason: 'Giấy phép kinh doanh bị mờ, không trùng khớp với mã số thuế trên cổng thông tin quốc gia.',
  },
];

async function seed() {
  console.log('--- Đang bắt đầu seed dữ liệu Company Service ---');
  for (const item of sampleCompanies) {
    const { licenseUrl, rejectionReason, ...compData } = item;
    const company = await prisma.company.upsert({
      where: { taxCode: compData.taxCode },
      update: compData,
      create: compData,
    });
    console.log(`✓ [${compData.verificationStatus}] Đã seed công ty: ${compData.companyName}`);

    if (licenseUrl) {
      await prisma.companyDocument.deleteMany({
        where: { companyId: company.companyId },
      });
      await prisma.companyDocument.create({
        data: {
          companyId: company.companyId,
          fileName: 'Giay_phep_kinh_doanh.pdf',
          fileUrl: licenseUrl,
          fileType: 'application/pdf',
          fileSize: 1048576,
          documentType: 'BUSINESS_LICENSE',
        },
      });
    }

    if (compData.verificationStatus === 'REJECTED' && rejectionReason) {
      await prisma.companyVerification.deleteMany({
        where: { companyId: company.companyId },
      });
      await prisma.companyVerification.create({
        data: {
          companyId: company.companyId,
          status: 'REJECTED',
          rejectionReason,
          adminNote: 'Từ chối bởi Quản trị viên hệ thống do hồ sơ không hợp lệ',
        },
      });
    }
  }
  console.log('--- Hoàn tất seed dữ liệu Company Service thành công! ---');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Lỗi khi seed dữ liệu Company Service:', err);
  process.exit(1);
});
