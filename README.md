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
- **Automated detection** of architectural elements (walls, doors, windows, rooms)
- **Real-time confidence scoring** with visual feedback
- **Intelligent data transformation** from backend to frontend formats
- **Interactive bounding box visualization** with color-coded element types
- **Geometric data processing** with Shapely for precise measurements

### User Authentication
- **Secure user registration and login** via [Supabase](https://supabase.com)
- **Session management** with persistent authentication state
- **Protected API endpoints** with JWT token verification
- **User profiles** with personalized experience

### Modern Vue.js Interface
- **Vue.js 3 with Composition API** for reactive state management
- **Component-based architecture** with reusable UI elements
- **Interactive canvas** with zoom, pan, and click-to-select capabilities
- **Real-time detection results** display with synchronized views
- **Smart export functionality** with intelligent filename matching
- **Developer tools** accessible via URL parameters (?modetest)

### Professional Architecture
- **FastAPI backend** with comprehensive API documentation
- **Vue.js frontend** with TypeScript and modern tooling
- **Scalable deployment** with [Railway](https://railway.app) integration
- **Comprehensive error handling** and logging throughout
- Comprehensive error handling and logging

---

## Technology Stack

### Backend
- Python 3.8+
- FastAPI framework
- [Supabase](https://supabase.com) for authentication and database
- Roboflow API for AI model inference
- Shapely for geometric processing
- Uvicorn ASGI server

### Frontend
- **Vue.js 3** with Composition API
- **TypeScript 5.2+** with strict type checking
- **Vite** build tool with hot reload
- **Component-based architecture** with reactive state management
- **Canvas API** for interactive image manipulation
- **Responsive design** with modern CSS and Vue.js styling

---

## Quick Start

### Prerequisites

- Python 3.8 or higher
- Node.js 18 or higher
- Roboflow account with API access
- [Supabase](https://supabase.com) project (for authentication)

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

# [Supabase](https://supabase.com) Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_TOKEN=your_supabase_anon_key_here
```

**Security Note**: The `.env` file is automatically excluded from git commits. Never commit API keys to version control.

### Frontend Environment Variables

The frontend also requires environment variables for [Supabase](https://supabase.com) configuration:

```bash
cd frontend
cp .env.example .env
```

Edit the frontend `.env` file:

```env
# Frontend [Supabase](https://supabase.com) Configuration
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

For user authentication functionality, configure your [Supabase](https://supabase.com) project:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Enable email authentication in the [Supabase](https://supabase.com) dashboard
3. Create the required database tables (see `AUTHENTICATION.md` for details)
4. Configure environment variables securely (see Security section below)

---

## Usage

### Vue.js Application Workflow

1. **Authentication**: Secure login via Supabase (optional but recommended)
2. **Import**: Click "Analyser un plan" to select an architectural floor plan image
3. **AI Processing**: Real-time progress indicator shows analysis status
4. **Visual Results**: Detected elements appear on canvas with color-coded bounding boxes
5. **Interactive Exploration**: Click elements on image to highlight corresponding table rows
6. **Export**: Download analysis results with intelligent filename matching

### Vue.js Interface Features

**Modern Component Architecture**
- **Reactive state management** with Vue.js 3 Composition API
- **Real-time synchronization** between canvas and detection panel
- **Responsive design** that adapts to different screen sizes
- **Component-based UI** with reusable elements

**Interactive Canvas**
- **Zoom and pan** with smooth mouse/touch controls
- **Click-to-select** elements for detailed inspection
- **Color-coded visualization** (walls: blue, doors: green, windows: orange, rooms: purple)
- **Automatic centering** and responsive resizing

**Smart Data Management**
- **Automatic format transformation** from backend to frontend
- **Bidirectional synchronization** between canvas clicks and table selection
- **Real-time confidence scoring** with visual feedback
- **Intelligent export** with filename matching source image

**Developer Tools**
- **Test mode access** via URL parameter: `?modetest`
- **Comprehensive logging** for debugging and monitoring
- **Technical validation page** for integration testing

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
| [`AUTHENTICATION.md`](AUTHENTICATION.md) | Authentication setup guide | [Supabase](https://supabase.com) auth configuration and user flows |
| [`SUPABASE_ADMIN.md`](SUPABASE_ADMIN.md) | Administrator guide | User management and admin workflows |
| [`RAILWAY_DEPLOYMENT.md`](RAILWAY_DEPLOYMENT.md) | Deployment guide | Production deployment on [Railway](https://railway.app) platform |

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

## Changelog

### v1.5.1 (2025-01-02)
- **🔧 CRITICAL FIX**: Fixed detection display issue in Vue.js interface
- **🔄 Data Transformation**: Added automatic format conversion from backend (label, bbox) to Vue.js format (class, x, y, width, height, id)
- **📊 Visual Results**: AI analysis results now display correctly in DetectionPanel and Canvas
- **🐛 Bug Resolution**: Resolved "Unhandled error during execution of render function" warnings
- **🧪 Test Mode Enhancement**: Hide "Mode Test" button by default, show only with ?modetest URL parameter
- **📝 Documentation Update**: Complete documentation overhaul reflecting Vue.js migration and new features
- **✅ Full Integration**: Complete end-to-end workflow now functional (import → analyze → display → export)
- **🎯 Production Ready**: Clean interface for end users, developer tools accessible via URL parameter

### v1.5.0 (2025-01-01)
- **🚀 MAJOR**: Complete migration to Vue.js 3 with Composition API and TypeScript
- **🏗️ Architecture**: All components migrated from vanilla TypeScript to Vue.js
- **⚡ Performance**: Modern reactive state management with Vue 3
- **🎨 UI/UX**: Enhanced interface with Vue.js component architecture

### v1.4.1 (2024-12-30)
- **🔐 AUTH FIX**: Fixed critical Supabase authentication error with proper JWT token verification
- **🔑 Security**: Corrected API key usage for client operations vs admin operations

### v1.4.0 (2024-12-29)
- **🔐 Authentication**: Integrated Supabase authentication with user management
- **🛡️ Security**: Protected API endpoints with authentication middleware
- **👤 User Profiles**: Added user registration, login, and profile management

### v1.3.0 (2024-12-28)
- **📱 UX Enhancement**: Expanded image display area and responsive canvas centering
- **💾 Smart Export**: Intelligent JSON export with filename matching source image
- **🎨 Interface**: Clean detection list and improved footer branding

### v1.2.0 (2024-12-27)
- **🎨 Visual**: Element type colors on canvas (walls, doors, windows, rooms)
- **🔘 UI**: Enhanced primary button styling with gradient and animations

### v1.1.0 (2024-12-26)
- **🔄 Interaction**: Bidirectional synchronization between canvas clicks and detection table
- **🎯 Selection**: Click elements on image to highlight corresponding table rows

---

## Acknowledgments

- Roboflow for AI model hosting and inference
- [Supabase](https://supabase.com) for authentication and database services
- FastAPI for the robust backend framework
- Vite for modern frontend tooling