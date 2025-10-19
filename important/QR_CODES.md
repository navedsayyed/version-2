# How to Generate QR Codes for Location Scanning

To create QR codes for various locations in your facility that can be scanned by the ComplaintPro app, follow these steps:

## QR Code Format

The QR codes should contain a JSON object with the following properties:

```json
{
  "class": "101",     // Room or class number
  "floor": "2",       // Floor number
  "department": "Electrical", // Department name
  "building": "A"     // Building identifier (optional)
}
```

## Sample QR Codes

Here are some samples you can generate for testing:

### Floor 1 - Civil Department
1. **Room 101 - Floor 1**
```json
{"class":"101","floor":"1","department":"Civil","building":"A"}
```

2. **Room 102 - Floor 1**
```json
{"class":"102","floor":"1","department":"Civil","building":"A"}
```

### Floor 3 - IT/Computer Department
3. **IT Lab 305 - Floor 3**
```json
{"class":"305","floor":"3","department":"IT","building":"B"}
```

4. **Computer Lab 301 - Floor 3**
```json
{"class":"301","floor":"3","department":"IT","building":"B"}
```

### Floor 4 - Electrical Department
5. **Electrical Room 401 - Floor 4**
```json
{"class":"401","floor":"4","department":"Electrical","building":"A"}
```

6. **Electrical Lab 405 - Floor 4**
```json
{"class":"405","floor":"4","department":"Electrical","building":"A"}
```

### Floor 5 - Mechanical Department
7. **Mechanical Workshop 501 - Floor 5**
```json
{"class":"501","floor":"5","department":"Mechanical","building":"C"}
```

8. **Mechanical Lab 505 - Floor 5**
```json
{"class":"505","floor":"5","department":"Mechanical","building":"C"}
```

## How to Generate QR Codes

1. Copy the JSON text for the location you want
2. Go to an online QR code generator like:
   - [QR Code Generator](https://www.qr-code-generator.com/)
   - [QR Code Monkey](https://www.qrcode-monkey.com/)
   - Any other QR code generator site
3. Paste the JSON text into the content field
4. Generate the QR code
5. Download and print the QR code
6. Post the QR code at the corresponding location

## Floor-Based Department Routing

The app now uses **smart floor-based routing**. When a user scans a QR code, the complaint is automatically routed to the correct department based on the floor number:

| Floor | Department Assigned |
|-------|-------------------|
| 1     | Civil Department |
| 2     | Civil Department |
| 3     | IT/Computer Department |
| 4     | Electrical Department |
| 5     | Mechanical Department |

### How It Works:
1. User scans QR code from any floor
2. System reads the `floor` field from QR data
3. Complaint is automatically routed to that floor's department
4. HOD/Admin of that department receives the complaint in their dashboard

### Dual Routing System:
Complaints are routed using TWO methods:
- **QR Code Floor-Based**: If user scans QR code, floor number determines department
- **Complaint Type-Based**: If no QR code, complaint type (Infrastructure → Civil, IT/Technical → IT, etc.) determines department

## Implementation Details

When scanned, these QR codes will automatically:
- Fill in Location (Building and Floor)
- Fill in Place (Department and Room)
- Fill in Class, Floor, and Department fields
- **Route complaint to the correct department based on floor number**

This makes it easy for users to submit complaints about specific locations without having to manually enter the details, and ensures complaints reach the right department automatically.