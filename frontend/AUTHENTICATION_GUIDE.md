# Authentication System Guide

This guide explains the authentication system implemented for the Branch Appointment System with Toyota Gazoo Racing theme.

## 🔐 **Authentication Flow**

### **Pages Created**

- `/login` - User login page
- `/register` - User registration page
- `/dashboard` - Protected dashboard page

### **API Endpoints**

The system expects these backend endpoints:

#### **Login**

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response:**

```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com"
  }
}
```

#### **Register**

```
POST /api/auth/register
Content-Type: application/json

{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response:**

```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com"
  }
}
```

#### **Get Current User**

```
GET /api/auth/me
Authorization: Bearer jwt_token_here
```

**Success Response:**

```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com"
  }
}
```

## 🎨 **UI/UX Features**

### **Toyota Gazoo Racing Theme**

- **Primary Color**: Red (#EB0A1E)
- **Secondary Color**: Black (#000000)
- **Background**: White (#FFFFFF)
- **Surface**: Light Gray (#F5F5F5)
- **Hover States**: Darker red (#C00015)

### **Form Features**

- ✅ Real-time validation
- ✅ Error messages in red
- ✅ Loading states with spinners
- ✅ Focus rings in Toyota red
- ✅ Responsive design
- ✅ Accessibility features

### **Security Features**

- ✅ JWT token storage in localStorage
- ✅ Automatic token management
- ✅ Protected routes
- ✅ Automatic logout on token expiry
- ✅ Form validation (client-side)

## 🛠️ **Configuration**

### **API URL Configuration**

Update the API base URL in `lib/auth.ts`:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
```

Or set environment variable:

```bash
NEXT_PUBLIC_API_URL=http://your-backend-url:8080
```

### **Backend Integration**

Make sure your Spring Boot backend has:

1. **CORS Configuration** for frontend domain
2. **JWT Secret** configured
3. **Authentication endpoints** implemented
4. **User entity** with name, email, password fields

## 📱 **Usage Examples**

### **Login Flow**

1. User visits `/login`
2. Enters email and password
3. Form validates input
4. API call to `/api/auth/login`
5. On success: token stored, redirect to `/dashboard`
6. On error: error message displayed

### **Registration Flow**

1. User visits `/register`
2. Enters name, email, password, confirm password
3. Form validates all fields
4. API call to `/api/auth/register`
5. On success: token stored, redirect to `/dashboard`
6. On error: error message displayed

### **Protected Routes**

- Dashboard automatically checks for valid token
- Redirects to login if not authenticated
- Shows user data when authenticated

## 🔧 **Customization**

### **Adding New Fields**

To add new registration fields:

1. Update `RegisterData` interface in `lib/auth.ts`
2. Add field to register form in `app/register/page.tsx`
3. Add validation in `validators` object
4. Update backend to handle new field

### **Changing Theme Colors**

Update CSS custom properties in `app/globals.css`:

```css
@theme {
  --color-toyota-red: #YOUR_COLOR;
  --color-toyota-red-dark: #YOUR_DARKER_COLOR;
  /* ... */
}
```

### **Adding New Protected Pages**

1. Create page component
2. Add authentication check:

```typescript
import { tokenManager, navigation } from "@/lib/auth";

useEffect(() => {
  if (!tokenManager.isAuthenticated()) {
    navigation.redirectToLogin();
  }
}, []);
```

## 🚀 **Testing**

### **Manual Testing**

1. Visit `/login` - should show login form
2. Visit `/register` - should show registration form
3. Try invalid credentials - should show error
4. Register new account - should redirect to dashboard
5. Visit `/dashboard` without login - should redirect to login

### **API Testing**

Use tools like Postman to test backend endpoints:

```bash
# Test login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

## 🔒 **Security Considerations**

- JWT tokens stored in localStorage (consider httpOnly cookies for production)
- Client-side validation only (backend should also validate)
- No password hashing on frontend (backend responsibility)
- CORS properly configured on backend
- HTTPS recommended for production

## 📝 **Next Steps**

1. **Backend Integration**: Connect to your Spring Boot authentication endpoints
2. **Error Handling**: Add more specific error messages
3. **Loading States**: Enhance loading indicators
4. **Remember Me**: Implement persistent login
5. **Password Reset**: Add forgot password functionality
6. **Email Verification**: Add email confirmation flow
