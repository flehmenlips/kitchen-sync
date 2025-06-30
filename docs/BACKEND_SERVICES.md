# Backend Services Documentation

## Overview

This document covers all backend services, utilities, middleware, and business logic in the KitchenSync Node.js/Express application.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Services](#services)
3. [Controllers](#controllers)
4. [Middleware](#middleware)
5. [Utilities](#utilities)
6. [Database Layer](#database-layer)
7. [External Integrations](#external-integrations)
8. [Configuration](#configuration)

## Architecture Overview

The backend follows a layered architecture:

```
├── Controllers      # Request/response handling
├── Services         # Business logic
├── Middleware       # Request processing
├── Utils           # Helper functions
├── Config          # Configuration files
├── Types           # TypeScript definitions
└── Tests           # Unit and integration tests
```

**Technology Stack:**
- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **Prisma** for database ORM
- **PostgreSQL** as primary database
- **JWT** for authentication
- **Cloudinary** for image storage
- **Stripe** for payment processing
- **Nodemailer** for email services

## Services

### Email Service

**Location**: `src/services/emailService.ts`

Handles all email communications including transactional emails, notifications, and marketing emails.

#### Methods

```typescript
interface EmailService {
  // Customer emails
  sendCustomerWelcomeEmail(customer: Customer, restaurant: Restaurant): Promise<void>;
  sendCustomerVerificationEmail(customer: Customer, token: string, restaurant: Restaurant): Promise<void>;
  sendCustomerPasswordResetEmail(customer: Customer, token: string, restaurant: Restaurant): Promise<void>;
  sendCustomerReservationConfirmation(reservation: Reservation, customer: Customer): Promise<void>;
  sendCustomerReservationReminder(reservation: Reservation, customer: Customer): Promise<void>;
  
  // Staff emails
  sendStaffWelcomeEmail(user: User, restaurant: Restaurant): Promise<void>;
  sendStaffPasswordResetEmail(user: User, token: string): Promise<void>;
  sendNewReservationNotification(reservation: Reservation, staff: User[]): Promise<void>;
  
  // Restaurant onboarding
  sendRestaurantWelcomeEmail(restaurant: Restaurant, owner: User): Promise<void>;
  sendRestaurantVerificationEmail(restaurant: Restaurant): Promise<void>;
  
  // Platform admin emails
  sendPlatformAdminAlert(alert: PlatformAlert): Promise<void>;
  sendSubscriptionUpdateEmail(subscription: Subscription, restaurant: Restaurant): Promise<void>;
}
```

#### Usage Examples

```typescript
import { emailService } from '../services/emailService';

// Send customer welcome email
await emailService.sendCustomerWelcomeEmail(customer, restaurant);

// Send reservation confirmation
await emailService.sendCustomerReservationConfirmation(reservation, customer);

// Send staff notification for new reservation
await emailService.sendNewReservationNotification(reservation, staffMembers);
```

#### Email Templates

The service uses dynamic email templates with restaurant branding:

```typescript
// Template structure
interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
  restaurantBranding?: {
    logo?: string;
    primaryColor?: string;
    restaurantName: string;
  };
}

// Custom template rendering
const renderTemplate = (template: string, variables: Record<string, any>) => {
  // Handlebars-style template rendering
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => variables[key] || '');
};
```

### Stripe Service

**Location**: `src/services/stripeService.ts`

Handles all payment processing, subscription management, and billing operations.

#### Methods

```typescript
interface StripeService {
  // Customer management
  createCustomer(restaurantData: RestaurantData): Promise<Stripe.Customer>;
  updateCustomer(customerId: string, updates: Partial<Stripe.CustomerUpdateParams>): Promise<Stripe.Customer>;
  
  // Subscription management
  createSubscription(customerId: string, priceId: string, trialDays?: number): Promise<Stripe.Subscription>;
  updateSubscription(subscriptionId: string, updates: Partial<Stripe.SubscriptionUpdateParams>): Promise<Stripe.Subscription>;
  cancelSubscription(subscriptionId: string, immediately?: boolean): Promise<Stripe.Subscription>;
  
  // Payment methods
  attachPaymentMethod(customerId: string, paymentMethodId: string): Promise<Stripe.PaymentMethod>;
  setDefaultPaymentMethod(customerId: string, paymentMethodId: string): Promise<void>;
  
  // Checkout sessions
  createCheckoutSession(sessionData: CheckoutSessionData): Promise<Stripe.Checkout.Session>;
  createBillingPortalSession(customerId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session>;
  
  // Webhooks
  constructEvent(body: string | Buffer, signature: string): Stripe.Event;
  handleWebhookEvent(event: Stripe.Event): Promise<void>;
  
  // Usage tracking
  recordUsage(subscriptionItemId: string, quantity: number, timestamp?: number): Promise<Stripe.UsageRecord>;
  getUsageRecords(subscriptionItemId: string): Promise<Stripe.UsageRecord[]>;
}
```

#### Usage Examples

```typescript
import { stripeService } from '../services/stripeService';

// Create subscription for new restaurant
const subscription = await stripeService.createSubscription(
  customer.stripeCustomerId,
  'price_professional_monthly',
  14 // 14-day trial
);

// Handle subscription upgrade
await stripeService.updateSubscription(subscriptionId, {
  items: [{
    id: subscriptionItem.id,
    price: 'price_enterprise_monthly'
  }]
});

// Create checkout session
const session = await stripeService.createCheckoutSession({
  customerId: customer.stripeCustomerId,
  successUrl: 'https://restaurant.com/success',
  cancelUrl: 'https://restaurant.com/cancel',
  lineItems: [{
    price: 'price_professional_monthly',
    quantity: 1
  }]
});
```

### Cloudinary Service

**Location**: `src/services/cloudinaryService.ts`

Manages image uploads, transformations, and storage.

#### Methods

```typescript
interface CloudinaryService {
  // Upload operations
  uploadImage(file: Buffer | string, options?: UploadOptions): Promise<CloudinaryUploadResult>;
  uploadImageFromUrl(url: string, options?: UploadOptions): Promise<CloudinaryUploadResult>;
  
  // Transformation operations
  getTransformedUrl(publicId: string, transformations: Transformation[]): string;
  generateThumbnail(publicId: string, width: number, height: number): string;
  
  // Management operations
  deleteImage(publicId: string): Promise<void>;
  getImageDetails(publicId: string): Promise<CloudinaryResource>;
  
  // Batch operations
  uploadMultipleImages(files: UploadFile[]): Promise<CloudinaryUploadResult[]>;
  deleteMultipleImages(publicIds: string[]): Promise<void>;
}

interface UploadOptions {
  folder?: string;
  publicId?: string;
  transformation?: Transformation[];
  tags?: string[];
  context?: Record<string, string>;
}

interface CloudinaryUploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  signature: string;
}
```

#### Usage Examples

```typescript
import { cloudinaryService } from '../services/cloudinaryService';

// Upload recipe photo
const uploadResult = await cloudinaryService.uploadImage(imageBuffer, {
  folder: 'recipes',
  tags: ['recipe', `restaurant_${restaurantId}`],
  transformation: [
    { width: 800, height: 600, crop: 'fill' },
    { quality: 'auto', fetch_format: 'auto' }
  ]
});

// Generate thumbnail URL
const thumbnailUrl = cloudinaryService.generateThumbnail(
  uploadResult.publicId,
  300,
  200
);

// Get optimized image URL
const optimizedUrl = cloudinaryService.getTransformedUrl(publicId, [
  { width: 400, height: 300, crop: 'fill' },
  { quality: 'auto' },
  { fetch_format: 'auto' }
]);
```

### AI Parser Service

**Location**: `src/services/aiParserService.ts`

Integrates with AI services for recipe parsing and content extraction.

#### Methods

```typescript
interface AIParserService {
  // Recipe parsing
  parseRecipeFromText(text: string): Promise<ParsedRecipe>;
  parseRecipeFromImage(imageUrl: string): Promise<ParsedRecipe>;
  parseRecipeFromUrl(url: string): Promise<ParsedRecipe>;
  
  // Ingredient extraction
  extractIngredients(text: string): Promise<ParsedIngredient[]>;
  standardizeIngredientName(ingredientName: string): Promise<string>;
  
  // Instruction processing
  parseInstructions(text: string): Promise<string[]>;
  generateInstructionSummary(instructions: string[]): Promise<string>;
  
  // Content enhancement
  generateRecipeDescription(recipe: Partial<Recipe>): Promise<string>;
  suggestRecipeTags(recipe: Partial<Recipe>): Promise<string[]>;
  estimateCookingTime(instructions: string[]): Promise<{ prepTime: number; cookTime: number }>;
}

interface ParsedRecipe {
  name: string;
  description?: string;
  ingredients: ParsedIngredient[];
  instructions: string[];
  servings?: number;
  prepTime?: number;
  cookTime?: number;
  tags?: string[];
  confidence: number;
}

interface ParsedIngredient {
  name: string;
  quantity?: number;
  unit?: string;
  preparation?: string;
  confidence: number;
}
```

#### Usage Examples

```typescript
import { aiParserService } from '../services/aiParserService';

// Parse recipe from text
const parsedRecipe = await aiParserService.parseRecipeFromText(`
  Marinara Sauce
  
  Ingredients:
  - 2 cans (28 oz each) crushed tomatoes
  - 3 cloves garlic, minced
  - 1 medium onion, diced
  
  Instructions:
  1. Heat oil in a large saucepan
  2. Add onion and garlic, cook until fragrant
  3. Add tomatoes and simmer for 30 minutes
`);

// Extract ingredients from text
const ingredients = await aiParserService.extractIngredients(
  "2 cups flour, 1 tsp salt, 3 eggs"
);

// Generate recipe description
const description = await aiParserService.generateRecipeDescription({
  name: "Marinara Sauce",
  ingredients: parsedIngredients,
  tags: ["italian", "sauce"]
});
```

### Website Builder Service

**Location**: `src/services/websiteBuilderService.ts`

Manages website creation, templating, and deployment for restaurant websites.

#### Methods

```typescript
interface WebsiteBuilderService {
  // Template management
  getAvailableTemplates(): Promise<WebsiteTemplate[]>;
  applyTemplate(restaurantId: number, templateId: string): Promise<void>;
  createCustomTemplate(templateData: TemplateData): Promise<WebsiteTemplate>;
  
  // Content management
  updatePageContent(restaurantId: number, pageId: string, content: PageContent): Promise<void>;
  addContentBlock(restaurantId: number, blockData: ContentBlockData): Promise<ContentBlock>;
  updateContentBlock(blockId: number, updates: Partial<ContentBlock>): Promise<ContentBlock>;
  
  // Theme management
  updateTheme(restaurantId: number, themeConfig: ThemeConfig): Promise<void>;
  previewTheme(restaurantId: number, themeConfig: ThemeConfig): Promise<string>;
  
  // Deployment
  publishWebsite(restaurantId: number): Promise<DeploymentResult>;
  generateStaticSite(restaurantId: number): Promise<StaticSiteFiles>;
  
  // Domain management
  setupCustomDomain(restaurantId: number, domain: string): Promise<void>;
  verifyDomainOwnership(domain: string): Promise<boolean>;
  
  // SEO optimization
  generateSitemap(restaurantId: number): Promise<string>;
  optimizeForSEO(restaurantId: number): Promise<SEOReport>;
}

interface WebsiteTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  previewUrl: string;
  features: string[];
  config: TemplateConfig;
}

interface PageContent {
  blocks: ContentBlock[];
  meta: {
    title: string;
    description: string;
    keywords: string[];
  };
}

interface DeploymentResult {
  success: boolean;
  url: string;
  deploymentId: string;
  errors?: string[];
}
```

#### Usage Examples

```typescript
import { websiteBuilderService } from '../services/websiteBuilderService';

// Apply template to restaurant website
await websiteBuilderService.applyTemplate(restaurantId, 'modern-restaurant');

// Update theme colors
await websiteBuilderService.updateTheme(restaurantId, {
  primaryColor: '#2196f3',
  secondaryColor: '#ff9800',
  backgroundColor: '#ffffff',
  textColor: '#333333'
});

// Add hero content block
const heroBlock = await websiteBuilderService.addContentBlock(restaurantId, {
  type: 'hero',
  title: 'Welcome to Our Restaurant',
  content: 'Experience exceptional dining with fresh, local ingredients',
  imageUrl: 'https://cloudinary.com/hero-image.jpg',
  order: 0
});

// Publish website
const deployment = await websiteBuilderService.publishWebsite(restaurantId);
console.log(`Website published at: ${deployment.url}`);
```

### Theming Service

**Location**: `src/services/themingService.ts`

Advanced theming system for restaurant websites and applications.

#### Methods

```typescript
interface ThemingService {
  // Color palette management
  getColorPalettes(restaurantId: number): Promise<ColorPalette[]>;
  createColorPalette(restaurantId: number, paletteData: ColorPaletteData): Promise<ColorPalette>;
  generateColorPalette(baseColor: string): Promise<GeneratedColorPalette>;
  
  // Typography management
  getTypographyConfigs(restaurantId: number): Promise<TypographyConfig[]>;
  createTypographyConfig(restaurantId: number, configData: TypographyConfigData): Promise<TypographyConfig>;
  previewTypography(config: TypographyConfig): Promise<string>;
  
  // Theme compilation
  compileTheme(restaurantId: number): Promise<CompiledTheme>;
  generateCSS(themeConfig: ThemeConfig): Promise<string>;
  generateSCSS(themeConfig: ThemeConfig): Promise<string>;
  
  // Brand asset management
  uploadBrandAsset(restaurantId: number, assetData: BrandAssetData): Promise<BrandAsset>;
  getBrandAssets(restaurantId: number): Promise<BrandAsset[]>;
  optimizeBrandAsset(assetId: number): Promise<OptimizedAsset>;
  
  // Template application
  applyTemplateTheme(restaurantId: number, templateId: string): Promise<void>;
  customizeTemplateTheme(restaurantId: number, templateId: string, customizations: ThemeCustomizations): Promise<void>;
}

interface ColorPalette {
  id: number;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  neutral: string[];
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

interface TypographyConfig {
  id: number;
  name: string;
  fontFamilies: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  fontSizes: Record<string, string>;
  fontWeights: Record<string, number>;
  lineHeights: Record<string, number>;
}

interface CompiledTheme {
  css: string;
  scss: string;
  variables: Record<string, string>;
  mediaQueries: Record<string, string>;
}
```

#### Usage Examples

```typescript
import { themingService } from '../services/themingService';

// Generate color palette from brand color
const palette = await themingService.generateColorPalette('#2196f3');

// Create custom typography configuration
const typography = await themingService.createTypographyConfig(restaurantId, {
  name: 'Modern Elegant',
  fontFamilies: {
    primary: 'Inter, sans-serif',
    secondary: 'Playfair Display, serif'
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem'
  }
});

// Compile complete theme
const compiledTheme = await themingService.compileTheme(restaurantId);

// Generate CSS for theme
const css = await themingService.generateCSS(themeConfig);
```

## Controllers

### Recipe Controller

**Location**: `src/controllers/recipeController.ts`

Handles all recipe-related HTTP requests and business logic.

#### Key Methods

```typescript
class RecipeController {
  // CRUD operations
  async getRecipes(req: Request, res: Response): Promise<void>;
  async getRecipeById(req: Request, res: Response): Promise<void>;
  async createRecipe(req: Request, res: Response): Promise<void>;
  async updateRecipe(req: Request, res: Response): Promise<void>;
  async deleteRecipe(req: Request, res: Response): Promise<void>;
  
  // Special operations
  async scaleRecipe(req: Request, res: Response): Promise<void>;
  async duplicateRecipe(req: Request, res: Response): Promise<void>;
  async importRecipe(req: Request, res: Response): Promise<void>;
  async exportRecipe(req: Request, res: Response): Promise<void>;
  
  // Search and filtering
  async searchRecipes(req: Request, res: Response): Promise<void>;
  async getRecipesByCategory(req: Request, res: Response): Promise<void>;
  async getRecipesByTag(req: Request, res: Response): Promise<void>;
  
  // Photo management
  async uploadRecipePhoto(req: Request, res: Response): Promise<void>;
  async deleteRecipePhoto(req: Request, res: Response): Promise<void>;
}
```

#### Usage Examples

```typescript
// GET /api/recipes?category=1&search=marinara&page=1&limit=20
app.get('/api/recipes', protect, setRestaurantContext, recipeController.getRecipes);

// POST /api/recipes/:id/scale
app.post('/api/recipes/:id/scale', protect, setRestaurantContext, recipeController.scaleRecipe);

// Request body for scaling
{
  "scaleFactor": 2.5,
  "targetYield": 10,
  "targetUnit": "servings"
}
```

### Customer Auth Controller

**Location**: `src/controllers/customerAuthController.ts`

Manages customer authentication, registration, and profile management.

#### Key Methods

```typescript
class CustomerAuthController {
  // Authentication
  async register(req: Request, res: Response): Promise<void>;
  async login(req: Request, res: Response): Promise<void>;
  async logout(req: Request, res: Response): Promise<void>;
  async refreshToken(req: Request, res: Response): Promise<void>;
  
  // Email verification
  async verifyEmail(req: Request, res: Response): Promise<void>;
  async resendVerificationEmail(req: Request, res: Response): Promise<void>;
  
  // Password management
  async requestPasswordReset(req: Request, res: Response): Promise<void>;
  async resetPassword(req: Request, res: Response): Promise<void>;
  async changePassword(req: Request, res: Response): Promise<void>;
  
  // Profile management
  async getProfile(req: CustomerAuthRequest, res: Response): Promise<void>;
  async updateProfile(req: CustomerAuthRequest, res: Response): Promise<void>;
  async deleteAccount(req: CustomerAuthRequest, res: Response): Promise<void>;
  
  // Restaurant associations
  async getCustomerRestaurants(req: CustomerAuthRequest, res: Response): Promise<void>;
  async joinRestaurant(req: CustomerAuthRequest, res: Response): Promise<void>;
  async leaveRestaurant(req: CustomerAuthRequest, res: Response): Promise<void>;
}
```

### Platform Admin Controllers

**Location**: `src/controllers/platform/`

Handles platform administration functions.

#### Restaurant Controller

```typescript
class PlatformRestaurantController {
  async getRestaurants(req: Request, res: Response): Promise<void>;
  async getRestaurant(req: Request, res: Response): Promise<void>;
  async updateRestaurant(req: Request, res: Response): Promise<void>;
  async verifyRestaurant(req: Request, res: Response): Promise<void>;
  async suspendRestaurant(req: Request, res: Response): Promise<void>;
  async unsuspendRestaurant(req: Request, res: Response): Promise<void>;
  async addRestaurantNote(req: Request, res: Response): Promise<void>;
  async getRestaurantAnalytics(req: Request, res: Response): Promise<void>;
  async getPlatformAnalytics(req: Request, res: Response): Promise<void>;
}
```

#### Subscription Controller

```typescript
class PlatformSubscriptionController {
  async getSubscriptions(req: Request, res: Response): Promise<void>;
  async getSubscription(req: Request, res: Response): Promise<void>;
  async updateSubscription(req: Request, res: Response): Promise<void>;
  async createTrialSubscription(req: Request, res: Response): Promise<void>;
  async cancelSubscription(req: Request, res: Response): Promise<void>;
  async getSubscriptionAnalytics(req: Request, res: Response): Promise<void>;
}
```

## Middleware

### Authentication Middleware

**Location**: `src/middleware/authMiddleware.ts`

Handles JWT token validation and user authentication.

```typescript
interface AuthMiddleware {
  protect: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  requireRole: (roles: UserRole[]) => (req: Request, res: Response, next: NextFunction) => void;
}

// Usage
app.get('/api/recipes', protect, requireRole(['USER', 'ADMIN']), recipeController.getRecipes);
```

### Customer Authentication Middleware

**Location**: `src/middleware/authenticateCustomer.ts`

Separate authentication system for customers.

```typescript
interface CustomerAuthMiddleware {
  authenticateCustomer: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  optionalCustomerAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

// Extends Request with customer data
interface CustomerAuthRequest extends Request {
  customer?: Customer;
  restaurantId?: number;
}
```

### Restaurant Context Middleware

**Location**: `src/middleware/restaurantContext.ts`

Ensures proper multi-tenant context for all operations.

```typescript
interface RestaurantContextMiddleware {
  setRestaurantContext: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  requireRestaurantContext: (req: Request, res: Response, next: NextFunction) => void;
  validateRestaurantAccess: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

// Extended Request interface
interface RequestWithRestaurant extends Request {
  restaurantId?: number;
  restaurant?: Restaurant;
}
```

### Platform Admin Middleware

**Location**: `src/middleware/platformAuth.ts`

Authentication and authorization for platform administrators.

```typescript
interface PlatformAuthMiddleware {
  platformAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  requirePlatformRole: (roles: PlatformRole[]) => (req: Request, res: Response, next: NextFunction) => void;
  logPlatformAction: (action: string) => (req: Request, res: Response, next: NextFunction) => void;
}

type PlatformRole = 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT' | 'BILLING';
```

### Upload Middleware

**Location**: `src/middleware/uploadMiddleware.ts`

Handles file uploads with validation and processing.

```typescript
interface UploadMiddleware {
  single: (fieldName: string) => (req: Request, res: Response, next: NextFunction) => void;
  multiple: (fieldName: string, maxCount?: number) => (req: Request, res: Response, next: NextFunction) => void;
  fields: (fields: Array<{ name: string; maxCount?: number }>) => (req: Request, res: Response, next: NextFunction) => void;
}

// Configuration
const uploadConfig = {
  fileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  destination: 'uploads/',
  filename: (req: Request, file: Express.Multer.File) => string;
};
```

## Utilities

### Validation Utilities

**Location**: `src/utils/validation.ts`

Input validation and sanitization functions.

```typescript
interface ValidationUtils {
  // Basic validation
  isEmail(email: string): boolean;
  isStrongPassword(password: string): boolean;
  isValidPhone(phone: string): boolean;
  isValidUrl(url: string): boolean;
  
  // Data sanitization
  sanitizeInput(input: string): string;
  sanitizeHtml(html: string): string;
  escapeSpecialChars(text: string): string;
  
  // Business logic validation
  isValidRecipeData(data: Partial<Recipe>): ValidationResult;
  isValidMenuData(data: Partial<Menu>): ValidationResult;
  isValidReservationData(data: Partial<Reservation>): ValidationResult;
  
  // Custom validators
  validateRestaurantSubdomain(subdomain: string): boolean;
  validateBusinessHours(hours: BusinessHours): ValidationResult;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}
```

### Date/Time Utilities

**Location**: `src/utils/dateTime.ts`

Date and time handling with timezone support.

```typescript
interface DateTimeUtils {
  // Timezone conversion
  convertToRestaurantTimezone(date: Date, restaurantId: number): Date;
  convertFromRestaurantTimezone(date: Date, restaurantId: number): Date;
  
  // Business hours
  isWithinBusinessHours(time: Date, restaurantId: number): boolean;
  getNextAvailableSlot(startTime: Date, restaurantId: number): Date;
  
  // Formatting
  formatForDisplay(date: Date, format: string, timezone?: string): string;
  formatForDatabase(date: Date): string;
  
  // Reservation specific
  calculateReservationEndTime(startTime: Date, durationMinutes: number): Date;
  isReservationSlotAvailable(startTime: Date, endTime: Date, restaurantId: number): Promise<boolean>;
}
```

### Security Utilities

**Location**: `src/utils/security.ts`

Security-related helper functions.

```typescript
interface SecurityUtils {
  // Password handling
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
  generateSecureToken(length?: number): string;
  
  // JWT operations
  generateJWT(payload: object, expiresIn?: string): string;
  verifyJWT(token: string): Promise<any>;
  refreshJWT(token: string): Promise<string>;
  
  // Rate limiting
  createRateLimiter(windowMs: number, maxRequests: number): RateLimiterFunction;
  isRateLimited(identifier: string, limiter: string): Promise<boolean>;
  
  // Data encryption
  encrypt(data: string, key?: string): string;
  decrypt(encryptedData: string, key?: string): string;
  
  // Input sanitization
  sanitizeForDatabase(input: any): any;
  preventSQLInjection(query: string): boolean;
  preventXSS(input: string): string;
}
```

### Logging Utilities

**Location**: `src/utils/logger.ts`

Structured logging with different levels and outputs.

```typescript
interface Logger {
  // Log levels
  debug(message: string, meta?: object): void;
  info(message: string, meta?: object): void;
  warn(message: string, meta?: object): void;
  error(message: string, error?: Error, meta?: object): void;
  
  // Context logging
  child(context: object): Logger;
  
  // Performance logging
  startTimer(label: string): Timer;
  
  // Request logging
  logRequest(req: Request, res: Response, duration: number): void;
  logError(error: Error, req?: Request): void;
}

interface Timer {
  end(meta?: object): void;
}

// Usage
const logger = createLogger({ service: 'recipe-service' });
logger.info('Recipe created', { recipeId: 123, userId: 456 });

const timer = logger.startTimer('recipe-creation');
// ... perform operation
timer.end({ recipeId: newRecipe.id });
```

## Database Layer

### Prisma Configuration

**Location**: `backend/prisma/schema.prisma`

Database schema and relationships are defined using Prisma ORM.

#### Key Models

```prisma
model Restaurant {
  id           Int      @id @default(autoincrement())
  name         String
  subdomain    String   @unique
  email        String
  phone        String?
  timezone     String   @default("UTC")
  status       RestaurantStatus @default(ACTIVE)
  
  // Relationships
  users        User[]
  customers    CustomerRestaurant[]
  recipes      Recipe[]
  menus        Menu[]
  reservations Reservation[]
  orders       Order[]
  
  // Settings
  settings     Json?
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Customer {
  id               Int      @id @default(autoincrement())
  email            String   @unique
  firstName        String
  lastName         String
  phone            String?
  isEmailVerified  Boolean  @default(false)
  passwordHash     String
  
  // Multi-tenant relationships
  restaurants      CustomerRestaurant[]
  reservations     Reservation[]
  sessions         CustomerSession[]
  
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

### Database Utilities

**Location**: `src/utils/database.ts`

Database connection and query utilities.

```typescript
interface DatabaseUtils {
  // Transaction management
  withTransaction<T>(operation: (tx: PrismaTransaction) => Promise<T>): Promise<T>;
  
  // Connection management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  healthCheck(): Promise<boolean>;
  
  // Query optimization
  batchQuery<T>(queries: Query[]): Promise<T[]>;
  optimizeQuery(query: any): any;
  
  // Seeding and migration
  seedDatabase(): Promise<void>;
  runMigrations(): Promise<void>;
  
  // Backup and restore
  createBackup(): Promise<string>;
  restoreFromBackup(backupPath: string): Promise<void>;
}
```

## External Integrations

### Stripe Integration

**Location**: `src/integrations/stripe.ts`

```typescript
interface StripeIntegration {
  // Webhook handling
  handleWebhook(event: Stripe.Event): Promise<void>;
  verifyWebhookSignature(body: string, signature: string): boolean;
  
  // Event processors
  processSubscriptionCreated(subscription: Stripe.Subscription): Promise<void>;
  processSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void>;
  processSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void>;
  processInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void>;
  processInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void>;
  
  // Usage tracking
  trackFeatureUsage(restaurantId: number, feature: string, quantity: number): Promise<void>;
  getUsageMetrics(restaurantId: number, period: string): Promise<UsageMetrics>;
}
```

### Email Provider Integration

**Location**: `src/integrations/email.ts`

```typescript
interface EmailProviderIntegration {
  // Provider management
  initializeProvider(config: EmailProviderConfig): Promise<void>;
  
  // Email sending
  sendTransactionalEmail(emailData: TransactionalEmailData): Promise<EmailResult>;
  sendBulkEmail(emailData: BulkEmailData): Promise<EmailResult[]>;
  
  // Template management
  createEmailTemplate(template: EmailTemplate): Promise<string>;
  updateEmailTemplate(templateId: string, updates: Partial<EmailTemplate>): Promise<void>;
  
  // Analytics
  getEmailMetrics(timeRange: TimeRange): Promise<EmailMetrics>;
  trackEmailOpens(emailId: string): Promise<void>;
  trackEmailClicks(emailId: string, linkId: string): Promise<void>;
}
```

## Configuration

### Environment Configuration

**Location**: `src/config/environment.ts`

```typescript
interface EnvironmentConfig {
  // Server configuration
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  
  // Database
  DATABASE_URL: string;
  
  // Authentication
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  
  // External services
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  
  EMAIL_PROVIDER_API_KEY: string;
  EMAIL_FROM_ADDRESS: string;
  
  // Security
  BCRYPT_ROUNDS: number;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  
  // Features
  ENABLE_AI_PARSING: boolean;
  ENABLE_REAL_TIME_FEATURES: boolean;
  ENABLE_ANALYTICS: boolean;
}

// Configuration validation
const validateConfig = (config: EnvironmentConfig): void => {
  const required = ['DATABASE_URL', 'JWT_SECRET', 'STRIPE_SECRET_KEY'];
  const missing = required.filter(key => !config[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};
```

### Database Configuration

**Location**: `src/config/database.ts`

```typescript
interface DatabaseConfig {
  url: string;
  ssl: boolean;
  connectionLimit: number;
  idleTimeout: number;
  logging: boolean;
  migrations: {
    directory: string;
    tableName: string;
  };
  seeds: {
    directory: string;
  };
}

const databaseConfig: DatabaseConfig = {
  url: process.env.DATABASE_URL!,
  ssl: process.env.NODE_ENV === 'production',
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
  logging: process.env.NODE_ENV === 'development',
  migrations: {
    directory: './prisma/migrations',
    tableName: '_prisma_migrations'
  },
  seeds: {
    directory: './prisma/seeds'
  }
};
```

## Error Handling

### Error Types

**Location**: `src/types/errors.ts`

```typescript
abstract class AppError extends Error {
  abstract statusCode: number;
  abstract isOperational: boolean;
  
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  statusCode = 400;
  isOperational = true;
  
  constructor(message: string, public fields?: Record<string, string>) {
    super(message);
  }
}

class NotFoundError extends AppError {
  statusCode = 404;
  isOperational = true;
}

class UnauthorizedError extends AppError {
  statusCode = 401;
  isOperational = true;
}

class ForbiddenError extends AppError {
  statusCode = 403;
  isOperational = true;
}

class ConflictError extends AppError {
  statusCode = 409;
  isOperational = true;
}

class InternalServerError extends AppError {
  statusCode = 500;
  isOperational = false;
}
```

### Error Handler Middleware

**Location**: `src/middleware/errorHandler.ts`

```typescript
const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error occurred', error, {
    url: req.url,
    method: req.method,
    userId: req.user?.id,
    restaurantId: req.restaurantId
  });

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: {
        message: error.message,
        code: error.constructor.name.replace('Error', '').toUpperCase(),
        ...(error instanceof ValidationError && { fields: error.fields })
      }
    });
  } else {
    // Unexpected error
    res.status(500).json({
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR'
      }
    });
  }
};
```

## Testing

### Test Utilities

**Location**: `src/utils/testUtils.ts`

```typescript
interface TestUtils {
  // Database setup
  setupTestDatabase(): Promise<void>;
  teardownTestDatabase(): Promise<void>;
  clearTestData(): Promise<void>;
  
  // Mock data creation
  createMockUser(overrides?: Partial<User>): User;
  createMockRestaurant(overrides?: Partial<Restaurant>): Restaurant;
  createMockRecipe(overrides?: Partial<Recipe>): Recipe;
  
  // Authentication helpers
  generateTestToken(user: User): string;
  authenticateTestRequest(request: any, user: User): any;
  
  // API testing
  makeAuthenticatedRequest(path: string, method: string, data?: any, user?: User): Promise<any>;
  expectValidationError(response: any, field: string): void;
}
```

### Example Tests

```typescript
describe('Recipe Controller', () => {
  beforeEach(async () => {
    await testUtils.clearTestData();
  });

  describe('POST /api/recipes', () => {
    it('should create a recipe with valid data', async () => {
      const user = await testUtils.createMockUser();
      const recipeData = {
        name: 'Test Recipe',
        instructions: 'Test instructions',
        ingredients: []
      };

      const response = await testUtils.makeAuthenticatedRequest(
        '/api/recipes',
        'POST',
        recipeData,
        user
      );

      expect(response.status).toBe(201);
      expect(response.body.recipe.name).toBe('Test Recipe');
    });

    it('should return validation error for invalid data', async () => {
      const user = await testUtils.createMockUser();
      const invalidData = { name: '' }; // Missing required fields

      const response = await testUtils.makeAuthenticatedRequest(
        '/api/recipes',
        'POST',
        invalidData,
        user
      );

      expect(response.status).toBe(400);
      testUtils.expectValidationError(response, 'name');
      testUtils.expectValidationError(response, 'instructions');
    });
  });
});
```

This comprehensive documentation covers the backend architecture, services, and utilities of the KitchenSync application. For specific implementation details and method signatures, refer to the individual source files.