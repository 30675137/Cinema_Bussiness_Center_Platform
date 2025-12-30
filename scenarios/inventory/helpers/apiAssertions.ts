// @spec T002-e2e-test-generator
/**
 * API Response Assertion Helpers for E2E Tests
 *
 * Provides functions to validate API responses, status codes,
 * response bodies, and error handling.
 */

import { expect, Response } from '@playwright/test';

/**
 * Assert API response status code
 * @param response - Playwright Response object
 * @param expectedStatus - Expected HTTP status code (default 200)
 */
export function assertResponseStatus(response: Response, expectedStatus: number = 200) {
  const actualStatus = response.status();
  expect(actualStatus, `API response status should be ${expectedStatus}`).toBe(expectedStatus);

  console.log(`✅ API response status verified: ${actualStatus}`);
}

/**
 * Assert successful API response (2xx status codes)
 * @param response - Playwright Response object
 */
export function assertResponseSuccess(response: Response) {
  const status = response.status();
  expect(status, `API response should be successful (2xx)`).toBeGreaterThanOrEqual(200);
  expect(status, `API response should be successful (2xx)`).toBeLessThan(300);

  console.log(`✅ API response successful: ${status}`);
}

/**
 * Assert API response body contains expected data
 * @param response - Playwright Response object
 * @param expectedData - Partial object to match against response data
 */
export async function assertResponseData(response: Response, expectedData: Record<string, any>) {
  const responseBody = await response.json();

  for (const [key, value] of Object.entries(expectedData)) {
    const actualValue = responseBody.data?.[key] || responseBody[key];
    expect(actualValue, `Response should contain ${key}=${value}`).toBe(value);
  }

  console.log(`✅ API response data verified:`, expectedData);
}

/**
 * Assert API response follows standard format
 * @param response - Playwright Response object
 * @param shouldSucceed - Whether the API call should succeed (default true)
 */
export async function assertStandardResponseFormat(response: Response, shouldSucceed: boolean = true) {
  const responseBody = await response.json();

  // Check for standard response structure
  expect(responseBody, 'Response should have success field').toHaveProperty('success');
  expect(responseBody.success, `Response success should be ${shouldSucceed}`).toBe(shouldSucceed);

  if (shouldSucceed) {
    expect(responseBody, 'Successful response should have data field').toHaveProperty('data');
  } else {
    expect(responseBody, 'Failed response should have error field').toHaveProperty('error');
    expect(responseBody, 'Failed response should have message field').toHaveProperty('message');
  }

  console.log(`✅ API response format verified (success=${shouldSucceed})`);
}

/**
 * Assert API error response
 * @param response - Playwright Response object
 * @param expectedErrorCode - Expected error code (e.g., 'INV_NTF_001')
 * @param expectedStatus - Expected HTTP status code (e.g., 404)
 */
export async function assertErrorResponse(
  response: Response,
  expectedErrorCode?: string,
  expectedStatus: number = 400
) {
  assertResponseStatus(response, expectedStatus);

  const responseBody = await response.json();

  expect(responseBody.success, 'Error response success should be false').toBe(false);
  expect(responseBody, 'Error response should have error field').toHaveProperty('error');
  expect(responseBody, 'Error response should have message field').toHaveProperty('message');

  if (expectedErrorCode) {
    expect(responseBody.error, `Error code should be ${expectedErrorCode}`).toBe(expectedErrorCode);
  }

  console.log(`✅ API error response verified:`, {
    error: responseBody.error,
    message: responseBody.message,
    status: expectedStatus
  });
}

/**
 * Wait for API response and assert status
 * @param page - Playwright Page object
 * @param urlPattern - URL pattern to match (string or RegExp)
 * @param expectedStatus - Expected HTTP status code (default 200)
 * @param timeout - Timeout in milliseconds (default 10000)
 * @returns Response object
 */
export async function waitForAPIResponse(
  page: any,
  urlPattern: string | RegExp,
  expectedStatus: number = 200,
  timeout: number = 10000
): Promise<Response> {
  const response = await page.waitForResponse(
    (resp: Response) => {
      const urlMatches = typeof urlPattern === 'string'
        ? resp.url().includes(urlPattern)
        : urlPattern.test(resp.url());

      return urlMatches && resp.status() === expectedStatus;
    },
    { timeout }
  );

  assertResponseStatus(response, expectedStatus);

  return response;
}

/**
 * Assert inventory reservation API response
 * @param response - Playwright Response object
 */
export async function assertInventoryReservationResponse(response: Response) {
  assertResponseStatus(response, 200);

  const responseBody = await response.json();

  expect(responseBody.success, 'Reservation should succeed').toBe(true);
  expect(responseBody.data, 'Reservation response should have data').toBeDefined();
  expect(responseBody.data, 'Reservation response should have reservedComponents').toHaveProperty('reservedComponents');

  console.log(`✅ Inventory reservation API verified:`, {
    success: responseBody.success,
    reservedCount: responseBody.data.reservedComponents?.length || 0
  });

  return responseBody.data;
}

/**
 * Assert inventory deduction API response
 * @param response - Playwright Response object
 */
export async function assertInventoryDeductionResponse(response: Response) {
  assertResponseStatus(response, 200);

  const responseBody = await response.json();

  expect(responseBody.success, 'Deduction should succeed').toBe(true);
  expect(responseBody.data, 'Deduction response should have data').toBeDefined();

  console.log(`✅ Inventory deduction API verified:`, {
    success: responseBody.success,
    data: responseBody.data
  });

  return responseBody.data;
}

/**
 * Assert order creation API response
 * @param response - Playwright Response object
 * @returns Order ID
 */
export async function assertOrderCreationResponse(response: Response): Promise<string> {
  assertResponseStatus(response, 201);

  const responseBody = await response.json();

  expect(responseBody.success, 'Order creation should succeed').toBe(true);
  expect(responseBody.data, 'Order response should have data').toBeDefined();
  expect(responseBody.data, 'Order response should have id field').toHaveProperty('id');

  const orderId = responseBody.data.id;

  console.log(`✅ Order creation API verified:`, {
    success: responseBody.success,
    orderId
  });

  return orderId;
}
