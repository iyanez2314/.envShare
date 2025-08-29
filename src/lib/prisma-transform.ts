/**
 * Recursively transforms all null values to undefined in an object
 * This solves the Prisma null vs TypeScript undefined incompatibility
 */
export function nullsToUndefined<T>(obj: T): T {
  if (obj === null) {
    return undefined as any;
  }
  
  if (obj instanceof Date) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(nullsToUndefined) as any;
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = nullsToUndefined(value);
    }
    return result;
  }
  
  return obj;
}

/**
 * Wrapper for server functions that automatically transforms Prisma results
 */
export function withPrismaTransform<T>(data: T): T {
  return nullsToUndefined(data);
}