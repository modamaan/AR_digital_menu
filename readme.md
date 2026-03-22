# Coowik - E-Commerce Store Builder Platform

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**Coowik** is a modern, full-stack e-commerce platform that enables users to create and manage their own online stores with ease. Built with Next.js 16, TypeScript, and powered by Firebase Authentication and NeonDB (PostgreSQL).

## 🌟 Features

### Store Management

- **Multi-Store Support** - Create and manage multiple stores from a single account
- **Store Customization** - Customize store name, bio, banner, and profile images
- **Template Selection** - Choose from pre-designed store templates
- **Unique Store URLs** - Each store gets a unique slug-based URL

### Product Management

- **Product CRUD** - Full create, read, update, delete operations
- **Multi-Image Upload** - Upload multiple product images with primary image selection
- **Inventory Tracking** - Real-time inventory management
- **Product Status** - Toggle products between active/disabled states
- **Discount Support** - Set percentage-based discounts on products
- **View Counter** - Track product page views

### Order Management

- **Order Processing** - Complete order lifecycle management
- **Status Tracking** - Multiple order statuses (pending, confirmed, packed, shipped, delivered, cancelled)
- **Payment Integration** - Support for COD, Razorpay, and UPI payments
- **Payment Verification** - Screenshot upload for UPI payments
- **Order Timeline** - Visual timeline showing order status history
- **Customer Information** - Store customer details and shipping addresses

### Analytics & Reporting

- **Dashboard Analytics** - Product views, total orders, and sales metrics
- **Date Range Filtering** - Filter analytics by time periods (today, week, month, year, all time)
- **Top Products** - View best-selling products with sales data
- **Store Switching** - Quick switch between multiple stores

### Subscription System

- **Tiered Plans** - Lite ($10/month) and Standard ($25/month) plans
- **7-Day Free Trial** - Try before you buy
- **Feature Gating** - Access control based on subscription tier
- **Razorpay Integration** - Secure payment processing
- **Subscription Management** - View and manage active subscriptions

### Payment Methods

- **Cash on Delivery (COD)** - Built-in COD support
- **Razorpay** - Merchant API key integration
- **UPI** - UPI ID-based payments with screenshot verification

### Storefront

- **Public Store Pages** - Beautiful, responsive storefront for customers
- **Product Catalog** - Browse products with images and details
- **Shopping Cart** - Add to cart and checkout functionality
- **Search** - Search products by name
- **Mobile Optimized** - Fully responsive design

### Mobile Experience

- **Responsive Tables** - Tables convert to expandable cards on mobile
- **Touch-Friendly** - Optimized for mobile interactions
- **Progressive Web App** - Can be installed as a mobile app

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Image Optimization**: Next.js Image + ImageKit

### Backend

- **Database**: NeonDB (Serverless PostgreSQL)
- **ORM**: Drizzle ORM
- **Authentication**: Firebase Authentication
- **File Storage**: ImageKit
- **Payment Gateway**: Razorpay

### Development Tools

- **Package Manager**: npm
- **Linting**: ESLint
- **Database Studio**: Drizzle Studio

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18.x or higher
- npm or yarn
- Git

You'll also need accounts for:

