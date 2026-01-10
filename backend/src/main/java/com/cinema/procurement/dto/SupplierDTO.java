/**
 * @spec N001-purchase-inbound
 * 供应商数据传输对象
 */
package com.cinema.procurement.dto;

import java.util.UUID;

public class SupplierDTO {

    private UUID id;
    private String code;
    private String name;
    private String contactName;
    private String contactPhone;
    private String status;

    public SupplierDTO() {}

    public SupplierDTO(UUID id, String code, String name, String contactName, String contactPhone, String status) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.contactName = contactName;
        this.contactPhone = contactPhone;
        this.status = status;
    }

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

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
