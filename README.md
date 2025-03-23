# M-Mart E-commerce Platform

A Nigerian e-commerce platform built with Laravel backend and React frontend.

## Project Structure

This repository contains both the frontend and backend code for the M-Mart e-commerce platform:

- **frontend/** - React application with Tailwind CSS styling
- **livebackend/** - Laravel API backend

## Technologies Used

### Frontend
- React (JavaScript)
- React Router for navigation
- Context API for state management
- Tailwind CSS for styling

### Backend
- Laravel PHP framework
- MySQL database
- RESTful API architecture

## Features

- User authentication (login/register)
- Product browsing and searching
- Shopping cart functionality
- Checkout process
- Nigerian Naira (₦) currency support

## Setup Instructions

### Backend Setup
1. Navigate to the `livebackend` directory
2. Run `composer install` to install dependencies
3. Configure your `.env` file with database settings
4. Run `php artisan migrate` to set up the database
5. Run `php artisan serve` to start the development server

### Frontend Setup
1. Navigate to the `frontend` directory
2. Run `npm install` to install dependencies
3. Configure API endpoint in the environment settings
4. Run `npm start` to start the development server

## CORS Configuration

See the [CORS Configuration Documentation](livebackend/CORS_CONFIGURATION.md) for details on how CORS is configured to allow communication between the frontend and backend.
