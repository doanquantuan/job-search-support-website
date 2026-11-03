import { randomUUID } from 'node:crypto';
import prisma from '../src/config/prisma.js';

const sampleCompanies = [
  {
    companyId: 'd10e0513-4876-43b9-b883-9366df65c821',
    recruiterId: randomUUID(),
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
    recruiterId: randomUUID(),
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
    recruiterId: randomUUID(),
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
    recruiterId: randomUUID(),
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
    recruiterId: randomUUID(),
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
    recruiterId: randomUUID(),
    companyName: 'VinAI',
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
];

async function seed() {
  console.log('--- Đang bắt đầu seed dữ liệu Company Service ---');
  for (const comp of sampleCompanies) {
    await prisma.company.upsert({
      where: { taxCode: comp.taxCode },
      update: comp,
      create: comp,
    });
    console.log(`✓ Đã seed công ty: ${comp.companyName}`);
  }
  console.log('--- Hoàn tất seed dữ liệu thành công! ---');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Lỗi khi seed dữ liệu:', err);
  process.exit(1);
});

