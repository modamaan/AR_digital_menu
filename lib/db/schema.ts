import { pgTable, text, timestamp, uuid, boolean, decimal, integer, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/**
 * Subscription Plans Table
 * Defines available subscription tiers (Lite & Standard) with pricing and features
 */
export const subscriptionPlans = pgTable('subscription_plans', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(), // 'Lite Monthly', 'Lite Yearly', 'Standard Monthly', 'Standard Yearly'
    slug: text('slug').notNull().unique(), // 'lite_monthly', 'lite_yearly', 'standard_monthly', 'standard_yearly'
    tier: text('tier').notNull(), // 'lite', 'standard'
    billingCycle: text('billing_cycle').notNull(), // 'monthly', 'yearly'
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    currency: text('currency').notNull().default('USD'),
    razorpayPlanId: text('razorpay_plan_id').unique(),

    // Feature flags
    hasCustomDomain: boolean('has_custom_domain').default(false),
    hasAdvancedAnalytics: boolean('has_advanced_analytics').default(false),
    removeBranding: boolean('remove_branding').default(false),

    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Users Table
 */
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    clerkId: text('clerk_id').unique().notNull(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    // Subscription fields
    subscriptionStatus: text('subscription_status').default('none'), // 'none', 'trial', 'active', 'expired', 'cancelled'
    trialStartDate: timestamp('trial_start_date'),
    trialEndDate: timestamp('trial_end_date'),
    currentPlanId: uuid('current_plan_id').references(() => subscriptionPlans.id),
    razorpayCustomerId: text('razorpay_customer_id').unique(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
});

/**
 * Stores Table
 * Stores information about user-created stores (restaurants/digital menus)
 */
export const stores = pgTable('stores', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    templateId: text('template_id').notNull(),
    bio: text('bio'),
    bannerImage: text('banner_image'),
    profileImage: text('profile_image'),
    currency: text('currency').notNull().default('USD'),
    notificationWhatsapp: boolean('notification_whatsapp').notNull().default(false),
    whatsappPhone: text('whatsapp_phone'),
    notificationEmail: boolean('notification_email').notNull().default(true),
    deliveryCost: decimal('delivery_cost', { precision: 10, scale: 2 }).default('10.00'),
    enablePickup: boolean('enable_pickup').notNull().default(true),
    enableDelivery: boolean('enable_delivery').notNull().default(true),

    // Restaurant-specific fields
    cuisineType: text('cuisine_type'), // 'Italian', 'Chinese', 'Indian', etc.
    openingHours: text('opening_hours'), // JSON string with daily hours
    seatingCapacity: integer('seating_capacity'),
    restaurantType: text('restaurant_type').default('both'), // 'dine_in', 'takeout', 'both'
    address: text('address'),
    phone: text('phone'),
    isActive: boolean('is_active').default(true), // Restaurant open/closed

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
});

/**
 * Menu Categories Table
 * Organizes menu items into categories (Appetizers, Main Course, Desserts, etc.)
 */
export const menuCategories = pgTable('menu_categories', {
    id: uuid('id').defaultRandom().primaryKey(),
    storeId: uuid('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
    name: text('name').notNull(), // "Appetizers", "Main Course", etc.
    description: text('description'),
    displayOrder: integer('display_order').default(0).notNull(),
    icon: text('icon'), // Emoji or icon identifier
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
}, (table) => ({
    storeIdIdx: index('menu_categories_store_id_idx').on(table.storeId),
}));

/**
 * Tables Table
 * Restaurant tables with QR codes for ordering
 */
export const tables = pgTable('tables', {
    id: uuid('id').defaultRandom().primaryKey(),
    storeId: uuid('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
    tableNumber: text('table_number').notNull(), // "T1", "Table 1", etc.
    qrCode: text('qr_code').notNull(), // QR code data/URL
    seatingCapacity: integer('seating_capacity').default(4),
    status: text('status').default('available'), // 'available', 'occupied', 'reserved'
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
}, (table) => ({
    storeIdIdx: index('tables_store_id_idx').on(table.storeId),
    qrCodeIdx: index('tables_qr_code_idx').on(table.qrCode),
}));

/**
 * Products Table (Menu Items)
 * Stores product/menu item information for each store/restaurant
 */
export const products = pgTable('products', {
    id: uuid('id').defaultRandom().primaryKey(),
    storeId: uuid('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
    categoryId: uuid('category_id').references(() => menuCategories.id, { onDelete: 'set null' }), // Menu category
    name: text('name').notNull(),
    description: text('description'),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    discount: decimal('discount', { precision: 5, scale: 2 }).default('0'),
    inventory: integer('inventory').default(0).notNull(),
    viewCount: integer('view_count').default(0).notNull(),
    status: text('status').default('active').notNull(), // 'active' or 'disabled'

    // Menu item specific fields
    preparationTime: integer('preparation_time'), // Minutes
    isVegetarian: boolean('is_vegetarian').default(false),
    isVegan: boolean('is_vegan').default(false),
    isGlutenFree: boolean('is_gluten_free').default(false),
    spiceLevel: text('spice_level').default('none'), // 'none', 'mild', 'medium', 'hot'
    calories: integer('calories'),
    isAvailable: boolean('is_available').default(true), // In stock / out of stock
    glbUrl: text('glb_url'), // URL to 3D GLB model file (optional, for AR/3D view)

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
}, (table) => ({
    storeIdIdx: index('products_store_id_idx').on(table.storeId),
    categoryIdIdx: index('products_category_id_idx').on(table.categoryId),
    statusIdx: index('products_status_idx').on(table.status),
}));

/**
 * Product Images Table
 * Stores multiple images for each product
 */
export const productImages = pgTable('product_images', {
    id: uuid('id').defaultRandom().primaryKey(),
    productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
    imageUrl: text('image_url').notNull(),
    isPrimary: boolean('is_primary').default(false).notNull(),
    displayOrder: integer('display_order').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    productIdIdx: index('product_images_product_id_idx').on(table.productId),
}));

/**
 * Orders Table
 * Stores customer orders (supports multi-item orders for restaurants)
 */
export const orders = pgTable('orders', {
    id: uuid('id').defaultRandom().primaryKey(),
    storeId: uuid('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
    tableId: uuid('table_id').references(() => tables.id, { onDelete: 'set null' }), // For dine-in orders
    tableNumber: text('table_number'), // Display table number
    orderType: text('order_type').default('takeout'), // 'dine_in', 'takeout', 'delivery'

    customerName: text('customer_name').notNull(),
    customerEmail: text('customer_email').notNull(),
    customerPhone: text('customer_phone'),
    countryCode: text('country_code'),

    totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
    shippingMethod: text('shipping_method').default('pickup'), // 'pickup' | 'delivery'
    shippingCost: decimal('shipping_cost', { precision: 10, scale: 2 }).default('0.00'),
    shippingAddress: text('shipping_address'), // JSON string with address details
    specialInstructions: text('special_instructions'), // Customer notes

    paymentMethod: text('payment_method').default('cod'), // 'cod', 'razorpay', 'upi'
    status: text('status').default('pending').notNull(), // 'pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'
    estimatedReadyTime: timestamp('estimated_ready_time'), // When order will be ready

    // Payment status fields
    paymentStatus: text('payment_status').default('pending'), // 'pending', 'paid', 'failed'
    paymentScreenshotUrl: text('payment_screenshot_url'), // Screenshot of payment (for UPI)
    paymentVerifiedAt: timestamp('payment_verified_at'), // When payment was verified
    screenshotUploadedAt: timestamp('screenshot_uploaded_at'), // When screenshot was uploaded

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
}, (table) => ({
    storeIdIdx: index('orders_store_id_idx').on(table.storeId),
    tableIdIdx: index('orders_table_id_idx').on(table.tableId),
    createdAtIdx: index('orders_created_at_idx').on(table.createdAt),
    statusIdx: index('orders_status_idx').on(table.status),
    paymentStatusIdx: index('orders_payment_status_idx').on(table.paymentStatus),
}));

/**
 * Order Items Table
 * Stores individual items within an order (for cart functionality)
 */
export const orderItems = pgTable('order_items', {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
    productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull(),
    unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
    subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
    specialInstructions: text('special_instructions'), // Item-specific notes
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    orderIdIdx: index('order_items_order_id_idx').on(table.orderId),
    productIdIdx: index('order_items_product_id_idx').on(table.productId),
}));

/**
 * Relations
 */
export const usersRelations = relations(users, ({ many, one }) => ({
    stores: many(stores),
    subscriptions: many(subscriptions),
    currentPlan: one(subscriptionPlans, {
        fields: [users.currentPlanId],
        references: [subscriptionPlans.id],
    }),
}));

export const storesRelations = relations(stores, ({ one, many }) => ({
    user: one(users, {
        fields: [stores.userId],
        references: [users.id],
    }),
    products: many(products),
    orders: many(orders),
    menuCategories: many(menuCategories),
    tables: many(tables),
    paymentMethods: many(paymentMethods),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
    store: one(stores, {
        fields: [products.storeId],
        references: [stores.id],
    }),
    category: one(menuCategories, {
        fields: [products.categoryId],
        references: [menuCategories.id],
    }),
    images: many(productImages),
    orderItems: many(orderItems),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
    product: one(products, {
        fields: [productImages.productId],
        references: [products.id],
    }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
    store: one(stores, {
        fields: [orders.storeId],
        references: [stores.id],
    }),
    table: one(tables, {
        fields: [orders.tableId],
        references: [tables.id],
    }),
    orderItems: many(orderItems),
}));

/**
 * Subscriptions Table
 * Tracks active and historical subscriptions for users
 */
export const subscriptions = pgTable('subscriptions', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    planId: uuid('plan_id').notNull().references(() => subscriptionPlans.id),

    razorpaySubscriptionId: text('razorpay_subscription_id').unique(),
    razorpayPaymentId: text('razorpay_payment_id'),

    status: text('status').notNull(), // 'created', 'active', 'paused', 'cancelled', 'expired'
    currentPeriodStart: timestamp('current_period_start').notNull(),
    currentPeriodEnd: timestamp('current_period_end').notNull(),

    cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
    cancelledAt: timestamp('cancelled_at'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
}, (table) => ({
    userIdIdx: index('subscriptions_user_id_idx').on(table.userId),
    statusIdx: index('subscriptions_status_idx').on(table.status),
}));

export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
    subscriptions: many(subscriptions),
    users: many(users),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
    user: one(users, {
        fields: [subscriptions.userId],
        references: [users.id],
    }),
    plan: one(subscriptionPlans, {
        fields: [subscriptions.planId],
        references: [subscriptionPlans.id],
    }),
}));

/**
 * Payment Methods Table
 * Stores payment method configurations for each store
 * Simple merchant account approach - store owners enter their own API keys
 */
export const paymentMethods = pgTable('payment_methods', {
    id: uuid('id').defaultRandom().primaryKey(),
    storeId: uuid('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(), // 'razorpay', 'stripe', 'cod', 'upi'
    name: text('name').notNull(), // Display name

    // Merchant API Key fields (for Razorpay)
    apiKey: text('api_key'), // Merchant API Key
    apiSecret: text('api_secret'), // Merchant API Secret

    // UPI fields
    upiId: text('upi_id'), // Merchant's UPI ID/VPA (e.g., merchant@paytm)
    accountHolderName: text('account_holder_name'), // Account holder name
    bankName: text('bank_name'), // Bank name for display

    // Connection status
    connectionStatus: text('connection_status').default('disconnected'), // 'connected', 'disconnected'

    enabled: boolean('enabled').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
}, (table) => ({
    storeIdIdx: index('payment_methods_store_id_idx').on(table.storeId),
    providerIdx: index('payment_methods_provider_idx').on(table.provider),
}));

export const paymentMethodsRelations = relations(paymentMethods, ({ one }) => ({
    store: one(stores, {
        fields: [paymentMethods.storeId],
        references: [stores.id],
    }),
}));

export const menuCategoriesRelations = relations(menuCategories, ({ one, many }) => ({
    store: one(stores, {
        fields: [menuCategories.storeId],
        references: [stores.id],
    }),
    products: many(products),
}));

export const tablesRelations = relations(tables, ({ one, many }) => ({
    store: one(stores, {
        fields: [tables.storeId],
        references: [stores.id],
    }),
    orders: many(orders),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
    order: one(orders, {
        fields: [orderItems.orderId],
        references: [orders.id],
    }),
    product: one(products, {
        fields: [orderItems.productId],
        references: [products.id],
    }),
}));


export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Store = typeof stores.$inferSelect;
export type NewStore = typeof stores.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = typeof productImages.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type NewSubscriptionPlan = typeof subscriptionPlans.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type NewPaymentMethod = typeof paymentMethods.$inferInsert;
export type MenuCategory = typeof menuCategories.$inferSelect;
export type NewMenuCategory = typeof menuCategories.$inferInsert;
export type Table = typeof tables.$inferSelect;
export type NewTable = typeof tables.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
