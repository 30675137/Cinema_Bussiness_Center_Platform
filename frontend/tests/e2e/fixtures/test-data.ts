export const testProducts = [
  {
    id: '1',
    name: '爆米花-大份',
    sku: 'POP001-L',
    category: '食品',
    materialType: '商品',
    status: 'active',
    price: 15.00,
    stock: 100
  },
  {
    id: '2',
    name: '可乐-中杯',
    sku: 'COL001-M',
    category: '饮料',
    materialType: '商品',
    status: 'active',
    price: 8.00,
    stock: 50
  },
  {
    id: '3',
    name: '电影票-标准场',
    sku: 'TCK001-STD',
    category: '票务',
    materialType: '服务',
    status: 'active',
    price: 35.00,
    stock: 200
  }
];

export const testStores = [
  {
    id: 'store001',
    name: '耀莱影城-朝阳店',
    code: 'CY001'
  },
  {
    id: 'store002',
    name: '耀莱影城-海淀店',
    code: 'HD001'
  }
];

export const formInputs = {
  product: {
    name: '测试商品-' + Date.now(),
    sku: 'TEST-' + Date.now(),
    category: '食品',
    materialType: '商品',
    description: '这是一个测试商品的描述',
    price: 10.00,
    cost: 5.00
  }
};