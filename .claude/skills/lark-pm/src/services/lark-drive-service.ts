/**
 * @spec T004-lark-project-management
 * 飞书云盘服务 - 文件上传到云盘
 *
 * 使用 /drive/v1/files/upload_all API 上传文件到飞书云盘
 */

import fs from 'fs/promises'
import FormData from 'form-data'
import axios from 'axios'
import logger from '../utils/logger.js'
import { LarkApiClient } from './lark-api-client.js'

export interface UploadFileRequest {
  filePath: string
  fileName?: string
  parentFolderToken?: string
}

export interface UploadFileResult {
  fileToken: string
  fileName: string
  fileUrl: string
}

/**
 * 飞书云盘服务
 */
export class LarkDriveService {
  private client: LarkApiClient

  constructor() {
    this.client = new LarkApiClient()
  }

  /**
   * 上传文件到飞书云盘
   *
   * @param request 上传请求参数
   * @returns 上传结果（包含 file_token 和文件链接）
   */
  async uploadFile(request: UploadFileRequest): Promise<UploadFileResult> {
    try {
      const fileContent = await fs.readFile(request.filePath)
      const fileSize = fileContent.length
      const fileName = request.fileName || request.filePath.split('/').pop() || 'file'

      logger.info({ fileName, fileSize }, 'Uploading file to Feishu Drive')

      // 如果没有提供父文件夹 token，使用默认文件夹或根文件夹
      let parentNode = request.parentFolderToken
      if (!parentNode) {
        // 优先使用环境变量配置的默认文件夹
        const defaultFolder = process.env.LARK_DEFAULT_DRIVE_FOLDER
        if (defaultFolder) {
          logger.info({ defaultFolder }, 'Using default drive folder from env')
          parentNode = defaultFolder
        } else {
          logger.info('No default folder configured, getting root folder token')
          parentNode = await this.getRootFolderToken()
          logger.info({ parentNode }, 'Got root folder token')
        }
      }

      // 准备 multipart/form-data
      const form = new FormData()
      form.append('file_name', fileName)
      form.append('parent_type', 'explorer')
      form.append('parent_node', parentNode)
      form.append('size', fileSize.toString())
      form.append('file', fileContent, fileName)

      // 调用上传 API
      const response = await this.uploadMultipart('/drive/v1/files/upload_all', form)

      if (!response.data?.file_token) {
        logger.error({ response }, 'Upload failed: no file_token returned')
        throw new Error('Upload failed: no file_token returned')
      }

      const fileToken = response.data.file_token
      const fileUrl = `https://feishu.cn/file/${fileToken}`

      logger.info({ fileToken, fileName }, 'File uploaded successfully')

      return {
        fileToken,
        fileName,
        fileUrl
      }
    } catch (error) {
      logger.error({ error }, 'Failed to upload file to Feishu Drive')
      throw error
    }
  }

  /**
   * 获取用户的根文件夹 Token（我的空间）
   */
  private async getRootFolderToken(): Promise<string> {
    try {
      // 调用获取根文件夹 API
      const response = await this.client.get('/drive/explorer/v2/root_folder/meta')

      if (!response.data?.token) {
        logger.error({ response }, 'Failed to get root folder token')
        throw new Error('Failed to get root folder token')
      }

      return response.data.token
    } catch (error) {
      logger.error({ error }, 'Error getting root folder token')
      throw new Error('无法获取根文件夹 Token，请手动指定 --folder 参数')
    }
  }

  /**
   * 使用 FormData 上传文件（使用 user_access_token）
   */
  private async uploadMultipart(path: string, form: FormData): Promise<any> {
    // 使用 user token 进行文件上传
    const token = await this.client['tokenManager'].getToken()
    const url = `https://open.feishu.cn/open-apis${path}`

    const headers = {
      'Authorization': `Bearer ${token}`,
      ...form.getHeaders()
    }

    logger.info({ url, headers }, 'Uploading file with multipart using axios')

    try {
      const response = await axios.post(url, form, {
        headers,
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      })

      const result = response.data

      if (result.code !== 0) {
        logger.error({ code: result.code, msg: result.msg }, 'Upload API returned error')
        throw new Error(`Upload API error: ${result.code} - ${result.msg}`)
      }

      logger.info({ code: result.code, msg: result.msg }, 'Upload successful')

      return result
    } catch (error: any) {
      if (error.response) {
        logger.error({
          status: error.response.status,
          data: error.response.data
        }, 'Axios upload failed')
        throw new Error(`Upload failed: ${error.response.status} ${JSON.stringify(error.response.data)}`)
      }
      throw error
    }
  }
}
