# Development Quickstart: BOM配方库存预占与扣料

**Feature**: P005-bom-inventory-deduction
**Branch**: `P005-bom-inventory-deduction`
**Date**: 2025-12-29

---

## Overview

This guide helps you set up the development environment and understand the core implementation flow for BOM-based inventory reservation and deduction.

---

## Prerequisites

### Required Tools
- **Java 21** + **Maven 3.9+** (backend)
- **Node.js 20+** + **npm 10+** (frontend)
- **PostgreSQL 15+** (Supabase locally) or Supabase account
- **Git** for version control

### Knowledge Requirements
- Spring Boot 3.x basics (transaction management, JPA)
- React 19 + TypeScript 5.9
- Taro 3.x basics (for C端 integration)
- PostgreSQL/SQL fundamentals

---

## Environment Setup

### 1. Clone and Switch to Feature Branch

```bash
git clone <repository-url>
cd Cinema_Bussiness_Center_Platform
git fetch origin
git checkout P005-bom-inventory-deduction
```

### 2. Database Setup (Supabase)

#### Option A: Use Existing Supabase Project

1. Set environment variables:
```bash
export SUPABASE_URL="https://<your-project>.supabase.co"
export SUPABASE_ANON_KEY="<your-anon-key>"
export SUPABASE_SERVICE_KEY="<your-service-role-key>"
```

2. Run migration scripts:
```bash
# Navigate to migration directory
cd backend/src/main/resources/db/migration

# Apply P005 migrations
psql $SUPABASE_URL \
  -c "$(cat V054__add_inventory_reserved_quantity.sql)"
psql $SUPABASE_URL \
  -c "$(cat V055__create_inventory_reservations.sql)"
psql $SUPABASE_URL \
  -c "$(cat V056__create_bom_snapshots.sql)"
psql $SUPABASE_URL \
  -c "$(cat V057__extend_inventory_transactions.sql)"
```

#### Option B: Local PostgreSQL Setup

1. Create database:
```bash
createdb cinema_platform
```

2. Run all migrations including P005:
```bash
cd backend
./mvnw flyway:migrate
```

### 3. Backend Setup

```bash
cd backend

# Configure application.yml
cat > src/main/resources/application-local.yml <<EOF
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/cinema_platform
    username: postgres
    password: <your-password>
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true

supabase:
  url: \${SUPABASE_URL}
  anon-key: \${SUPABASE_ANON_KEY}

logging:
  level:
    com.cinema.inventory: DEBUG
    org.springframework.transaction: DEBUG
EOF

# Build and run
./mvnw clean install
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

Backend will start on `http://localhost:8080`

### 4. Frontend Setup (B端 - Inventory Transaction Log Viewer)

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cat > .env.local <<EOF
VITE_API_BASE_URL=http://localhost:8080/api
VITE_ENABLE_MOCK=false
EOF

# Start development server
npm run dev
```

Frontend will start on `http://localhost:5173`

### 5. C端 Setup (Taro - Order Placement)

```bash
cd hall-reserve-taro

# Install dependencies
npm install

# Configure environment
cat > .env.local <<EOF
TARO_APP_API=http://localhost:8080/api
EOF

# Start H5 development
npm run dev:h5

# OR start WeChat mini-program development
npm run dev:weapp
```

H5 will start on `http://localhost:10086`

---

## Key Implementation Files

### Backend (Java)

```
backend/src/main/java/com/cinema/inventory/
├── controller/
│   ├── InventoryReservationController.java    # POST /api/inventory/reservations
│   ├── InventoryDeductionController.java      # POST /api/inventory/deductions
│   └── InventoryTransactionController.java    # GET /api/inventory/transactions
├── service/
│   ├── BomExpansionService.java               # BOM recursive expansion logic
│   ├── InventoryReservationService.java       # Reservation business logic
│   ├── InventoryDeductionService.java         # Deduction business logic
│   └── InventoryTransactionService.java       # Transaction log query
├── repository/
│   ├── InventoryRepository.java               # Inventory data access (with FOR UPDATE)
│   ├── InventoryReservationRepository.java    # Reservation data access
│   ├── BomSnapshotRepository.java             # BOM snapshot data access
│   └── InventoryTransactionRepository.java    # Transaction log data access
├── dto/
│   ├── ReservationRequest.java
│   ├── ReservationResponse.java
│   ├── DeductionRequest.java
│   ├── DeductionResponse.java
│   └── TransactionQueryRequest.java
├── exception/
│   ├── InsufficientInventoryException.java
│   ├── ReservationNotFoundException.java
│   └── InventoryErrorCode.java (enum)
└── config/
    └── TransactionConfig.java                 # Transaction isolation level config
```

