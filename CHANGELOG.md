# Changelog

All notable changes to the Stoq-Keep Inventory Management project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [1.0.0] - 2026-02-01

### Added
- **Backend** - Express.js server with MongoDB (Mongoose) integration
  - User authentication system with JWT tokens and bcrypt password hashing
  - Auth middleware for protected routes
  - User model and auth routes (register/login)
  - Inventory model and CRUD API routes
  - Centralized error handling middleware
  - Security headers via Helmet, request logging via Morgan
  - CORS configuration
  - Input validation with express-validator
  - Token generation utility
  - Debug script for stock troubleshooting (`debug-stock.js`)
  - Test sample setup (`test-sample.js`)
- **Client** - React 18 single-page application
  - React Router v6 for client-side routing
  - Axios HTTP client proxied to backend on port 5001
  - Toast notifications via react-toastify
  - Icon support via react-icons
  - Production build configuration

### Fixed
- Corrected API endpoints and functions (PR #1)

### Removed
- Removed `.env` and `.env.example` from version control for security (PR #3, PR #4)

## [0.0.0] - 2026-01-29

### Added
- Initial repository setup with README
