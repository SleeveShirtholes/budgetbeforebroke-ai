# Date Utilities

This module provides comprehensive date handling utilities that prevent timezone conversion issues by working with date strings (YYYY-MM-DD format) instead of Date objects.

## Why Use These Utilities?

**Problem**: JavaScript Date objects automatically convert to UTC when stored/retrieved, causing timezone shifts that can display the wrong date to users.

**Solution**: These utilities work with date strings (YYYY-MM-DD) that represent local dates without timezone conversion.

## Core Functions

### `formatDateSafely(date, formatString)`

Safely formats dates without timezone issues.

```typescript
import { formatDateSafely } from "@/utils/date";

// Works with Date objects
const date = new Date(2025, 7, 21); // August 21, 2025
formatDateSafely(date, "MMM dd, yyyy"); // "Aug 21, 2025"

// Works with date strings (preferred)
formatDateSafely("2025-08-21", "MMM dd, yyyy"); // "Aug 21, 2025"
formatDateSafely("2025-08-21", "MMM dd"); // "Aug 21"
formatDateSafely("2025-08-21", "yyyy-MM-dd"); // "2025-08-21"
```

### `toDateString(date)`

Converts a Date object to YYYY-MM-DD string format.

```typescript
import { toDateString } from "@/utils/date";

const date = new Date(2025, 7, 21);
toDateString(date); // "2025-08-21"
```

### `createDateString(year, month, day)`

Creates a date string from individual components.

```typescript
import { createDateString } from "@/utils/date";

createDateString(2025, 8, 21); // "2025-08-21"
createDateString(2025, 1, 1); // "2025-01-01"
```

### `parseDateString(dateString)`

Safely parses a date string to a Date object.

```typescript
import { parseDateString } from "@/utils/date";

const date = parseDateString("2025-08-21");
// Returns Date object at local midnight
// Throws error for invalid dates like "2025-13-01"
```

## Date Arithmetic

### `addDaysToString(dateString, days)`

Adds/subtracts days to a date string.

```typescript
import { addDaysToString } from "@/utils/date";

addDaysToString("2025-08-21", 1); // "2025-08-22"
addDaysToString("2025-08-21", -1); // "2025-08-20"
addDaysToString("2025-08-31", 1); // "2025-09-01"
```

### `addWeeksToString(dateString, weeks)`

Adds/subtracts weeks to a date string.

```typescript
import { addWeeksToString } from "@/utils/date";

addWeeksToString("2025-08-21", 1); // "2025-08-28"
addWeeksToString("2025-08-21", -1); // "2025-08-14"
```

### `addMonthsToString(dateString, months)`

Adds/subtracts months to a date string.

```typescript
import { addMonthsToString } from "@/utils/date";

addMonthsToString("2025-08-21", 1); // "2025-09-21"
addMonthsToString("2025-08-21", -1); // "2025-07-21"
addMonthsToString("2025-01-31", 1); // "2025-02-28"
```

## Comparison and Validation

### `compareDates(date1, date2)`

Compares two dates (can be Date objects or strings).

```typescript
import { compareDates } from "@/utils/date";

compareDates("2025-08-21", "2025-08-22"); // -1 (first is earlier)
compareDates("2025-08-21", "2025-08-21"); // 0  (equal)
compareDates("2025-08-22", "2025-08-21"); // 1  (first is later)

// Works with Date objects too
const date1 = new Date(2025, 7, 21);
const date2 = new Date(2025, 7, 22);
compareDates(date1, date2); // -1
```

### `isValidDateString(dateString)`

Validates if a date string is valid.

```typescript
import { isValidDateString } from "@/utils/date";

isValidDateString("2025-08-21"); // true
isValidDateString("2025-13-01"); // false (invalid month)
isValidDateString("2025-02-30"); // false (invalid day)
isValidDateString("invalid"); // false
```

## Utility Functions

### `getCurrentDateString()`

Gets current date as YYYY-MM-DD string.

```typescript
import { getCurrentDateString } from "@/utils/date";

getCurrentDateString(); // "2025-08-29" (today's date)
```

### `getFirstDayOfMonth(year, month)`

Gets first day of a month.

```typescript
import { getFirstDayOfMonth } from "@/utils/date";

getFirstDayOfMonth(2025, 8); // "2025-08-01"
getFirstDayOfMonth(2025, 1); // "2025-01-01"
```

### `getLastDayOfMonth(year, month)`

Gets last day of a month.

```typescript
import { getLastDayOfMonth } from "@/utils/date";

getLastDayOfMonth(2025, 8); // "2025-08-31"
getLastDayOfMonth(2025, 2); // "2025-02-28" (not leap year)
getLastDayOfMonth(2025, 4); // "2025-04-30"
```

## Migration Guide

### Before (Problematic)

```typescript
// ❌ This can cause timezone issues
const date = new Date("2025-08-21");
const formatted = format(date, "MMM dd, yyyy");
const nextDay = addDays(date, 1);
```

### After (Safe)

```typescript
// ✅ No timezone issues
import { formatDateSafely, addDaysToString } from "@/utils/date";

const dateString = "2025-08-21";
const formatted = formatDateSafely(dateString, "MMM dd, yyyy");
const nextDay = addDaysToString(dateString, 1);
```

## Best Practices

1. **Always use date strings (YYYY-MM-DD) for storage and API calls**
2. **Use these utilities instead of direct Date object manipulation**
3. **Only create Date objects when absolutely necessary (e.g., for date-fns functions)**
4. **Use `formatDateSafely` for display formatting**
5. **Use `toDateString` when converting from Date objects**

## Common Use Cases

### Form Default Values

```typescript
import { getCurrentDateString } from "@/utils/date";

const defaultValues = {
  startDate: getCurrentDateString(),
  // ... other fields
};
```

### Date Validation

```typescript
import { isValidDateString, compareDates } from "@/utils/date";

if (!isValidDateString(startDate)) {
  throw new Error("Invalid start date");
}

if (compareDates(startDate, endDate) >= 0) {
  throw new Error("Start date must be before end date");
}
```

### Date Calculations

```typescript
import { addWeeksToString, addMonthsToString } from "@/utils/date";

// Calculate next payment date
const nextPayment = addWeeksToString(lastPayment, 2);

// Calculate renewal date
const renewalDate = addMonthsToString(startDate, 12);
```

### Display Formatting

```typescript
import { formatDateSafely } from "@/utils/date";

// In React components
<span>{formatDateSafely(user.startDate, "MMM dd, yyyy")}</span>
<span>{formatDateSafely(user.startDate, "MMM dd")}</span>
```

## Testing

All utilities are thoroughly tested. Run tests with:

```bash
yarn test src/utils/__tests__/date.test.ts
```

## Migration Checklist

When updating existing code:

- [ ] Replace `new Date(dateString)` with `parseDateString(dateString)` when you need a Date object
- [ ] Replace `format(date, formatString)` with `formatDateSafely(date, formatString)`
- [ ] Replace `addDays(date, days)` with `addDaysToString(dateString, days)`
- [ ] Replace `addWeeks(date, weeks)` with `addWeeksToString(dateString, weeks)`
- [ ] Replace `addMonths(date, months)` with `addMonthsToString(dateString, months)`
- [ ] Replace date comparisons with `compareDates(date1, date2)`
- [ ] Add validation with `isValidDateString(dateString)`
- [ ] Update form schemas to use `z.string()` instead of `z.date()`
- [ ] Update TypeScript types to use `string` instead of `Date` for date fields
