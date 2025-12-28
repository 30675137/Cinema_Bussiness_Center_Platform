/**
 * Store Types for C端 Taro
 *
 * 门店类型定义，用于 C端小程序/H5 展示门店信息
 *
 * @since 020-store-address
 * @author Cinema Platform
 */

/**
 * 门店状态
 */
export type StoreStatus = 'active' | 'inactive';

/**
 * 门店接口
 */
export interface Store {
  id: string;
  code: string;
  name: string;
  province?: string;        // 省份
  city?: string;            // 城市
  district?: string;        // 区县
  address?: string;         // 详细地址
  phone?: string;           // 联系电话
  addressSummary?: string;  // 地址摘要（派生字段）
  status: StoreStatus;
}

/**
 * 格式化完整地址
 * 将省市区+详细地址拼接为完整地址字符串
 *
 * @param store 门店对象
 * @returns 完整地址字符串，如 "北京市北京市朝阳区建国路88号"
 */
export function formatFullAddress(store: Store): string {
  const parts = [
    store.province,
    store.city,
    store.district,
    store.address
  ].filter(Boolean);
  return parts.join('');
}

/**
 * 格式化展示地址（省市区，不含详细地址）
 *
 * @param store 门店对象
 * @returns 展示地址，如 "北京市 朝阳区"
 */
export function formatDisplayAddress(store: Store): string {
  const parts = [
    store.city,
    store.district
  ].filter(Boolean);
  return parts.join(' ');
}

/**
 * 检查门店是否有完整地址
 *
 * @param store 门店对象
 * @returns 是否有完整地址（省市区都有值）
 */
export function hasCompleteAddress(store: Store): boolean {
  return !!(store.province && store.city && store.district);
}

/**
 * 检查门店是否有联系电话
 *
 * @param store 门店对象
 * @returns 是否有电话
 */
export function hasPhone(store: Store): boolean {
  return !!store.phone;
}
