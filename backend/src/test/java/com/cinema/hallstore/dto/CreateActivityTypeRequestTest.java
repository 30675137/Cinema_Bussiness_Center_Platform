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
 * CreateActivityTypeRequest DTO 验证测试
 * 验证创建活动类型请求的字段验证规则
 */
class CreateActivityTypeRequestTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Nested
    @DisplayName("名称验证测试")
    class NameValidationTests {

        @Test
        @DisplayName("名称不能为空")
        void shouldRejectEmptyName() {
            CreateActivityTypeRequest request = new CreateActivityTypeRequest();
            request.setName("");
            request.setSort(1);

            Set<ConstraintViolation<CreateActivityTypeRequest>> violations = validator.validate(request);
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("不能为空")));
        }

        @Test
        @DisplayName("名称不能为null")
        void shouldRejectNullName() {
            CreateActivityTypeRequest request = new CreateActivityTypeRequest();
            request.setName(null);
            request.setSort(1);

            Set<ConstraintViolation<CreateActivityTypeRequest>> violations = validator.validate(request);
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("不能为空")));
        }

        @Test
        @DisplayName("名称长度不能超过100个字符")
        void shouldRejectNameLongerThan100() {
            CreateActivityTypeRequest request = new CreateActivityTypeRequest();
            request.setName("a".repeat(101));
            request.setSort(1);

            Set<ConstraintViolation<CreateActivityTypeRequest>> violations = validator.validate(request);
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("100个字符")));
        }

        @Test
        @DisplayName("名称长度为100个字符时应该通过")
        void shouldAcceptNameWith100Characters() {
            CreateActivityTypeRequest request = new CreateActivityTypeRequest();
            request.setName("a".repeat(100));
            request.setSort(1);

            Set<ConstraintViolation<CreateActivityTypeRequest>> violations = validator.validate(request);
            assertTrue(violations.isEmpty());
        }
    }

    @Nested
    @DisplayName("描述验证测试")
    class DescriptionValidationTests {

        @Test
        @DisplayName("描述可以为null")
        void shouldAcceptNullDescription() {
            CreateActivityTypeRequest request = new CreateActivityTypeRequest();
            request.setName("企业团建");
            request.setDescription(null);
            request.setSort(1);

            Set<ConstraintViolation<CreateActivityTypeRequest>> violations = validator.validate(request);
            assertTrue(violations.isEmpty());
        }

        @Test
        @DisplayName("描述长度不能超过500个字符")
        void shouldRejectDescriptionLongerThan500() {
            CreateActivityTypeRequest request = new CreateActivityTypeRequest();
            request.setName("企业团建");
            request.setDescription("a".repeat(501));
            request.setSort(1);

            Set<ConstraintViolation<CreateActivityTypeRequest>> violations = validator.validate(request);
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("500个字符")));
        }

        @Test
        @DisplayName("描述长度为500个字符时应该通过")
        void shouldAcceptDescriptionWith500Characters() {
            CreateActivityTypeRequest request = new CreateActivityTypeRequest();
            request.setName("企业团建");
            request.setDescription("a".repeat(500));
            request.setSort(1);

            Set<ConstraintViolation<CreateActivityTypeRequest>> violations = validator.validate(request);
            assertTrue(violations.isEmpty());
        }
    }

    @Nested
    @DisplayName("排序号验证测试")
    class SortValidationTests {

        @Test
        @DisplayName("排序号不能为null")
        void shouldRejectNullSort() {
            CreateActivityTypeRequest request = new CreateActivityTypeRequest();
            request.setName("企业团建");
            request.setSort(null);

            Set<ConstraintViolation<CreateActivityTypeRequest>> violations = validator.validate(request);
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("不能为空")));
        }

        @Test
        @DisplayName("排序号可以为0")
        void shouldAcceptSortZero() {
            CreateActivityTypeRequest request = new CreateActivityTypeRequest();
            request.setName("企业团建");
            request.setSort(0);

            Set<ConstraintViolation<CreateActivityTypeRequest>> violations = validator.validate(request);
            assertTrue(violations.isEmpty());
        }

        @Test
        @DisplayName("排序号可以为正数")
        void shouldAcceptPositiveSort() {
            CreateActivityTypeRequest request = new CreateActivityTypeRequest();
            request.setName("企业团建");
            request.setSort(100);

            Set<ConstraintViolation<CreateActivityTypeRequest>> violations = validator.validate(request);
            assertTrue(violations.isEmpty());
        }
    }

    @Nested
    @DisplayName("完整验证测试")
    class CompleteValidationTests {

        @Test
        @DisplayName("所有字段都有效时应该通过验证")
        void shouldPassValidationWithAllValidFields() {
            CreateActivityTypeRequest request = new CreateActivityTypeRequest();
            request.setName("企业团建");
            request.setDescription("企业团队建设活动");
            request.setSort(1);

            Set<ConstraintViolation<CreateActivityTypeRequest>> violations = validator.validate(request);
            assertTrue(violations.isEmpty());
        }

        @Test
        @DisplayName("只有必填字段时应该通过验证")
        void shouldPassValidationWithOnlyRequiredFields() {
            CreateActivityTypeRequest request = new CreateActivityTypeRequest();
            request.setName("企业团建");
            request.setSort(1);

            Set<ConstraintViolation<CreateActivityTypeRequest>> violations = validator.validate(request);
            assertTrue(violations.isEmpty());
        }
    }
}




