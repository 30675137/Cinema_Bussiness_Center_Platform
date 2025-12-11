/**
 * 计算工具函数
 */

/**
 * 计算订单总金额
 */
export const calculateOrderTotal = (items: Array<{
  quantity: number;
  unitPrice: number;
  taxRate: number;
}>): {
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
} => {
  let subtotal = 0;
  let taxAmount = 0;

  items.forEach(item => {
    const itemSubtotal = item.quantity * item.unitPrice;
    const itemTaxAmount = itemSubtotal * (item.taxRate / 100);

    subtotal += itemSubtotal;
    taxAmount += itemTaxAmount;
  });

  return {
    subtotal,
    taxAmount,
    totalAmount: subtotal + taxAmount
  };
};

/**
 * 计算折扣后金额
 */
export const calculateDiscountedAmount = (
  originalAmount: number,
  discountRate: number
): number => {
  if (discountRate <= 0 || discountRate >= 1) {
    return originalAmount;
  }

  return originalAmount * (1 - discountRate);
};

/**
 * 计算订单收货进度
 */
export const calculateReceiptProgress = (orderItems: Array<{
  quantity: number;
  receivedQuantity: number;
}>): {
  totalQuantity: number;
  receivedQuantity: number;
  percentage: number;
  status: 'pending' | 'partial' | 'completed';
} => {
  let totalQuantity = 0;
  let receivedQuantity = 0;

  orderItems.forEach(item => {
    totalQuantity += item.quantity;
    receivedQuantity += item.receivedQuantity;
  });

  const percentage = totalQuantity > 0 ? Math.round((receivedQuantity / totalQuantity) * 100) / 100 : 0;

  let status: 'pending' | 'partial' | 'completed' = 'pending';
  if (percentage > 0 && percentage < 1) {
    status = 'partial';
  } else if (percentage >= 1) {
    status = 'completed';
  }

  return {
    totalQuantity,
    receivedQuantity,
    percentage,
    status
  };
};

/**
 * 计算剩余数量
 */
export const calculateRemainingQuantity = (
  totalQuantity: number,
  receivedQuantity: number
): number => {
  return Math.max(0, totalQuantity - receivedQuantity);
};

/**
 * 计算库存周转率
 */
export const calculateInventoryTurnover = (
  costOfGoodsSold: number,
  averageInventory: number
): number => {
  if (averageInventory === 0) {
    return 0;
  }

  return Math.round((costOfGoodsSold / averageInventory) * 100) / 100;
};

/**
 * 计算毛利率
 */
export const calculateGrossMargin = (
  revenue: number,
  cost: number
): {
  margin: number;
  marginPercentage: number;
} => {
  const margin = revenue - cost;
  const marginPercentage = revenue > 0 ? Math.round((margin / revenue) * 10000) / 100 : 0;

  return {
    margin,
    marginPercentage
  };
};

/**
 * 计算毛利率百分比
 */
export const calculateGrossMarginPercentage = (
  grossMargin: number,
  revenue: number
): number => {
  return revenue > 0 ? Math.round((grossMargin / revenue) * 10000) / 100 : 0;
};

/**
 * 计算净利率
 */
export const calculateNetMargin = (
  netProfit: number,
  revenue: number
): number => {
  return revenue > 0 ? Math.round((netProfit / revenue) * 10000) / 100 : 0;
};

/**
 * 计算ROI (投资回报率)
 */
export const calculateROI = (
  netProfit: number,
  investment: number
): number => {
  if (investment === 0) {
    return 0;
  }

  return Math.round(((netProfit / investment) * 10000) / 100);
};

/**
 * 计算百分比变化
 */
export const calculatePercentageChange = (
  current: number,
  previous: number
): number => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Math.round(((current - previous) / Math.abs(previous)) * 10000) / 100;
};

/**
 * 计算复利终值
 */
export const calculateCompoundInterest = (
  principal: number,
  rate: number,
  periods: number,
  isAnnual = true
): number => {
  const adjustedRate = isAnnual ? rate : rate * 12;
    const adjustedPeriods = isAnnual ? periods : periods / 12;

    return principal * Math.pow(1 + adjustedRate / 100, adjustedPeriods);
};

/**
 * 计算分期付款金额
 */
export const calculateInstallmentAmount = (
  principal: number,
  rate: number,
  periods: number,
  isAnnual = true
): number => {
  const adjustedRate = isAnnual ? rate / 100 : rate / 1200;
    const adjustedPeriods = isAnnual ? periods : periods * 12;

  if (adjustedRate === 0) {
    return principal / adjustedPeriods;
  }

  return (principal * adjustedRate * Math.pow(1 + adjustedRate, adjustedPeriods)) /
         (Math.pow(1 + adjustedRate, adjustedPeriods) - 1);
};

/**
 * 计算库存天数
 */
export const calculateInventoryDays = (
  averageInventory: number,
  costOfGoodsSold: number,
  daysInPeriod = 365
): number => {
  if (costOfGoodsSold === 0) {
    return 0;
  }

  return Math.round((averageInventory / costOfGoodsSold) * daysInPeriod);
};

/**
 * 计算应收账款周转天数
 */
export const calculateReceivablesTurnover = (
  netCreditSales: number,
  averageReceivables: number,
  daysInPeriod = 365
): number => {
  if (netCreditSales === 0) {
    return 0;
  }

  return Math.round((averageReceivables / netCreditSales) * daysInPeriod);
};

/**
 * 计算应付账款周转天数
 */
