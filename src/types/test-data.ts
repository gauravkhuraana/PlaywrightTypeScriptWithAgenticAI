export interface TestData {
  users: User[];
  searchQueries: SearchQuery[];
  urls: UrlData[];
  environments: Environment[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user' | 'guest';
  profile: UserProfile;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: Address;
  preferences: UserPreferences;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark';
  notifications: boolean;
  newsletter: boolean;
}

export interface SearchQuery {
  id: string;
  query: string;
  expectedResults: number;
  category: 'valid' | 'invalid' | 'edge-case' | 'performance';
  description: string;
  expectedBehavior: 'pass' | 'fail';
}

export interface UrlData {
  id: string;
  name: string;
  url: string;
  environment: string;
  expectedStatus: number;
  timeout: number;
}

export interface Environment {
  name: string;
  baseUrl: string;
  apiUrl: string;
  features: string[];
  credentials: {
    username: string;
    password: string;
  };
}

export interface ApiResponse<T = any> {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: T;
  responseTime: number;
}

export interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

export interface AccessibilityResult {
  violations: AccessibilityViolation[];
  passes: AccessibilityPass[];
  incomplete: AccessibilityIncomplete[];
  inapplicable: AccessibilityInapplicable[];
}

export interface AccessibilityViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  nodes: AccessibilityNode[];
}

export interface AccessibilityPass {
  id: string;
  description: string;
  nodes: AccessibilityNode[];
}

export interface AccessibilityIncomplete {
  id: string;
  description: string;
  nodes: AccessibilityNode[];
}

export interface AccessibilityInapplicable {
  id: string;
  description: string;
}

export interface AccessibilityNode {
  html: string;
  target: string[];
  failureSummary?: string;
}
