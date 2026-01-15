/**
 * @spec I003-inventory-query
 * Store JPA Entity for inventory module
 *
 * Purpose: JPA entity for stores table (read-only for inventory queries)
 * Maps to: stores table
 */

package com.cinema.inventory.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

/**
 * Store Entity (只读)
 * 用于库存查询时关联门店信息
 *
 * 注意：此实体仅用于库存模块的只读查询，不应直接用于门店的 CRUD 操作
 */
@Entity
@Table(name = "stores")
public class StoreEntity {

    @Id
    @Column(name = "id")
    private UUID id;

    @Column(name = "code", length = 50)
    private String code;

    @Column(name = "name", length = 200)
    private String name;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    // Getters and Setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
