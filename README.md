# 🏨 Student Hostel Booking Web Application

A comprehensive full-stack MERN (MongoDB, Express, React, Node.js) application that connects students with hostel owners. Students can search, filter, and book hostels while hostel owners can manage their properties and booking requests. Admin users can oversee hostel approvals and platform management.

---

## 🌟 Key Features

### 👨‍🎓 For Students
- **🔍 Advanced Hostel Search** - Search hostels by location with real-time filtering
- **💰 Price & Amenity Filters** - Filter by price range, room type (single, double, shared), and amenities
- **⭐ Detailed Hostel Information** - View comprehensive hostel details including photos, description, and facilities
- **📸 Photo Gallery** - Browse multiple hostel photos
- **📱 Booking System** - Send booking requests to hostel owners with advance payment via Razorpay
- **💳 Secure Payment Integration** - Process payments through Razorpay for booking confirmation
- **📋 Booking Dashboard** - View all booking history with status tracking (pending, confirmed, cancelled)
- **🎫 Booking Management** - Cancel pending bookings anytime
- **💾 Wishlist** - Save hostels to wishlist for later booking
- **⭐ Reviews & Ratings** - Submit and view reviews for booked hostels
- **👤 Student Dashboard** - Personalized dashboard showing bookings and account details

### 🏢 For Hostel Owners
- **🏨 Hostel Management** - Add, edit, and delete hostel listings
- **📸 Photo Management** - Upload multiple photos for each hostel
- **📊 Owner Dashboard** - Overview of all managed hostels
- **📑 Booking Requests** - View incoming booking requests from students
- **✅ Booking Approval/Rejection** - Accept or reject booking requests
- **📋 Booking History** - Track all booking requests and their statuses
- **🎯 Hostel Visibility Control** - Manage which hostels are active and visible

### 🔧 For Administrators
- **✔️ Hostel Approval System** - Review and approve new hostel listings before they go live
- **🚫 Hostel Rejection** - Reject hostels that don't meet platform standards
- **👨‍💼 Admin Dashboard** - Centralized control panel for platform management
- **📊 Pending Hostels Management** - View queue of hostels awaiting approval

---

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast and minimalist web framework
- **MongoDB** - NoSQL database for flexible data storage
- **Mongoose** - ODM (Object Document Mapper) for MongoDB
- **JWT (JSON Web Tokens)** - Secure user authentication
- **bcryptjs** - Password hashing and security
- **Multer** - File upload middleware for hostel photos
- **Razorpay** - Payment gateway integration
- **Express Validator** - Request validation and sanitization
- **CORS** - Cross-Origin Resource Sharing support

### Frontend
- **React.js** - Component-based UI library (v18+)
- **React Router DOM** - Client-side routing and navigation
- **Axios** - Promise-based HTTP client for API calls
- **CSS 3** - Modern styling and responsive design
- **React Context API** - State management for authentication

### Database
- **MongoDB** - Cloud-hosted NoSQL database

---

## 📁 Project Structure

