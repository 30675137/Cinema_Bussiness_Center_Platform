# Data Model: 属性模板与数据字典管理

**Feature**: 010-attribute-dict-management
**Date**: 2025-12-14
**Purpose**: Define data entities and relationships for the attribute template and dictionary management system

## Entity Overview

This document defines the core data entities for the attribute template and data dictionary management system. The system follows a hierarchical structure: Dictionary Types contain Dictionary Items, which can be referenced by Attribute Templates, which are applied to Categories for SPU/SKU attribute management.

## Core Entities

### 1. DictionaryType (字典类型)

Represents a category of dictionary items, such as capacity units, flavors, or packaging types.

```typescript
interface DictionaryType {
  // Primary fields
  id: string;                    // Unique identifier (UUID v4)
  code: string;                  // Unique code (e.g., 'capacity_unit')
  name: string;                  // Display name (e.g., '容量单位')
  description?: string;          // Optional description

  // Classification
  isSystem: boolean;            // Whether this is a system-built-in type
  category: 'basic' | 'business' | 'custom';  // Type category

  // Ordering and status
  sort: number;                 // Display order
  status: 'active' | 'inactive'; // Status

  // Metadata
  createdAt: string;            // ISO 8601 timestamp
  updatedAt: string;            // ISO 8601 timestamp
  createdBy: string;            // User ID who created
  updatedBy: string;            // User ID who last updated
}
```

**Validation Rules**:
- `code`: Required, unique, alphanumeric with underscores
- `name`: Required, unique, max 50 characters
- `sort`: Required, integer, default 0
- `status`: Required, must be 'active' or 'inactive'

**Indexes**:
- Unique index on `code`
- Index on `status` for filtering active types

### 2. DictionaryItem (字典项)

Represents a specific value within a dictionary type.

```typescript
interface DictionaryItem {
  // Primary fields
  id: string;                    // Unique identifier (UUID v4)
  typeId: string;                // Reference to DictionaryType.id
  code: string;                  // Unique code within type (e.g., '500ml')
  name: string;                  // Display name (e.g., '500毫升')
  value?: any;                   // Actual stored value

  // Hierarchy (optional)
  parentId?: string;             // For hierarchical items
  level: number;                 // Hierarchy level (0 for root)

  // Display and ordering
  sort: number;                 // Display order within type
  status: 'active' | 'inactive'; // Status
  remark?: string;              // Optional notes

  // Metadata
  createdAt: string;            // ISO 8601 timestamp
  updatedAt: string;            // ISO 8601 timestamp
  createdBy: string;            // User ID who created
  updatedBy: string;            // User ID who last updated
}
```

**Validation Rules**:
- `typeId`: Required, valid DictionaryType ID
- `code`: Required, unique within typeId
- `name`: Required, unique within typeId, max 100 characters
- `sort`: Required, integer, default 0
- `level`: Required, integer, min 0

**Indexes**:
- Composite unique index on `(typeId, code)`
- Composite unique index on `(typeId, name)`
- Index on `status` for filtering active items
- Index on `parentId` for hierarchy queries

### 3. Category (类目)

Represents a product category in the three-level hierarchy. This entity is assumed to exist in the system.

```typescript
interface Category {
  id: string;                    // Unique identifier
  code: string;                  // Unique code
  name: string;                  // Display name
  level: 1 | 2 | 3;             // Category level
  parentId?: string;             // Parent category ID
  path: string;                  // Full path (e.g., '1>2>3')
  status: 'active' | 'inactive';
  sort: number;
  // ... other existing fields
}
```

### 4. AttributeTemplate (属性模板)

Defines the attribute structure for a specific category.

```typescript
interface AttributeTemplate {
  // Primary fields
  id: string;                    // Unique identifier (UUID v4)
  categoryId: string;            // Reference to Category.id (must be level 3)
  name: string;                  // Template name
  version: number;               // Version for change tracking

  // Template status
  isActive: boolean;             // Whether this template is active
  appliedAt?: string;            // When this template was applied

  // Metadata
  createdAt: string;            // ISO 8601 timestamp
  updatedAt: string;            // ISO 8601 timestamp
  createdBy: string;            // User ID who created
  updatedBy: string;            // User ID who last updated

  // Associations (lazy loaded)
  attributes?: Attribute[];      // Attributes in this template
}
```

**Validation Rules**:
- `categoryId`: Required, must reference a level-3 category
- `name`: Required, max 100 characters
- `version`: Required, integer, starts at 1
- Only one active template per category

**Indexes**:
- Composite unique index on `(categoryId, isActive)` where isActive = true
- Index on `categoryId` for all templates
- Index on `isActive` for filtering active templates

### 5. Attribute (属性)

Defines a single attribute within an attribute template.