### Frontend B端 (TypeScript + React)

```
frontend/src/features/inventory-management/
├── components/
│   ├── InventoryTransactionList.tsx          # Transaction log table component
│   ├── TransactionDetailDrawer.tsx           # Drawer showing BOM components
│   ├── TransactionTypeFilter.tsx             # Filter by BOM_DEDUCTION, etc.
│   └── BomComponentsTable.tsx                # Display BOM component breakdown
├── hooks/
│   ├── useInventoryTransactions.ts           # TanStack Query hook
│   └── useTransactionDetail.ts               # Hook for transaction details
├── services/
│   └── inventoryTransactionService.ts        # API client
├── types/
│   └── inventoryTransaction.ts               # TypeScript interfaces
└── pages/
    └── InventoryTransactionLogPage.tsx       # Main page
```

### Frontend C端 (Taro + TypeScript)

```
hall-reserve-taro/src/
├── pages/order/
│   ├── create/
│   │   └── index.tsx                         # Order creation page (calls reservation API)
│   └── fulfillment/
│       └── index.tsx                         # Fulfillment confirmation (calls deduction API)
├── services/
│   └── inventoryService.ts                   # Inventory API client (Taro.request wrapper)
└── utils/
    └── errorHandler.ts                       # Error code handling utility
```

---

## Core Development Flows

### Flow 1: Order Reservation (预占)

**Triggered by**: Customer places order in C端 Taro app or B端 POS system

**Backend Flow**:

```java
/**
 * @spec P005-bom-inventory-deduction
 * 库存预占服务
 */
@Service
public class InventoryReservationService {

    @Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class)
    public ReservationResponse reserveInventory(ReservationRequest request) {
        // Step 1: Expand BOM to calculate material requirements
        List<MaterialRequirement> materials = bomExpansionService.expandBom(
            request.getOrderId(),
            request.getItems()
        );

        // Step 2: Check and lock inventory (row-level locking)
        for (MaterialRequirement material : materials) {
            Inventory inventory = inventoryRepository.findByStoreIdAndSkuIdForUpdate(
                request.getStoreId(),
                material.getSkuId()
            );

            BigDecimal available = inventory.getCurrentQuantity()
                .subtract(inventory.getReservedQuantity());

            if (available.compareTo(material.getQuantity()) < 0) {
                throw new InsufficientInventoryException(
                    buildShortageDetails(material, available)
                );
            }

            // Increase reserved_quantity
            inventory.setReservedQuantity(
                inventory.getReservedQuantity().add(material.getQuantity())
            );
            inventoryRepository.save(inventory);
        }

        // Step 3: Create reservation records
        List<InventoryReservation> reservations = materials.stream()
            .map(material -> InventoryReservation.builder()
                .orderId(request.getOrderId())
                .storeId(request.getStoreId())
                .skuId(material.getSkuId())
                .reservedQuantity(material.getQuantity())
                .status(ReservationStatus.ACTIVE)
                .build())
            .toList();

        reservationRepository.saveAll(reservations);

        // Step 4: Create BOM snapshots
        bomSnapshotService.createSnapshots(request.getOrderId(), request.getItems());

        // Transaction commits: reserved_quantity updated + reservations created atomically
        return buildReservationResponse(reservations);
    }
}
```

**Frontend C端 Flow**:

