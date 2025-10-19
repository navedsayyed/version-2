# ComplaintPro - College Complaint Management System

A comprehensive mobile application for managing and tracking maintenance complaints in a college environment, built with React Native and Supabase.

## 📋 Project Overview

ComplaintPro is an intelligent complaint management system designed specifically for college campuses. The system automatically routes complaints to the appropriate department based on floor location and complaint type, ensuring quick resolution and efficient communication between students, technicians, and administrators.

## 🎯 Key Features

### User Roles
The system supports three distinct user roles:

1. **User (Students/Staff)**
   - Submit complaints with photos and descriptions
   - Scan QR codes for location-based complaints
   - Track complaint status (In Progress / Completed)
   - View detailed complaint history
   - Receive updates on complaint resolution

2. **Technician**
   - View assigned complaints by department
   - Update complaint status
   - Upload completion photos and notes
   - Mark complaints as resolved
   - Department-specific complaint filtering

3. **Admin (HOD/Department Head)**
   - View all complaints in their department
   - Manage technicians in their department
   - Add new technicians with authentication
   - View department statistics
   - Monitor complaint resolution progress

## 🏢 Department Structure

### Floor-Based Department Routing
Complaints are automatically routed based on floor location:

| Floor | Department |
|-------|-----------|
| Floor 1 | Civil Department |
| Floor 2 | First Year Department |
| Floor 3 | IT/Computer Department |
| Floor 4 | Electrical Department |
| Floor 5 | Mechanical Department |
| General | Housekeeping Department |

### Complaint Type-Based Routing
When no QR code is scanned, complaints route by type:

- **Infrastructure Issues** → Civil Department
- **IT/Technical Issues** → IT Department
- **Electrical Issues** → Electrical Department
- **Mechanical Issues** → Mechanical Department
- **Cleaning/Maintenance** → Housekeeping Department

## 🔧 Technical Architecture

### Frontend
- **Framework:** React Native with Expo
- **Navigation:** React Navigation (Stack & Bottom Tabs)
- **UI Components:** Custom components with Material Icons
- **State Management:** React Hooks (useState, useEffect, useCallback)
- **Camera/Image:** expo-image-picker
- **QR Scanner:** expo-camera with barcode scanning

### Backend
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth with Row Level Security (RLS)
- **Storage:** Supabase Storage for images
- **Real-time:** Supabase subscriptions for live updates

### Database Schema

#### Tables

**1. users**
```sql
- id: UUID (Primary Key, links to auth.users)
- email: TEXT (Unique)
- full_name: TEXT
- phone: TEXT
- role: TEXT (user/technician/admin)
- department: TEXT (Civil/IT/Electrical/Mechanical/Housekeeping)
- avatar_url: TEXT
- created_at: TIMESTAMP
```

**2. complaints**
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key → users)
- technician_id: UUID (Foreign Key → users)
- title: TEXT
- description: TEXT
- type: TEXT (Infrastructure/IT/Electrical/Mechanical/Cleaning/Other)
- location: TEXT (Building and Floor)
- place: TEXT (Department and Room)
- class: TEXT (Room number)
- floor: TEXT (Floor number)
- department: TEXT (Assigned department)
- status: TEXT (in-progress/completed)
- completion_notes: TEXT
- completion_image_url: TEXT
- completed_at: TIMESTAMP
- created_at: TIMESTAMP
```

**3. complaint_images**
```sql
- id: UUID (Primary Key)
- complaint_id: UUID (Foreign Key → complaints)
- url: TEXT
- created_at: TIMESTAMP
```

### Security - Row Level Security (RLS) Policies

**users table:**
- SELECT: All authenticated users can view profiles
- INSERT: All authenticated users can insert (for registration)
- UPDATE: All authenticated users can update (for profile editing)

**complaints table:**
- SELECT: Users see their own complaints; technicians/admins see department complaints
- INSERT: Only authenticated users can create complaints
- UPDATE: Complaint owner and assigned technician can update

## 📱 Key Functionalities

### 1. QR Code-Based Location Scanning
- Users scan QR codes placed at different locations
- QR codes contain JSON with location details:
```json
{
  "class": "305",
  "floor": "3",
  "department": "IT",
  "building": "B"
}
```
- Automatically fills location, floor, class, department
- Routes complaint to correct department based on floor

### 2. Smart Complaint Routing
**Dual routing system:**
- **Primary:** Floor-based routing (when QR code scanned)
- **Secondary:** Type-based routing (when no QR code)
- Ensures complaints reach the right department automatically

### 3. Real-Time Status Tracking
- Users track complaint status in real-time
- Automatic reload when navigating to complaint list
- Visual status indicators (In Progress / Completed)

### 4. Image Management
- Users upload multiple photos with complaints
- Technicians upload completion photos
- Stored securely in Supabase Storage
- Optimized image quality (0.7 compression)

### 5. Department Management
- Admins add technicians directly from app
- Automatic authentication account creation
- Department-specific technician assignment
- Profile management (view, edit, call)

## 🚀 Installation & Setup

### Prerequisites
```bash
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Supabase account
```

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/navedsayyed/fyp.git
cd ComplaintManagementApp
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Supabase**
   - Create a new Supabase project
   - Copy `.env.example` to `.env`
   - Add your Supabase URL and Anon Key:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
```