```typescript
interface Attribute {
  // Primary fields
  id: string;                    // Unique identifier (UUID v4)
  templateId: string;            // Reference to AttributeTemplate.id
  name: string;                  // Display name (e.g., '容量')
  code: string;                  // Unique code within template (e.g., 'capacity')

  // Attribute definition
  type: AttributeType;          // Attribute type
  required: boolean;            // Whether this attribute is required
  description?: string;         // Description

  // Value configuration
  dictionaryTypeId?: string;    // Reference to DictionaryType.id
  customValues?: string[];      // Custom predefined values
  defaultValue?: any;           // Default value

  // Display and grouping
  sort: number;                 // Display order
  group?: string;               // Group name for organization

  // Level applicability
  level: 'SPU' | 'SKU' | 'both'; // Where this attribute applies

  // Validation rules (JSON schema)
  validation?: ValidationRule[];

  // Metadata
  createdAt: string;            // ISO 8601 timestamp
  updatedAt: string;            // ISO 8601 timestamp
  createdBy: string;            // User ID who created
  updatedBy: string;            // User ID who last updated
}
```

**AttributeType Enum**:
```typescript
type AttributeType =
  | 'text'           // 文本输入
  | 'number'         // 数字输入
  | 'single-select'  // 单选
  | 'multi-select'   // 多选
  | 'boolean'        // 布尔值
  | 'date';          // 日期
```

**ValidationRule Interface**:
```typescript
interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
}
```

**Validation Rules**:
- `templateId`: Required, valid AttributeTemplate ID
- `name`: Required, unique within templateId, max 50 characters
- `code`: Required, unique within templateId, alphanumeric with underscores
- `type`: Required, must be valid AttributeType
- If `type` is 'single-select' or 'multi-select', either `dictionaryTypeId` or `customValues` must be provided
- `sort`: Required, integer, default 0

**Indexes**:
- Composite unique index on `(templateId, code)`
- Composite unique index on `(templateId, name)`
- Index on `dictionaryTypeId` for reference lookups
- Index on `type` for filtering by type

### 6. SPUAttributeValue (SPU属性值)

Stores actual attribute values for SPU entities.

```typescript
interface SPUAttributeValue {
  id: string;                    // Unique identifier (UUID v4)
  spuId: string;                 // Reference to SPU.id
  attributeId: string;           // Reference to Attribute.id
  value: any;                    // Actual attribute value

  // Metadata
  createdAt: string;            // ISO 8601 timestamp
  updatedAt: string;            // ISO 8601 timestamp
  createdBy: string;            // User ID who created
  updatedBy: string;            // User ID who last updated
}
```

### 7. SKUAttributeValue (SKU属性值)

Stores actual attribute values for SKU entities.

```typescript
interface SKUAttributeValue {
  id: string;                    // Unique identifier (UUID v4)
  skuId: string;                 // Reference to SKU.id
  attributeId: string;           // Reference to Attribute.id
  value: any;                    // Actual attribute value

  // Metadata
  createdAt: string;            // ISO 8601 timestamp
  updatedAt: string;            // ISO 8601 timestamp
  createdBy: string;            // User ID who created
  updatedBy: string;            // User ID who last updated
}
```

## Entity Relationships

### Relationship Diagram

```
Category (1) ----< (1) AttributeTemplate (1) ----< (*) Attribute
                                                   |
                                                   | (optional)
                                                   v
                                         DictionaryType (1) ----< (*) DictionaryItem

SPU (*) ----< (*) SPUAttributeValue (*) >---- Attribute
SKU (*) ----< (*) SKUAttributeValue (*) >---- Attribute
```

### Relationship Details

1. **Category → AttributeTemplate**: One-to-One (only one active template per category)
2. **AttributeTemplate → Attribute**: One-to-Many
3. **Attribute → DictionaryType**: Many-to-One (optional, only for select/multi-select types)
4. **DictionaryType → DictionaryItem**: One-to-Many
5. **SPU → SPUAttributeValue**: One-to-Many
6. **SKU → SKUAttributeValue**: One-to-Many
7. **Attribute → SPUAttributeValue**: One-to-Many
8. **Attribute → SKUAttributeValue**: One-to-Many

## Data Constraints

### Business Rules

1. **Dictionary Type Constraints**:
   - Cannot delete a DictionaryType if it has DictionaryItems
   - Cannot delete a DictionaryType if it's referenced by any Attribute

2. **Dictionary Item Constraints**:
   - Cannot delete a DictionaryItem if it's used in any SPU/SKU attribute value
   - Cannot delete a DictionaryItem if it's a default value for any Attribute
   - Code must be unique within its DictionaryType
   - Name must be unique within its DictionaryType

