# Quick QR Code Generation Guide

## Step-by-Step Instructions

### Step 1: Choose Location Details
Decide which room/location you want to create a QR code for:
- **Floor number** (1, 2, 3, 4, 5, etc.)
- **Room/Class number** (101, 305, M15, etc.)
- **Building** (A, B, C, etc.)
- **Department** (optional, but helpful)

### Step 2: Copy the JSON Template

**For Floor 1 (Civil Department):**
```json
{"class":"101","floor":"1","department":"Civil","building":"A"}
```

**For Floor 3 (IT Department):**
```json
{"class":"305","floor":"3","department":"IT","building":"B"}
```

**For Floor 4 (Electrical Department):**
```json
{"class":"401","floor":"4","department":"Electrical","building":"A"}
```

**For Floor 5 (Mechanical Department):**
```json
{"class":"501","floor":"5","department":"Mechanical","building":"C"}
```

### Step 3: Customize the JSON
Replace the values with your actual location:
- Change `class` to your room number
- Change `floor` to your floor number
- Change `building` to your building letter
- Change `department` to match your floor (use table below)

### Step 4: Generate QR Code

#### Online Method (Recommended)
1. Go to: **https://www.qr-code-generator.com/**
2. Click on "Text" option
3. Paste your JSON string (from Step 3)
4. Click "Create QR Code"
5. Download the QR code image

#### Alternative Sites
- **QR Code Monkey**: https://www.qrcode-monkey.com/
- **QR Stuff**: https://www.qrstuff.com/
- **QR Code Generator**: https://www.the-qrcode-generator.com/

### Step 5: Print and Post
1. Print the QR code (recommended size: 4x4 inches or 10x10 cm)
2. Laminate for durability (optional but recommended)
3. Post at eye level near the room entrance
4. Ensure good lighting for easy scanning

## Floor-to-Department Reference

| Floor | Department | Use This Department Value |
|-------|-----------|--------------------------|
| 1 | Civil | `"department":"Civil"` |
| 2 | Civil | `"department":"Civil"` |
| 3 | IT/Computer | `"department":"IT"` |
| 4 | Electrical | `"department":"Electrical"` |
| 5 | Mechanical | `"department":"Mechanical"` |

## Complete Examples by Floor

### Floor 1 Rooms
```json
Room 101: {"class":"101","floor":"1","department":"Civil","building":"A"}
Room 102: {"class":"102","floor":"1","department":"Civil","building":"A"}
Room 103: {"class":"103","floor":"1","department":"Civil","building":"A"}
Room 104: {"class":"104","floor":"1","department":"Civil","building":"A"}
```

### Floor 2 Rooms
```json
Room 201: {"class":"201","floor":"2","department":"Civil","building":"A"}
Room 202: {"class":"202","floor":"2","department":"Civil","building":"A"}
Room 203: {"class":"203","floor":"2","department":"Civil","building":"A"}
```

### Floor 3 Rooms (IT)
```json
IT Lab 301: {"class":"301","floor":"3","department":"IT","building":"B"}
IT Lab 302: {"class":"302","floor":"3","department":"IT","building":"B"}
Computer Lab 305: {"class":"305","floor":"3","department":"IT","building":"B"}
Server Room 310: {"class":"310","floor":"3","department":"IT","building":"B"}
```

### Floor 4 Rooms (Electrical)
```json
Electrical Lab 401: {"class":"401","floor":"4","department":"Electrical","building":"A"}
Electrical Workshop 402: {"class":"402","floor":"4","department":"Electrical","building":"A"}
Power Room 405: {"class":"405","floor":"4","department":"Electrical","building":"A"}
```

### Floor 5 Rooms (Mechanical)
```json
Mechanical Workshop 501: {"class":"501","floor":"5","department":"Mechanical","building":"C"}
Mechanical Lab 502: {"class":"502","floor":"5","department":"Mechanical","building":"C"}
Engineering Workshop 505: {"class":"505","floor":"5","department":"Mechanical","building":"C"}
```

## Bulk Generation Template

If you need to generate many QR codes at once, use this spreadsheet template:

| Floor | Class | Department | Building | JSON String |
|-------|-------|-----------|----------|-------------|
| 1 | 101 | Civil | A | `{"class":"101","floor":"1","department":"Civil","building":"A"}` |
| 1 | 102 | Civil | A | `{"class":"102","floor":"1","department":"Civil","building":"A"}` |
| 3 | 301 | IT | B | `{"class":"301","floor":"3","department":"IT","building":"B"}` |
| 4 | 401 | Electrical | A | `{"class":"401","floor":"4","department":"Electrical","building":"A"}` |
| 5 | 501 | Mechanical | C | `{"class":"501","floor":"5","department":"Mechanical","building":"C"}` |

Copy the JSON strings from the last column and generate QR codes for each.

## Testing Your QR Codes

1. Open the ComplaintPro app
2. Tap "Scan QR Code" button
3. Scan your printed QR code
4. Verify the location details are filled correctly:
   - Location shows: "Building X - Floor Y"
   - Place shows: "Department - Room Z"
5. Check that Department, Floor, and Class fields are populated

## Tips for Best Results

✅ **DO:**
- Use high contrast printing (black QR on white background)
- Keep QR codes at least 4x4 inches for easy scanning
- Laminate for outdoor or high-traffic areas
- Test each QR code before posting
- Keep the JSON format exact (no spaces, correct quotes)

❌ **DON'T:**
- Don't add extra spaces in the JSON string
- Don't use curved or wrinkled surfaces
- Don't place in poorly lit areas
- Don't use reflective lamination that creates glare
- Don't make QR codes smaller than 3x3 inches

## Troubleshooting

**QR Code Won't Scan:**
- Check lighting - ensure area is well-lit
- Clean phone camera lens
- Hold phone steady 6-12 inches from QR code
- Ensure QR code is flat, not curved or damaged

**Wrong Information Filled:**
- Verify JSON string has correct floor number
- Check that department matches the floor (see reference table)
- Regenerate QR code with corrected JSON

**Complaint Goes to Wrong Department:**
- Verify floor number in JSON matches physical floor
- Check `utils/departmentMapping.js` for correct floor-to-department mapping
- Contact admin if floor assignments need to be updated

## Need Help?

Contact your IT administrator or refer to:
- **FLOOR_BASED_ROUTING.md** - Detailed routing system explanation
- **QR_CODES.md** - Complete QR code documentation
- **DEPARTMENT_COMPLAINT_TYPES.md** - Department structure and types
