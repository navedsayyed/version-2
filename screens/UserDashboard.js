import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, Alert, Modal, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { CustomButton } from '../components/CustomButton';
import { Card } from '../components/Card';
import QRScannerScreen from '../components/QRScannerScreen';
import { 
  BellIcon, 
  CameraIcon, 
  UploadIcon, 
  CheckCircleIcon
} from '../components/icons';
import { 
  getCurrentUser, 
  createComplaint, 
  uploadComplaintImage 
} from '../config/supabaseClient';
import { getDepartmentFromFloor } from '../utils/departmentMapping';

// CLEAN REWRITE OF USER DASHBOARD (fixing prior corruption & nesting issues)
// Key changes:
// 1. Removed corrupted preamble and stray JSX fragments
// 2. Dropdown moved to a single top-level Modal (no FlatList inside parent ScrollView)
// 3. Clear separation of Add Complaint vs My Complaints tabs
// 4. Simplified styles (removed duplicated style keys)
// 5. Guarded all optional resources & removed unused imports

export const UserDashboard = ({ navigation }) => {
  /* -------------------------------- State -------------------------------- */
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [complaintForm, setComplaintForm] = useState({
    title: '',
    location: '',
    place: '',
    description: '',
    image: null,
    class: '',
    floor: '',
    department: '',
    type: '',
    customType: '' // For "Other" option - user enters their own type
  });

  /* -------------------------- Complaint Type List - Organized by Category ------------------------ */
  const complaintTypes = [
    // ===== INFRASTRUCTURE (Civil Department) =====
    { label: 'Wall/Paint Damage', value: 'wall', category: 'Infrastructure' },
    { label: 'Ceiling Damage', value: 'ceiling', category: 'Infrastructure' },
    { label: 'Floor Damage', value: 'floor', category: 'Infrastructure' },
    { label: 'Window/Glass Repair', value: 'window', category: 'Infrastructure' },
    { label: 'Door Repair', value: 'door', category: 'Infrastructure' },
    { label: 'Furniture Repair', value: 'furniture', category: 'Infrastructure' },
    { label: 'Building Structure', value: 'structure', category: 'Infrastructure' },
    { label: 'Other Infrastructure', value: 'civil-other', category: 'Infrastructure', requiresCustomType: true },
    
    // ===== ELECTRICAL (Electrical Department) =====
    { label: 'Electrical Wiring', value: 'electrical', category: 'Electrical' },
    { label: 'Lighting Problem', value: 'lighting', category: 'Electrical' },
    { label: 'Power Outage', value: 'power', category: 'Electrical' },
    { label: 'Switch/Socket Issue', value: 'switch', category: 'Electrical' },
    { label: 'Fan Not Working', value: 'fan', category: 'Electrical' },
    { label: 'Electrical Safety', value: 'electrical-safety', category: 'Electrical' },
    { label: 'Other Electrical', value: 'electrical-other', category: 'Electrical', requiresCustomType: true },
    
    // ===== MECHANICAL (Mechanical Department) =====
    { label: 'Air Conditioning', value: 'ac', category: 'Mechanical' },
    { label: 'Heating System', value: 'heating', category: 'Mechanical' },
    { label: 'Plumbing/Water', value: 'plumbing', category: 'Mechanical' },
    { label: 'Drainage Problem', value: 'drainage', category: 'Mechanical' },
    { label: 'Ventilation', value: 'ventilation', category: 'Mechanical' },
    { label: 'Elevator/Lift', value: 'elevator', category: 'Mechanical' },
    { label: 'Other Mechanical', value: 'mechanical-other', category: 'Mechanical', requiresCustomType: true },
    
    // ===== IT/TECHNICAL (IT Department) =====
    { label: 'Computer/Desktop', value: 'computer', category: 'IT/Technical' },
    { label: 'Projector/Display', value: 'projector', category: 'IT/Technical' },
    { label: 'Internet/Network', value: 'network', category: 'IT/Technical' },
    { label: 'Lab Equipment', value: 'lab', category: 'IT/Technical' },
    { label: 'Software Issue', value: 'software', category: 'IT/Technical' },
    { label: 'Printer/Scanner', value: 'printer', category: 'IT/Technical' },
    { label: 'Teaching Equipment', value: 'teaching', category: 'IT/Technical' },
    { label: 'Other IT/Technical', value: 'it-other', category: 'IT/Technical', requiresCustomType: true },
    
    // ===== HOUSEKEEPING (Housekeeping Department) =====
    { label: 'Cleanliness', value: 'cleanliness', category: 'Housekeeping' },
    { label: 'Washroom/Toilet', value: 'washroom', category: 'Housekeeping' },
    { label: 'Garbage/Waste', value: 'garbage', category: 'Housekeeping' },
    { label: 'Pest Control', value: 'pest', category: 'Housekeeping' },
    { label: 'Garden/Lawn', value: 'garden', category: 'Housekeeping' },
    { label: 'General Maintenance', value: 'maintenance', category: 'Housekeeping' },
    { label: 'Other Housekeeping', value: 'housekeeping-other', category: 'Housekeeping', requiresCustomType: true },
    
    // ===== GENERAL OTHER =====
    { label: 'Security Issue', value: 'security', category: 'Other' },
    { label: 'Fire Safety', value: 'fire', category: 'Other' },
    { label: 'General Other', value: 'other', category: 'Other', requiresCustomType: true }
  ];

  /* -------------------------- Load user and data on mount ----------------------- */
  useEffect(() => {
    loadUserAndComplaints();
    requestPermissions();
  }, []);

  const loadUserAndComplaints = async () => {
    try {
      const { user, error } = await getCurrentUser();
      if (error) {
        Alert.alert('Error', 'Failed to load user data');
        return;
      }
      setCurrentUser(user);
    } catch (err) {
      console.error('Error loading user:', err);
    }
  };

  const requestPermissions = async () => {
    try {
      const cam = await ImagePicker.requestCameraPermissionsAsync();
      const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cam.status !== 'granted' || lib.status !== 'granted') {
        Alert.alert('Permission required', 'Camera & gallery permissions are needed for photos.');
      }
    } catch (e) { 
      console.log('Permission error', e); 
    }
  };

  /* ------------------------------- Handlers ------------------------------ */
  const handleSetField = useCallback((field, value) => {
    setComplaintForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleQRScan = () => setShowQRScanner(true);

  const handleScanComplete = (qrData) => {
    const upd = {
      class: qrData.class || '',
      floor: qrData.floor || '',
      department: qrData.department || '',
      location: `Building ${qrData.building || 'A'} - Floor ${qrData.floor || '1'}`,
      place: `${qrData.department || 'General'} - Room ${qrData.class || '101'}`
    };
    setComplaintForm(p => ({ ...p, ...upd }));
    Alert.alert('QR Scanned', `${upd.location}\n${upd.place}`);
    setShowQRScanner(false);
  };

  const takePhoto = async () => {
    try {
      const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });
      if (!res.canceled) handleSetField('image', res.assets[0].uri);
      setShowPhotoOptions(false);
    } catch (e) { Alert.alert('Error', 'Camera failed'); }
  };

  const pickImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
      if (!res.canceled) handleSetField('image', res.assets[0].uri);
      setShowPhotoOptions(false);
    } catch (e) { Alert.alert('Error', 'Image pick failed'); }
  };

  const submitComplaint = async () => {
    const { title, type, description, location, place, image, customType } = complaintForm;
    
    if (!title || !type || !description || !location || !place) {
      Alert.alert('Missing Fields', 'Fill Title, Type, Location, Place, Description');
      return;
    }

    // Check if "Other" type is selected and customType is required
    const selectedType = complaintTypes.find(t => t.value === type);
    if (selectedType?.requiresCustomType && !customType?.trim()) {
      Alert.alert('Missing Field', 'Please specify the problem type');
      return;
    }

    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to submit a complaint');
      return;
    }

    setLoading(true);
    try {
      // Get fresh auth user to ensure we have the correct ID
      const { user: authUser, error: authError } = await getCurrentUser();
      
      if (authError || !authUser) {
        Alert.alert('Error', 'You must be logged in to submit a complaint');
        setLoading(false);
        return;
      }

      // Create complaint in database with authenticated user's ID
      // If "Other" is selected, append custom type to title
      const finalTitle = selectedType?.requiresCustomType && customType 
        ? `${customType} - ${title}` 
        : title;

      // Determine department routing:
      // 1. If floor info from QR code exists, use floor-to-department mapping
      // 2. Otherwise, complaint routes based on complaint type (handled in backend)
      let routingDepartment = complaintForm.department || null;
      if (complaintForm.floor) {
        const floorBasedDept = getDepartmentFromFloor(complaintForm.floor);
        if (floorBasedDept) {
          routingDepartment = floorBasedDept;
          console.log(`Floor ${complaintForm.floor} → ${floorBasedDept} Department`);
        }
      }

      const complaintData = {
        user_id: authUser.id, // Use fresh auth user ID
        title: finalTitle,
        type,
        description,
        location,
        place,
        department: routingDepartment, // Use floor-based routing if available
        floor: complaintForm.floor || null,
        class: complaintForm.class || null,
        status: 'in-progress',
      };

      console.log('Submitting complaint with user_id:', authUser.id);

      const { data: newComplaint, error: complaintError } = await createComplaint(complaintData);

      if (complaintError) {
        console.error('Complaint creation error:', complaintError);
        throw complaintError;
      }

      // Upload image if provided
      if (image && newComplaint) {
        const { error: imageError } = await uploadComplaintImage(newComplaint.id, image);
        if (imageError) {
          console.error('Error uploading image:', imageError);
          Alert.alert('Warning', 'Complaint created but image upload failed');
        }
      }

      // Show success and reset form
      setShowSuccess(true);
      setComplaintForm({ 
        title: '', 
        location: '', 
        place: '', 
        description: '', 
        image: null, 
        class: '', 
        floor: '', 
        department: '', 
        type: '',
        customType: '' 
      });

      setTimeout(() => {
        setShowSuccess(false);
        navigation.navigate('Tasks');
      }, 1200);

    } catch (err) {
      console.error('Error submitting complaint:', err);
      Alert.alert('Error', err.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------- Dropdown ------------------------------- */
  const renderDropdownModal = () => (
    <Modal visible={showTypeDropdown} transparent animationType="fade" onRequestClose={() => setShowTypeDropdown(false)}>
      <TouchableOpacity activeOpacity={1} style={styles.ddOverlay} onPress={() => setShowTypeDropdown(false)}>
        <View style={styles.ddPanel}>
          <View style={styles.ddHeader}><Text style={styles.ddHeaderText}>Select Complaint Type</Text></View>
          <FlatList
            data={complaintTypes}
            keyExtractor={i => i.value}
            renderItem={({ item, index }) => {
              const prev = index > 0 ? complaintTypes[index - 1] : null;
              const showCat = !prev || prev.category !== item.category;
              return (
                <>
                  {showCat && <Text style={styles.ddCategory}>{item.category}</Text>}
                  <TouchableOpacity style={[styles.ddItem, complaintForm.type === item.value && styles.ddItemActive]} onPress={() => { handleSetField('type', item.value); setShowTypeDropdown(false); }}>
                    <Text style={[styles.ddItemText, complaintForm.type === item.value && styles.ddItemTextActive]}>{item.label}</Text>
                    {complaintForm.type === item.value && <Feather name="check" size={16} color={colors.primary} />}
                  </TouchableOpacity>
                </>
              );
            }}
            style={{ maxHeight: 320 }}
          />
          <TouchableOpacity style={styles.ddCloseBtn} onPress={() => setShowTypeDropdown(false)}>
            <Text style={styles.ddCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  /* ------------------------------- Main UI -------------------------------- */
  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Complaint Form</Text>
        <BellIcon size={22} color={colors.text} />
      </View>

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.scrollContent} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        removeClippedSubviews={false}
      >
          <Card>
              <Text style={styles.sectionTitle}>Location (QR Optional)</Text>
              <CustomButton title="Scan QR Code" icon={CameraIcon} variant="outline" onPress={handleQRScan} />
              {(complaintForm.department || complaintForm.floor || complaintForm.class) && (
                <View style={styles.scannedBox}>
                  {complaintForm.department ? <Text style={styles.scannedLine}>Dept: {complaintForm.department}</Text> : null}
                  {complaintForm.floor ? <Text style={styles.scannedLine}>Floor: {complaintForm.floor}</Text> : null}
                  {complaintForm.class ? <Text style={styles.scannedLine}>Room: {complaintForm.class}</Text> : null}
                </View>
              )}
            </Card>

            <Card>
              <Text style={styles.sectionTitle}>Complaint Details</Text>
              <Field label="Title *">
                <TextInput 
                  style={styles.input} 
                  value={complaintForm.title} 
                  onChangeText={(text) => handleSetField('title', text)} 
                  placeholder="Short title" 
                  placeholderTextColor={colors.textSecondary}
                  returnKeyType="next"
                />
              </Field>

              <Field label="Complaint Type *">
                <TouchableOpacity style={[styles.dropdownSelector, complaintForm.type && styles.dropdownSelectorActive]} onPress={() => setShowTypeDropdown(true)}>
                  <Text style={[styles.dropdownText, !complaintForm.type && styles.placeholder]}>
                    {complaintForm.type ? complaintTypes.find(t => t.value === complaintForm.type)?.label : 'Select type'}
                  </Text>
                  <Feather name="chevron-down" size={18} color={complaintForm.type ? colors.primary : colors.textSecondary} />
                </TouchableOpacity>
              </Field>

              {/* Show custom type input if "Other" option is selected */}
              {complaintTypes.find(t => t.value === complaintForm.type)?.requiresCustomType && (
                <Field label="Specify Problem Type *">
                  <TextInput 
                    style={[styles.input, styles.customTypeInput]} 
                    value={complaintForm.customType} 
                    onChangeText={(text) => handleSetField('customType', text)} 
                    placeholder="e.g., Staircase handrail broken" 
                    placeholderTextColor={colors.textSecondary}
                    returnKeyType="next"
                    autoFocus={true}
                  />
                  <Text style={styles.helperText}>
                    💡 Enter a brief description of the problem type
                  </Text>
                </Field>
              )}

              <Field label="Location *">
                <TextInput 
                  style={styles.input} 
                  value={complaintForm.location} 
                  onChangeText={(text) => handleSetField('location', text)} 
                  placeholder="Building & Floor" 
                  placeholderTextColor={colors.textSecondary}
                  returnKeyType="next"
                />
              </Field>
              <Field label="Place *">
                <TextInput 
                  style={styles.input} 
                  value={complaintForm.place} 
                  onChangeText={(text) => handleSetField('place', text)} 
                  placeholder="Dept / Room" 
                  placeholderTextColor={colors.textSecondary}
                  returnKeyType="next"
                />
              </Field>
              <Field label="Description *">
                <TextInput 
                  style={[styles.input, styles.textArea]} 
                  value={complaintForm.description} 
                  onChangeText={(text) => handleSetField('description', text)} 
                  multiline 
                  numberOfLines={5} 
                  placeholder="Describe the issue" 
                  placeholderTextColor={colors.textSecondary}
                  textAlignVertical="top"
                />
              </Field>

              <Field label="Photo (optional)">
                {complaintForm.image ? (
                  <View>
                    <Image source={{ uri: complaintForm.image }} style={styles.preview} />
                    <CustomButton title="Change Photo" variant="outline" size="small" onPress={() => setShowPhotoOptions(true)} />
                  </View>
                ) : (
                  <CustomButton title="Add Photo" icon={UploadIcon} variant="outline" onPress={() => setShowPhotoOptions(true)} />
                )}
              </Field>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>Submitting complaint...</Text>
                </View>
              ) : (
                <CustomButton title="Submit Complaint" icon={CheckCircleIcon} size="large" onPress={submitComplaint} />
              )}
            </Card>
        </ScrollView>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.centerOverlay}>
          <View style={styles.successBox}>
            <CheckCircleIcon size={56} color={colors.success} />
            <Text style={styles.successTitle}>Submitted!</Text>
            <Text style={styles.successMsg}>Complaint recorded.</Text>
          </View>
        </View>
      </Modal>

      {/* Photo Options */}
      <Modal visible={showPhotoOptions} transparent animationType="fade">
        <View style={styles.centerOverlay}>
          <View style={styles.photoSheet}>
            <Text style={styles.photoTitle}>Add Photo</Text>
            <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}><CameraIcon size={22} color={colors.primary} /><Text style={styles.photoBtnText}>Take Photo</Text></TouchableOpacity>
            <TouchableOpacity style={styles.photoBtn} onPress={pickImage}><UploadIcon size={22} color={colors.secondary} /><Text style={styles.photoBtnText}>From Gallery</Text></TouchableOpacity>
            <TouchableOpacity style={styles.photoCancel} onPress={() => setShowPhotoOptions(false)}><Text style={styles.photoCancelText}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* QR Scanner */}
      <Modal visible={showQRScanner} animationType="slide">
        <QRScannerScreen onScan={handleScanComplete} onClose={() => setShowQRScanner(false)} />
      </Modal>

      {renderDropdownModal()}
    </View>
  );
};