3. **Attribute Template Constraints**:
   - Only one active template per category
   - Cannot delete a template if it has attributes with SPU/SKU values
   - All attributes must have unique codes within the template

4. **Attribute Constraints**:
   - If type is 'single-select' or 'multi-select', must have either dictionaryTypeId or customValues
   - Cannot change type of attribute if it has SPU/SKU values
   - Required attributes must have values for all SPU in the category

### Cascade Operations

1. **Deletion Cascades**:
   - Deleting AttributeTemplate → soft delete all Attributes
   - Deleting Attribute → soft delete all SPU/SKU attribute values

2. **Status Changes**:
   - Deactivating DictionaryType → deactivate all DictionaryItems
   - Deactivating DictionaryItem → remove from active options in forms

## Performance Considerations

### Indexing Strategy

1. **Primary Lookups**:
   - Dictionary items by type: Index on `DictionaryItem.typeId`
   - Attributes by template: Index on `Attribute.templateId`
   - Attribute values by SPU/SKU: Index on `SPUAttributeValue.spuId`

2. **Uniqueness Constraints**:
   - Dictionary codes: Composite unique on `(DictionaryType.code)`
   - Dictionary item codes: Composite unique on `(DictionaryItem.typeId, DictionaryItem.code)`
   - Attribute codes: Composite unique on `(Attribute.templateId, Attribute.code)`

3. **Filtering Queries**:
   - Status filtering: Index on all `status` fields
   - Active data queries: Composite indexes on `(status, sort)`

### Query Patterns

1. **Common Queries**:
   ```sql
   -- Get active dictionary items for a type
   SELECT * FROM DictionaryItem
   WHERE typeId = ? AND status = 'active'
   ORDER BY sort;

   -- Get template for a category
   SELECT t.* FROM AttributeTemplate t
   WHERE t.categoryId = ? AND t.isActive = true;

   -- Get SPU attribute values
   SELECT av.*, a.name, a.type
   FROM SPUAttributeValue av
   JOIN Attribute a ON av.attributeId = a.id
   WHERE av.spuId = ?;
   ```

2. **Bulk Operations**:
   - Batch update of sort orders
   - Bulk status changes
   - Mass deletion with reference checks

## Data Migration

### Version 1.0 Schema

Initial implementation includes all core entities with basic relationships.

### Future Extensions

1. **Version 1.1**:
   - Add attribute value history tracking
   - Support for conditional attribute display
   - Multi-language support for dictionary items

2. **Version 2.0**:
   - Attribute templates inheritance
   - Cross-category template sharing
   - Advanced validation rules

## Mock Data Structure

### Initial Data Example

```json
{
  "dictionaryTypes": [
    {
      "id": "dt-001",
      "code": "capacity_unit",
      "name": "容量单位",
      "isSystem": true,
      "status": "active",
      "sort": 1
    }
  ],
  "dictionaryItems": [
    {
      "id": "di-001",
      "typeId": "dt-001",
      "code": "500ml",
      "name": "500毫升",
      "status": "active",
      "sort": 1
    }
  ],
  "attributeTemplates": [
    {
      "id": "at-001",
      "categoryId": "cat-001",
      "name": "饮料属性模板",
      "version": 1,
      "isActive": true
    }
  ],
  "attributes": [
    {
      "id": "attr-001",
      "templateId": "at-001",
      "name": "容量",
      "code": "capacity",
      "type": "single-select",
      "required": true,
      "dictionaryTypeId": "dt-001",
      "sort": 1
    }
  ]
}
```

## Security Considerations

### Access Control

1. **Dictionary Management**:
   - Admin/Data Manager: Full CRUD on DictionaryType and DictionaryItem
   - All roles: Read-only access to dictionary data

2. **Template Management**:
   - Admin/Data Manager: Full CRUD on AttributeTemplate and Attribute
   - Operator: Read-only access

3. **Value Assignment**:
   - All roles: Can read SPU/SKU attribute values
   - Operator: Can create/update attribute values for SPU/SKU

### Data Validation

1. **Input Sanitization**:
   - All text fields: Trim whitespace, escape HTML
   - Codes: Validate format, prevent injection
   - JSON validation rules: Schema validation

2. **Business Logic Validation**:
   - Reference integrity before deletion
   - Type consistency for attribute values
   - Required field validation

## Summary

This data model provides a flexible and scalable foundation for managing product attributes through data dictionaries and templates. The design supports:

1. **Hierarchical dictionary organization** with types and items
2. **Category-specific attribute templates** for structured product data
3. **Flexible attribute types** with validation rules
4. **Performance optimization** through proper indexing
5. **Data integrity** through constraints and validation rules
6. **Access control** based on user roles

The model is designed to handle the requirements specified in the feature specification, supporting up to 50 dictionary types with 200 items each, while maintaining good performance for common operations.