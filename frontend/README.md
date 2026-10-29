# TrackGPT — AI-Powered Supply Chain & Inventory Intelligence Platform

**TrackGPT** is a complete, modern, production-oriented enterprise web application designed to monitor warehouse inventory, analyze historical sales velocity, forecast product demand using machine-learning models, detect immediate stockout risks, manage supplier networks, and track purchase order fulfillment through a centralized executive dashboard.

---

## 🚀 Key Highlights & Architectural Features

- **Royal-Blue Enterprise SaaS Aesthetic**: Clean royal-blue (`#2563EB`), deep navy (`#0F172A`), light blue (`#EFF6FF`), white cards with subtle borders (`#E2E8F0`), and restrained shadows.
- **Strict JavaScript & JSX Architecture**: Clean `.jsx` components and `.js` modules. Zero TypeScript dependencies or `.ts`/`.tsx` files.
- **Centralized Data & API Service Layer**: Built with Axios, configurable via environment variables (`VITE_API_BASE_URL`), and integrated with an isolated, reactive mock-data fallback for offline and demo execution.
- **Interactive Predictive AI Module**: Elevates the delivery risk diagnostics into an interactive modal (`AIResultModal`) capable of analyzing any vendor order, evaluating risk factors, and outputting action steps.
- **Rich Recharts Visualizations**:
  - Multi-series revenue & unit sales Area / Bar charts
  - Demand forecasting trajectory with historical vs. predicted boundary and 95% confidence intervals
  - Category stock distribution donut charts
  - Segmented stock health breakdown bars
- **End-to-End Workflows**:
  - Dynamic CRUD for warehouse inventory SKUs with category, supplier, lead time, and reorder levels
  - Detailed slide-over drawers for SKU stock movement logs
  - In-place stock adjustment modal (restock / dispatch / write-off)
  - Full purchase order & customer delivery logistics with status updates (On-Time, Delivered, Late)
  - One-click browser CSV export for all data tables
  - Printable / PDF audit reporting suite

---

## 📋 Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **React 18** | UI component rendering & reactive state |
| **Vite 5** | High-performance build tool & development server |
| **JavaScript (ES Modules)** | Pure JavaScript throughout (`.jsx`, `.js`) |
| **Tailwind CSS 3** | Enterprise design tokens & utility styling |
| **React Router DOM 6** | Declarative client-side routing & deep linking |
| **Recharts 2** | Responsive SVG charts (Area, Line, Bar, Pie, Composed) |
| **Lucide React** | Consistent enterprise iconography |
| **Axios** | HTTP client with request/response interceptors |

---

## 📁 Project Structure