/* ----------------------------- Reusable Components ----------------------------- */
const Field = ({ label, children }) => (
  <View style={styles.field}> 
    <Text style={styles.fieldLabel}>{label}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingBottom: 0 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12, backgroundColor: colors.surface },
  topTitle: { fontSize: 22, fontWeight: '700', color: colors.text },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 90, gap: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6 },
  input: { backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border, fontSize: 15, color: colors.text },
  textArea: { height: 120, textAlignVertical: 'top' },
  dropdownSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14 },
  dropdownSelectorActive: { borderColor: colors.primary },
  dropdownText: { fontSize: 15, color: colors.text },
  placeholder: { color: colors.textSecondary },
  preview: { width: '100%', height: 180, borderRadius: 12, marginBottom: 12, marginTop: 4 },
  scannedBox: { marginTop: 12, backgroundColor: colors.primaryTransparent, padding: 12, borderRadius: 10 },
  scannedLine: { fontSize: 12, color: colors.text },
  centerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  successBox: { backgroundColor: colors.surface, padding: 28, borderRadius: 22, alignItems: 'center', width: '75%' },
  successTitle: { fontSize: 20, fontWeight: '700', marginTop: 12, color: colors.text },
  successMsg: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  photoSheet: { backgroundColor: colors.surface, padding: 22, width: '80%', borderRadius: 20 },
  photoTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 16, color: colors.text },
  photoBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  photoBtnText: { fontSize: 15, color: colors.text },
  photoCancel: { marginTop: 12, paddingVertical: 12, alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border },
  photoCancelText: { color: colors.danger, fontWeight: '600' },
  ddOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', padding: 24, justifyContent: 'center' },
  ddPanel: { backgroundColor: colors.surface, borderRadius: 16, paddingBottom: 8, overflow: 'hidden', maxHeight: '80%' },
  ddHeader: { padding: 14, backgroundColor: colors.primary },
  ddHeaderText: { color: '#fff', fontWeight: '600', fontSize: 16, textAlign: 'center' },
  ddCategory: { 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    marginTop: 8,
    fontSize: 13, 
    fontWeight: '700', 
    color: colors.primary,
    backgroundColor: colors.primaryTransparent,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  ddItem: { paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border },
  ddItemActive: { backgroundColor: colors.primaryTransparent },
  ddItemText: { fontSize: 15, color: colors.text },
  ddItemTextActive: { color: colors.primary, fontWeight: '600' },
  ddCloseBtn: { padding: 14, alignItems: 'center' },
  ddCloseText: { fontSize: 15, fontWeight: '600', color: colors.primary },
  customTypeInput: {
    borderColor: colors.primary,
    borderWidth: 1.5,
    backgroundColor: colors.primaryTransparent,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
    fontStyle: 'italic',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
  },
});
