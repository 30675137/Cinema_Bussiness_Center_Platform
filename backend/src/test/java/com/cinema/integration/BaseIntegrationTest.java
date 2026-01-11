/** @spec M001-material-unit-system */
package com.cinema.integration;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.beans.factory.annotation.Autowired;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

/**
 * Base class for integration tests.
 *
 * Provides:
 * - Spring Boot test context with random port
 * - TestRestTemplate for HTTP requests
 * - Test data cleanup between tests
 * - Transaction management
 */
@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    classes = com.cinema.hallstore.HallStoreBackendApplication.class
)
@ActiveProfiles("test")
@Transactional
public abstract class BaseIntegrationTest {

    @LocalServerPort
    protected int port;

    @Autowired
    protected TestRestTemplate restTemplate;

    @PersistenceContext
    protected EntityManager entityManager;

    /**
     * Get base URL for API requests
     */
    protected String getBaseUrl() {
        return "http://localhost:" + port + "/api";
    }

    /**
     * Setup before each test
     * Override this method to add custom setup logic
     */
    @BeforeEach
    public void setUp() {
        // Override in subclasses if needed
    }

    /**
     * Cleanup after each test
     * Override this method to add custom cleanup logic
     */
    @AfterEach
    public void tearDown() {
        // Override in subclasses if needed
    }

    /**
     * Flush and clear entity manager to sync with database
     */
    protected void flushAndClear() {
        entityManager.flush();
        entityManager.clear();
    }
}
