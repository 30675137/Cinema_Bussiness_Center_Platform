/**
 * E2E测试环境设置
 */

// 设置环境变量
process.env.API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://fxhgyxceqrmnpezluaht.supabase.co';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4aGd5eGNlcXJtbnBlemx1YWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3MjU3OTAsImV4cCI6MjA1MDMwMTc5MH0.X5oJxVHQY2nHfEb9qCkZVW9ZdGMJRJYMYr7Pd6ujDWs';

// 全局测试钩子
beforeAll(() => {
  console.log('🚀 Starting E2E tests...');
  console.log(`   API: ${process.env.API_BASE_URL}`);
  console.log(`   Supabase: ${process.env.SUPABASE_URL}`);
});

afterAll(() => {
  console.log('✅ E2E tests completed');
});
