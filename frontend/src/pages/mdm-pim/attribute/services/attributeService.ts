/**
 * Attribute Dictionary Service
 *
 * Class-based service for making API calls to:
 * - Dictionary Types
 * - Dictionary Items
 * - Attribute Templates
 * - Attributes
 *
 * Following the same pattern as brandService.ts
 */

import type {
  DictionaryType,
  DictionaryItem,
  AttributeTemplate,
  Attribute,
  CreateDictionaryTypeRequest,
  UpdateDictionaryTypeRequest,
  CreateDictionaryItemRequest,
  UpdateDictionaryItemRequest,
  CreateAttributeTemplateRequest,
  UpdateAttributeTemplateRequest,
  CreateAttributeRequest,
  UpdateAttributeRequest,
  BatchUpdateSortRequest,
  ListResponse,
  ApiResponse,
  DictionaryTypeQueryParams,
  DictionaryItemQueryParams,
  AttributeTemplateQueryParams,
} from '@/features/attribute-dictionary/types';

// ============================================================================
// API Response Types
// ============================================================================

interface DictionaryTypeListResponse {
  data: DictionaryType[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

interface AttributeTemplateListResponse {
  data: AttributeTemplate[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// Attribute Dictionary Service Class
// ============================================================================

class AttributeService {
  private baseUrl = '/api';

  // ==========================================================================
  // Dictionary Type Methods
  // ==========================================================================

  /**
   * Get list of dictionary types
   */
  async getDictionaryTypes(
    params?: DictionaryTypeQueryParams
  ): Promise<ApiResponse<DictionaryTypeListResponse>> {
    const searchParams = new URLSearchParams();

    if (params?.status) {
      searchParams.set('status', params.status);
    }
    if (params?.search) {
      searchParams.set('search', params.search);
    }
    if (params?.page) {
      searchParams.set('page', String(params.page));
    }
    if (params?.pageSize) {
      searchParams.set('pageSize', String(params.pageSize));
    }

    const url = `${this.baseUrl}/dictionary-types?${searchParams.toString()}`;
    const response = await fetch(url);
    return response.json();
  }

  /**
   * Get single dictionary type by ID
   */
  async getDictionaryType(id: string): Promise<ApiResponse<DictionaryType>> {
    const response = await fetch(`${this.baseUrl}/dictionary-types/${id}`);
    return response.json();
  }

  /**
   * Create a new dictionary type
   */
  async createDictionaryType(
    data: CreateDictionaryTypeRequest
  ): Promise<ApiResponse<DictionaryType>> {
    const response = await fetch(`${this.baseUrl}/dictionary-types`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  /**
   * Update an existing dictionary type
   */
  async updateDictionaryType(
    id: string,
    data: UpdateDictionaryTypeRequest
  ): Promise<ApiResponse<DictionaryType>> {
    const response = await fetch(`${this.baseUrl}/dictionary-types/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  /**
   * Delete a dictionary type
   */
  async deleteDictionaryType(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.baseUrl}/dictionary-types/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  }

  // ==========================================================================
  // Dictionary Item Methods
  // ==========================================================================

  /**
   * Get list of dictionary items for a type
   */
  async getDictionaryItems(
    typeId: string,
    params?: Omit<DictionaryItemQueryParams, 'typeId'>
  ): Promise<ApiResponse<DictionaryItem[]>> {
    const searchParams = new URLSearchParams();

    if (params?.status) {
      searchParams.set('status', params.status);
    }
    if (params?.search) {
      searchParams.set('search', params.search);
    }

    const url = `${this.baseUrl}/dictionary-types/${typeId}/items?${searchParams.toString()}`;
    const response = await fetch(url);
    return response.json();
  }

  /**
   * Create a new dictionary item
   */
  async createDictionaryItem(
    typeId: string,
    data: Omit<CreateDictionaryItemRequest, 'typeId'>
  ): Promise<ApiResponse<DictionaryItem>> {
    const response = await fetch(
      `${this.baseUrl}/dictionary-types/${typeId}/items`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, typeId }),
      }
    );
    return response.json();
  }

  /**
   * Update an existing dictionary item
   */
  async updateDictionaryItem(
    id: string,
    data: UpdateDictionaryItemRequest
  ): Promise<ApiResponse<DictionaryItem>> {
    const response = await fetch(`${this.baseUrl}/dictionary-items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  /**
   * Delete a dictionary item
   */
  async deleteDictionaryItem(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.baseUrl}/dictionary-items/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  }

  /**
   * Batch update sort order for dictionary items
   */
  async batchUpdateDictionaryItemSort(
    data: BatchUpdateSortRequest
  ): Promise<ApiResponse<void>> {
    const response = await fetch(
      `${this.baseUrl}/dictionary-items/batch-update-sort`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );
    return response.json();
  }

  // ==========================================================================
  // Attribute Template Methods
  // ==========================================================================

  /**
   * Get list of attribute templates
   */
  async getAttributeTemplates(
    params?: AttributeTemplateQueryParams
  ): Promise<ApiResponse<AttributeTemplateListResponse>> {
    const searchParams = new URLSearchParams();

    if (params?.categoryId) {
      searchParams.set('categoryId', params.categoryId);
    }
    if (params?.isActive !== undefined) {
      searchParams.set('isActive', String(params.isActive));
    }
    if (params?.page) {
      searchParams.set('page', String(params.page));
    }
    if (params?.pageSize) {
      searchParams.set('pageSize', String(params.pageSize));
    }

    const url = `${this.baseUrl}/attribute-templates?${searchParams.toString()}`;
    const response = await fetch(url);
    return response.json();
  }

  /**
   * Get single attribute template by ID
   */
  async getAttributeTemplate(
    id: string
  ): Promise<ApiResponse<AttributeTemplate & { attributes: Attribute[] }>> {
    const response = await fetch(`${this.baseUrl}/attribute-templates/${id}`);
    return response.json();
  }

  /**
   * Get attribute template by category ID
   */
  async getAttributeTemplateByCategory(
    categoryId: string
  ): Promise<ApiResponse<(AttributeTemplate & { attributes: Attribute[] }) | null>> {
    const response = await fetch(
      `${this.baseUrl}/attribute-templates/by-category/${categoryId}`
    );
    return response.json();
  }

  /**
   * Create a new attribute template
   */
  async createAttributeTemplate(
    data: CreateAttributeTemplateRequest
  ): Promise<ApiResponse<AttributeTemplate>> {
    const response = await fetch(`${this.baseUrl}/attribute-templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  /**
   * Update an existing attribute template
   */
  async updateAttributeTemplate(
    id: string,
    data: UpdateAttributeTemplateRequest
  ): Promise<ApiResponse<AttributeTemplate>> {
    const response = await fetch(`${this.baseUrl}/attribute-templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  /**
   * Delete an attribute template
   */
  async deleteAttributeTemplate(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.baseUrl}/attribute-templates/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  }

  /**
   * Copy attribute template to another category
   */
  async copyAttributeTemplate(
    id: string,
    targetCategoryId: string,
    newName: string
  ): Promise<ApiResponse<AttributeTemplate & { attributes: Attribute[] }>> {
    const response = await fetch(
      `${this.baseUrl}/attribute-templates/${id}/copy`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetCategoryId, newName }),
      }
    );
    return response.json();
  }

  // ==========================================================================
  // Attribute Methods
  // ==========================================================================

  /**
   * Get list of attributes for a template
   */
  async getAttributes(templateId: string): Promise<ApiResponse<Attribute[]>> {
    const response = await fetch(
      `${this.baseUrl}/attribute-templates/${templateId}/attributes`
    );
    return response.json();
  }

  /**
   * Create a new attribute
   */
  async createAttribute(
    data: CreateAttributeRequest
  ): Promise<ApiResponse<Attribute>> {
    const response = await fetch(`${this.baseUrl}/attributes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  /**
   * Update an existing attribute
   */
  async updateAttribute(
    id: string,
    data: UpdateAttributeRequest
  ): Promise<ApiResponse<Attribute>> {
    const response = await fetch(`${this.baseUrl}/attributes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  /**
   * Delete an attribute
   */
  async deleteAttribute(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.baseUrl}/attributes/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  }
}

// Export singleton instance
export const attributeService = new AttributeService();

export default attributeService;
