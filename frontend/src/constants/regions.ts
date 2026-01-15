/**
 * Region and City Constants
 *
 * Static data for store region and city dropdown options
 * @since 022-store-crud
 */

/**
 * Region options for store form
 */
export const REGIONS = [
  { label: '华北', value: '华北' },
  { label: '华东', value: '华东' },
  { label: '华南', value: '华南' },
  { label: '华中', value: '华中' },
  { label: '西南', value: '西南' },
  { label: '西北', value: '西北' },
  { label: '东北', value: '东北' },
] as const;

/**
 * Cities mapped to regions
 */
export const CITIES: Record<string, { label: string; value: string }[]> = {
  华北: [
    { label: '北京', value: '北京' },
    { label: '天津', value: '天津' },
    { label: '石家庄', value: '石家庄' },
    { label: '太原', value: '太原' },
    { label: '呼和浩特', value: '呼和浩特' },
  ],
  华东: [
    { label: '上海', value: '上海' },
    { label: '南京', value: '南京' },
    { label: '杭州', value: '杭州' },
    { label: '合肥', value: '合肥' },
    { label: '济南', value: '济南' },
    { label: '青岛', value: '青岛' },
    { label: '苏州', value: '苏州' },
    { label: '无锡', value: '无锡' },
    { label: '宁波', value: '宁波' },
    { label: '福州', value: '福州' },
    { label: '厦门', value: '厦门' },
  ],
  华南: [
    { label: '广州', value: '广州' },
    { label: '深圳', value: '深圳' },
    { label: '东莞', value: '东莞' },
    { label: '佛山', value: '佛山' },
    { label: '珠海', value: '珠海' },
    { label: '南宁', value: '南宁' },
    { label: '海口', value: '海口' },
  ],
  华中: [
    { label: '武汉', value: '武汉' },
    { label: '长沙', value: '长沙' },
    { label: '郑州', value: '郑州' },
    { label: '洛阳', value: '洛阳' },
    { label: '南昌', value: '南昌' },
  ],
  西南: [
    { label: '成都', value: '成都' },
    { label: '重庆', value: '重庆' },
    { label: '昆明', value: '昆明' },
    { label: '贵阳', value: '贵阳' },
    { label: '拉萨', value: '拉萨' },
  ],
  西北: [
    { label: '西安', value: '西安' },
    { label: '兰州', value: '兰州' },
    { label: '西宁', value: '西宁' },
    { label: '银川', value: '银川' },
    { label: '乌鲁木齐', value: '乌鲁木齐' },
  ],
  东北: [
    { label: '沈阳', value: '沈阳' },
    { label: '大连', value: '大连' },
    { label: '长春', value: '长春' },
    { label: '哈尔滨', value: '哈尔滨' },
  ],
};

/**
 * Get cities by region
 */
export const getCitiesByRegion = (region: string) => {
  return CITIES[region] || [];
};

/**
 * Get all regions as options
 */
export const getRegionOptions = () => REGIONS;

/**
 * Province options (for detailed address)
 */
export const PROVINCES = [
  { label: '北京市', value: '北京市' },
  { label: '上海市', value: '上海市' },
  { label: '天津市', value: '天津市' },
  { label: '重庆市', value: '重庆市' },
  { label: '河北省', value: '河北省' },
  { label: '山西省', value: '山西省' },
  { label: '辽宁省', value: '辽宁省' },
  { label: '吉林省', value: '吉林省' },
  { label: '黑龙江省', value: '黑龙江省' },
  { label: '江苏省', value: '江苏省' },
  { label: '浙江省', value: '浙江省' },
  { label: '安徽省', value: '安徽省' },
  { label: '福建省', value: '福建省' },
  { label: '江西省', value: '江西省' },
  { label: '山东省', value: '山东省' },
  { label: '河南省', value: '河南省' },
  { label: '湖北省', value: '湖北省' },
  { label: '湖南省', value: '湖南省' },
  { label: '广东省', value: '广东省' },
  { label: '海南省', value: '海南省' },
  { label: '四川省', value: '四川省' },
  { label: '贵州省', value: '贵州省' },
  { label: '云南省', value: '云南省' },
  { label: '陕西省', value: '陕西省' },
  { label: '甘肃省', value: '甘肃省' },
  { label: '青海省', value: '青海省' },
  { label: '内蒙古自治区', value: '内蒙古自治区' },
  { label: '广西壮族自治区', value: '广西壮族自治区' },
  { label: '西藏自治区', value: '西藏自治区' },
  { label: '宁夏回族自治区', value: '宁夏回族自治区' },
  { label: '新疆维吾尔自治区', value: '新疆维吾尔自治区' },
  { label: '香港特别行政区', value: '香港特别行政区' },
  { label: '澳门特别行政区', value: '澳门特别行政区' },
  { label: '台湾省', value: '台湾省' },
] as const;