```
Supply-chain/
├── public/                     # Static public assets
├── src/
│   ├── components/
│   │   ├── common/             # Reusable enterprise UI primitives
│   │   │   ├── AIResultModal.jsx     # Interactive delivery risk modal
│   │   │   ├── Badge.jsx             # Status badges (Low Stock, Delivered, etc.)
│   │   │   ├── Button.jsx            # Multi-variant button with loading state
│   │   │   ├── Card.jsx              # Enterprise card containers
│   │   │   ├── ConfirmDialog.jsx     # Destructive confirmation modal
│   │   │   ├── Drawer.jsx            # Slide-over detail panel
│   │   │   ├── EmptyState.jsx        # Data empty states with CTA
│   │   │   ├── ErrorState.jsx        # Service error box with retry button
│   │   │   ├── Input.jsx             # Form input field with validation
│   │   │   ├── Modal.jsx             # Accessible backdrop dialog
│   │   │   ├── Pagination.jsx         # Client-side table pagination
│   │   │   ├── Select.jsx            # Dropdown selector
│   │   │   ├── Skeleton.jsx          # Loading skeletons for tables & cards
│   │   │   └── Toast.jsx             # Floating notification manager
│   │   ├── dashboard/          # Dashboard-specific widgets & charts
│   │   │   ├── AIInsightCard.jsx
│   │   │   ├── CategoryDonutChart.jsx
│   │   │   ├── CriticalAlertsList.jsx
│   │   │   ├── CustomerPartnersList.jsx
│   │   │   ├── DemandOverviewChart.jsx
│   │   │   ├── KPICard.jsx
│   │   │   ├── RecentOrdersList.jsx
│   │   │   ├── SalesTrendChart.jsx
│   │   │   └── StockBreakdownChart.jsx
│   │   ├── inventory/          # Inventory CRUD modals & drawers
│   │   │   ├── ProductDetailsDrawer.jsx
│   │   │   ├── ProductFormModal.jsx
│   │   │   └── StockUpdateModal.jsx
│   │   └── layout/             # Shell navigation components
│   │       ├── DashboardLayout.jsx
│   │       ├── Sidebar.jsx
│   │       └── Topbar.jsx
│   ├── context/
│   │   └── AppContext.jsx      # Global settings, currency & toast context
│   ├── data/
│   │   └── mockData.js         # Isolated, realistic supply chain datasets
│   ├── pages/                  # Top-level page routes
│   │   ├── Dashboard.jsx       # Executive supply chain overview (/dashboard)
│   │   ├── Inventory.jsx       # Inventory table & SKU management (/inventory)
│   │   ├── SalesAnalytics.jsx  # Historical revenue & units sold (/sales)
│   │   ├── DemandForecast.jsx  # AI predictive demand with confidence band (/forecasting)
│   │   ├── StockAlerts.jsx     # Centralized stock risk & resolution (/alerts)
│   │   ├── Suppliers.jsx       # Vendor directory & SLA tracking (/suppliers)
│   │   ├── PurchaseOrders.jsx  # Inbound POs & Outbound Deliveries (/purchase-orders)
│   │   ├── Reports.jsx         # Audit logs & PDF/CSV reporting (/reports)
│   │   ├── Settings.jsx        # Organization profile & alert buffers (/settings)
│   │   └── NotFound.jsx        # 404 Route (/404)
│   ├── services/
│   │   └── api.js              # Centralized Axios client & modular services
│   ├── utils/
│   │   ├── cn.js               # Tailwind class merging utility
│   │   ├── exportCsv.js        # Browser CSV export helper
│   │   └── formatters.js       # Currency (₹/$) & date formatting
│   ├── App.jsx                 # Route declarations & shell mounting
│   ├── index.css               # Base Tailwind directives & custom scrollbars
│   └── main.jsx                # DOM entry point
├── .env                        # Local active environment configuration
├── .env.example                # Example configuration reference
├── index.html                  # HTML5 entry with Inter font
├── package.json                # Project dependencies and npm scripts
├── postcss.config.js           # PostCSS configuration
├── tailwind.config.js          # Royal blue & Navy color theme tokens
└── vite.config.js              # Vite configuration with chunk splitting
```

---

## 🗺️ Application Routes

### Authentication Routes (Split-Screen Layout)
| Path | Page Name | Primary Capability |
| :--- | :--- | :--- |
| `/signin` | **Sign In** | Welcome back screen, email/password validation, independent eye visibility toggle, remember me, quick demo autofill |
| `/signup` | **Sign Up** | Account creation, full name, email, company, password strength meter, matching validation, terms acceptance |
| `/forgot-password` | **Forgot Password** | Recovery request with email validation, loading spinner, check-your-email success state |

