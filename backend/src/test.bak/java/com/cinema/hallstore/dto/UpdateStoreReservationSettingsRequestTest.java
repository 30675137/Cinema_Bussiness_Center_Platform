package com.cinema.hallstore.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

/**
 * UpdateStoreReservationSettingsRequest 验证测试
 * 验证 Bean Validation 注解的正确性
 */
class UpdateStoreReservationSettingsRequestTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Nested
    @DisplayName("maxReservationDays 范围验证测试")
    class MaxReservationDaysRangeTests {

        @Test
        @DisplayName("可预约天数在有效范围内（1-365）应该通过验证")
        void shouldPassWhenDaysInValidRange() {
            // Given
            UpdateStoreReservationSettingsRequest request = new UpdateStoreReservationSettingsRequest();
            request.setIsReservationEnabled(true);
            request.setMaxReservationDays(7);

            // When
            Set<ConstraintViolation<UpdateStoreReservationSettingsRequest>> violations = validator.validate(request);

            // Then
            assertTrue(violations.isEmpty());
        }

        @Test
        @DisplayName("可预约天数为0且未开启预约应该通过验证")
        void shouldPassWhenDaysIsZeroAndDisabled() {
            // Given
            UpdateStoreReservationSettingsRequest request = new UpdateStoreReservationSettingsRequest();
            request.setIsReservationEnabled(false);
            request.setMaxReservationDays(0);

            // When
            Set<ConstraintViolation<UpdateStoreReservationSettingsRequest>> violations = validator.validate(request);

            // Then
            assertTrue(violations.isEmpty());
        }

        @Test
        @DisplayName("可预约天数小于1应该失败")
        void shouldFailWhenDaysLessThanOne() {
            // Given
            UpdateStoreReservationSettingsRequest request = new UpdateStoreReservationSettingsRequest();
            request.setIsReservationEnabled(true);
            request.setMaxReservationDays(0); // Invalid when enabled

            // When
            Set<ConstraintViolation<UpdateStoreReservationSettingsRequest>> violations = validator.validate(request);

            // Then
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("maxReservationDays")));
        }

        @Test
        @DisplayName("可预约天数大于365应该失败")
        void shouldFailWhenDaysGreaterThan365() {
            // Given
            UpdateStoreReservationSettingsRequest request = new UpdateStoreReservationSettingsRequest();
            request.setIsReservationEnabled(true);
            request.setMaxReservationDays(366); // Invalid: exceeds max

            // When
            Set<ConstraintViolation<UpdateStoreReservationSettingsRequest>> violations = validator.validate(request);

            // Then
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream().anyMatch(v -> 
                v.getPropertyPath().toString().equals("maxReservationDays") &&
                v.getMessage().contains("365")
            ));
        }

        @Test
        @DisplayName("可预约天数为负数应该失败")
        void shouldFailWhenDaysIsNegative() {
            // Given
            UpdateStoreReservationSettingsRequest request = new UpdateStoreReservationSettingsRequest();
            request.setIsReservationEnabled(true);
            request.setMaxReservationDays(-1); // Invalid: negative

            // When
            Set<ConstraintViolation<UpdateStoreReservationSettingsRequest>> violations = validator.validate(request);

            // Then
            assertFalse(violations.isEmpty());
        }
    }

    @Nested
    @DisplayName("isReservationEnabled 验证测试")
    class IsReservationEnabledTests {

        @Test
        @DisplayName("isReservationEnabled为null应该失败")
        void shouldFailWhenIsReservationEnabledIsNull() {
            // Given
            UpdateStoreReservationSettingsRequest request = new UpdateStoreReservationSettingsRequest();
            request.setIsReservationEnabled(null);
            request.setMaxReservationDays(7);

            // When
            Set<ConstraintViolation<UpdateStoreReservationSettingsRequest>> violations = validator.validate(request);

            // Then
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("isReservationEnabled")));
        }
    }

    @Nested
    @DisplayName("自定义验证测试 - isValidMaxReservationDays")
    class CustomValidationTests {

        @Test
        @DisplayName("开启预约时maxReservationDays必须大于0")
        void shouldFailWhenEnabledButDaysIsZero() {
            // Given
            UpdateStoreReservationSettingsRequest request = new UpdateStoreReservationSettingsRequest();
            request.setIsReservationEnabled(true);
            request.setMaxReservationDays(0); // Invalid: enabled but days is 0

            // When
            Set<ConstraintViolation<UpdateStoreReservationSettingsRequest>> violations = validator.validate(request);

            // Then
            assertFalse(violations.isEmpty());
            // @AssertTrue validation should catch this
            assertTrue(violations.stream().anyMatch(v -> 
                v.getPropertyPath().toString().equals("validMaxReservationDays") ||
                v.getMessage().contains("开启预约时必须设置可预约天数")
            ));
        }

        @Test
        @DisplayName("未开启预约时maxReservationDays可以为0")
        void shouldPassWhenDisabledAndDaysIsZero() {
            // Given
            UpdateStoreReservationSettingsRequest request = new UpdateStoreReservationSettingsRequest();
            request.setIsReservationEnabled(false);
            request.setMaxReservationDays(0);

            // When
            Set<ConstraintViolation<UpdateStoreReservationSettingsRequest>> violations = validator.validate(request);

            // Then
            assertTrue(violations.isEmpty());
        }

        @Test
        @DisplayName("开启预约时maxReservationDays为null应该失败")
        void shouldFailWhenEnabledButDaysIsNull() {
            // Given
            UpdateStoreReservationSettingsRequest request = new UpdateStoreReservationSettingsRequest();
            request.setIsReservationEnabled(true);
            request.setMaxReservationDays(null); // Invalid: enabled but days is null

            // When
            Set<ConstraintViolation<UpdateStoreReservationSettingsRequest>> violations = validator.validate(request);

            // Then
            assertFalse(violations.isEmpty());
        }
    }
}

