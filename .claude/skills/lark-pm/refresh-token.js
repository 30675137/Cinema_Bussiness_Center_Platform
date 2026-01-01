const { LarkOAuthHelper } = require('./dist/utils/lark-oauth-helper.js');
const fs = require('fs');
const path = require('path');

async function refreshAccessToken() {
  try {
    // 读取当前的 refresh token
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const refreshTokenMatch = envContent.match(/LARK_REFRESH_TOKEN=(.+)/);
    const appIdMatch = envContent.match(/LARK_APP_ID=(.+)/);
    const appSecretMatch = envContent.match(/LARK_APP_SECRET=(.+)/);

    if (!refreshTokenMatch || !appIdMatch || !appSecretMatch) {
      throw new Error('Missing required environment variables');
    }

    const refreshToken = refreshTokenMatch[1].trim();
    const appId = appIdMatch[1].trim();
    const appSecret = appSecretMatch[1].trim();

    console.log('🔄 正在刷新 access token...');
    const helper = new LarkOAuthHelper(appId, appSecret);
    const newAccessToken = await helper.refreshToken(refreshToken);

    // 保存新的 access token
    await helper.saveRefreshedTokenToEnv(newAccessToken);

    console.log('✅ Access token 已刷新并保存到 .env 文件');
    console.log('新的 token:', newAccessToken.substring(0, 30) + '...');
  } catch (error) {
    console.error('❌ 刷新失败:', error.message);
    throw error;
  }
}

refreshAccessToken();