```typescript
/**
 * @spec P005-bom-inventory-deduction
 * 订单创建前预占库存
 */
import Taro from '@tarojs/taro';

export async function createOrderWithReservation(orderItems: OrderItem[]) {
  try {
    // Step 1: Reserve inventory
    const reservationResponse = await Taro.request<ReservationResponse>({
      url: `${API_BASE}/inventory/reservations`,
      method: 'POST',
      data: {
        orderId: generateOrderId(),
        storeId: getCurrentStoreId(),
        items: orderItems
      },
      header: {
        'Authorization': `Bearer ${getToken()}`
      }
    });

    if (!reservationResponse.data.success) {
      throw new Error(reservationResponse.data.message);
    }

    // Step 2: Create order (inventory already reserved)
    const orderResponse = await Taro.request({
      url: `${API_BASE}/orders`,
      method: 'POST',
      data: {
        id: reservationResponse.data.data.orderId,
        items: orderItems,
        status: 'PENDING_FULFILLMENT'
      }
    });

    Taro.showToast({
      title: '下单成功',
      icon: 'success'
    });

    return orderResponse.data;

  } catch (error) {
    // Handle inventory shortage errors
    if (error.error === 'INV_BIZ_001') {
      const shortages = error.details.shortages;
      Taro.showModal({
        title: '库存不足',
        content: shortages.map(s =>
          `${s.skuName}: 需要${s.required}${s.unit}, 可用${s.available}${s.unit}`
        ).join('\n'),
        showCancel: false
      });
    } else {
      Taro.showToast({
        title: '下单失败: ' + error.message,
        icon: 'error'
      });
    }
    throw error;
  }
}
```

### Flow 2: Order Fulfillment (实扣)

**Triggered by**: Bartender/kitchen confirms order completion

**Backend Flow**:

```java
/**
 * @spec P005-bom-inventory-deduction
 * 库存实扣服务
 */
@Service
public class InventoryDeductionService {

    @Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class)
    public DeductionResponse deductInventory(DeductionRequest request) {
        // Step 1: Load BOM snapshots created at reservation time
        List<BomSnapshot> snapshots = bomSnapshotRepository.findByOrderId(request.getOrderId());

        // Step 2: Lock and deduct inventory
        List<DeductedComponent> deductedComponents = new ArrayList<>();

        for (BomSnapshot snapshot : snapshots) {
            for (BomComponent component : snapshot.getComponents()) {
                Inventory inventory = inventoryRepository.findByStoreIdAndSkuIdForUpdate(
                    snapshot.getStoreId(),
                    component.getSkuId()
                );

                BigDecimal deductionQuantity = calculateDeductionQuantity(
                    component,
                    request.getAdjustments()
                );

                // Validate current inventory sufficient
                if (inventory.getCurrentQuantity().compareTo(deductionQuantity) < 0) {
                    throw new InsufficientCurrentInventoryException(
                        component.getSkuId(),
                        inventory.getCurrentQuantity(),
                        deductionQuantity
                    );
                }

                BigDecimal quantityBefore = inventory.getCurrentQuantity();

                // Deduct current_quantity
                inventory.setCurrentQuantity(
                    inventory.getCurrentQuantity().subtract(deductionQuantity)
                );

                // Release reserved_quantity
                inventory.setReservedQuantity(
                    inventory.getReservedQuantity().subtract(deductionQuantity)
                );

                inventoryRepository.save(inventory);

                // Create transaction log
                InventoryTransaction transaction = InventoryTransaction.builder()
                    .storeId(snapshot.getStoreId())
                    .skuId(component.getSkuId())
                    .transactionType(TransactionType.BOM_DEDUCTION)
                    .quantity(deductionQuantity.negate()) // Negative for deduction
                    .quantityBefore(quantityBefore)
                    .quantityAfter(inventory.getCurrentQuantity())
                    .relatedOrderId(request.getOrderId())
                    .bomSnapshotId(snapshot.getId())
                    .operatorId(request.getOperatorId())
                    .build();

                transactionRepository.save(transaction);

                deductedComponents.add(new DeductedComponent(
                    component.getSkuId(),
                    component.getSkuName(),
                    deductionQuantity,
                    quantityBefore,
                    inventory.getCurrentQuantity()
                ));
            }
        }

        // Step 3: Update reservation status
        reservationRepository.updateStatusByOrderId(
            request.getOrderId(),
            ReservationStatus.FULFILLED
        );

        // Transaction commits: inventory deducted + reservations fulfilled + logs created
        return buildDeductionResponse(request.getOrderId(), deductedComponents);
    }
}
```

