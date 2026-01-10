# 🏥 Hospital Management System

A comprehensive hospital management system built with Flask (backend) and Next.js (frontend).

## ✨ Features

- 👥 **Patient Management** - Registration, profiles, medical history, bulk operations
- 👨‍⚕️ **Doctor Management** - Profiles, specializations, schedules
- 📅 **Appointment System** - Booking, scheduling, reminders
- 👩‍💼 **Staff Management** - Roles, permissions, workload tracking
- 📊 **Analytics Dashboard** - Comprehensive insights and reporting
- ⚙️ **Settings & Configuration** - Hospital setup, preferences
- 🔐 **Authentication** - Role-based access control

## 🛠️ Technology Stack

- **Backend**: Flask (Python) with SQLAlchemy
- **Frontend**: Next.js (React) with TypeScript
- **Database**: SQLite/PostgreSQL/MySQL
- **Authentication**: JWT tokens
- **UI**: Tailwind CSS with Framer Motion
- **Charts**: Recharts for analytics
- **Icons**: Heroicons

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL or SQLite

### Installation
```bash
# 1. Clone the repository
git clone <repository-url>
cd hospital-management-system

# 2. Backend setup
pip install -r requirements.txt
python scripts/setup_utilities.py init

# 3. Frontend setup
cd frontend
npm install

# 4. Start the application
# Terminal 1 - Backend
python start.py

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Access Points
- **Backend API**: http://localhost:5000
- **Frontend**: http://localhost:3000
- **Hospital Dashboard**: http://localhost:3000/hospital/dashboard
- **Doctor Portal**: http://localhost:3000/doctor/dashboard

## 📁 Project Structure

```
hospital-management-system/
├── 📁 docs/                    # Documentation
│   ├── README.md
│   └── troubleshooting.md
├── 📁 scripts/                 # Utility scripts
│   ├── database_management.py
│   └── setup_utilities.py
├── 📁 hospital/                # Backend (Flask)
│   ├── models/
│   ├── routes/
│   └── utils/
├── 📁 frontend/                # Frontend (Next.js)
│   ├── app/
│   ├── components/
│   └── lib/
├── config.py
├── app.py
├── start.py
└── requirements.txt
```

## 🔧 Utility Scripts

### Database Management
```bash
# Clean database
python scripts/database_management.py clean

# Reset database
python scripts/database_management.py reset

# View statistics
python scripts/database_management.py stats

# Create backup
python scripts/database_management.py backup
```

### Setup Utilities
```bash
# Check system setup
python scripts/setup_utilities.py check

# Test database connection
python scripts/setup_utilities.py test

# Initialize database
python scripts/setup_utilities.py init

# Fix common issues
python scripts/setup_utilities.py fix

# Comprehensive status check
python scripts/setup_utilities.py status

# Test backend functionality
python scripts/setup_utilities.py backend-test
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/profile` - Get user profile

### Patient Management
- `GET /api/patients/` - List patients (with pagination and search)
- `POST /api/patients/` - Create new patient
- `GET /api/patients/<id>` - Get patient details
- `PUT /api/patients/<id>` - Update patient
- `DELETE /api/patients/<id>` - Delete patient

### Doctor Management
- `GET /api/doctors/` - List doctors (with filters)
- `GET /api/doctors/<id>` - Get doctor details
- `GET /api/doctors/specializations` - Get all specializations

### Appointments
- `GET /api/appointments/` - List appointments (with filters)
- `POST /api/appointments/` - Create appointment
- `PUT /api/appointments/<id>` - Update appointment

### AI Services
- `POST /api/ai/symptom-checker` - AI symptom analysis
- `POST /api/ai/risk-assessment` - Patient risk assessment
- `POST /api/ai/treatment-recommendations` - Get treatment recommendations
- `GET /api/ai/diagnoses/<patient_id>` - Get patient AI diagnoses
- `PUT /api/ai/verify-diagnosis/<id>` - Doctor verification of AI diagnosis

### Admin Dashboard
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - User management
- `PUT /api/admin/users/<id>/toggle-status` - Toggle user status

## 📚 Documentation

- [Complete Documentation](docs/README.md)
- [Troubleshooting Guide](docs/troubleshooting.md)

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📄 License

MIT License