- [NeonDB](https://neon.tech) - Database
- [Firebase](https://firebase.google.com) - Authentication
- [ImageKit](https://imagekit.io) - Image storage
- [Razorpay](https://razorpay.com) - Payment processing (optional)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/modamaan/coowik_web.git
cd coowik_web
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```bash
# Database
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# ImageKit
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

# Razorpay (Optional)
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
REVALIDATION_SECRET=your_secret_key
```

### 4. Database Setup

#### Push Schema to Database

```bash
npm run db:push
```

#### Seed Subscription Plans

```bash
npx tsx seed.ts
```

This will create the default subscription plans (Lite and Standard) in your database.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## 📚 Detailed Setup Guides

### Firebase Setup

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed Firebase configuration instructions.

### Razorpay Setup

See [RAZORPAY_SETUP.md](./RAZORPAY_SETUP.md) for payment gateway integration guide.

## 🗄️ Database Schema

The application uses the following main tables:

- **users** - User accounts with subscription info
- **stores** - Store information and settings
- **products** - Product catalog
- **product_images** - Product image gallery
- **orders** - Customer orders
- **subscription_plans** - Available subscription tiers
- **subscriptions** - Active user subscriptions
- **payment_methods** - Store payment configurations

### Database Commands

```bash
# Open Drizzle Studio (Database GUI)
npm run db:studio

# Generate migration files
npm run db:generate

# Run migrations
npm run db:migrate

# Drop migration
npm run db:drop
```

## 🎨 Project Structure

```
coowik_web/
├── app/                      # Next.js App Router pages
│   ├── (auth)/              # Authentication pages
│   ├── home/                # Dashboard pages
│   ├── [storeSlug]/         # Public storefront
│   ├── api/                 # API routes
│   └── plans/               # Subscription plans
├── components/              # React components
│   ├── home/               # Dashboard components
│   ├── orders/             # Order management
│   ├── products/           # Product management
│   └── storefront/         # Public store components
├── lib/                     # Utility libraries
│   ├── actions/            # Server actions
│   ├── db/                 # Database configuration
│   ├── firebase/           # Firebase setup
│   └── utils/              # Helper functions
├── public/                  # Static assets
└── docs/                    # Documentation
```

## 🔐 Authentication Flow

1. User signs up/signs in with Firebase Authentication (Google OAuth)
2. Firebase UID is used to create/retrieve user in NeonDB
3. Session cookie is set for server-side authentication
4. Middleware protects routes based on authentication status

## 💳 Payment Flow

### Subscription Payments (Razorpay)

1. User selects a plan on `/plans` page
2. Razorpay checkout modal opens
3. Payment is processed through Razorpay
4. Webhook updates subscription status
5. User gets access to premium features

### Store Payments (Merchant Integration)

1. Store owner configures payment methods in settings
2. Customers can pay via COD, Razorpay, or UPI
3. UPI payments require screenshot upload
4. Store owner verifies and processes orders

## 📱 Mobile Responsiveness

The application features a fully responsive design with special mobile optimizations:

- **Card-based Tables**: Tables convert to expandable cards on mobile devices
- **Touch Gestures**: Optimized for touch interactions
- **Mobile Navigation**: Collapsible sidebar with hamburger menu
- **Responsive Images**: Optimized image loading for mobile networks

## 🔧 Development

### Code Style

The project uses ESLint for code quality. Run linting with:

```bash
npm run lint
```

### Building for Production

```bash
npm run build
npm start
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/modamaan/coowik_web)

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- Netlify
- AWS Amplify
- Railway
- Render

## 📖 API Documentation

### Server Actions

The application uses Next.js Server Actions for data mutations:

- `lib/actions/store.ts` - Store management
- `lib/actions/product.ts` - Product operations
- `lib/actions/order.ts` - Order processing
- `lib/actions/subscription.ts` - Subscription management
- `lib/actions/analytics.ts` - Analytics data

### API Routes

- `/api/auth/session` - Create authentication session
- `/api/webhooks/razorpay` - Razorpay webhook handler
- `/api/revalidate` - On-demand revalidation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Mohammed Amaan** - [GitHub](https://github.com/modamaan)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment
- NeonDB for serverless PostgreSQL
- Firebase for authentication services
- ImageKit for image optimization
- Razorpay for payment processing

## 📞 Support

For support, email support@coowik.com.

## 🗺️ Roadmap

- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] WhatsApp integration
- [ ] Inventory alerts
- [ ] Bulk product import/export
- [ ] Custom domain support
- [ ] Advanced SEO tools
- [ ] Marketing automation
- [ ] Customer reviews and ratings

---

**Built with ❤️ using Next.js**
