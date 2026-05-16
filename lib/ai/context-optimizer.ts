/**
 * 🔍 CONTEXT OPTIMIZER
 * Intelligent file selection system for AI development to minimize token usage.
 * Provides fast lookup of relevant files based on user queries.
 */

import { API_ROUTES, SERVICES, REPOSITORIES, TABLES, COMPONENTS } from './codebase-index.js';

// Cache for frequently accessed queries
const queryCache = new Map<string, { files: string[]; timestamp: number }>();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

interface QueryOptions {
  includeServices?: boolean;
  includeRepositories?: boolean;
  includeAPIRoutes?: boolean;
  includeTables?: boolean;
  includeComponents?: boolean;
  maxResults?: number;
}

interface CachedResult {
  files: string[];
  timestamp: number;
}

/**
 * Analyze a user query and return relevant file paths
 */
export async function optimizeContext(query: string, options: QueryOptions = {}): Promise<string[]> {
  const cacheKey = `${query}_${JSON.stringify(options)}`;

  // Check cache first
  const cached = queryCache.get(cacheKey) as CachedResult | undefined;
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
    return cached.files;
  }

  const {
    includeServices = true,
    includeRepositories = true,
    includeAPIRoutes = true,
    includeTables = false,
    includeComponents = false,
    maxResults = 10
  } = options;

  const results: string[] = [];
  const queryLower = query.toLowerCase();

  // API Routes
  if (includeAPIRoutes) {
    const apiRoutes = API_ROUTES.filter(route =>
      route.purpose.toLowerCase().includes(queryLower) ||
      route.path.toLowerCase().includes(queryLower)
    )
      .map(route => route.file)
      .slice(0, Math.ceil(maxResults * 0.3));

    results.push(...[...new Set(apiRoutes)]);
  }

  // Services
  if (includeServices) {
    const services = SERVICES.filter(service =>
      service.name.toLowerCase().includes(queryLower) ||
      service.purpose.toLowerCase().includes(queryLower) ||
      service.methods.some(method => method.toLowerCase().includes(queryLower))
    )
      .map(service => service.file)
      .slice(0, Math.ceil(maxResults * 0.3));

    results.push(...[...new Set(services)]);
  }

  // Repositories
  if (includeRepositories) {
    const repositories = REPOSITORIES.filter(repo =>
      repo.name.toLowerCase().includes(queryLower) ||
      repo.purpose.toLowerCase().includes(queryLower) ||
      repo.table?.toLowerCase().includes(queryLower)
    )
      .map(repo => repo.file)
      .slice(0, Math.ceil(maxResults * 0.3));

    results.push(...[...new Set(repositories)]);
  }

  // Database Tables (if requested)
  if (includeTables) {
    const tables = TABLES.filter(table =>
      table.name.toLowerCase().includes(queryLower) ||
      table.purpose.toLowerCase().includes(queryLower)
    )
      .map(table => table.file)
      .slice(0, Math.ceil(maxResults * 0.25));

    results.push(...[...new Set(tables)]);
  }

  // Components
  if (includeComponents) {
    const components = COMPONENTS.filter(component =>
      component.name.toLowerCase().includes(queryLower) ||
      component.category.toLowerCase().includes(queryLower) ||
      component.purpose.toLowerCase().includes(queryLower)
    )
      .map(component => component.file)
      .slice(0, Math.ceil(maxResults * 0.25));

    results.push(...[...new Set(components)]);
  }

  // Remove duplicates and limit
  const uniqueResults = [...new Set(results)].slice(0, maxResults);

  // Cache results
  queryCache.set(cacheKey, {
    files: uniqueResults,
    timestamp: Date.now()
  });

  return uniqueResults;
}

/**
 * Get context for specific modules
 */
export function getModuleContext(module: string): string[] {
  const moduleServices = SERVICES.filter(s =>
    s.name.toLowerCase().includes(module.toLowerCase())
  ).map(s => s.file);

  const moduleRepositories = REPOSITORIES.filter(r =>
    r.name.toLowerCase().includes(module.toLowerCase()) ||
    r.table?.toLowerCase().includes(module.toLowerCase())
  ).map(r => r.file);

  const moduleAPI = API_ROUTES.filter(a =>
    a.purpose.toLowerCase().includes(module.toLowerCase()) ||
    a.path.toLowerCase().includes(module)
  ).map(a => a.file);

  return [...moduleServices, ...moduleRepositories, ...moduleAPI];
}

