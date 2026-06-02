# Swift Inventory & Order Management

Swift is a full-stack inventory and order management application built with a React frontend, Python backend, and PostgreSQL database. The app is containerized with Docker and orchestrated using Docker Compose for local development and deployment.

## Project Overview

- Frontend: React (JavaScript) user interface
- Backend: Python API using FastAPI or Flask
- Database: PostgreSQL
- Containerization: Docker
- Orchestration: Docker Compose

The application supports product management, customer management, order creation, and inventory tracking from a dashboard interface.

## Key Features

- Product management: create, read, update, and delete products
- Customer management: add and view customers
- Order management: create orders, view order summaries, and order details
- Inventory control: stock quantities are updated automatically when orders are placed
- Dashboard: displays summary statistics and low-stock alerts

## Repository Structure

- `backend/` — Python API, database models, routers, and app configuration
- `frontend/` — React application and API client code
- `docker-compose.yml` — service definitions for frontend, backend, and PostgreSQL

## Local Setup

1. Clone the repository
2. From the project root, run:

```bash
docker compose up --build
```

3. Access the application:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

## Docker Services

- `frontend` — serves the React app
- `backend` — serves the Python API
- `db` — PostgreSQL database service

## Notes

- The backend validates input and returns appropriate HTTP status codes.
- Orders decrement product inventory and reject requests when stock is insufficient.
- The frontend provides a responsive UI with forms for managing products, customers, and orders.

## Contact

For questions or issues, inspect the code in `frontend/` and `backend/` folders or review the Docker Compose setup in `docker-compose.yml`.
