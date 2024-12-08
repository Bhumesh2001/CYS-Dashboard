# **API Documentation**

## **Introduction**

Welcome to the CYS API! This API provides functionalities to login/signup and profile.

- **API Version:** v1.0
- **Base URL:** `https://quiz-app-backend-bi9c.onrender.com`

---

## **Authentication**

To access the API, you need a valid bearer token XSRF-TOKEN.

- **Header:**  
  `Authorization: Bearer <token>`,
  `XSRF-TOKEN: <token>`

### **Example Request Header**

```json
{
  "Authorization": "Bearer eyJhbGciOiJIUz...",
  "XSRF-TOKEN": "eyJhbGciOiJIUz..."
}

# 0. CSRF TOKEN

* URL: /api/csrf-token
* Method: GET
* Response body: {
    "csrfToken": "WHW7lxq9..."
}

# 1. Register

* URL: /api/auth/register
* Method: POST
* HEADERS: {
    "XSRF-TOKEN": "<token>"
}
* Request Body: {
    "fullName": "Suraj Kumar",
    "email": "suraj.kmr948467@gmail.com",
    "mobile": "7066233689",
    "password": "Suraj@798",
    "confirmPassword": "Suraj@798",
    "class": "12th"
}
* Response body: {
    "success": true,
    "message": "User registered successfully",
    "_id": "user id here",
    "token": "user token here"
}

# 2. Login

* URL: /api/auth/login
* Method: POST
* HEADERS: {
    "XSRF-TOKEN": "<token>"
}
* Request Body: {
    "email": "your email",
    "password": "your password"
}
* Response body: {
    "success": true,
    "message": "User logged in successful...!",
    "_id": "user id here",
    "token": "user token here"
}

# 3 Forgot Password

* URL: /api/auth/forgot-password
* Method: POST
* HEADERS: {
    "XSRF-TOKEN": "<token>"
}
* Request Body: {
    "email": "your email",
}
* Response body: {
    "success": true,
    "message": "OTP sent to your email."
}

# 4 Verify Forgot Password OTP

* URL: /api/auth/verify-otp
* Method: POST
* HEADERS: {
    "XSRF-TOKEN": "<token>"
}
* Request Body: {
    "email": "your email",
    "otp": "your otp"
}
* Response body: {
    "success": true,
    "message": "OTP verified successfully."
}

# 5. Reset Password

* URL: /api/auth/verify-otp
* Method: POST
* HEADERS: {
    "XSRF-TOKEN": "<token>"
}
* Request Body: {
    "email": "your email",
    "newPassword": "your otp"
}
* Response body: {
    "success": true,
    "message": "Password has been reset successfully."
}

# 6. Profile

* URL: /api/auth/profile
* Method: GET
* HEADERS: {
    "Authorization": "Bearer <token>"
}
* Response body: {
    "success": true,
    "message": "Profile fetched successfully...!",
    "data": {
        "_id": "user id here",
        "fullName": "full name here",
        "email": "email here",
        "mobile": "mobile number here",
        "class": "class here",
        "role": "user"
    }
}

# 7. Update Profile

* URL: /api/auth/profile/{userId}
* Method: PUT
* HEADERS: {
    "Authorization": "Bearer <token>",
    "XSRF-TOKEN": "<token>"
}
* Request Body: {
    "fullName": "full name here",
    "email": "email here",
    "mobile": "mobile number here",
    "class": "class here",
    "profileUrl": "profile picture url here"
}
* Response body: {
    "success": true,
    "message": "Profile updated successfully",
    "data": {
        "fullName": "full name here",
        "email": "email here",
        "mobile": "mobile number here",
        "class": "class here",
        "profileUrl": "profile picture url here"
    }
}

# 8 Logout

* URL: /api/auth/logout
* Method: POST
* HEADERS: {
    "Authorization": "Bearer <token>",
    "XSRF-TOKEN": "<token>"
}
* Response body: {
    "success": true,
    "message": "Profile updated successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...."
}

```