```
student-hostel/
├── backend/
│   ├── config/
│   │   ├── database.js          # MongoDB connection configuration
│   │   ├── jwt.js               # JWT token generation & verification
│   │   └── multer.js            # File upload configuration & middleware
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic (register, login, currentUser)
│   │   ├── hostelController.js  # Hostel CRUD operations & search/filter
│   │   ├── bookingController.js # Booking management & status updates
│   │   ├── paymentController.js # Razorpay payment processing
│   │   ├── reviewController.js  # Reviews & ratings management
│   │   └── ownerController.js   # Owner-specific functions
│   ├── middleware/
│   │   └── auth.js              # Authentication & role-based authorization
│   ├── models/
│   │   ├── User.js              # User schema (student, owner, admin roles)
│   │   ├── Hostel.js            # Hostel listing schema with amenities
│   │   ├── Booking.js           # Booking request schema
│   │   ├── Review.js            # Review & rating schema
│   │   ├── BookingOrder.js      # Booking advance payment order
│   │   └── QuickPayOrder.js     # Quick payment order
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints (/register, /login, /me)
│   │   ├── hostelRoutes.js      # Hostel endpoints (CRUD, photos, approval)
│   │   ├── bookingRoutes.js     # Booking endpoints (create, view, update)
│   │   ├── paymentRoutes.js     # Payment endpoints (create order, verify)
│   │   ├── reviewRoutes.js      # Review endpoints (submit, view)
│   │   └── ownerRoutes.js       # Owner endpoints
│   ├── utils/
│   │   └── hostelVisibility.js  # Hostel visibility & filtering utilities
│   ├── uploads/                 # Stored hostel photos
│   ├── server.js                # Express server entry point
│   ├── .env                     # Environment variables
│   ├── .gitignore               # Git ignore rules
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── index.html           # HTML template
│   │   └── favicon.ico          # App icon
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js        # Navigation bar with user menu
│   │   │   ├── Navbar.css       # Navbar styling
│   │   │   ├── Footer.js        # Footer component
│   │   │   ├── Footer.css       # Footer styling
│   │   │   ├── SearchBar.js     # Search & filter functionality
│   │   │   ├── SearchBar.css    # Search bar styling
│   │   │   ├── HostelCard.js    # Hostel listing card component
│   │   │   ├── HostelCard.css   # Card styling
│   │   │   ├── PhotoUpload.js   # Photo upload component
│   │   │   ├── PhotoUpload.css  # Upload styling
│   │   │   └── AdvanceCheckoutOverlay.js # Payment modal component
│   │   ├── pages/
│   │   │   ├── HomePage.js                  # Landing page with hero section
│   │   │   ├── HomePage.css                 # Home page styling
│   │   │   ├── LoginPage.js                 # User login page
│   │   │   ├── LoginPage.css                # Login styling
│   │   │   ├── SignupPage.js                # User registration page
│   │   │   ├── SignupPage.css               # Signup styling
│   │   │   ├── HostelDetailsPage.js         # Full hostel detail view
│   │   │   ├── HostelDetailsPage.css        # Details page styling
│   │   │   ├── SearchResultsPage.js         # Search results display
│   │   │   ├── SearchResultsPage.css        # Results styling
│   │   │   ├── StudentDashboard.js          # Student bookings & account
│   │   │   ├── StudentDashboard.css         # Dashboard styling
│   │   │   ├── OwnerDashboard.js            # Owner property management
│   │   │   ├── OwnerDashboard.css           # Owner dashboard styling
│   │   │   ├── AdminDashboard.js            # Admin approval panel
│   │   │   ├── AdminDashboard.css           # Admin styling
│   │   │   ├── DummyPaymentPage.js          # Payment processing page
│   │   │   └── DummyPaymentPage.css         # Payment page styling
│   │   ├── context/
│   │   │   └── AuthContext.js               # Authentication state management
│   │   ├── utils/
│   │   │   ├── api.js                       # Axios API instance & configuration
│   │   │   └── validation.js                # Form validation utilities
│   │   ├── App.js                           # Main app component with routing
│   │   ├── App.css                          # Global app styling
│   │   ├── index.js                         # React entry point
│   │   └── index.css                        # Global CSS
│   └── package.json
│
├── README.md                    # Project documentation (this file)
├── QUICKSTART.md                # Quick start guide
├── DEPLOYMENT.md                # Deployment instructions
├── PROJECT_STRUCTURE.md         # Detailed structure documentation
├── package.json                 # Root package configuration
└── .gitignore                   # Git ignore rules
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** (comes with Node.js)
- **MongoDB Account** - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier available)
- **Git** (optional)

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create a `.env` file in the backend directory:**
```env
PORT=5000
MONGODB_URL=mongodb+srv://your_username:your_password@cluster.mongodb.net/studenthostel
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
NODE_ENV=development
```

4. **Start the backend server:**
```bash
npm run dev
```

✅ Backend will start on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory (in a new terminal):**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the React development server:**
```bash
npm start
```

✅ Frontend will open on `http://localhost:3000`

### Run Both Simultaneously

From the root directory:
```bash
npm run dev
```

---

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student" // or "owner"
}

Response: { success: true, token: "jwt_token", user: {...} }
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: { success: true, token: "jwt_token", user: {...} }
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>

Response: { success: true, user: {...} }
```

### Hostel Endpoints

#### Get All Hostels (with filters)
```
GET /api/hostels?city=Mumbai&area=Bandra&minPrice=5000&maxPrice=10000
Query Parameters:
  - city: string (optional)
  - area: string (optional)
  - minPrice: number (optional)
  - maxPrice: number (optional)
  - roomType: string (optional)
  - sort: "price" | "rating" (optional)

