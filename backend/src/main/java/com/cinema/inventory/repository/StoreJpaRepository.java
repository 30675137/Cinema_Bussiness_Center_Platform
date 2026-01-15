/**
 * @spec N001-purchase-inbound
 * Store JPA Repository for procurement module
 *
 * Purpose: Data access layer for stores (read-only for procurement queries)
 */

package com.cinema.inventory.repository;

import com.cinema.inventory.entity.StoreEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * Store JPA Repository
 *
 * Provides data access methods for store queries.
 * Read-only repository for procurement and inventory modules.
 */
@Repository
public interface StoreJpaRepository extends JpaRepository<StoreEntity, UUID> {

}
