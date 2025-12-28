package com.cinema.hallstore.validator;

import com.cinema.hallstore.exception.StoreNameConflictException;
import com.cinema.hallstore.repository.StoreRepository;
import org.springframework.stereotype.Component;

import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Validator for store business rules
 * 
 * @since 022-store-crud
 */
@Component
public class StoreValidator {

    /**
     * Phone number pattern supporting:
     * - Mobile: 11 digits starting with 1 (e.g., 13912345678)
     * - Landline: area code + number (e.g., 010-12345678, 0755-1234567)
     */
    private static final Pattern PHONE_PATTERN = Pattern.compile("^(1[3-9]\\d{9}|0\\d{2,3}-\\d{7,8})$");

    private final StoreRepository storeRepository;

    public StoreValidator(StoreRepository storeRepository) {
        this.storeRepository = storeRepository;
    }

    /**
     * Validate store name uniqueness for create operation
     * 
     * @param name Store name to validate
     * @throws StoreNameConflictException if name already exists
     */
    public void validateNameUniqueness(String name) {
        if (name == null || name.isBlank()) {
            return;
        }
        
        String trimmedName = name.trim();
        boolean exists = storeRepository.findByNameIgnoreCase(trimmedName).isPresent();
        
        if (exists) {
            throw new StoreNameConflictException(trimmedName);
        }
    }

    /**
     * Validate store name uniqueness for update operation
     * Excludes the current store from the check
     * 
     * @param name Store name to validate
     * @param excludeId Store ID to exclude from check
     * @throws StoreNameConflictException if name already exists for another store
     */
    public void validateNameUniquenessForUpdate(String name, UUID excludeId) {
        if (name == null || name.isBlank()) {
            return;
        }
        
        String trimmedName = name.trim();
        boolean exists = storeRepository.existsByNameIgnoreCaseAndIdNot(trimmedName, excludeId);
        
        if (exists) {
            throw new StoreNameConflictException(trimmedName, 
                "门店名称已被其他门店使用: " + trimmedName);
        }
    }

    /**
     * Validate phone number format
     * 
     * @param phone Phone number to validate
     * @return true if valid, false otherwise
     */
    public boolean isValidPhoneFormat(String phone) {
        if (phone == null || phone.isBlank()) {
            return false;
        }
        return PHONE_PATTERN.matcher(phone).matches();
    }

    /**
     * Validate phone number format and throw exception if invalid
     * 
     * @param phone Phone number to validate
     * @throws IllegalArgumentException if phone format is invalid
     */
    public void validatePhoneFormat(String phone) {
        if (!isValidPhoneFormat(phone)) {
            throw new IllegalArgumentException(
                "请输入有效的电话号码(手机号11位或座机号如010-12345678)"
            );
        }
    }
}
