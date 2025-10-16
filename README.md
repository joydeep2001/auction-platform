# Real-Time Auction & Bidding Platform

A modern, full-stack real-time auction platform built with React, FastAPI, MongoDB, and WebSocket technology with Redis pub/sub architecture.

## 🎯 Features

### Core Functionality
- **Real-Time Bidding**: Multiple users can bid simultaneously with instant updates via WebSocket
- **JWT Authentication**: Secure user authentication and authorization
- **Live Countdown Timers**: Server-synced countdown timers for auction expiration
- **Bid Validation**: Automatic validation to prevent invalid bids
- **Auction Management**: Admin panel for creating and managing auctions
- **Bid History**: Complete audit trail of all bids
- **Status Tracking**: Automatic auction status updates (upcoming/ongoing/completed)

### User Interface
- **Modern Dark Theme**: Professional dark theme with teal accent colors
- **Responsive Design**: Mobile-first design that works on all devices
- **Real-Time Feed**: Live bid feed showing recent bids as they happen
- **Search & Filter**: Search auctions and filter by status
- **Quick Bidding**: Quick increment buttons for fast bidding

## 🛠 Tech Stack

### Frontend
- **React 19**: Modern React with hooks
- **React Router**: Client-side routing
- **TailwindCSS**: Utility-first CSS framework
- **Shadcn UI**: High-quality UI components
- **WebSocket (react-use-websocket)**: Real-time bidding updates
- **Axios**: HTTP client for API calls
- **DayJS**: Date/time manipulation
- **Framer Motion**: Smooth animations
- **Sonner**: Toast notifications

### Backend
- **FastAPI**: Modern Python web framework
- **Motor**: Async MongoDB driver
- **WebSocket**: Real-time communication
- **Redis**: Pub/sub for multi-instance support
- **JWT (python-jose)**: Token-based authentication
- **Passlib + Bcrypt**: Password hashing
- **Pydantic**: Data validation

### Database
- **MongoDB**: NoSQL database for flexibility

## 🔐 Test Accounts

The seed script creates the following test accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@auction.com | admin123 |
| User | john@example.com | password123 |
| User | jane@example.com | password123 |

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Auctions
- `GET /api/auctions` - List all auctions (optional `?status=ongoing`)
- `GET /api/auctions/{id}` - Get auction details
- `POST /api/auctions` - Create auction (admin only)
- `POST /api/auctions/{id}/bid` - Place a bid
- `GET /api/auctions/{id}/bids` - Get auction bid history

### WebSocket
- `WS /ws/{auction_id}?user_id={user_id}` - Real-time auction updates

## 🏗 Architecture

### Real-Time Communication Flow
1. User places a bid via REST API
2. Backend validates and stores the bid in MongoDB
3. Backend publishes bid update to Redis channel
4. All connected WebSocket clients receive the update
5. Frontend updates UI in real-time for all users

### Pub/Sub Architecture
- **Redis** acts as message broker for multi-instance scalability
- Each auction has its own channel (`auction:{auction_id}`)
- WebSocket manager subscribes to relevant channels
- Supports horizontal scaling with multiple backend instances

## 🎨 Design System

### Color Palette
- **Primary**: Teal (`hsl(165 80% 55%)`) - For CTAs and live indicators
- **Background**: Dark slate (`hsl(220 20% 5%)`)
- **Card**: Darker slate (`hsl(220 18% 7%)`)
- **Border**: Subtle gray (`hsl(220 14% 18%)`)
- **Warning**: Amber - For countdown urgency
- **Critical**: Red - For final countdown

### Typography
- **Headings**: Space Grotesk
- **Body**: Inter
- **Numbers**: Azeret Mono (for prices and countdowns)

---

**Built with ❤️ using React, FastAPI, MongoDB, and Redis**
