import { z } from 'zod';

/**
 * UUID Primary Key Schema
 */
export const UUIDSchema = z.string().uuid('Must be a valid UUID');

/**
 * Money Representation:
 * Always represented as a stringified Decimal with up to 2 decimal places to avoid IEEE-754 float precision loss.
 */
export const MoneyDecimalSchema = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid decimal amount (e.g. 1500 or 1500.50)');

/**
 * Weight Representation:
 * Always represented as an integer in grams.
 */
export const WeightGramsSchema = z
  .number()
  .int('Weight must be an integer')
  .nonnegative('Weight in grams cannot be negative');

/**
 * Bangladesh Mobile Phone Number Schema:
 * Validates +8801... or 01... with standard operator prefixes (3-9).
 */
export const BangladeshPhoneSchema = z
  .string()
  .regex(/^(\+88)?01[3-9]\d{8}$/, 'Must be a valid Bangladesh phone number');
