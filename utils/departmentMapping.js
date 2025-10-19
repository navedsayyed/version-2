// ============================================================================
// Department Mapping Utility
// Maps complaint types to HOD departments for automatic routing
// Also maps QR code floor numbers to departments
// ============================================================================

/**
 * Maps floor number to department
 * Used when QR codes are scanned to automatically assign department
 */
export const floorToDepartment = {
  '1': 'Civil',          // First floor → Civil Department
  '2': 'First Year',     // Second floor → First Year Department (Umakant Butkar)
  '3': 'IT',             // Third floor → IT/Computer Department
  '4': 'Electrical',     // Fourth floor → Electrical Department
  '5': 'Mechanical',     // Fifth floor → Mechanical Department
  // Add more floor mappings as needed
};

/**
 * Get department based on QR code floor information
 * @param {string} floor - Floor number from QR code
 * @returns {string|null} Department name or null if not mapped
 */
export const getDepartmentFromFloor = (floor) => {
  return floorToDepartment[floor] || null;
};

/**
 * Maps complaint_type to the corresponding HOD department
 * This determines which HOD will receive the complaint
 */
export const complaintTypeToDepartment = {
  // ===== CIVIL DEPARTMENT - Mr. A.G. Chaudhari =====
  'wall': 'Civil',
  'ceiling': 'Civil',
  'floor': 'Civil',
  'window': 'Civil',
  'door': 'Civil',
  'furniture': 'Civil',
  'structure': 'Civil',
  'civil-other': 'Civil', // Other civil issues
  
  // ===== ELECTRICAL DEPARTMENT - Mr. B.G. Dabhade =====
  'electrical': 'Electrical',
  'lighting': 'Electrical',
  'power': 'Electrical',
  'switch': 'Electrical',
  'fan': 'Electrical',
  'electrical-safety': 'Electrical',
  'electrical-other': 'Electrical', // Other electrical issues
  
  // ===== MECHANICAL DEPARTMENT - Mr. R.S. Khandare =====
  'ac': 'Mechanical',
  'heating': 'Mechanical',
  'plumbing': 'Mechanical',
  'drainage': 'Mechanical',
  'ventilation': 'Mechanical',
  'elevator': 'Mechanical',
  'mechanical-other': 'Mechanical', // Other mechanical issues
  
  // ===== IT DEPARTMENT - Mr. P.C. Patil =====
  'computer': 'IT',
  'projector': 'IT',
  'network': 'IT',
  'lab': 'IT',
  'software': 'IT',
  'printer': 'IT',
  'teaching': 'IT',
  'it-other': 'IT', // Other IT issues
  
  // ===== HOUSEKEEPING DEPARTMENT - Mr. Vinayak Apsingkar =====
  'cleanliness': 'Housekeeping',
  'washroom': 'Housekeeping',
  'garbage': 'Housekeeping',
  'pest': 'Housekeeping',
  'garden': 'Housekeeping',
  'maintenance': 'Housekeeping',
  'housekeeping-other': 'Housekeeping', // Other housekeeping issues
  
  // ===== GENERAL OTHER =====
  'security': 'Housekeeping', // Security handled by housekeeping
  'fire': 'Civil', // Fire safety handled by civil
  'other': 'Civil', // Default to civil for unknown issues
};

/**
 * Get department name for a given complaint type
 * @param {string} complaintType - The type of complaint
 * @returns {string} Department name or 'General' if not found
 */
export const getDepartmentForComplaintType = (complaintType) => {
  return complaintTypeToDepartment[complaintType] || 'General';
};

/**
 * Get all complaint types for a specific department
 * @param {string} department - Department name
 * @returns {string[]} Array of complaint types
 */
export const getComplaintTypesForDepartment = (department) => {
  return Object.entries(complaintTypeToDepartment)
    .filter(([_, dept]) => dept === department)
    .map(([type, _]) => type);
};

/**
 * HOD Information
 */
export const hodInfo = {
  'Civil': {
    name: 'Mr. A.G. Chaurdhari',
    title: 'Infrastructure Civil Activities',
    email: 'ag.chaurdhari@college.edu',
    complaintTypes: ['wall', 'ceiling', 'floor', 'door', 'window']
  },
  'Electrical': {
    name: 'Mr. B.G. Dabhade',
    title: 'Infrastructure Electrical Activities',
    email: 'bg.dabhade@college.edu',
    complaintTypes: ['electrical', 'lighting', 'power', 'ac', 'heating']
  },
  'Mechanical': {
    name: 'Mr. R.S. Khandare',
    title: 'Infrastructure Mechanical Activities',
    email: 'rs.khandare@college.edu',
    complaintTypes: ['plumbing', 'furniture']
  },
  'IT': {
    name: 'Mr. P.C. Patil',
    title: 'Infrastructure IT Activities',
    email: 'pc.patil@college.edu',
    complaintTypes: ['network', 'computer', 'projector', 'lab', 'teaching']
  },
  'Housekeeping': {
    name: 'Mr. Vinayak Apsingkar',
    title: 'Housekeeping Activities',
    email: 'vinayak.apsingkar@college.edu',
    complaintTypes: ['cleanliness', 'security']
  }
};

/**
 * Get HOD email for a specific department
 * @param {string} department - Department name
 * @returns {string|null} HOD email or null if not found
 */
export const getHODEmailForDepartment = (department) => {
  return hodInfo[department]?.email || null;
};

/**
 * Get HOD ID from database for a specific department
 * This is an async function that queries Supabase
 * @param {string} department - Department name
 * @param {object} supabase - Supabase client instance
 * @returns {Promise<string|null>} HOD user ID or null if not found
 */
export const getHODIdForDepartment = async (department, supabase) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .eq('department', department)
      .limit(1);

    if (error) {
      console.error('Error fetching HOD ID:', error);
      return null;
    }

    // Return first HOD ID if found, otherwise null
    return data && data.length > 0 ? data[0].id : null;
  } catch (error) {
    console.error('Error in getHODIdForDepartment:', error);
    return null;
  }
};

/**
 * Validate if a complaint type exists in our mapping
 * @param {string} complaintType - The type of complaint
 * @returns {boolean} True if valid complaint type
 */
export const isValidComplaintType = (complaintType) => {
  return complaintType in complaintTypeToDepartment;
};
