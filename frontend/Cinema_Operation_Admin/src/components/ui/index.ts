// 基础UI组件导出
export { default as DataTable } from './DataTable';
export { default as FormField } from './FormField';
export { default as Card, StatCard } from './Card';

// 类型导出
export type {
  DataTableProps,
  DataTableColumn,
  DataTablePagination,
  DataTableSelection,
  DataTableActions,
} from './DataTable/types';

export type {
  FormFieldProps,
  FormFieldConfig,
  FormFieldOption,
  FormFieldRule,
  FormFieldType,
} from './FormField/types';

export type {
  CardProps,
  CardAction,
  StatCardProps,
  StatCardData,
  CardSize,
  CardVariant,
} from './Card/types';

// 重新导出Ant Design常用组件
export {
  Button,
  Input,
  Select,
  Checkbox,
  Radio,
  Switch,
  DatePicker,
  TimePicker,
  Upload,
  Modal as AntModal,
  Drawer,
  Table,
  Form,
  Card as AntCard,
  Space,
  Typography,
  Divider,
  Tag,
  Badge,
  Avatar,
  Tooltip,
  Popconfirm,
  message,
  notification,
  List as AntList,
} from 'antd';

// 导出优化的Modal组件
export {
  OptimizedModal as Modal,
  FormModal,
  ConfirmModal,
  LargeModal,
  FullScreenModal,
  ModalPresets,
} from '@/components/common/Modal';

// 导出优化的List组件
export {
  OptimizedList as List,
  StandardList,
  LargeList,
  CardList,
  ListPresets,
} from '@/components/common/List';

// 导出优化的Image组件
export {
  OptimizedImage as Image,
  ProductImage,
  ThumbnailImage,
  AvatarImage,
  BannerImage,
  ImagePresets,
} from '@/components/common/Image';

// 重新导出图标
export * from '@ant-design/icons';