### Enterprise Dashboard Console
| Path | Page Name | Primary Capability |
| :--- | :--- | :--- |
| `/` | Redirect | Automatically redirects to `/dashboard` |
| `/dashboard` | **Dashboard** | 6 KPI cards, 4 Recharts visualizers, critical alerts, AI recommendations |
| `/inventory` | **Inventory** | SKU catalog, search, category/status filters, Add/Edit product, stock adjustments, CSV export |
| `/sales` | **Sales Analytics** | Revenue trends, units sold, gross margin, best-selling vs. slow-moving SKUs |
| `/forecasting` | **Demand Forecasting**| Multi-horizon (7d, 30d, 90d) SARIMAX / ML demand prediction with 95% CI bands |
| `/alerts` | **Stock Alerts** | Critical shortage flags, potential stockouts, overstock alerts, in-app resolution |
| `/suppliers` | **Suppliers** | Vendor directory, contact details, SLA on-time rate, lead times, order history |
| `/purchase-orders`| **Purchase Orders** | Inbound supplier orders, customer deliveries, status update (On-Time, Late, Delivered) |
| `/reports` | **Reports** | Valuation audits, low-stock logs, vendor compliance, PDF print & CSV export |
| `/settings` | **Settings** | Organization name, currency switch (`INR ₹` / `USD $`), notification safety thresholds |

---

## ⚙️ Environment Variables

The application reads its configuration from Vite environment variables:

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base endpoint for the TrackGPT backend API | `http://localhost:8000/api` |
| `VITE_USE_MOCK_DATA` | Toggle mock data mode (`true` or `false`) | `true` |
| `VITE_FORECAST_API_URL`| Endpoint for the ML forecasting microservice | `http://localhost:8000/api/forecast` |
| `VITE_DEFAULT_CURRENCY`| Default currency symbol | `₹` |

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

---

## 🛠️ Installation & Development

### Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

The application will be accessible at: `http://localhost:3000` (or the port specified by Vite).

### 3. Build for Production

```bash
npm run build
```

Production assets are compiled into the `dist/` directory with optimized code-splitting chunks (`vendor`, `charts`, `icons`, and app bundle).

### 4. Preview the Production Build Locally

```bash
npm run preview
```

---

## 🔌 Backend Integration Contract

All HTTP requests pass through `src/services/api.js`. When `VITE_USE_MOCK_DATA=false`, TrackGPT makes real HTTP calls to the backend endpoints:

### Expected REST Endpoints

1. **Authentication**:
   - `POST /api/auth/signin` (Payload: `{ email, password }` -> Returns `{ user, token }`)
   - `POST /api/auth/signup` (Payload: `{ fullName, email, companyName, password }` -> Returns `{ user, token, message }`)
   - `POST /api/auth/forgot-password` (Payload: `{ email }` -> Returns `{ success, message }`)
2. **Dashboard Summary**:
   - `GET /api/dashboard/summary`
   - Returns `{ kpis, salesTrend, categoryDistribution, stockStatusBreakdown, criticalAlerts, recentOrders }`
2. **Products & Inventory**:
   - `GET /api/products?search=&category=&stockStatus=`
   - `GET /api/products/:id`
   - `POST /api/products` (Payload: Product object)
   - `PUT /api/products/:id` (Payload: Partial product object)
   - `DELETE /api/products/:id`
   - `PATCH /api/products/:id/stock` (Payload: `{ delta, reason }`)
3. **Suppliers**:
   - `GET /api/suppliers?search=&status=`
   - `POST /api/suppliers`
   - `PUT /api/suppliers/:id`
4. **Purchase Orders & Deliveries**:
   - `GET /api/purchase-orders?search=&status=&arrivalStatus=`
   - `POST /api/purchase-orders`
   - `PATCH /api/purchase-orders/:id/status` (Payload: `{ orderStatus, arrivalStatus }`)
   - `GET /api/deliveries/customers`
5. **AI Demand Forecasting**:
   - `GET /api/forecast?productId=:id&horizon=:horizon`
   - `POST /api/ai/analyze-risk` (Payload: `{ orderId, productId, companyName }`)
6. **Stock Alerts**:
   - `GET /api/alerts?severity=&alertType=&search=`
   - `POST /api/alerts/:id/resolve` (Payload: `{ notes }`)

---

## 🛡️ License

TrackGPT Enterprise Supply Chain Management Platform — Developed for high-performance operational intelligence.

