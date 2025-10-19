# Floor-Based Complaint Routing System

## Overview

The complaint management system now includes **smart floor-based routing** that automatically directs complaints to the correct department based on the floor where the issue is located.

## How It Works

### 1. QR Code Scanning
When a user scans a QR code posted at any location in the building:
```json
{
  "class": "305",
  "floor": "3",
  "department": "IT",
  "building": "B"
}
```

### 2. Automatic Department Assignment
The system reads the `floor` field and automatically assigns the complaint to the department responsible for that floor:

| Floor | Department | HOD |
|-------|-----------|-----|
| **1** | Civil | Mr. A.G. Chaudhari |
| **2** | Civil | Mr. A.G. Chaudhari |
| **3** | IT | Mr. P.C. Patil |
| **4** | Electrical | Mr. B.G. Dabhade |
| **5** | Mechanical | Mr. R.S. Khandare |

### 3. Complaint Routing
The complaint is automatically routed to:
- ✅ **HOD Dashboard** - Department head sees it in their overview
- ✅ **Admin Dashboard** - Admin sees it in department-specific sections
- ✅ **Technician Assignment** - Can be assigned to technicians from that department

## Dual Routing System

The app uses **two methods** to determine which department receives a complaint:

### Method 1: Floor-Based Routing (QR Code)
- **Priority**: High (used first if available)
- **Trigger**: User scans QR code with floor information
- **Logic**: Floor number → Department mapping
- **Example**: Floor 3 → IT Department

### Method 2: Complaint Type-Based Routing (Manual)
- **Priority**: Fallback (used if no QR code scanned)
- **Trigger**: User manually selects complaint type
- **Logic**: Complaint type → Department mapping
- **Example**: "Computer/Desktop" → IT Department

## Real-World Example

### Scenario 1: QR Code Used
1. Student on **Floor 3** (IT Department floor) finds broken chair
2. Scans QR code: `{"floor":"3","class":"305"}`
3. Selects complaint type: "Furniture Repair" (normally Civil)
4. **Result**: Complaint goes to **IT Department** (floor-based routing takes priority)
5. **Reason**: IT Department is responsible for Floor 3 maintenance

### Scenario 2: No QR Code
1. Student submits complaint without scanning QR
2. Selects complaint type: "Furniture Repair"
3. **Result**: Complaint goes to **Civil Department**
4. **Reason**: Type-based routing used (Furniture → Civil)

## Configuration

### Customizing Floor Mappings
Edit `utils/departmentMapping.js`:

```javascript
export const floorToDepartment = {
  '1': 'Civil',          // First floor
  '2': 'Civil',          // Second floor
  '3': 'IT',             // Third floor
  '4': 'Electrical',     // Fourth floor
  '5': 'Mechanical',     // Fifth floor
  '6': 'Housekeeping',   // Add more floors as needed
};
```

### Adding New Floors
1. Open `utils/departmentMapping.js`
2. Add new entry to `floorToDepartment` object:
   ```javascript
   '6': 'Housekeeping',
   '7': 'Civil',
   ```
3. Create QR codes for new floor locations
4. Deploy updated app

## Benefits

### For Users
- ✅ **Faster submission** - QR scan auto-fills location
- ✅ **More accurate** - No manual data entry errors
- ✅ **Context-aware** - Complaint goes to floor's department

### For Departments
- ✅ **Better organization** - Each floor has assigned department
- ✅ **Clearer responsibility** - HODs know which floors they manage
- ✅ **Faster response** - Right department gets complaint immediately

### For Admin
- ✅ **Transparent routing** - Can see which floor triggered which department
- ✅ **Better oversight** - Track complaints by floor and department
- ✅ **Flexible configuration** - Easy to change floor assignments

## Technical Implementation

### Files Modified
1. **utils/departmentMapping.js**
   - Added `floorToDepartment` mapping
   - Added `getDepartmentFromFloor()` function

2. **screens/UserDashboard.js**
   - Import floor mapping utility
   - Check for floor data before submission
   - Route to floor-based department if available

3. **QR_CODES.md**
   - Added floor routing documentation
   - Added floor-specific QR code examples

### Database Schema
The `complaints` table already has the required columns:
- `floor` - Stores floor number from QR code
- `department` - Stores assigned department name
- `class` - Stores room/class number
- `complaint_type` - Stores type for fallback routing

## Testing

### Test Case 1: Floor 3 QR Code
1. Scan QR code: `{"floor":"3","class":"305"}`
2. Submit any complaint type
3. **Expected**: Complaint in IT Department dashboard

### Test Case 2: Floor 4 QR Code
1. Scan QR code: `{"floor":"4","class":"401"}`
2. Submit any complaint type
3. **Expected**: Complaint in Electrical Department dashboard

### Test Case 3: No QR Code
1. Don't scan any QR code
2. Select "Computer/Desktop" complaint type
3. **Expected**: Complaint in IT Department dashboard (type-based routing)

## Future Enhancements

1. **Building-Based Routing** - Different buildings, different department assignments
2. **Time-Based Routing** - After-hours complaints go to security/housekeeping
3. **Priority-Based Routing** - Urgent complaints escalate to multiple departments
4. **Zone-Based Routing** - Wing A vs Wing B on same floor

## Conclusion

Floor-based routing provides a **smarter, more context-aware** complaint management system that automatically routes issues to the department responsible for that physical location, while maintaining fallback routing based on complaint type.
