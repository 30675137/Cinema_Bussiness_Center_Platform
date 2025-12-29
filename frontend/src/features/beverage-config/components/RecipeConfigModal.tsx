/**
 * @spec O003-beverage-order
 * 饮品配方(BOM)配置弹窗组件 (User Story 3 - FR-035, FR-036, FR-037)
 */

import React, { useState } from 'react'
import {
  Modal,
  Table,
  Button,
  Form,
  Input,
  InputNumber,
  Space,
  Popconfirm,
  message,
  Tag,
  Collapse,
  Descriptions,
  Select,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnsType } from 'antd/es/table'
import {
  getBeverageRecipes,
  addBeverageRecipe,
  updateBeverageRecipe,
  deleteBeverageRecipe,
} from '../services/beverageAdminApi'
import { getSkuList, type SkuDTO } from '../services/skuApi'
import type {
  BeverageRecipeDTO,
  CreateRecipeRequest,
  UpdateRecipeRequest,
  RecipeIngredientDTO,
  RecipeIngredientRequest,
} from '../types/beverage'

const { TextArea } = Input
const { Panel } = Collapse

interface RecipeConfigModalProps {
  open: boolean
  beverageId: string | null
  beverageName?: string
  onClose: () => void
}

export const RecipeConfigModal: React.FC<RecipeConfigModalProps> = ({
  open,
  beverageId,
  beverageName,
  onClose,
}) => {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()
  const [editingRecipe, setEditingRecipe] = useState<BeverageRecipeDTO | null>(null)
  const [formVisible, setFormVisible] = useState(false)

  // 获取配方列表
  const { data: recipes, isLoading } = useQuery({
    queryKey: ['beverage-recipes', beverageId],
    queryFn: () => getBeverageRecipes(beverageId!),
    enabled: !!beverageId && open,
  })

  // 获取 SKU 列表（原料）
  const { data: skuList = [], isLoading: isLoadingSkus } = useQuery({
    queryKey: ['skus', 'RAW_MATERIAL'],
    queryFn: () => getSkuList('RAW_MATERIAL'),
    enabled: open,
  })

  // 添加配方
  const addMutation = useMutation({
    mutationFn: (data: CreateRecipeRequest) =>
      addBeverageRecipe(beverageId!, data),
    onSuccess: () => {
      message.success('添加配方成功')
      queryClient.invalidateQueries({ queryKey: ['beverage-recipes', beverageId] })
      handleFormCancel()
    },
    onError: (error: Error) => {
      message.error(`添加失败: ${error.message}`)
    },
  })

  // 更新配方
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRecipeRequest }) =>
      updateBeverageRecipe(beverageId!, id, data),
    onSuccess: () => {
      message.success('更新配方成功')
      queryClient.invalidateQueries({ queryKey: ['beverage-recipes', beverageId] })
      handleFormCancel()
    },
    onError: (error: Error) => {
      message.error(`更新失败: ${error.message}`)
    },
  })

  // 删除配方
  const deleteMutation = useMutation({
    mutationFn: (recipeId: string) => deleteBeverageRecipe(beverageId!, recipeId),
    onSuccess: () => {
      message.success('删除配方成功')
      queryClient.invalidateQueries({ queryKey: ['beverage-recipes', beverageId] })
    },
    onError: (error: Error) => {
      message.error(`删除失败: ${error.message}`)
    },
  })

  const handleAddRecipe = () => {
    setEditingRecipe(null)
    form.resetFields()
    form.setFieldsValue({
      ingredients: [{ skuId: undefined, ingredientName: '', quantity: 0, unit: '' }],
    })
    setFormVisible(true)
  }

  const handleEditRecipe = (recipe: BeverageRecipeDTO) => {
    setEditingRecipe(recipe)
    form.setFieldsValue({
      name: recipe.name,
      applicableSpecs: recipe.applicableSpecs,
      description: recipe.description,
      ingredients: recipe.ingredients.map((ing) => ({
        skuId: ing.skuId,
        ingredientName: ing.ingredientName,
        quantity: ing.quantity,
        unit: ing.unit,
        note: ing.note,
      })),
    })
    setFormVisible(true)
  }

  const handleDeleteRecipe = (recipeId: string) => {
    deleteMutation.mutate(recipeId)
  }

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields()

      const ingredients: RecipeIngredientRequest[] = values.ingredients.map(
        (ing: RecipeIngredientRequest) => ({
          skuId: ing.skuId,
          ingredientName: ing.ingredientName,
          quantity: ing.quantity,
          unit: ing.unit,
          note: ing.note,
        })
      )

      if (editingRecipe) {
        // 编辑模式
        const updateData: UpdateRecipeRequest = {
          name: values.name,
          applicableSpecs: values.applicableSpecs,
          description: values.description,
          ingredients,
        }
        updateMutation.mutate({ id: editingRecipe.id, data: updateData })
      } else {
        // 新增模式
        const createData: CreateRecipeRequest = {
          name: values.name,
          applicableSpecs: values.applicableSpecs,
          description: values.description,
          ingredients,
        }
        addMutation.mutate(createData)
      }
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  const handleFormCancel = () => {
    form.resetFields()
    setFormVisible(false)
    setEditingRecipe(null)
  }

  // SKU 选择变更处理
  const handleSkuChange = (skuId: string, fieldIndex: number) => {
    const selectedSku = skuList.find((sku) => sku.id === skuId)
    if (selectedSku) {
      const ingredients = form.getFieldValue('ingredients') || []
      ingredients[fieldIndex] = {
        ...ingredients[fieldIndex],
        skuId: skuId, // SKU ID 是 UUID 字符串，不转换为 Number
        ingredientName: selectedSku.name,
        unit: selectedSku.main_unit, // 使用 main_unit 字段
      }
      form.setFieldsValue({ ingredients })
    }
  }

  const ingredientColumns: ColumnsType<RecipeIngredientDTO> = [
    {
      title: '原料SKU ID',
      dataIndex: 'skuId',
      key: 'skuId',
      width: 120,
    },
    {
      title: '原料名称',
      dataIndex: 'ingredientName',
      key: 'ingredientName',
      width: 150,
    },
    {
      title: '用量',
      key: 'quantity',
      width: 150,
      render: (_: unknown, record: RecipeIngredientDTO) =>
        `${record.quantity} ${record.unit}`,
    },
    {
      title: '库存状态',
      dataIndex: 'stockStatus',
      key: 'stockStatus',
      width: 120,
      render: (stockStatus?: RecipeIngredientDTO['stockStatus']) => {
        if (!stockStatus) return '-'
        return stockStatus.inStock ? (
          <Tag color="green">{stockStatus.statusText}</Tag>
        ) : (
          <Tag color="red">{stockStatus.statusText}</Tag>
        )
      },
    },
    {
      title: '备注',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
    },
  ]

  return (
    <Modal
      title={`配方配置 - ${beverageName || ''}`}
      open={open}
      onCancel={onClose}
      width={1200}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRecipe}>
          添加配方
        </Button>
      </div>

      <Collapse>
        {recipes?.map((recipe) => (
          <Panel
            key={recipe.id}
            header={
              <Space>
                <strong>{recipe.name}</strong>
                <Tag color="blue">{recipe.ingredients.length} 种原料</Tag>
              </Space>
            }
            extra={
              <Space onClick={(e) => e.stopPropagation()}>
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleEditRecipe(recipe)}
                >
                  编辑
                </Button>
                <Popconfirm
                  title="确定删除此配方吗？"
                  onConfirm={() => handleDeleteRecipe(recipe.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                    删除
                  </Button>
                </Popconfirm>
              </Space>
            }
          >
            <Descriptions size="small" column={2} style={{ marginBottom: 16 }}>
              {recipe.applicableSpecs && (
                <Descriptions.Item label="适用规格">
                  {recipe.applicableSpecs}
                </Descriptions.Item>
              )}
              {recipe.description && (
                <Descriptions.Item label="描述" span={2}>
                  {recipe.description}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Table<RecipeIngredientDTO>
              columns={ingredientColumns}
              dataSource={recipe.ingredients}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Panel>
        ))}
      </Collapse>

      {!recipes || recipes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
          暂无配方，请添加
        </div>
      ) : null}

      <Modal
        title={editingRecipe ? '编辑配方' : '添加配方'}
        open={formVisible}
        onOk={handleFormSubmit}
        onCancel={handleFormCancel}
        width={800}
        confirmLoading={addMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="配方名称"
            name="name"
            rules={[
              { required: true, message: '请输入配方名称' },
              { max: 100, message: '名称不能超过100个字符' },
            ]}
          >
            <Input placeholder="例如：标准配方、加强版配方" />
          </Form.Item>

          <Form.Item
            label="适用规格"
            name="applicableSpecs"
            tooltip="可选，JSON格式存储规格组合，例如: {&quot;SIZE&quot;: &quot;LARGE&quot;}"
          >
            <Input placeholder='例如: {"SIZE": "LARGE", "TEMPERATURE": "HOT"}' />
          </Form.Item>

          <Form.Item
            label="配方描述"
            name="description"
            rules={[{ max: 500, message: '描述不能超过500个字符' }]}
          >
            <TextArea rows={2} placeholder="可选的配方描述" />
          </Form.Item>

          <Form.List
            name="ingredients"
            rules={[
              {
                validator: async (_, ingredients) => {
                  if (!ingredients || ingredients.length < 1) {
                    return Promise.reject(new Error('至少添加一种原料'))
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                <div style={{ marginBottom: 8 }}>
                  <strong>原料清单</strong>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                    style={{ marginLeft: 8 }}
                  >
                    添加原料
                  </Button>
                </div>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{ display: 'flex', marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, 'skuId']}
                      rules={[{ required: true, message: '请选择SKU' }]}
                    >
                      <Select
                        showSearch
                        placeholder="选择原料SKU"
                        style={{ width: 200 }}
                        loading={isLoadingSkus}
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        onChange={(value) => handleSkuChange(value, name)}
                        options={skuList.map((sku) => ({
                          value: sku.id,
                          label: `${sku.name} (${sku.code})`, // 使用 code 字段
                        }))}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'ingredientName']}
                      rules={[{ required: true, message: '原料名称' }]}
                    >
                      <Input placeholder="原料名称" style={{ width: 150 }} disabled />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'quantity']}
                      rules={[{ required: true, message: '请输入用量' }]}
                    >
                      <InputNumber
                        placeholder="用量"
                        style={{ width: 100 }}
                        min={0.01}
                        precision={2}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'unit']}
                      rules={[{ required: true, message: '单位' }]}
                    >
                      <Input placeholder="单位" style={{ width: 80 }} disabled />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'note']}>
                      <Input placeholder="备注（可选）" style={{ width: 150 }} />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.ErrorList errors={errors} />
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </Modal>
  )
}

export default RecipeConfigModal
