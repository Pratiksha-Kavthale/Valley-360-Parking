# Valley 360 Smart Parking Platform - Complete Setup Guide

> **Quick Start**: Follow this guide to get the entire platform running in under 15 minutes.

## 📋 Prerequisites

Make sure you have the following installed on your system:

| Software | Version | Download Link |
|----------|---------|---------------|
| Java JDK | 11 or higher | [Oracle JDK](https://www.oracle.com/java/technologies/downloads/) or [OpenJDK](https://adoptium.net/) |
| Node.js | 18 or higher | [Node.js](https://nodejs.org/) |
| MySQL | 8.0 or higher | [MySQL Community](https://dev.mysql.com/downloads/mysql/) |
| Python | 3.10 or higher | [Python](https://www.python.org/downloads/) |
| Git | Latest | [Git](https://git-scm.com/downloads) |

### Verify Installation

```bash
java -version      # Should show Java 11+
node -v            # Should show v18+
npm -v             # Should show 8+
mysql --version    # Should show 8.0+
python --version   # Should show 3.10+
```

---

## 🚀 Step-by-Step Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/pravin-kavthale/Valley-360-Smart-Parking-Platform.git
cd Valley-360-Smart-Parking-Platform
```

---

### Step 2: Setup MySQL Database

1. **Start MySQL Server** (if not already running)

2. **Create the database** (optional - app auto-creates it):
   ```bash
   mysql -u root -p
   ```
   ```sql
   CREATE DATABASE IF NOT EXISTS valley;
   EXIT;
   ```

3. **Initialize roles** (IMPORTANT - required for user registration):
   ```bash
   mysql -u root -p valley < database/init.sql
   ```
   
   Or manually run in MySQL:
   ```sql
   USE valley;
   INSERT INTO roles (id, role_name) VALUES (1, 'ROLE_ADMIN');
   INSERT INTO roles (id, role_name) VALUES (2, 'ROLE_OWNER');
   INSERT INTO roles (id, role_name) VALUES (3, 'ROLE_CUSTOMER');
   ```

> **Note**: If using different MySQL credentials, update `BackEnd/Valley360-Parking/src/main/resources/application.properties`:
> ```properties
> spring.datasource.username=your_username
> spring.datasource.password=your_password
> ```

---

### Step 3: Start the Backend (Spring Boot)

```bash
cd BackEnd/Valley360-Parking

# On Windows:
mvnw.cmd spring-boot:run

# On Mac/Linux:
./mvnw spring-boot:run
```

Wait until you see: `Started Valley360ParkingApplication in X seconds`

✅ Backend running at: **http://localhost:8080**  
✅ Swagger API Docs: **http://localhost:8080/swagger-ui.html**

---

### Step 4: Start the Frontend (React + Vite)

Open a **new terminal**:

```bash
cd my-project

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

✅ Frontend running at: **http://localhost:5173**

---

### Step 5: Start the AI Service (Optional)

The AI service provides review sentiment analysis. It's optional but recommended.

Open a **new terminal**:

```bash
cd ai-service

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the AI service
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

✅ AI Service running at: **http://localhost:8000**

---

## 🔑 Default Credentials & Setup

### Admin Registration
To register as an admin:
1. Go to the Registration page
2. Select **"Admin (Platform Manager)"** as role
3. Enter Employee ID: **`12345`** (secret code)
4. Complete registration and login

### Role IDs
| Role | ID | Description |
|------|----|----|
| Admin | 1 | Platform administrator |
| Owner | 2 | Parking space owner |
| Customer | 3 | Driver/customer |

---

## 🌐 Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | React application |
| Backend API | http://localhost:8080 | Spring Boot REST API |
| Swagger UI | http://localhost:8080/swagger-ui.html | API Documentation |
| AI Service | http://localhost:8000 | Python FastAPI for review analysis |

---

## 📁 Project Structure

```
Valley-360-Smart-Parking-Platform/
├── my-project/                 # React Frontend
│   ├── src/
│   │   ├── Components/        # React components
│   │   ├── contexts/          # React contexts
│   │   └── api.js             # API configuration
│   └── package.json
│
├── BackEnd/Valley360-Parking/  # Spring Boot Backend
│   ├── src/main/java/com/app/
│   │   ├── controller/        # REST controllers
│   │   ├── service/           # Business logic
│   │   ├── entities/          # JPA entities
│   │   └── config/            # Security & app config
│   └── pom.xml
│
├── ai-service/                 # Python AI Service
│   ├── main.py                # FastAPI application
│   └── requirements.txt
│
├── database/                   # Database scripts
│   └── init.sql               # Initial data setup
│
├── docs/                       # Documentation
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── DB_SCHEMA.md
│
├── SETUP.md                    # This file
└── README.md                   # Project overview
```

---

## ⚠️ Troubleshooting

### Common Issues

#### 1. "Access denied for user 'root'@'localhost'"
- Check MySQL credentials in `application.properties`
- Make sure MySQL is running

#### 2. "Port 8080 already in use"
- Stop other applications using port 8080, or
- Change port in `application.properties`: `server.port=8081`

#### 3. "CORS error in browser"
- Ensure backend is running
- Check `app.cors.allowed-origins` in `application.properties` includes your frontend URL

#### 4. "Role not found" during registration
- Run the database initialization script: `mysql -u root -p valley < database/init.sql`

#### 5. "npm install fails"
- Delete `node_modules` and `package-lock.json`, then run `npm install` again
- Try: `npm cache clean --force`

#### 6. "mvnw: Permission denied" (Mac/Linux)
```bash
chmod +x mvnw
./mvnw spring-boot:run
```

---

## 🔧 Configuration

### Environment Variables (Optional)

Create `.env` files for custom configuration:

**Backend** (`BackEnd/Valley360-Parking/.env`):
```env
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/valley
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=root
```

**Frontend** (`my-project/.env`):
```env
VITE_API_BASE_URL=http://localhost:8080
```

**AI Service** (`ai-service/.env`):
```env
AI_SERVICE_PORT=8000
```

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed correctly
3. Ensure all services are running
4. Check browser console for errors

---

## 📄 License

This project is for educational purposes.

---

**Happy Parking! 🚗**
