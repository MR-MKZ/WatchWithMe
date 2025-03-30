# Dockerized Laravel Project

This project is a Dockerized setup for a Laravel application with a socket server and Nginx configuration. It includes the following components:

## Project Structure

```
dockerized-laravel-project
├── backend                # Laravel backend application
│   ├── app                # Core application logic (models, controllers, middleware)
│   ├── bootstrap           # Bootstrap files for Laravel
│   ├── config             # Configuration files for the application
│   ├── database           # Database migrations, seeders, and factories
│   ├── public             # Public-facing files (entry point)
│   ├── resources          # Views, language files, and other resources
│   ├── routes             # Route definitions
│   ├── storage            # Logs, cache, and other storage files
│   ├── tests              # Test files for the application
│   ├── artisan            # Command-line interface for Laravel
│   ├── composer.json      # Composer dependencies
│   ├── composer.lock      # Locked versions of dependencies
│   └── Dockerfile         # Dockerfile for building the Laravel backend image
├── socket-server          # Socket server for handling WebSocket connections
│   ├── server.js          # Entry point for the socket server
│   └── Dockerfile         # Dockerfile for building the socket server image
├── nginx                  # Nginx configuration
│   ├── default.conf       # Nginx configuration file
│   └── ssl                # SSL certificates
│       ├── server.crt     # SSL certificate
│       └── server.key      # Private key for SSL
├── docker-compose.yml     # Docker Compose file for orchestrating services
└── README.md              # Project documentation
```

## Getting Started

### Prerequisites

- Docker
- Docker Compose

### Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd dockerized-laravel-project
   ```

2. Build the Docker images:
   ```
   docker-compose build
   ```

3. Start the services:
   ```
   docker-compose up -d
   ```

4. Access the application:
   - Laravel backend: `https://localhost`
   - Socket server: `ws://localhost:port` (replace `port` with the actual port used)

### Usage

- The Laravel application can be accessed through the Nginx server.
- The socket server handles WebSocket connections for real-time features.

### License

This project is licensed under the MIT License. See the LICENSE file for more details.