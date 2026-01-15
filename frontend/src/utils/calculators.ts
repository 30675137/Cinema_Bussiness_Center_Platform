/**
 * 计算工具函数库
 */

/**
 * 计算订单总金额
 */
export const calculateOrderTotal = (items: any[]): number => {
  if (!items || items.length === 0) {
    return 0;
  }

  return items.reduce((total, item) => {
    const subtotal = item.quantity * item.unitPrice - (item.discountAmount || 0);
    const taxAmount = item.subtotal * (item.taxRate || 0);
    return total + subtotal + taxAmount;
  }, 0);
};

/**
 * 计算折扣金额
 */
export const calculateDiscountedAmount = (amount: number, discountRate: number): number => {
  if (amount <= 0 || discountRate <= 0 || discountRate > 100) {
    return 0;
  }

  return Math.round(((amount * discountRate) / 100) * 100) / 100;
};

/**
 * 计算收货进度
 */
export const calculateReceiptProgress = (
  receivedQuantity: number,
  orderedQuantity: number
): number => {
  if (orderedQuantity === 0) {
    return 0;
  }

  return Math.round((receivedQuantity / orderedQuantity) * 100);
};

/**
 * 计算剩余数量
 */
export const calculateRemainingQuantity = (
  orderedQuantity: number,
  receivedQuantity: number
): number => {
  return Math.max(0, orderedQuantity - receivedQuantity);
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
 * 计算毛利
 */
export const calculateGrossMargin = (revenue: number, costOfGoodsSold: number): number => {
  return revenue - costOfGoodsSold;
};

/**
 * 计算毛利率
 */
export const calculateGrossMarginPercentage = (
  revenue: number,
  costOfGoodsSold: number
): number => {
  if (revenue === 0) {
    return 0;
  }

  return Math.round(((revenue - costOfGoodsSold) / revenue) * 10000) / 100;
};

/**
 * 计算净利率
 */
export const calculateNetMargin = (netIncome: number, revenue: number): number => {
  if (revenue === 0) {
    return 0;
  }

  return Math.round((netIncome / revenue) * 10000) / 100;
};

/**
 * 计算投资回报率
 */
export const calculateROI = (netProfit: number, investmentCost: number): number => {
  if (investmentCost === 0) {
    return 0;
  }

  return Math.round((netProfit / investmentCost) * 10000) / 100;
};

/**
 * 计算百分比变化
 */
export const calculatePercentageChange = (oldValue: number, newValue: number): number => {
  if (oldValue === 0) {
    return newValue > 0 ? Infinity : 0;
  }

  return Math.round(((newValue - oldValue) / oldValue) * 10000) / 100;
};

/**
 * 计算复利
 */
export const calculateCompoundInterest = (
  principal: number,
  rate: number,
  time: number,
  compoundsPerYear = 1
): number => {
  return (
    Math.round(principal * Math.pow(1 + rate / compoundsPerYear, compoundsPerYear * time) * 100) /
    100
  );
};

/**
 * 计算分期付款金额
 */
export const calculateInstallmentAmount = (
  totalAmount: number,
  interestRate: number,
  numberOfPayments: number
): number => {
  if (numberOfPayments === 0) {
    return 0;
  }

  const monthlyRate = interestRate / 100 / 12;
  const denominator = Math.pow(1 + monthlyRate, numberOfPayments) - 1;

  if (monthlyRate === 0) {
    return Math.round((totalAmount / numberOfPayments) * 100) / 100;
  }

  const installment =
    (totalAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) / denominator;
  return Math.round(installment * 100) / 100;
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
 * 计算标准差
 */
export const calculateStandardDeviation = (values: number[]): number => {
  if (values.length === 0) {
    return 0;
  }

  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const squaredDifferences = values.map((value) => Math.pow(value - mean, 2));
  const variance = squaredDifferences.reduce((sum, value) => sum + value, 0) / values.length;

  return Math.round(Math.sqrt(variance) * 100) / 100;
};

/**
 * 计算平均值
 */
export const calculateAverage = (values: number[]): number => {
  if (values.length === 0) {
    return 0;
  }

  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 100) / 100;
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
    return Math.round(((sorted[middle - 1] + sorted[middle]) / 2) * 100) / 100;
  } else {
    return Math.round(sorted[middle] * 100) / 100;
  }
};

/**
 * 计算加权平均值
 */
export const calculateWeightedAverage = (values: number[], weights: number[]): number => {
  if (values.length === 0 || values.length !== weights.length) {
    return 0;
  }

  const weightedSum = values.reduce((sum, value, index) => sum + value * weights[index], 0);
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);

  return Math.round((weightSum > 0 ? weightedSum / weightSum : 0) * 100) / 100;
};

/**
 * 计算折扣率
 */
export const calculateDiscountRate = (originalPrice: number, discountedPrice: number): number => {
  if (originalPrice === 0) {
    return 0;
  }

  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 10000) / 100;
};

/**
 * 计算加价率
 */
export const calculateMarkupRate = (costPrice: number, sellingPrice: number): number => {
  if (costPrice === 0) {
    return 0;
  }

  return Math.round(((sellingPrice - costPrice) / costPrice) * 10000) / 100;
};

/**
 * 计算税前价格
 */
export const calculatePreTaxPrice = (totalPrice: number, taxRate: number): number => {
  if (taxRate === 0) {
    return totalPrice;
  }

  return Math.round((totalPrice / (1 + taxRate / 100)) * 100) / 100;
};

/**
 * 计算税后价格
 */
export const calculatePostTaxPrice = (preTaxPrice: number, taxRate: number): number => {
  return Math.round(preTaxPrice * (1 + taxRate / 100) * 100) / 100;
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
    seconds: 1000,
  };

  return Math.round(difference / divisors[unit]);
};

/**
 * 计算工作日差（排除周末）
 */
export const calculateBusinessDays = (startDate: Date | string, endDate: Date | string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let businessDays = 0;

  const currentDate = new Date(start);
  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // 0=Sunday, 6=Saturday
      businessDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return businessDays;
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
};