/**
 * Get context for database operations
 */
export function getDatabaseContext(table?: string): string[] {
  const repositories = table
    ? REPOSITORIES.filter(r => r.table === table)
    : REPOSITORIES;

  const schemaFiles = [TABLES.map(t => t.file)];

  return [
    ...repositories.map(r => r.file),
    ...schemaFiles.flat()
  ];
}

/**
 * Get context for API development
 */
export function getAPIContext(endpoint?: string): string[] {
  const routes = endpoint
    ? API_ROUTES.filter(r => r.path.includes(endpoint))
    : API_ROUTES;

  const authFiles = ['lib/auth/api-auth.ts'];
  const errorFiles = ['lib/errors/api-error.ts', 'lib/errors/index.ts'];
  const validationFiles = ['lib/validations/validation.ts'];

  return [
    ...routes.map(r => r.file),
    ...authFiles,
    ...errorFiles,
    ...validationFiles
  ];
}

/**
 * Smart query expansion for better results
 */
export function expandQuery(query: string): string[] {
  const keywords: Record<string, string[]> = {
    'project': ['task', 'milestone', 'member', 'activity'],
    'client': ['business', 'order', 'invoice', 'amc'],
    'order': ['item', 'invoice', 'customer', 'service'],
    'invoice': ['payment', 'order', 'client', 'finance'],
    'employee': ['attendance', 'payroll', 'hr', 'payslip'],
    'ticket': ['support', 'message', 'assign', 'priority'],
    'admin': ['dashboard', 'settings', 'audit', 'role'],
    'api': ['route', 'endpoint', 'auth', 'validation'],
    'database': ['table', 'schema', 'query', 'repository'],
    'ui': ['component', 'form', 'button', 'modal'],
  };

  const expanded = [query];

  // Add related keywords
  for (const [key, related] of Object.entries(keywords)) {
    if (query.toLowerCase().includes(key)) {
      expanded.push(...related);
    }
  }

  return [...new Set(expanded)];
}

/**
 * Clear the cache
 */
export function clearCache(): void {
  queryCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: queryCache.size,
    keys: Array.from(queryCache.keys())
  };
}

// Predefined context shortcuts for common scenarios
export const CONTEXT_PRESETS = {
  // Project Development
  projectDevelopment: () => getModuleContext('project'),

  // API Development
  apiDevelopment: (endpoint?: string) => getAPIContext(endpoint),

  // Database Work
  databaseWork: (table?: string) => getDatabaseContext(table),

  // Admin Panel
  adminPanel: () => [
    ...getModuleContext('admin'),
    'app/admin/page.tsx',
    'components/ui/*'
  ],

  // HR Management
  hrManagement: () => getModuleContext('hr'),

  // Finance Operations
  financeOperations: () => getModuleContext('finance'),

  // Support System
  supportSystem: () => getModuleContext('support'),

  // Directory/Business
  directory: () => getModuleContext('directory'),

  // Form Development
  formDevelopment: () => [
    ...COMPONENTS.filter(c => c.category === 'Forms').map(c => c.file),
    'components/ui/form.tsx',
    'lib/validations/validation.ts'
  ]
};

/**
 * Helper to get all files for a complete feature module
 */
export function getFeatureModuleFiles(feature: string): string[] {
  const featureLower = feature.toLowerCase();

  // Get related API routes
  const apiFiles = API_ROUTES
    .filter(route => route.purpose.toLowerCase().includes(featureLower))
    .map(route => route.file);

  // Get related services
  const serviceFiles = SERVICES
    .filter(service => service.name.toLowerCase().includes(featureLower))
    .map(service => service.file);

  // Get related repositories
  const repositoryFiles = REPOSITORIES
    .filter(repo => repo.name.toLowerCase().includes(featureLower))
    .map(repo => repo.file);

  // Get related admin pages
  const adminFiles = (ADMIN_PAGES as any[])
    .filter((page: any) => page.title.toLowerCase().includes(featureLower))
    .map((page: any) => page.file);

  return [
    ...[...new Set(apiFiles)],
    ...[...new Set(serviceFiles)],
    ...[...new Set(repositoryFiles)],
    ...[...new Set(adminFiles)]
  ];
}