Response: { success: true, count: 5, hostels: [...] }
```

#### Get Hostel by ID
```
GET /api/hostels/:id

Response: { success: true, hostel: {...} }
```

#### Create Hostel (Owner Only)
```
POST /api/hostels
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Downtown Hostel",
  "description": "Comfortable hostel in city center",
  "location": "123 Main St",
  "city": "Mumbai",
  "area": "Bandra",
  "pricePerMonth": 5000,
  "roomTypes": [{"type": "Single", "price": 5000}],
  "amenities": ["WiFi", "AC", "Food", "Laundry"]
}

Response: { success: true, hostel: {...} }
```

#### Update Hostel (Owner Only)
```
PUT /api/hostels/:id
Authorization: Bearer <token>
Content-Type: application/json

Body: {...updated hostel data...}

Response: { success: true, hostel: {...} }
```

#### Delete Hostel (Owner Only)
```
DELETE /api/hostels/:id
Authorization: Bearer <token>

Response: { success: true, message: "Hostel deleted" }
```

#### Upload Hostel Photo (Owner Only)
```
POST /api/hostels/:id/photos
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data: photo (file)

Response: { success: true, hostel: {...} }
```

#### Get Owner's Hostels
```
GET /api/hostels/owner/my-hostels
Authorization: Bearer <token>

Response: { success: true, hostels: [...] }
```

#### Get Pending Hostels (Admin Only)
```
GET /api/hostels/admin/pending
Authorization: Bearer <token>

Response: { success: true, hostels: [...] }
```

#### Approve Hostel (Admin Only)
```
PUT /api/hostels/admin/:id/approve
Authorization: Bearer <token>

Response: { success: true, message: "Hostel approved" }
```

#### Reject Hostel (Admin Only)
```
PUT /api/hostels/admin/:id/reject
Authorization: Bearer <token>

Response: { success: true, message: "Hostel rejected" }
```

### Booking Endpoints

#### Get Student's Bookings
```
GET /api/bookings/student/my-bookings
Authorization: Bearer <token>

Response: { success: true, bookings: [...] }
```

#### Get Owner's Booking Requests
```
GET /api/bookings/owner/requests
Authorization: Bearer <token>

Response: { success: true, bookings: [...] }
```

#### Update Booking Status (Owner Only)
```
PUT /api/bookings/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed", // "confirmed" or "rejected"
  "rejectionReason": "Not available" // optional
}

Response: { success: true, booking: {...} }
```

#### Cancel Booking (Student Only)
```
DELETE /api/bookings/:id
Authorization: Bearer <token>

Response: { success: true, message: "Booking cancelled" }
```

### Wishlist Endpoints

#### Get Student Wishlist
```
GET /api/users/wishlist
Authorization: Bearer <token>

Response: { success: true, wishlist: [...] }
```

#### Add Hostel to Wishlist
```
POST /api/users/wishlist/:hostelId
Authorization: Bearer <token>

Response: { success: true, message: "Hostel added to wishlist", wishlist: [...] }
```

#### Remove Hostel from Wishlist
```
DELETE /api/users/wishlist/:hostelId
Authorization: Bearer <token>

Response: { success: true, message: "Hostel removed from wishlist", wishlist: [...] }
```

### Payment Endpoints

#### Create Booking Order
```
POST /api/payments/booking-order
Authorization: Bearer <token>
Content-Type: application/json

{
  "hostelId": "123abc",
  "amount": 5000
}

Response: { success: true, order: {...} }
```

#### Verify Booking Payment
```
POST /api/payments/booking-verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "order_123",
  "paymentId": "pay_123",
  "signature": "sig_123"
}

Response: { success: true, booking: {...} }
```

### Review Endpoints

#### Get Hostel Reviews
```
GET /api/reviews/hostel/:hostelId

Response: { success: true, reviews: [...] }
```

#### Submit Review (Student Only)
```
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "hostelId": "123abc",
  "rating": 4,
  "comment": "Great hostel!"
}

