const { AppController } = require('../apps/ceo1983_app_be/dist/app.controller');
// We can test the method directly with a mock PrismaService
const mockPrisma = {
  $queryRawUnsafe: async (sql, ...params) => {
    return [];
  }
};
const mockAppService = { getHello: () => 'Hello' };

async function test() {
  const ctrl = new AppController(mockAppService, mockPrisma);
  const html = await ctrl.getSharePreview(
    'opportunity',
    'test-123',
    '[Cơ Hội Giao Thương B2B] Cung cấp 500 tấn nông sản hữu cơ',
    'Cần tìm đối tác phân phối nông sản đạt chuẩn VietGAP tại Hà Nội',
    'https://ceo1983.viconnect.vn/test-image.jpg',
    'https://ceo1983.viconnect.vn/association/opportunities?id=test-123'
  );

  console.log('--- TEST SHARE PREVIEW HTML OUTPUT ---');
  console.log('Includes og:title:', html.includes('og:title'));
  console.log('Includes og:description:', html.includes('og:description'));
  console.log('Includes og:image:', html.includes('og:image'));
  console.log('Includes redirect script:', html.includes('window.location.replace'));
  console.log('\nSample HTML head:\n', html.slice(0, 700));
}

test().catch(e => console.log('Error (maybe dist not built yet, that is fine):', e.message));