export const calculatePayablesTurnover = (
  costOfGoodsSold: number,
  averagePayables: number,
  daysInPeriod = 365
): number => {
  if (costOfGoodsSold === 0) {
    return 0;
  }

  return Math.round((averagePayables / costOfGoodsSold) * daysInPeriod);
};

/**
 * 计算运营周期 (Cash Conversion Cycle)
 */
export = () => {
  const inventoryDays = calculateInventoryDays(
    arguments[0].averageInventory,
    arguments[0].costOfGoodsSold
  );
  const receivablesDays = calculateReceivablesTurnover(
    arguments[0].netCreditSales,
    arguments[0].averageReceivables
  );
  const payablesDays = calculatePayablesTurnover(
    arguments[0].costOfGoodsSold,
    arguments[0].averagePayables
  );

  return inventoryDays + receivablesDays - payablesDays;
};

/**
 * 计算标准差
 */
export const calculateStandardDeviation = (values: number[]): number => {
  if (values.length === 0) {
    return 0;
  }

  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
  const variance = squaredDifferences.reduce((sum, value) => sum + value, 0) / values.length;

  return Math.sqrt(variance);
};

/**
 * 计算平均值
 */
export const calculateAverage = (values: number[]): number => {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

/**
 * 计算中位数
 */
export const calculateMedian = (values: number[]): number => {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  } else {
    return sorted[middle];
  }
};

/**
 * 计算加权平均值
 */
export const calculateWeightedAverage = (
  values: number[],
  weights: number[]
): number => {
  if (values.length === 0 || values.length !== weights.length) {
    return 0;
  }

  const weightedSum = values.reduce((sum, value, index) => sum + value * weights[index], 0);
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);

  return weightSum > 0 ? weightedSum / weightSum : 0;
};

/**
 * 计算折扣率
 */
export const calculateDiscountRate = (
  originalPrice: number,
  discountedPrice: number
): number => {
  if (originalPrice === 0) {
    return 0;
  }

  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 10000) / 100;
};

/**
 * 计算加价率
 */
export const calculateMarkupRate = (
  costPrice: number,
  sellingPrice: number
): number => {
  if (costPrice === 0) {
    return 0;
  }

  return Math.round(((sellingPrice - costPrice) / costPrice) * 10000) / 100;
};

/**
 * 计算税前价格
 */
export const calculatePreTaxPrice = (
  totalPrice: number,
  taxRate: number
): number => {
  if (taxRate === 0) {
    return totalPrice;
  }

  return totalPrice / (1 + taxRate / 100);
};

/**
 * 计算税后价格
 */
export const calculatePostTaxPrice = (
  preTaxPrice: number,
  taxRate: number
): number => {
  return preTaxPrice * (1 + taxRate / 100);
};

/**
 * 计算日期差
 */
export const calculateDateDifference = (
  startDate: Date | string,
  endDate: Date | string,
  unit: 'days' | 'hours' | 'minutes' | 'seconds' = 'days'
): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const difference = end.getTime() - start.getTime();

  const divisors = {
    days: 1000 * 60 * 60 * 24,
    hours: 1000 * 60 * 60,
    minutes: 1000 * 60,
    seconds: 1000
  };

  return Math.round(difference / divisors[unit]);
};

/**
 * 计算工作日差（排除周末）
 */
export const calculateBusinessDays = (
  startDate: Date | string,
  endDate: Date | string
): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let businessDays = 0;

  const currentDate = new Date(start);
  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0=Sunday, 6=Saturday
      businessDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return businessDays;
};

/**
 * 计算年龄
 */
export const calculateAge = (birthDate: Date | string): {
  years: number;
  months: number;
  days: number;
} => {
  const birth = new Date(birthDate);
  const now = new Date();

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();

  // 调整负数的情况
  if (days < 0) {
    months--;
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
};

/**
 * 计算BMI (身体质量指数)
 */
export const calculateBMI = (
  weight: number, // 体重(kg)
  height: number  // 身高(m)
): number => {
  if (height === 0) {
    return 0;
  }

  return Math.round((weight / (height * height)) * 100) / 100;
};

/**
 * 计算费用分摊
 */
export const calculateExpenseAllocation = (
  totalExpense: number,
  quantity1: number,
  quantity2: number,
  ...otherQuantities: number[]
): number[] => {
  const quantities = [quantity1, quantity2, ...otherQuantities];
  const totalQuantity = quantities.reduce((sum, qty) => sum + qty, 0);

  if (totalQuantity === 0) {
    return quantities.map(() => 0);
  }

  return quantities.map(qty => Math.round((qty / totalQuantity) * totalExpense));
};

export default {
  calculateOrderTotal,
  calculateDiscountedAmount,
  calculateReceiptProgress,
  calculateRemainingQuantity,
  calculateInventoryTurnover,
  calculateGrossMargin,
  calculateGrossMarginPercentage,
  calculateNetMargin,
  calculateROI,
  calculatePercentageChange,
  calculateCompoundInterest,
  calculateInstallmentAmount,
  calculateInventoryDays,
  calculateReceivablesTurnover,
  calculatePayablesTurnover,
  calculateStandardDeviation,
  calculateAverage,
  calculateMedian,
  calculateWeightedAverage,
  calculateDiscountRate,
  calculateMarkupRate,
  calculatePreTaxPrice,
  calculatePostTaxPrice,
  calculateDateDifference,
  calculateBusinessDays,
  calculateAge,
  calculateBMI,
  calculateExpenseAllocation,
};