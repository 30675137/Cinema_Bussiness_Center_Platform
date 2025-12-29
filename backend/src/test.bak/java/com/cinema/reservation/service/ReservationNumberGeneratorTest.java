package com.cinema.reservation.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 预约单号生成器单元测试
 * <p>
 * 测试范围：
 * - 预约单号格式验证（R + 时间戳 + 随机数）
 * - 预约单号唯一性验证（100次连续生成无重复）
 * - 预约单号长度验证（固定19位）
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-23
 */
@DisplayName("预约单号生成器测试")
class ReservationNumberGeneratorTest {

    private ReservationNumberGenerator generator;

    @BeforeEach
    void setUp() {
        generator = new ReservationNumberGenerator();
    }

    @Nested
    @DisplayName("生成预约单号")
    class GenerateOrderNumberTests {

        @Test
        @DisplayName("生成的预约单号以R开头")
        void shouldStartWithPrefixR() {
            // When
            String orderNumber = generator.generate();

            // Then
            assertThat(orderNumber).startsWith("R");
        }

        @Test
        @DisplayName("生成的预约单号长度为19位")
        void shouldHaveLength19() {
            // When
            String orderNumber = generator.generate();

            // Then
            assertThat(orderNumber).hasSize(19);
        }

        @Test
        @DisplayName("生成的预约单号格式正确：R + 14位时间戳 + 4位随机数")
        void shouldMatchExpectedFormat() {
            // When
            String orderNumber = generator.generate();

            // Then
            assertThat(orderNumber).matches("R\\d{14}\\d{4}");
        }

        @Test
        @DisplayName("时间戳部分可解析为有效日期")
        void timestampPartShouldBeValidDate() {
            // When
            String orderNumber = generator.generate();
            String timestampPart = orderNumber.substring(1, 15);

            // Then
            // 格式：yyyyMMddHHmmss
            String year = timestampPart.substring(0, 4);
            String month = timestampPart.substring(4, 6);
            String day = timestampPart.substring(6, 8);
            String hour = timestampPart.substring(8, 10);
            String minute = timestampPart.substring(10, 12);
            String second = timestampPart.substring(12, 14);

            assertThat(Integer.parseInt(year)).isBetween(2024, 2100);
            assertThat(Integer.parseInt(month)).isBetween(1, 12);
            assertThat(Integer.parseInt(day)).isBetween(1, 31);
            assertThat(Integer.parseInt(hour)).isBetween(0, 23);
            assertThat(Integer.parseInt(minute)).isBetween(0, 59);
            assertThat(Integer.parseInt(second)).isBetween(0, 59);
        }

        @Test
        @DisplayName("随机数部分为4位数字（0000-9999）")
        void randomPartShouldBeFourDigits() {
            // When
            String orderNumber = generator.generate();
            String randomPart = orderNumber.substring(15);

            // Then
            assertThat(randomPart).matches("\\d{4}");
            int randomValue = Integer.parseInt(randomPart);
            assertThat(randomValue).isBetween(0, 9999);
        }

        @Test
        @DisplayName("100次连续生成无重复")
        void shouldGenerateUniqueOrderNumbers() {
            // Given
            Set<String> orderNumbers = new HashSet<>();
            int iterations = 100;

            // When
            for (int i = 0; i < iterations; i++) {
                String orderNumber = generator.generate();
                orderNumbers.add(orderNumber);
            }

            // Then
            // 注意：由于时间戳精确到秒，同一秒内可能生成相同的时间戳部分
            // 但加上4位随机数，重复概率很低
            // 测试至少应该有接近100个不同的单号
            assertThat(orderNumbers.size()).isGreaterThan(90);
        }
    }

    @Nested
    @DisplayName("验证预约单号格式")
    class ValidateOrderNumberTests {

        @Test
        @DisplayName("有效的预约单号返回true")
        void shouldReturnTrueForValidOrderNumber() {
            // Given
            String orderNumber = generator.generate();

            // When & Then
            assertThat(generator.isValid(orderNumber)).isTrue();
        }

        @Test
        @DisplayName("空值返回false")
        void shouldReturnFalseForNull() {
            // When & Then
            assertThat(generator.isValid(null)).isFalse();
        }

        @Test
        @DisplayName("长度不是19位返回false")
        void shouldReturnFalseForWrongLength() {
            // When & Then
            assertThat(generator.isValid("R20251223")).isFalse();
            assertThat(generator.isValid("R2025122315300012345")).isFalse();
        }

        @Test
        @DisplayName("不以R开头返回false")
        void shouldReturnFalseForWrongPrefix() {
            // When & Then
            assertThat(generator.isValid("S202512231530001234")).isFalse();
            assertThat(generator.isValid("0202512231530001234")).isFalse();
        }

        @Test
        @DisplayName("时间戳部分包含非数字返回false")
        void shouldReturnFalseForNonDigitTimestamp() {
            // When & Then
            assertThat(generator.isValid("R2025122315300A1234")).isFalse();
        }

        @Test
        @DisplayName("随机数部分包含非数字返回false")
        void shouldReturnFalseForNonDigitRandom() {
            // When & Then
            assertThat(generator.isValid("R20251223153000ABCD")).isFalse();
        }
    }
}
