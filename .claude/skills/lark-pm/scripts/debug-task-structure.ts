/**
 * @spec T004-lark-project-management
 * 调试任务数据结构
 */

import { config as dotenvConfig } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env');
dotenvConfig({ path: envPath });

import { LarkClient } from '../src/lark/client.js';
import { loadConfig } from '../src/config/config-manager.js';

async function debugTaskStructure() {
  const config = await loadConfig();
  const client = new LarkClient();
  const appToken = config.baseAppToken!;
  const tableId = config.tableIds!.tasks;

  const result = await client.searchRecords(
    appToken,
    tableId,
    {
      filter: {
        conjunction: 'and',
        conditions: [
          {
            field_name: '规格ID',
            operator: 'is',
            value: ['O006'],
          },
        ],
      },
      automatic_fields: true,
    }
  );

  if (result.items.length > 0) {
    console.log('第一条记录的数据结构:');
    console.log(JSON.stringify(result.items[0], null, 2));
  }
}

debugTaskStructure();
