/**
 * @spec O005-channel-product-config
 * @spec O008-channel-product-category-migration
 * MSW Mock Handlers for Channel Product APIs
 *
 * Note: Channel product CRUD operations use real backend APIs.
 * Only image upload is mocked here.
 */

import { http, HttpResponse } from 'msw';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const channelProductHandlers = [
  // 上传渠道商品图片（模拟）
  http.post('/api/channel-products/upload-image', async ({ request }) => {
    await delay(800); // 模拟上传延迟

    try {
      const formData = await request.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return HttpResponse.json({ success: false, message: '未找到上传文件' }, { status: 400 });
      }

      // 模拟生成 Supabase Storage 公开 URL
      const mockPublicUrl = `https://mock-supabase.co/storage/v1/object/public/product-images/channel-products/${Date.now()}_${file.name}`;

      return HttpResponse.json({
        success: true,
        data: mockPublicUrl,
        message: '图片上传成功',
      });
    } catch (error) {
      return HttpResponse.json({ success: false, message: '图片上传失败' }, { status: 500 });
    }
  }),
];
