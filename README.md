# FloorIA

![Python](https://img.shields.io/badge/python-v3.8+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=flat&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green.svg)

AI-powered architectural image analysis platform for automated floor plan processing and element detection.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Access Points](#access-points)
- [Automated Setup Scripts](#automated-setup-scripts)
- [Configuration](#configuration)
  - [Environment Variables](#environment-variables)
  - [Authentication Setup](#authentication-setup)
- [Usage](#usage)
  - [Image Analysis Workflow](#image-analysis-workflow)
  - [Interface Features](#interface-features)
- [API Documentation](#api-documentation)
- [Use Cases](#use-cases)
- [Documentation](#documentation)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Overview

FloorIA is a comprehensive web application that combines computer vision and geometric processing to analyze architectural floor plans. The platform automatically detects and categorizes structural elements such as walls, doors, windows, and rooms using advanced AI models.

---

## Key Features

### AI-Powered Analysis
- Automated detection of architectural elements
- Real-time confidence scoring
- Geometric data processing with Shapely
- Interactive bounding box visualization

### User Authentication
- Secure user registration and login via Supabase
- Session management and user profiles
- Protected API endpoints

### Modern Interface
- Responsive web application built with TypeScript
- Interactive canvas with zoom and pan capabilities
- Real-time detection results display
- Export functionality for analysis data

### Professional Architecture
- FastAPI backend with comprehensive API documentation
- Component-based frontend architecture
- Scalable deployment with Railway integration
- Comprehensive error handling and logging

---

## Technology Stack

### Backend
- Python 3.8+
- FastAPI framework
- Supabase for authentication and database
- Roboflow API for AI model inference
- Shapely for geometric processing
- Uvicorn ASGI server

### Frontend
- TypeScript 5.2+
- Vite build tool
- Modern ES modules
- Canvas API for image manipulation
- Responsive CSS design

---

## Quick Start

### Prerequisites

- Python 3.8 or higher
- Node.js 18 or higher
- Roboflow account with API access
- Supabase project (for authentication)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # venv\Scripts\activate   # Windows
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your API credentials.

5. Start the development server:
   ```bash
   python main.py
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Access Points

- **Application**: http://localhost:3000
- **API Server**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

---

## Automated Setup Scripts

For streamlined development, automated setup scripts are provided:

### Backend Script
```bash
./start-backend.sh
```

This script automatically:
- Verifies backend directory structure
- Creates Python virtual environment if needed
- Installs all required dependencies
- Validates environment configuration
- Starts the FastAPI server

### Frontend Script
```bash
./start-frontend.sh
```

This script automatically:
- Verifies frontend directory structure
- Checks Node.js and npm installation
- Installs npm dependencies if needed
- Starts the Vite development server

### Complete Application Startup

To start the full application stack:

```bash
# Terminal 1 - Backend
./start-backend.sh

# Terminal 2 - Frontend (new terminal)
./start-frontend.sh
```

Both scripts include comprehensive validation and will guide you through any configuration issues.

---

## Configuration

### Environment Variables

Configure backend environment variables:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your actual credentials:

```env
# Roboflow API Configuration
ROBOFLOW_API_KEY=your_actual_api_key_here
ROBOFLOW_WORKSPACE=cubicasa5k-2-qpmsa-tppfc
ROBOFLOW_PROJECT=cubicasa5k-2-qpmsa-tppfc
ROBOFLOW_VERSION=1

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_TOKEN=your_supabase_anon_key_here
```

**Security Note**: The `.env` file is automatically excluded from git commits. Never commit API keys to version control.

### Frontend Environment Variables

The frontend also requires environment variables for Supabase configuration:

```bash
cd frontend
cp .env.example .env
```

Edit the frontend `.env` file:

```env
# Frontend Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:8000
```

**⚠️ CRITICAL SECURITY WARNING**: 
- **NEVER** hardcode API keys in source code
- Frontend `.env` files must be in `.gitignore`
- Only use public/anon keys in frontend (never service role keys)
- Frontend environment variables are visible to users - only use public keys

### Authentication Setup

For user authentication functionality, configure your Supabase project:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Enable email authentication in the Supabase dashboard
3. Create the required database tables (see `AUTHENTICATION.md` for details)
4. Configure environment variables securely (see Security section below)

---

## Usage

### Image Analysis Workflow

1. **Upload**: Select an architectural floor plan image
2. **Processing**: The AI model automatically detects structural elements
3. **Results**: View detected elements with confidence scores and geometric data
4. **Export**: Download analysis results in JSON format

### Interface Features

**Navigation**
- Zoom controls for detailed inspection
- Pan functionality for large images
- Fit-to-window for optimal viewing
- Mouse wheel zoom with cursor positioning

**Data Visualization**
- Interactive detection table with sorting
- Color-coded element types (walls, doors, windows, rooms)
- Confidence score visualization
- Geometric measurements and calculations

**User Management**
- Secure registration and login system
- Session persistence across browser sessions
- User profile management
- Selection highlighting with visual emphasis

---

## API Documentation

### Core Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| `GET` | `/` | API status | None |
| `POST` | `/analyze` | Image analysis | Optional |
| `GET` | `/health` | Health check | None |
| `POST` | `/auth/signup` | User registration | None |
| `POST` | `/auth/login` | User authentication | None |
| `POST` | `/auth/logout` | User logout | Required |
| `GET` | `/auth/me` | Current user info | Required |

### Image Analysis Request

```bash
curl -X POST "http://localhost:8000/analyze" \
     -H "Content-Type: multipart/form-data" \
     -F "image=@floor_plan.jpg"
```

### Response Format

```json
{
  "status": "success",
  "image_dimensions": {
    "width": 1920,
    "height": 1080
  },
  "detections": [
    {
      "label": "wall",
      "confidence": 0.92,
      "bbox": {
        "x": 100,
        "y": 150,
        "width": 300,
        "height": 20
      },
      "geometry": {
        "area": 6000,
        "perimeter": 640,
        "centroid": {"x": 250, "y": 160}
      }
    }
  ]
}
```

---

## Use Cases

### Architecture and Construction
- Automated floor plan analysis
- Building element identification
- Space measurement and validation
- Construction planning assistance

### Real Estate and Property Management
- Property assessment automation
- Space utilization analysis
- Documentation generation
- Compliance verification

### Design and Planning
- Architectural review processes
- Design validation workflows
- Space optimization studies
- Renovation planning support

---

## Documentation

FloorIA includes comprehensive documentation to help you set up, configure, and manage the application:

### 📚 Available Documentation

| Document | Description | Purpose |
|----------|-------------|----------|
| [`README.md`](README.md) | Main project documentation | Overview, setup, and usage instructions |
| [`AUTHENTICATION.md`](AUTHENTICATION.md) | Authentication setup guide | Supabase auth configuration and user flows |
| [`SUPABASE_ADMIN.md`](SUPABASE_ADMIN.md) | Administrator guide | User management and admin workflows |
| [`RAILWAY_DEPLOYMENT.md`](RAILWAY_DEPLOYMENT.md) | Deployment guide | Production deployment on Railway platform |

### 🔗 Quick Navigation

**For Users:**
- Start with [`README.md`](README.md) for basic setup
- Follow [`AUTHENTICATION.md`](AUTHENTICATION.md) for auth configuration

**For Administrators:**
- Read [`SUPABASE_ADMIN.md`](SUPABASE_ADMIN.md) for user management
- Use [`RAILWAY_DEPLOYMENT.md`](RAILWAY_DEPLOYMENT.md) for production deployment

**For Developers:**
- All documents contain relevant technical information
- See [Development](#development) section below for dev workflows

### 📋 Documentation Standards

- **Clear step-by-step instructions** with code examples
- **Security best practices** highlighted throughout
- **Troubleshooting sections** for common issues
- **Cross-references** between related documents
- **Regular updates** to match current features

---

## Development

### Development Workflow

```bash
# Backend setup
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend setup
cd frontend
npm install

# Start development servers
# Terminal 1: Backend
cd backend && python main.py

# Terminal 2: Frontend
cd frontend && npm run dev
```

### Project Structure

```
FloorIA/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── supabase_client.py   # Authentication client
│   ├── auth_middleware.py   # Authentication middleware
│   ├── roboflow_client.py   # AI model integration
│   ├── geometry_processor.py # Geometric calculations
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables
├── frontend/
│   ├── src/
│   │   ├── main.ts         # Application entry point
│   │   ├── supabaseClient.ts # Authentication client
│   │   ├── AuthModal.ts    # Authentication modal
│   │   └── components/     # UI components
│   ├── package.json        # Node.js dependencies
│   └── vite.config.js      # Build configuration
└── README.md
```

### Testing

The application includes comprehensive error handling and logging. For development testing:

- Backend API documentation: `http://localhost:8000/docs`
- Health check endpoint: `http://localhost:8000/health`
- Frontend development tools available in browser

---

## Deployment

FloorIA supports deployment on Railway with automated CI/CD:

1. Configure environment variables in Railway dashboard
2. Connect your GitHub repository
3. Deploy backend and frontend services separately
4. Configure custom domains if needed

See `RAILWAY_DEPLOYMENT.md` for detailed deployment instructions.

---

## Contributing

Contributions are welcome. Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

### Code Standards

- Backend: Follow PEP 8 Python style guidelines
- Frontend: Use TypeScript with strict type checking
- Documentation: Update README and inline comments
- Testing: Include tests for new functionality

---

## License

This project is licensed under the MIT License.

---

## Acknowledgments

- Roboflow for AI model hosting and inference
- Supabase for authentication and database services
- FastAPI for the robust backend framework
- Vite for modern frontend tooling