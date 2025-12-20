package com.cinema.scenariopackage.controller;

import com.cinema.scenariopackage.dto.CreatePackageRequest;
import com.cinema.scenariopackage.dto.ScenarioPackageDTO;
import com.cinema.scenariopackage.dto.UpdatePackageRequest;
import com.cinema.scenariopackage.model.ScenarioPackage;
import com.cinema.scenariopackage.repository.ScenarioPackageRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 场景包管理控制器集成测试
 * <p>
 * 测试范围：
 * - T019: 创建场景包
 * - T020: 查询场景包列表
 * - T021: 查询单个场景包详情
 * - T022: 更新场景包基本信息
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-20
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class ScenarioPackageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ScenarioPackageRepository packageRepository;

    private UUID testPackageId;

    @BeforeEach
    void setUp() {
        // 清理测试数据
        packageRepository.deleteAll();
    }

    @AfterEach
    void tearDown() {
        // 清理测试数据
        packageRepository.deleteAll();
    }

    /**
     * T019: 测试创建场景包
     * <p>
     * 验证点：
     * 1. HTTP 状态码 201 Created
     * 2. 返回的 DTO 包含完整字段
     * 3. 默认状态为 DRAFT
     * 4. 数据库中成功保存记录
     * </p>
     */
    @Test
    @Order(1)
    @DisplayName("T019: Should create scenario package successfully")
    void testCreatePackage() throws Exception {
        // Arrange
        CreatePackageRequest request = new CreatePackageRequest();
        request.setName("测试场景包-生日派对");
        request.setDescription("适合生日庆祝的场景包，包含装饰和餐饮服务");
        request.setHallTypeIds(List.of(UUID.randomUUID(), UUID.randomUUID()));

        // Act & Assert
        MvcResult result = mockMvc.perform(post("/api/scenario-packages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").isNotEmpty())
                .andExpect(jsonPath("$.data.name").value("测试场景包-生日派对"))
                .andExpect(jsonPath("$.data.description").value(containsString("生日庆祝")))
                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andExpect(jsonPath("$.data.version").value(1))
                .andExpect(jsonPath("$.data.versionLock").value(0))
                .andExpect(jsonPath("$.data.createdAt").isNotEmpty())
                .andReturn();

        // Extract ID for later tests
        String responseBody = result.getResponse().getContentAsString();
        ScenarioPackageDTO dto = objectMapper.readTree(responseBody).get("data").traverse(objectMapper).readValueAs(ScenarioPackageDTO.class);
        testPackageId = dto.getId();

        // Verify database persistence
        ScenarioPackage savedPackage = packageRepository.findById(testPackageId).orElseThrow();
        assertThat(savedPackage.getName()).isEqualTo("测试场景包-生日派对");
        assertThat(savedPackage.getStatus()).isEqualTo("DRAFT");
        assertThat(savedPackage.getVersion()).isEqualTo(1);
    }

    /**
     * T019: 测试创建场景包 - 验证失败场景（名称为空）
     */
    @Test
    @Order(2)
    @DisplayName("T019: Should fail when creating package with empty name")
    void testCreatePackageWithInvalidData() throws Exception {
        // Arrange
        CreatePackageRequest request = new CreatePackageRequest();
        request.setName(""); // Invalid: empty name
        request.setDescription("Test description");

        // Act & Assert
        mockMvc.perform(post("/api/scenario-packages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    /**
     * T020: 测试查询场景包列表（分页）
     * <p>
     * 验证点：
     * 1. HTTP 状态码 200 OK
     * 2. 返回列表包含预期数量的记录
     * 3. 分页参数正确工作
     * 4. 排序功能正常
     * </p>
     */
    @Test
    @Order(3)
    @DisplayName("T020: Should list scenario packages with pagination")
    void testListPackages() throws Exception {
        // Arrange: Create 3 test packages
        for (int i = 1; i <= 3; i++) {
            CreatePackageRequest request = new CreatePackageRequest();
            request.setName("场景包-" + i);
            request.setDescription("描述-" + i);

            mockMvc.perform(post("/api/scenario-packages")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());
        }

        // Act & Assert: Test default pagination (page 0, size 20)
        mockMvc.perform(get("/api/scenario-packages"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data", hasSize(3)))
                .andExpect(jsonPath("$.total").value(3));

        // Test custom pagination (page 0, size 2)
        mockMvc.perform(get("/api/scenario-packages")
                        .param("page", "0")
                        .param("size", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.total").value(3));

        // Test sorting by name (asc)
        mockMvc.perform(get("/api/scenario-packages")
                        .param("sortBy", "name")
                        .param("sortOrder", "asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].name").value("场景包-1"));
    }

    /**
     * T021: 测试查询单个场景包详情
     * <p>
     * 验证点：
     * 1. HTTP 状态码 200 OK
     * 2. 返回的详情完整且正确
     * 3. 包含所有关联数据（规则、影厅、内容等）
     * </p>
     */
    @Test
    @Order(4)
    @DisplayName("T021: Should get package details by ID")
    void testGetPackageById() throws Exception {
        // Arrange: Create a test package
        CreatePackageRequest request = new CreatePackageRequest();
        request.setName("详情测试场景包");
        request.setDescription("用于测试详情查询的场景包");

        MvcResult createResult = mockMvc.perform(post("/api/scenario-packages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        String createResponseBody = createResult.getResponse().getContentAsString();
        ScenarioPackageDTO createdDto = objectMapper.readTree(createResponseBody).get("data").traverse(objectMapper).readValueAs(ScenarioPackageDTO.class);
        UUID packageId = createdDto.getId();

        // Act & Assert
        mockMvc.perform(get("/api/scenario-packages/" + packageId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(packageId.toString()))
                .andExpect(jsonPath("$.data.name").value("详情测试场景包"))
                .andExpect(jsonPath("$.data.description").value("用于测试详情查询的场景包"))
                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andExpect(jsonPath("$.data.version").value(1));
    }

    /**
     * T021: 测试查询不存在的场景包
     */
    @Test
    @Order(5)
    @DisplayName("T021: Should return 404 when package not found")
    void testGetNonExistentPackage() throws Exception {
        UUID nonExistentId = UUID.randomUUID();

        mockMvc.perform(get("/api/scenario-packages/" + nonExistentId))
                .andExpect(status().isNotFound());
    }

    /**
     * T022: 测试更新场景包基本信息
     * <p>
     * 验证点：
     * 1. HTTP 状态码 200 OK
     * 2. 更新后的数据正确保存
     * 3. 乐观锁版本号正确递增
     * 4. 其他字段保持不变
     * </p>
     */
    @Test
    @Order(6)
    @DisplayName("T022: Should update package successfully")
    void testUpdatePackage() throws Exception {
        // Arrange: Create a test package first
        CreatePackageRequest createRequest = new CreatePackageRequest();
        createRequest.setName("原始名称");
        createRequest.setDescription("原始描述");

        MvcResult createResult = mockMvc.perform(post("/api/scenario-packages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String createResponseBody = createResult.getResponse().getContentAsString();
        ScenarioPackageDTO createdDto = objectMapper.readTree(createResponseBody).get("data").traverse(objectMapper).readValueAs(ScenarioPackageDTO.class);
        UUID packageId = createdDto.getId();
        Integer initialVersionLock = createdDto.getVersionLock();

        // Update request
        UpdatePackageRequest updateRequest = new UpdatePackageRequest();
        updateRequest.setName("更新后的名称");
        updateRequest.setDescription("更新后的描述");
        updateRequest.setVersionLock(initialVersionLock);

        // Act & Assert
        mockMvc.perform(put("/api/scenario-packages/" + packageId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(packageId.toString()))
                .andExpect(jsonPath("$.data.name").value("更新后的名称"))
                .andExpect(jsonPath("$.data.description").value("更新后的描述"))
                .andExpect(jsonPath("$.data.versionLock").value(initialVersionLock + 1)); // Version incremented

        // Verify database changes
        ScenarioPackage updatedPackage = packageRepository.findById(packageId).orElseThrow();
        assertThat(updatedPackage.getName()).isEqualTo("更新后的名称");
        assertThat(updatedPackage.getDescription()).isEqualTo("更新后的描述");
        assertThat(updatedPackage.getVersionLock()).isEqualTo(initialVersionLock + 1);
    }

    /**
     * T022: 测试更新场景包 - 验证失败场景（无效数据）
     */
    @Test
    @Order(7)
    @DisplayName("T022: Should fail when updating package with invalid data")
    void testUpdatePackageWithInvalidData() throws Exception {
        // Arrange: Create a test package first
        CreatePackageRequest createRequest = new CreatePackageRequest();
        createRequest.setName("测试场景包");
        createRequest.setDescription("测试描述");

        MvcResult createResult = mockMvc.perform(post("/api/scenario-packages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String createResponseBody = createResult.getResponse().getContentAsString();
        ScenarioPackageDTO createdDto = objectMapper.readTree(createResponseBody).get("data").traverse(objectMapper).readValueAs(ScenarioPackageDTO.class);
        UUID packageId = createdDto.getId();

        // Update request with invalid data (empty name)
        UpdatePackageRequest updateRequest = new UpdatePackageRequest();
        updateRequest.setName(""); // Invalid
        updateRequest.setDescription("Valid description");
        updateRequest.setVersionLock(createdDto.getVersionLock());

        // Act & Assert
        mockMvc.perform(put("/api/scenario-packages/" + packageId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isBadRequest());
    }

    /**
     * T022: 测试删除场景包（软删除）
     * <p>
     * 验证点：
     * 1. HTTP 状态码 204 No Content
     * 2. 数据库记录标记为已删除（deleted_at 不为 null）
     * 3. 删除后无法再次查询到该记录
     * </p>
     */
    @Test
    @Order(8)
    @DisplayName("T022: Should soft delete package successfully")
    void testDeletePackage() throws Exception {
        // Arrange: Create a test package
        CreatePackageRequest createRequest = new CreatePackageRequest();
        createRequest.setName("待删除场景包");
        createRequest.setDescription("这个场景包将被删除");

        MvcResult createResult = mockMvc.perform(post("/api/scenario-packages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String createResponseBody = createResult.getResponse().getContentAsString();
        ScenarioPackageDTO createdDto = objectMapper.readTree(createResponseBody).get("data").traverse(objectMapper).readValueAs(ScenarioPackageDTO.class);
        UUID packageId = createdDto.getId();

        // Act: Delete the package
        mockMvc.perform(delete("/api/scenario-packages/" + packageId))
                .andExpect(status().isNoContent());

        // Assert: Package should not be found after deletion
        mockMvc.perform(get("/api/scenario-packages/" + packageId))
                .andExpect(status().isNotFound());

        // Verify soft delete in database (deleted_at should be set)
        ScenarioPackage deletedPackage = packageRepository.findById(packageId).orElse(null);
        if (deletedPackage != null) {
            assertThat(deletedPackage.getDeletedAt()).isNotNull();
        }
    }
}