Response: { success: true, review: {...} }
```

---

## 👥 User Roles & Permissions

### Student Role
- ✅ Search and browse hostels
- ✅ View detailed hostel information
- ✅ Send booking requests
- ✅ View personal booking history
- ✅ Cancel pending bookings
- ✅ Submit reviews for booked hostels
- ✅ Make advance payments for bookings

### Owner Role
- ✅ Add new hostels
- ✅ Edit hostel details
- ✅ Delete hostels
- ✅ Upload hostel photos
- ✅ View booking requests
- ✅ Approve or reject booking requests
- ✅ Track booking history
- ✅ Manage hostel visibility

### Admin Role
- ✅ View pending hostel approvals
- ✅ Approve new hostels
- ✅ Reject hostels with reasons
- ✅ Access admin dashboard
- ✅ System-wide management

---

## 🧪 Testing the Application

### 1. Create Test Accounts

**Student Account:**
```json
{
  "name": "Student User",
  "email": "student@example.com",
  "password": "password123",
  "role": "student"
}
```

**Owner Account:**
```json
{
  "name": "Hostel Owner",
  "email": "owner@example.com",
  "password": "password123",
  "role": "owner"
}
```

### 2. Add Test Hostel (as Owner)
```json
{
  "name": "Downtown Hostel",
  "description": "Budget-friendly hostel in the heart of the city",
  "location": "123 Main Street, Downtown",
  "city": "Mumbai",
  "area": "Bandra",
  "pricePerMonth": 5000,
  "roomTypes": [
    {
      "type": "Single Bed",
      "pricePerMonth": 5000,
      "availableRooms": 5,
      "totalRooms": 5
    },
    {
      "type": "Double Bed",
      "pricePerMonth": 8000,
      "availableRooms": 3,
      "totalRooms": 3
    }
  ],
  "amenities": ["WiFi", "Food", "AC", "Laundry", "24/7 Security"],
  "images": []
}
```

### 3. Test Workflow

1. **As Student:** Search hostels by city/area
2. **As Owner:** Check booking requests on dashboard
3. **As Admin:** Approve pending hostels
4. **As Student:** Send booking request with advance payment
5. **As Owner:** View and approve booking
6. **As Student:** Leave review for hostel

---

## ✨ Features Implemented

✅ **User Authentication** - Secure JWT-based authentication
✅ **Role-Based Authorization** - Student, Owner, and Admin roles
✅ **Hostel CRUD Operations** - Complete hostel management
✅ **Advanced Search & Filters** - Filter by location, price, amenities
✅ **Hostel Sorting** - Sort by price and rating
✅ **Photo Upload** - Multer-based file uploads
✅ **Booking System** - Request-approve-confirm workflow
✅ **Booking Status Tracking** - Pending, confirmed, rejected states
✅ **Payment Integration** - Razorpay payment gateway
✅ **Advance Payment** - Secure booking deposits via Razorpay
✅ **Reviews & Ratings** - Student reviews for hostels
✅ **Wishlist Management** - Save favorite hostels for later booking
✅ **Hostel Approval System** - Admin approval workflow
✅ **Student Dashboard** - View bookings and account
✅ **Owner Dashboard** - Manage properties and bookings
✅ **Admin Dashboard** - Approve/reject hostels
✅ **Form Validation** - Client and server-side validation
✅ **Error Handling** - Comprehensive error responses
✅ **Responsive Design** - Mobile-friendly interface
✅ **Loading States** - User feedback during operations

---

## 🚢 Deployment

### Frontend Deployment (Vercel/Netlify)

**Using Vercel:**
```bash
# Install Vercel CLI
npm install -g vercel

# Build frontend
cd frontend
npm run build

# Deploy
vercel
```

**Using Netlify:**
1. Connect GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`

### Backend Deployment (Heroku/Railway/Render)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

---

## 📚 Additional Documentation

- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Detailed project structure

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the MIT License. See the LICENSE file for details.

---

## 📧 Support & Contact

For support, issues, or questions:
- Open an issue on GitHub
- Email: support@studenthostel.com
- Create a discussion for feature requests

---

## 🙏 Acknowledgments

- [MongoDB](https://www.mongodb.com/) - Database
- [Express.js](https://expressjs.com/) - Backend framework
- [React](https://react.dev/) - Frontend framework
- [Razorpay](https://razorpay.com/) - Payment processing
- All contributors and users

---

**Happy Hosting! 🎉**

Made with ❤️ for students and hostel owners
