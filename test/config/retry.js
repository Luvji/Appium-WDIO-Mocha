function nonNegativeInteger(name, fallback) {
  const rawValue = process.env[name];

  if (rawValue === undefined) {
    return fallback;
  }

  const value = Number(rawValue);

  if (
    !Number.isInteger(value) ||
    value < 0
  ) {
    throw new Error(
      `${name} must be a non-negative integer`,
    );
  }

  return value;
}

export const retryPolicy = Object.freeze({
  testRetries: nonNegativeInteger(
    'TEST_RETRIES',
    0,
  ),

  specRetries: nonNegativeInteger(
    'SPEC_RETRIES',
    0,
  ),
});