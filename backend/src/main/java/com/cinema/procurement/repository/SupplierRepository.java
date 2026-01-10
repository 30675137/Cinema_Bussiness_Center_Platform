/**
 * @spec N001-purchase-inbound
 * 供应商数据访问接口
 */
package com.cinema.procurement.repository;

import com.cinema.procurement.entity.SupplierEntity;
import com.cinema.procurement.entity.SupplierStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SupplierRepository extends JpaRepository<SupplierEntity, UUID> {

    Optional<SupplierEntity> findByCode(String code);

    List<SupplierEntity> findByStatusOrderByNameAsc(SupplierStatus status);

    @Query("SELECT s FROM SupplierEntity s WHERE s.status = 'ACTIVE' ORDER BY s.name")
    List<SupplierEntity> findAllActive();
}
