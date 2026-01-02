# BidWars - Real-Time Auction Platform

A production-ready, scalable microservices-based auction platform with real-time bidding, built following 2025 best practices for enterprise-grade applications.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Production-Ready Features](#production-ready-features)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Microservices](#microservices)
- [Best Practices Implemented](#best-practices-implemented)
- [Development](#development)
- [Testing](#testing)
- [Environment Configuration](#environment-configuration)

## Overview

BidWars is a **real-time auction platform** enabling users to participate in live auctions with instant bid updates, comprehensive leaderboards, achievements, and notifications. The platform is designed with a microservices architecture to ensure scalability, maintainability, and fault tolerance.

### Key Features

- **Real-time bidding** via WebSocket connections with JWT authentication
- **Leaderboards** with Redis caching for high-performance queries
- **Achievement system** with unlockable badges and real-time notifications
- **Event-driven architecture** using Apache Kafka for inter-service communication
- **Idempotent operations** ensuring data consistency across services
- **Secure authentication** with NextAuth v5 and server-side JWT token handling
- **Optimized caching** with Redis for frequently accessed data
- **Modern frontend** built with Next.js 16 App Router and React 19

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js 16)                   │
│              React 19 | NextAuth v5 | Tailwind CSS              │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API Gateway (Port 3000)                   │
│                  HTTP Routing | JWT Auth | CORS                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┬─────────────────┐
        │                   │                   │                 │
        ▼                   ▼                   ▼                 ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐  ┌──────────────┐
│ User Service │    │ Item Service │    │ Auction Svc  │  │  Bid Service │
│   (3002)     │    │   (3003)     │    │   (3004)     │  │   (3005)     │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘  └──────┬───────┘
       │                   │                   │                 │
       └───────────────────┴───────────────────┴─────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  Kafka Broker │
                    │    (9092)     │
                    └───────┬───────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Notification │    │ Leaderboard  │    │   WebSocket  │
│ Service      │    │ Service      │    │   Gateway    │
│   (3006)     │    │   (3007)     │    │   (3008)     │
└──────────────┘    └──────┬───────┘    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │    Redis     │
                    │    (6379)    │
                    │  Cache Layer │
                    └──────────────┘

Data Layer:
┌──────────────────────────────────────────────────────────────┐
│                      MongoDB (27017)                         │
│  user_db | item_db | auction_db | bid_db | leaderboard_db   │
└──────────────────────────────────────────────────────────────┘
```

## Tech Stack

### Backend

- **Node.js** with TypeScript
- **Express.js** - REST API framework
- **Socket.IO** - WebSocket server for real-time communication
- **KafkaJS** - Event streaming platform client
- **Mongoose** - MongoDB ODM
- **ioredis** - Redis client for caching
- **JWT** - Token-based authentication
- **NextAuth v5** - Authentication for Next.js

### Frontend

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Utility-first styling
- **Zustand** - State management
- **React Hook Form + Zod** - Form validation
- **Socket.IO Client** - Real-time updates

### Infrastructure

- **Docker Compose** - Container orchestration
- **MongoDB** - Primary database
- **Redis** - Caching layer
- **Apache Kafka + Zookeeper** - Event streaming
- **pnpm** - Fast, disk-efficient package manager

### Development Tools

- **Nodemon** - Auto-reload during development
- **Jest** - Testing framework
- **Testcontainers** - Integration testing
- **ESLint** - Code linting
- **Concurrently** - Run multiple services

## Prerequisites

- **Node.js** >= 20.x
- **pnpm** >= 8.x
- **Docker** >= 24.x
- **Docker Compose** >= 2.x

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/auctionAI.git
cd auctionAI
```

### 2. Start infrastructure services

```bash
cd infrastructure
docker-compose up -d
```

This starts:

- MongoDB (port 27017)
- Redis (port 6379)
- Kafka + Zookeeper (port 9092)

### 3. Install dependencies

```bash
pnpm install:all
```

### 4. Configure environment variables

Each service has a `.env` file. For production, create your own:

```bash
# Example for leaderboard-service
cp services/leaderboard-service/.env.example services/leaderboard-service/.env
```

See [Environment Configuration](#environment-configuration) for details.

### 5. Run all services

```bash
# Development mode (all services with hot reload)
pnpm dev:all

# Or run individual services
pnpm dev:gateway    # API Gateway (3000)
pnpm dev:user       # User Service (3002)
pnpm dev:item       # Item Service (3003)
pnpm dev:auction    # Auction Service (3004)
pnpm dev:bid        # Bid Service (3005)
pnpm dev:notification # Notification Service (3006)
pnpm dev:leaderboard # Leaderboard Service (3007)
```

### 6. Run frontend

```bash
cd frontend
pnpm dev  # Runs on http://localhost:3001
```

### 7. Verify setup

- Frontend: http://localhost:3001
- API Gateway: http://localhost:3000/health
- Leaderboard: http://localhost:3007/health

## Project Structure

```
auctionAI/
├── frontend/                 # Next.js 16 application
│   ├── app/                  # App Router pages
│   ├── components/           # Reusable React components
│   ├── lib/                  # Utilities and configurations
│   └── public/               # Static assets
│
├── services/                 # Microservices
│   ├── api-gateway/          # Main entry point (3000)
│   ├── user-service/         # User management (3002)
│   ├── item-service/         # Auction items (3003)
│   ├── auction-service/      # Auction management (3004)
│   ├── bid-service/          # Bid processing (3005)
│   ├── notification-service/ # Real-time notifications (3006)
│   └── leaderboard-service/  # Rankings & stats (3007)
│
├── infrastructure/
│   └── docker-compose.yml    # Infrastructure services
│
└── package.json              # Monorepo scripts
```

### Service Structure (Example: leaderboard-service)

```
leaderboard-service/
├── src/
│   ├── config/
│   │   ├── database.ts       # MongoDB connection
│   │   └── redis.ts          # Redis client configuration
│   ├── controllers/
│   │   └── leaderboardController.ts  # Business logic
│   ├── models/
│   │   └── UserStats.ts      # Mongoose schemas
│   ├── routes/
│   │   └── leaderboardRoutes.ts
│   ├── services/
│   │   └── kafka-consumer.ts # Event handlers
│   ├── middleware/
│   │   └── auth.ts           # JWT verification
│   └── index.ts              # Server entry point
├── .env                      # Environment variables
└── package.json
```

## Microservices

### API Gateway (Port 3000)

**Purpose**: Single entry point for all client requests

**Responsibilities**:

- HTTP routing to downstream services
- CORS configuration
- Request/response logging
- Health checks

**Key Files**:

- `services/api-gateway/src/index.ts`

---

### User Service (Port 3002)

**Purpose**: User authentication and profile management

**Responsibilities**:

- User registration and login
- JWT token generation
- Profile CRUD operations
- Password hashing with bcrypt

**Events Published**:

- `user.registered` - New user created
- `user.updated` - Profile modified

**Key Files**:

- `services/user-service/src/controllers/authController.ts`
- `services/user-service/src/models/User.ts`

---

### Item Service (Port 3003)

**Purpose**: Manage auction items/products

**Responsibilities**:

- Item CRUD operations
- Image upload handling
- Item search and filtering
- Category management

**Events Published**:

- `item.created` - New item added
- `item.updated` - Item details changed

**Key Files**:

- `services/item-service/src/controllers/itemController.ts`

---

### Auction Service (Port 3004)

**Purpose**: Auction lifecycle management

**Responsibilities**:

- Create and schedule auctions
- Start/end auction automation
- Winner determination
- Auction status updates

**Events Published**:

- `auction.created`
- `auction.started`
- `auction.ended`
- `auction.winner_determined`

**Events Consumed**:

- `bid.placed` - Update highest bid

**Key Files**:

- `services/auction-service/src/controllers/auctionController.ts`
- `services/auction-service/src/services/auctionScheduler.ts`

---

### Bid Service (Port 3005)

**Purpose**: Process and validate bids

**Responsibilities**:

- Bid validation (amount, timing, user credits)
- Bid placement
- Bid history tracking
- **Idempotent bid processing** (prevents duplicates)

**Events Published**:

- `bid.placed` - New valid bid
- `bid.outbid` - User has been outbid

**Events Consumed**:

- `auction.started` - Enable bidding
- `auction.ended` - Disable bidding

**Best Practices**:

- Kafka producer idempotency enabled
- Request deduplication using `bidId`
- Optimistic locking for concurrent bids

**Key Files**:

- `services/bid-service/src/controllers/bidController.ts`
- `services/bid-service/src/config/kafka.ts` (idempotent producer)

---

### Notification Service (Port 3006)

**Purpose**: Real-time notifications via WebSocket

**Responsibilities**:

- WebSocket connection management
- **JWT authentication for Socket.IO**
- Real-time event broadcasting
- Achievement notifications

**Events Consumed**:

- `bid.placed` - Notify auction participants
- `bid.outbid` - Alert outbid users
- `auction.ended` - Winner notification
- `achievement.unlocked` - Badge earned

**Best Practices**:

- Socket.IO middleware for JWT verification
- Message deduplication using ProcessedMessage model
- Room-based broadcasting for efficiency

**Key Files**:

- `services/notification-service/src/index.ts` (WebSocket auth)
- `services/notification-service/src/services/kafka-consumer.ts`

---

### Leaderboard Service (Port 3007)

**Purpose**: User rankings and statistics

**Responsibilities**:

- Calculate user rankings
- Track bidding statistics
- **Redis caching for high-frequency queries**
- Achievement progress tracking

**Events Consumed**:

- `bid.placed` - Update user stats
- `auction.ended` - Record wins

**API Endpoints**:

- `GET /api/leaderboard/top-bidders?limit=10`
- `GET /api/leaderboard/most-active?limit=10`
- `GET /api/leaderboard/biggest-wins?limit=10`
- `GET /api/leaderboard/user-ranking` (authenticated)

**Best Practices**:

- **Cache-Aside pattern** with 60s TTL
- Cache invalidation on data updates
- TypeScript `Promise<Response | void>` pattern
- Proper Redis connection lifecycle

**Key Files**:

- `services/leaderboard-service/src/config/redis.ts`
- `services/leaderboard-service/src/controllers/leaderboardController.ts`

## Testing

### Unit Tests

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

### Integration Tests

Uses **Testcontainers** for real MongoDB and Kafka instances:

```bash
pnpm test:verbose
```
