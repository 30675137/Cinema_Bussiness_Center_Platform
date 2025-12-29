package com.cinema.hallstore.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * PhoneValidator 单元测试
 *
 * @since 020-store-address
 */
@DisplayName("PhoneValidator 电话号码验证")
class PhoneValidatorTest {

    @Nested
    @DisplayName("isValid() 通用验证")
    class IsValidTests {

        @ParameterizedTest
        @NullAndEmptySource
        @DisplayName("空值和null应该返回true（选填字段）")
        void shouldReturnTrueForNullAndEmpty(String phone) {
            assertThat(PhoneValidator.isValid(phone)).isTrue();
        }

        @ParameterizedTest
        @ValueSource(strings = {
            "13800138000",   // 手机号
            "13912345678",   // 手机号
            "18888888888",   // 手机号
            "010-12345678",  // 北京座机
            "021-87654321",  // 上海座机
            "0755-12345678", // 深圳座机
            "02112345678",   // 座机无连字符
            "400-123-4567",  // 400热线
            "4001234567",    // 400热线无连字符
            "400-1234567"    // 400热线部分连字符
        })
        @DisplayName("有效电话号码应该返回true")
        void shouldReturnTrueForValidPhones(String phone) {
            assertThat(PhoneValidator.isValid(phone)).isTrue();
        }

        @ParameterizedTest
        @ValueSource(strings = {
            "12345678901",   // 不以1开头的11位
            "1380013800",    // 10位手机号
            "138001380001",  // 12位手机号
            "abc12345678",   // 包含字母
            "12-34567890",   // 无效区号
            "500-123-4567",  // 非400热线
            "phone",         // 纯文本
            "123",           // 太短
            "1234567890123456" // 太长
        })
        @DisplayName("无效电话号码应该返回false")
        void shouldReturnFalseForInvalidPhones(String phone) {
            assertThat(PhoneValidator.isValid(phone)).isFalse();
        }
    }

    @Nested
    @DisplayName("isMobile() 手机号验证")
    class IsMobileTests {

        @ParameterizedTest
        @ValueSource(strings = {
            "13800138000",
            "13912345678",
            "14712345678",
            "15012345678",
            "16612345678",
            "17712345678",
            "18812345678",
            "19912345678"
        })
        @DisplayName("有效手机号应该返回true")
        void shouldReturnTrueForValidMobile(String phone) {
            assertThat(PhoneValidator.isMobile(phone)).isTrue();
        }

        @ParameterizedTest
        @ValueSource(strings = {
            "12345678901",   // 不以1开头
            "10812345678",   // 第二位是0
            "11812345678",   // 第二位是1
            "12812345678",   // 第二位是2
            "010-12345678",  // 座机
            "400-123-4567"   // 400热线
        })
        @DisplayName("非手机号应该返回false")
        void shouldReturnFalseForNonMobile(String phone) {
            assertThat(PhoneValidator.isMobile(phone)).isFalse();
        }

        @Test
        @DisplayName("空值应该返回false")
        void shouldReturnFalseForEmpty() {
            assertThat(PhoneValidator.isMobile(null)).isFalse();
            assertThat(PhoneValidator.isMobile("")).isFalse();
        }
    }

    @Nested
    @DisplayName("isLandline() 座机验证")
    class IsLandlineTests {

        @ParameterizedTest
        @ValueSource(strings = {
            "010-12345678",
            "021-87654321",
            "0755-12345678",
            "02112345678",
            "075512345678"
        })
        @DisplayName("有效座机应该返回true")
        void shouldReturnTrueForValidLandline(String phone) {
            assertThat(PhoneValidator.isLandline(phone)).isTrue();
        }

        @ParameterizedTest
        @ValueSource(strings = {
            "13800138000",   // 手机号
            "400-123-4567",  // 400热线
            "12-34567890",   // 无效区号
            "10-12345678"    // 区号不以0开头
        })
        @DisplayName("非座机应该返回false")
        void shouldReturnFalseForNonLandline(String phone) {
            assertThat(PhoneValidator.isLandline(phone)).isFalse();
        }
    }

    @Nested
    @DisplayName("isHotline() 400热线验证")
    class IsHotlineTests {

        @ParameterizedTest
        @ValueSource(strings = {
            "400-123-4567",
            "4001234567",
            "400-1234567"
        })
        @DisplayName("有效400热线应该返回true")
        void shouldReturnTrueForValidHotline(String phone) {
            assertThat(PhoneValidator.isHotline(phone)).isTrue();
        }

        @ParameterizedTest
        @ValueSource(strings = {
            "13800138000",   // 手机号
            "010-12345678",  // 座机
            "500-123-4567",  // 非400开头
            "800-123-4567"   // 800开头
        })
        @DisplayName("非400热线应该返回false")
        void shouldReturnFalseForNonHotline(String phone) {
            assertThat(PhoneValidator.isHotline(phone)).isFalse();
        }
    }

    @Nested
    @DisplayName("getPhoneType() 电话类型识别")
    class GetPhoneTypeTests {

        @Test
        @DisplayName("应该正确识别手机号")
        void shouldIdentifyMobile() {
            assertThat(PhoneValidator.getPhoneType("13800138000")).isEqualTo("手机");
        }

        @Test
        @DisplayName("应该正确识别座机")
        void shouldIdentifyLandline() {
            assertThat(PhoneValidator.getPhoneType("010-12345678")).isEqualTo("座机");
        }

        @Test
        @DisplayName("应该正确识别400热线")
        void shouldIdentifyHotline() {
            assertThat(PhoneValidator.getPhoneType("400-123-4567")).isEqualTo("400热线");
        }

        @Test
        @DisplayName("无效电话应该返回未知")
        void shouldReturnUnknownForInvalid() {
            assertThat(PhoneValidator.getPhoneType("invalid")).isEqualTo("未知");
        }

        @Test
        @DisplayName("空值应该返回未知")
        void shouldReturnUnknownForEmpty() {
            assertThat(PhoneValidator.getPhoneType(null)).isEqualTo("未知");
            assertThat(PhoneValidator.getPhoneType("")).isEqualTo("未知");
        }
    }
}