**Frontend C端 Flow**:

```typescript
/**
 * @spec P005-bom-inventory-deduction
 * 出品确认实扣库存
 */
export async function confirmFulfillment(orderId: string) {
  try {
    const response = await Taro.request<DeductionResponse>({
      url: `${API_BASE}/inventory/deductions`,
      method: 'POST',
      data: {
        orderId,
        operatorId: getCurrentUserId()
      },
      header: {
        'Authorization': `Bearer ${getToken()}`
      }
    });

    if (!response.data.success) {
      throw response.data;
    }

    Taro.showToast({
      title: '出品确认成功',
      icon: 'success'
    });

    return response.data;

  } catch (error) {
    if (error.error === 'INV_BIZ_002') {
      // Insufficient current inventory - data inconsistency
      Taro.showModal({
        title: '库存异常',
        content: `${error.details.skuName}库存不足，请联系管理员处理`,
        showCancel: false
      });
      // Trigger admin alert
      notifyAdmin(error);
    } else {
      Taro.showToast({
        title: '出品确认失败: ' + error.message,
        icon: 'error'
      });
    }
    throw error;
  }
}
```

### Flow 3: View Transaction Logs (B端)

**Backend Flow**:

```java
/**
 * @spec P005-bom-inventory-deduction
 * 库存流水查询服务
 */
@Service
public class InventoryTransactionService {

    public Page<InventoryTransactionDTO> queryTransactions(TransactionQueryRequest request) {
        // Build dynamic query with filters
        Specification<InventoryTransaction> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("storeId"), request.getStoreId()));

            if (request.getTransactionType() != null) {
                predicates.add(cb.equal(root.get("transactionType"), request.getTransactionType()));
            }

            if (request.getSkuId() != null) {
                predicates.add(cb.equal(root.get("skuId"), request.getSkuId()));
            }

            if (request.getOrderId() != null) {
                predicates.add(cb.equal(root.get("relatedOrderId"), request.getOrderId()));
            }

            if (request.getStartDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("operatedAt"), request.getStartDate()));
            }

            if (request.getEndDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("operatedAt"), request.getEndDate()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Pageable pageable = PageRequest.of(
            request.getPage() - 1,
            request.getPageSize(),
            Sort.by(Sort.Direction.DESC, "operatedAt")
        );

        Page<InventoryTransaction> transactions = transactionRepository.findAll(spec, pageable);

        return transactions.map(this::mapToDTO);
    }
}
```

**Frontend B端 Flow**:

```typescript
/**
 * @spec P005-bom-inventory-deduction
 * 库存流水查询页面
 */
import { useQuery } from '@tanstack/react-query';
import { Table, Select, DatePicker } from 'antd';

export const InventoryTransactionLogPage: React.FC = () => {
  const [filters, setFilters] = useState({
    storeId: getCurrentStoreId(),
    transactionType: 'BOM_DEDUCTION',
    startDate: dayjs().subtract(7, 'days'),
    endDate: dayjs()
  });

  const { data, isLoading } = useQuery({
    queryKey: ['inventory-transactions', filters],
    queryFn: () => fetchInventoryTransactions(filters),
    staleTime: 30000 // 30 seconds
  });

  const columns = [
    {
      title: 'SKU名称',
      dataIndex: 'skuName',
      key: 'skuName'
    },
    {
      title: '变动类型',
      dataIndex: 'transactionType',
      key: 'transactionType',
      render: (type: string) => {
        const typeLabels = {
          'BOM_DEDUCTION': 'BOM扣料',
          'BOM_RESERVATION': 'BOM预占',
          'RESERVATION_RELEASE': '预占释放'
        };
        return typeLabels[type] || type;
      }
    },
    {
      title: '变动数量',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (qty: number) => (
        <span style={{ color: qty > 0 ? 'green' : 'red' }}>
          {qty > 0 ? '+' : ''}{qty}
        </span>
      )
    },
    {
      title: '关联订单',
      dataIndex: 'relatedOrderId',
      key: 'relatedOrderId',
      render: (orderId: string) => (
        <a onClick={() => viewOrderDetail(orderId)}>{orderId}</a>
      )
    },
    {
      title: '操作人',
      dataIndex: 'operatorName',
      key: 'operatorName'
    },
    {
      title: '操作时间',
      dataIndex: 'operatedAt',
      key: 'operatedAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <a onClick={() => viewBomDetail(record.id)}>查看BOM明细</a>
      )
    }
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Select
          value={filters.transactionType}
          onChange={(value) => setFilters({ ...filters, transactionType: value })}
          options={[
            { label: '全部', value: undefined },
            { label: 'BOM扣料', value: 'BOM_DEDUCTION' },
            { label: 'BOM预占', value: 'BOM_RESERVATION' },
            { label: '预占释放', value: 'RESERVATION_RELEASE' }
          ]}
        />
        <DatePicker.RangePicker
          value={[filters.startDate, filters.endDate]}
          onChange={([start, end]) => setFilters({ ...filters, startDate: start, endDate: end })}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={data?.data || []}
        loading={isLoading}
        pagination={{
          total: data?.total,
          pageSize: 20,
          showSizeChanger: false
        }}
        rowKey="id"
      />
    </div>
  );
};
```

---

## Testing

### Backend Integration Tests

```bash
cd backend

# Run all tests
./mvnw test

# Run only inventory tests
./mvnw test -Dtest="com.cinema.inventory.**"

# Run specific test class
./mvnw test -Dtest="InventoryReservationServiceTest"
```

### Frontend Tests

```bash
cd frontend

# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Run tests with coverage
npm run test:coverage
```

### Manual API Testing

Use the Postman collection in `specs/P005-bom-inventory-deduction/postman/`:

1. Import collection: `P005-bom-inventory-deduction.postman_collection.json`
2. Import environment: `P005-local.postman_environment.json`
3. Set `baseUrl` and `token` in environment variables
4. Run tests in order:
   - Create Reservation
   - Query Reservations
   - Deduct Inventory
   - Query Transactions
   - Release Reservation

---

## Troubleshooting

### Issue: "Lock acquisition timeout"

**Symptom**: `INV_SYS_004` error during high concurrency

**Solution**:
1. Check for long-running transactions blocking inventory table
2. Verify database connection pool size (increase if needed)
3. Review transaction isolation level configuration

### Issue: "Insufficient current inventory for deduction"

**Symptom**: `INV_BIZ_002` error when fulfilling order

**Root Cause**: Manual inventory adjustment between reservation and fulfillment

**Solution**:
1. Check inventory adjustment logs for the SKU
2. Verify data consistency: `current_quantity >= reserved_quantity`
3. Run data consistency check script:
```sql
SELECT * FROM inventory
WHERE current_quantity < reserved_quantity;
```

### Issue: "BOM depth exceeds maximum"

**Symptom**: `INV_BIZ_004` error during reservation

**Root Cause**: Combo product has >3 nesting levels

**Solution**:
1. Review BOM formula configuration in P001
2. Simplify combo structure or split into multiple products
3. Adjust MAX_DEPTH constant if business requires deeper nesting (not recommended)

---

## Next Steps

1. ✅ Complete database migrations
2. ✅ Implement backend services (ReservationService, DeductionService)
3. ✅ Write integration tests for concurrent reservation scenarios
4. ✅ Implement B端 transaction log viewer
5. ✅ Integrate C端 order creation flow
6. ✅ Add Postman collection for API testing
7. ✅ Configure monitoring and alerting for inventory inconsistencies

---

**Quickstart Guide Complete** ✅
