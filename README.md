
# Secure Data Import Application

This application securely imports data from a user's remote MySQL database into a local database via SSH tunneling. It allows users to register, generate SSH key pairs, and manage their connection details. The application is containerized using Docker and utilizes environment variables for configuration.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Setup](#setup)
4. [Testing the Application](#testing-the-application)
5. [Troubleshooting](#troubleshooting)
6. [Application Improvements](#application-improvements)
7. [Contributing](#contributing)
8. [License](#license)
9. [Contact Information](#contact-information)

---

## Prerequisites

Ensure you have the following installed on your machine:

- **Docker**
- **Docker Compose**
- **Git**
- **MySQL Server**: Installed and running on your local machine (port `3306`)
- **SSH Server**: Installed and running on your local machine (port `22`)

For Windows users, running the application in **WSL2** is recommended.

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/vbchivu/secure-data-import
cd secure-data-import
```

### Configure Environment Variables

Create a `.env` file in the project root directory:

```bash
touch .env
```

Refer to the `.env.example` file in the repository for the full list of environment variables.

**Important:**

- Generate a secure JWT secret:
  ```bash
  openssl rand -base64 32
  ```
- Generate a 32-byte hexadecimal string for encryption:
  ```bash
  openssl rand -hex 32
  ```

---

### Set Up the Database

#### Local MySQL Database (Simulating Remote Database)

Log into MySQL as root:

```bash
mysql -u root -p
```

Create a database, user, and table:

```sql
CREATE DATABASE test_database;
CREATE USER 'test_user'@'%' IDENTIFIED BY 'test_password';
GRANT ALL PRIVILEGES ON test_database.* TO 'test_user'@'%';
FLUSH PRIVILEGES;

USE test_database;

CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    position VARCHAR(100),
    salary DECIMAL(10,2)
);

INSERT INTO employees (name, position, salary) VALUES
('Alice Smith', 'Developer', 75000),
('Bob Johnson', 'Manager', 85000),
('Carol Williams', 'Designer', 65000);
```

#### Application Database (Inside Docker Container)

The application database is automatically set up via Docker Compose and initialization scripts.

---

### Build and Run the Docker Containers

```bash
docker-compose up --build -d
```

### Verify Running Containers

```bash
docker ps
```

Ensure `application-container` and `application-db` are listed and running.

---

## Setup

### Run Migrations and Seeds

If necessary, ensure the application database is properly set up using migrations and seeds:

```bash
docker exec -it application-container npm run migrate
docker exec -it application-container npm run seed
```

---

## Testing the Application

### User Registration and Authentication

- **Register a New User**:

  ```bash
  curl -X POST http://localhost:3000/auth/register        -H 'Content-Type: application/json'        -d '{"username": "testuser", "password": "testpassword"}'
  ```

- **Log In to Obtain JWT Token**:

  ```bash
  curl -X POST http://localhost:3000/auth/login        -H 'Content-Type: application/json'        -d '{"username": "testuser", "password": "testpassword"}'
  ```

  Extract the token from the response for authenticated requests.

---

### Generating SSH Key Pairs

- **Generate SSH Key Pair via API**:

  ```bash
  curl -X POST http://localhost:3000/ssh-keys/generate        -H "Authorization: Bearer <JWT_TOKEN>"
  ```

- **Retrieve Public Key**:

  ```bash
  curl -X GET http://localhost:3000/ssh-keys/public-key        -H "Authorization: Bearer <JWT_TOKEN>"
  ```

- **Add Public Key to Host Machine**:

  Append the public key to `~/.ssh/authorized_keys`:

  ```bash
  echo "ssh-rsa AAAAB3Nza..." >> ~/.ssh/authorized_keys
  chmod 600 ~/.ssh/authorized_keys
  ```

---

### Adding Connection Details

- **Add Database Connection Details**:

  ```bash
  curl -X POST http://localhost:3000/connections/add        -H "Authorization: Bearer <JWT_TOKEN>"        -H 'Content-Type: application/json'        -d '{
           "dbHost": "localhost",
           "dbPort": 3306,
           "dbUsername": "test_user",
           "dbPassword": "test_password",
           "dbName": "test_database",
           "sshHost": "host.docker.internal",
           "sshPort": 22,
           "sshUsername": "your_host_username"
       }'
  ```

---

### Importing Data

- **Import Data from Remote Table**:

  ```bash
  curl -X POST http://localhost:3000/data/import-data/employees        -H "Authorization: Bearer <JWT_TOKEN>"
  ```

---

## Troubleshooting

### SSH Connection Issues

- Ensure the SSH server is running:

  ```bash
  sudo service ssh status
  ```

- Verify the SSH keys are correctly added and permissions are set.

### Database Connection Errors

- Check that MySQL is running on port `3306`.
- Confirm that the credentials provided match those in the local MySQL setup.

### Container Not Starting

- View logs:

  ```bash
  docker-compose logs
  ```

### Environment Variable Issues

- Ensure all required variables are set in the `.env` file.
- Rebuild the containers after making changes to the `.env` file:

  ```bash
  docker-compose down
  docker-compose up --build -d
  ```

---

## Application Improvements

### Security Enhancements

- Encrypt sensitive data in transit (use HTTPS).
- Implement rate limiting to prevent brute-force attacks.
- Add audit logging for critical operations.

### Performance Improvements

- Use database connection pooling.
- Optimize database queries and caching.

### Additional Features

- Support multiple database types (e.g., PostgreSQL).
- Implement a user-friendly frontend interface.

---

## Contributing

1. Fork the repository.
2. Create a new branch:

   ```bash
   git checkout -b feature-name
   ```

3. Commit your changes:

   ```bash
   git commit -m "Add feature-name"
   ```

4. Push to the branch:

   ```bash
   git push origin feature-name
   ```

5. Open a Pull Request.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact Information

For any questions or support, please contact me.