4. **Set up database**
   - Run the SQL scripts in order:
     1. `supabase/schema.sql` - Create tables
     2. `supabase/SAFE_RLS_POLICIES.sql` - Set up RLS policies

5. **Create storage bucket**
   - In Supabase Dashboard → Storage
   - Create bucket named `complaint-images`
   - Set to Public

6. **Run the app**
```bash
npm start
# or
expo start
```

## 🔐 User Authentication

### Sign Up (Users Only)
- New users can self-register
- Automatically assigned 'user' role
- Email verification sent
- Profile created with name, email, phone

### Login (All Roles)
- Email and password authentication
- Role-based dashboard routing
- Secure session management
- Password visibility toggle

### Admin/Technician Creation
- Created by admins only
- No self-registration for these roles
- Automatic auth account + profile creation
- Department assignment required

## 📊 Dashboard Features

### User Dashboard
- Submit new complaints
- QR code scanner
- View complaint history (In Progress / Completed)
- Track complaint details
- Profile management

### Technician Dashboard
- View assigned complaints by department
- Filter by status
- Update complaint status
- Upload completion photos and notes
- Profile management

### Admin Dashboard
- Department overview statistics
- Manage technicians
- Add new technicians
- View all department complaints
- Department filtering
- Profile management

## 🎨 UI/UX Features

- **Dark Theme:** Modern dark color scheme
- **Responsive Design:** Adapts to different screen sizes
- **Smooth Animations:** Card animations, loading states
- **Icon System:** Consistent Material Icons
- **Bottom Tab Navigation:** Easy access to main features
- **Modal Forms:** Clean form presentations
- **Pull-to-Refresh:** Update data with pull gesture
- **Loading States:** Visual feedback during operations
- **Success Animations:** Confirmation feedback
- **Error Handling:** User-friendly error messages

## 📸 Image Handling

### Complaint Images
- Multiple images per complaint
- Stored in `complaint-images/{userId}/{timestamp}.jpg`
- Public URL generation
- Automatic cleanup on complaint deletion

### Completion Images
- Single completion photo per complaint
- Stored with completion notes
- Proof of work done
- Timestamped for records

## 🔄 Real-Time Updates

### Auto-Reload Features
- Complaints list auto-reloads on focus
- Dashboard statistics refresh on navigation
- Profile data reloads after updates
- Technician list updates after additions

### Navigation Flow
```
Login → Role-based Dashboard
  ├─ User Dashboard
  │   ├─ Submit Complaint → Success → Tasks (Auto-reload)
  │   ├─ Tasks (In Progress / Completed)
  │   └─ Profile
  │
  ├─ Technician Dashboard
  │   ├─ Assigned Tasks
  │   ├─ Update Status
  │   └─ Profile
  │
  └─ Admin Dashboard
      ├─ Overview
      ├─ Manage Technicians
      ├─ Departments
      └─ Profile
```

## 🐛 Known Issues & Fixes

### Fixed Issues
- ✅ RLS policies causing infinite recursion
- ✅ Technicians not visible in admin dashboard
- ✅ Duplicate key errors on technician creation
- ✅ Profile table name mismatch
- ✅ Password visibility toggle
- ✅ Auto-reload after complaint submission

### Current Limitations
- Email cannot be changed after registration
- Single department per technician
- QR codes must be generated externally

## 📝 Future Enhancements

- [ ] Push notifications for complaint updates
- [ ] In-app chat between users and technicians
- [ ] Complaint priority levels
- [ ] Advanced analytics dashboard
- [ ] Export complaint reports (PDF)
- [ ] Multi-language support
- [ ] Offline mode with sync
- [ ] Rating system for technician performance

## 🤝 Contributing

This is a college project. For suggestions or improvements, please contact the development team.

## 👨‍💻 Development Team

- **Developer:** Naved Sayyed
- **GitHub:** [@navedsayyed](https://github.com/navedsayyed)
- **Repository:** [fyp](https://github.com/navedsayyed/fyp)

## 📄 License

This project is created for educational purposes as part of a Final Year Project.

## 📞 Support

For any issues or questions:
- Check the documentation in the project files
- Review `COMPLETE_FIX_NOW.md` for troubleshooting
- Review `QR_CODES.md` for QR code generation
- Contact the development team

## 🙏 Acknowledgments

- Supabase for backend infrastructure
- Expo team for React Native framework
- React Navigation for routing
- Material Icons for UI icons
- College administration for project support

---

**Version:** 1.0.0  
**Last Updated:** October 2025  
**Status:** Active Development