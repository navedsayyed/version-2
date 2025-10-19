import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, ActivityIndicator, SafeAreaView, Platform, StatusBar, TouchableOpacity, Modal, TextInput, Linking } from 'react-native';
import { colors } from '../styles/colors';
import { Card } from '../components/Card';
import { CustomButton } from '../components/CustomButton';
import { UsersIcon, PlusIcon, CloseIcon } from '../components/icons';
import { getCurrentUser, getUserProfile, supabase } from '../config/supabaseClient';

export const AdminTechniciansScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [hodProfile, setHodProfile] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingTechnician, setAddingTechnician] = useState(false);
  const [newTechForm, setNewTechForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });
  
  // New state for viewing/editing technician
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { user } = await getCurrentUser();
      if (!user) {
        Alert.alert('Error', 'Unable to load user data');
        return;
      }

      const { data: profileData } = await getUserProfile(user.id);
      if (profileData) {
        setHodProfile({
          id: user.id,
          name: profileData.full_name || 'HOD',
          department: profileData.department || 'General',
          email: user.email,
        });
        
        await loadTechnicians(profileData.department);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load technicians data');
    } finally {
      setLoading(false);
    }
  };

  const loadTechnicians = async (department) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'technician')
        .eq('department', department);

      if (error) throw error;
      
      // Get work stats for each technician
      const techsWithStats = await Promise.all((data || []).map(async (tech) => {
        const { data: assigned } = await supabase
          .from('complaints')
          .select('id')
          .eq('assigned_to', tech.id)
          .eq('status', 'in-progress');
        
        const { data: completed } = await supabase
          .from('complaints')
          .select('id')
          .eq('assigned_to', tech.id)
          .eq('status', 'completed');

        return {
          ...tech,
          assignedWork: assigned?.length || 0,
          completedWork: completed?.length || 0
        };
      }));
      
      setTechnicians(techsWithStats);
    } catch (error) {
      console.error('Error loading technicians:', error);
    }
  };

  const handleAddTechnician = async () => {
    const { fullName, email, phone, password } = newTechForm;

    // Validation
    if (!fullName || !email || !phone || !password) {
      Alert.alert('Missing Fields', 'Please fill all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setAddingTechnician(true);

    try {
      // Step 1: Create authentication account (with email confirmation disabled)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          emailRedirectTo: undefined,
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
            role: 'technician',
            department: hodProfile.department,
          }
        }
      });

      if (authError) {
        throw new Error(`Auth error: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('Failed to create authentication account');
      }

      console.log('Auth account created:', authData.user.id);

      // Wait a moment for any database triggers to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Upsert user profile in users table (handles existing profiles)
      const { error: profileError } = await supabase
        .from('users')
        .upsert([
          {
            id: authData.user.id,
            email: email.trim(),
            full_name: fullName.trim(),
            phone: phone.trim(),
            role: 'technician',
            department: hodProfile.department,
          }
        ], {
          onConflict: 'id'
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }

      // Success!
      Alert.alert(
        'Success',
        `Technician ${fullName} added successfully!\n\nCredentials:\nEmail: ${email}\nPassword: ${password}\n\nThey can now login to the app.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setShowAddModal(false);
              setNewTechForm({ fullName: '', email: '', phone: '', password: '' });
              loadTechnicians(hodProfile.department);
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error adding technician:', error);
      Alert.alert('Error', error.message || 'Failed to add technician. Please try again.');
    } finally {
      setAddingTechnician(false);
    }
  };

  const handleViewTechnician = (tech) => {
    setSelectedTechnician(tech);
    setEditForm({
      fullName: tech.full_name,
      email: tech.email,
      phone: tech.phone || '',
    });
    setIsEditing(false);
    setShowDetailModal(true);
  };

  const handleCallTechnician = (phone) => {
    if (!phone) {
      Alert.alert('No Phone Number', 'This technician does not have a phone number on file.');
      return;
    }
    
    const phoneNumber = phone.replace(/[^0-9+]/g, ''); // Remove non-numeric characters except +
    const url = Platform.OS === 'ios' ? `telprompt:${phoneNumber}` : `tel:${phoneNumber}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Unable to make phone calls on this device');
        }
      })
      .catch((err) => {
        console.error('Error opening phone dialer:', err);
        Alert.alert('Error', 'Failed to open phone dialer');
      });
  };

  const handleUpdateTechnician = async () => {
    const { fullName, email, phone } = editForm;

    if (!fullName || !email || !phone) {
      Alert.alert('Missing Fields', 'Please fill all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    try {
      setAddingTechnician(true);

      const { error } = await supabase
        .from('users')
        .update({
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
        })
        .eq('id', selectedTechnician.id);

      if (error) throw error;

      Alert.alert('Success', 'Technician information updated successfully!');
      setIsEditing(false);
      setShowDetailModal(false);
      loadTechnicians(hodProfile.department);
    } catch (error) {
      console.error('Error updating technician:', error);
      Alert.alert('Error', error.message || 'Failed to update technician information');
    } finally {
      setAddingTechnician(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading Technicians...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Technicians</Text>
          <Text style={styles.headerSubtitle}>{hodProfile?.department} Department</Text>
        </View>
        <UsersIcon size={24} color={colors.text} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Blue stats card commented out - not needed */}
        {/* <View style={styles.statsCard}>
          <Text style={styles.statsNumber}>{technicians.length}</Text>
          <Text style={styles.statsLabel}>Total Technicians</Text>
        </View> */}

        {technicians.length > 0 ? (
          technicians.map((tech) => {
            const total = tech.assignedWork + tech.completedWork;
            const completionRate = total > 0 ? ((tech.completedWork / total) * 100).toFixed(1) : 0;
            
            return (
              <TouchableOpacity 
                key={tech.id} 
                onPress={() => handleViewTechnician(tech)}
                activeOpacity={0.7}
              >
                <Card style={styles.techCard}>
                  <View style={styles.techHeader}>
                    <View style={styles.techIconCircle}>
                      <UsersIcon size={24} color={colors.primary} />
                    </View>
                    <View style={styles.techInfo}>
                      <Text style={styles.techName}>{tech.full_name}</Text>
                      <Text style={styles.techContact}>📞 {tech.phone || 'N/A'}</Text>
                      <Text style={styles.techEmail}>📧 {tech.email}</Text>
                    </View>
                  </View>

                <View style={styles.divider} />

                <View style={styles.techStats}>
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{tech.assignedWork}</Text>
                    <Text style={styles.statLabel}>Assigned</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={[styles.statNumber, { color: colors.success }]}>
                      {tech.completedWork}
                    </Text>
                    <Text style={styles.statLabel}>Completed</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={[styles.statNumber, { color: colors.primary }]}>
                      {total}
                    </Text>
                    <Text style={styles.statLabel}>Total</Text>
                  </View>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Completion Rate</Text>
                    <Text style={styles.progressPercent}>{completionRate}%</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${completionRate}%`,
                          backgroundColor: colors.success 
                        }
                      ]} 
                    />
                  </View>
                </View>
                </Card>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <UsersIcon size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No technicians assigned yet</Text>
            <Text style={styles.emptySubtext}>Technicians will appear here once assigned to your department</Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Add Technician Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.8}
      >
        <PlusIcon size={28} color={colors.white} />
      </TouchableOpacity>

      {/* Add Technician Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Technician</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <CloseIcon size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.departmentBadge}>
                📍 {hodProfile?.department} Department
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  value={newTechForm.fullName}
                  onChangeText={(text) => setNewTechForm({ ...newTechForm, fullName: text })}
                  placeholder="Enter full name"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email *</Text>
                <TextInput
                  style={styles.input}
                  value={newTechForm.email}
                  onChangeText={(text) => setNewTechForm({ ...newTechForm, email: text })}
                  placeholder="technician@example.com"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone *</Text>
                <TextInput
                  style={styles.input}
                  value={newTechForm.phone}
                  onChangeText={(text) => setNewTechForm({ ...newTechForm, phone: text })}
                  placeholder="Enter phone number"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password *</Text>
                <TextInput
                  style={styles.input}
                  value={newTechForm.password}
                  onChangeText={(text) => setNewTechForm({ ...newTechForm, password: text })}
                  placeholder="Minimum 6 characters"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                />
                <Text style={styles.helperText}>
                  This password will be used for login
                </Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>ℹ️ What happens next?</Text>
                <Text style={styles.infoText}>
                  1. Authentication account will be created{'\n'}
                  2. Technician can login immediately{'\n'}
                  3. They will be assigned to {hodProfile?.department} department{'\n'}
                  4. Credentials will be shown after creation
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <CustomButton
                title="Cancel"
                variant="outline"
                onPress={() => setShowAddModal(false)}
                disabled={addingTechnician}
                style={{ flex: 1, marginRight: 8 }}
              />
              <CustomButton
                title={addingTechnician ? "Adding..." : "Add Technician"}
                onPress={handleAddTechnician}
                disabled={addingTechnician}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Technician Detail Modal */}
      <Modal
        visible={showDetailModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditing ? 'Edit Technician' : 'Technician Details'}
              </Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <CloseIcon size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {selectedTechnician && (
                <>
                  <View style={styles.detailSection}>
                    <View style={styles.detailIconCircle}>
                      <UsersIcon size={40} color={colors.primary} />
                    </View>
                    <Text style={styles.detailName}>{selectedTechnician.full_name}</Text>
                    <Text style={styles.detailDepartment}>
                      {selectedTechnician.department} Department
                    </Text>
                  </View>

                  {!isEditing ? (
                    <>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>📧 Email:</Text>
                        <Text style={styles.infoValue}>{selectedTechnician.email}</Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>📞 Phone:</Text>
                        <Text style={styles.infoValue}>
                          {selectedTechnician.phone || 'Not provided'}
                        </Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>👤 Role:</Text>
                        <Text style={styles.infoValue}>Technician</Text>
                      </View>

                      <View style={styles.statsSection}>
                        <Text style={styles.statsSectionTitle}>Work Statistics</Text>
                        <View style={styles.statsGrid}>
                          <View style={styles.statItem}>
                            <Text style={styles.statItemNumber}>
                              {selectedTechnician.assignedWork || 0}
                            </Text>
                            <Text style={styles.statItemLabel}>Assigned</Text>
                          </View>
                          <View style={styles.statItem}>
                            <Text style={[styles.statItemNumber, { color: colors.success }]}>
                              {selectedTechnician.completedWork || 0}
                            </Text>
                            <Text style={styles.statItemLabel}>Completed</Text>
                          </View>
                          <View style={styles.statItem}>
                            <Text style={[styles.statItemNumber, { color: colors.primary }]}>
                              {(selectedTechnician.assignedWork || 0) + (selectedTechnician.completedWork || 0)}
                            </Text>
                            <Text style={styles.statItemLabel}>Total</Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.actionButtons}>
                        <CustomButton
                          title="📞 Call Technician"
                          variant="outline"
                          onPress={() => handleCallTechnician(selectedTechnician.phone)}
                          style={{ marginBottom: 12 }}
                        />
                        <CustomButton
                          title="✏️ Edit Information"
                          onPress={() => setIsEditing(true)}
                        />
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Full Name *</Text>
                        <TextInput
                          style={styles.input}
                          value={editForm.fullName}
                          onChangeText={(text) => setEditForm({ ...editForm, fullName: text })}
                          placeholder="Enter full name"
                          placeholderTextColor={colors.textSecondary}
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Email *</Text>
                        <TextInput
                          style={styles.input}
                          value={editForm.email}
                          onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                          placeholder="technician@example.com"
                          placeholderTextColor={colors.textSecondary}
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Phone *</Text>
                        <TextInput
                          style={styles.input}
                          value={editForm.phone}
                          onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
                          placeholder="Enter phone number"
                          placeholderTextColor={colors.textSecondary}
                          keyboardType="phone-pad"
                        />
                      </View>

                      <View style={styles.modalFooter}>
                        <CustomButton
                          title="Cancel"
                          variant="outline"
                          onPress={() => {
                            setIsEditing(false);
                            setEditForm({
                              fullName: selectedTechnician.full_name,
                              email: selectedTechnician.email,
                              phone: selectedTechnician.phone || '',
                            });
                          }}
                          disabled={addingTechnician}
                          style={{ flex: 1, marginRight: 8 }}
                        />
                        <CustomButton
                          title={addingTechnician ? "Saving..." : "Save Changes"}
                          onPress={handleUpdateTechnician}
                          disabled={addingTechnician}
                          style={{ flex: 1, marginLeft: 8 }}
                        />
                      </View>
                    </>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  statsNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.white,
  },
  statsLabel: {
    fontSize: 16,
    color: colors.white,
    marginTop: 4,
  },
  techCard: {
    padding: 16,
    marginBottom: 16,
  },
  techHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  techIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 191, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  techInfo: {
    flex: 1,
  },
  techName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  techContact: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  techEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  techStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.success,
  },
  progressBar: {
    height: 10,
    backgroundColor: colors.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  fab: {
    position: 'absolute',
    bottom: 90,  // Moved higher to avoid bottom navigation
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,  // Increased elevation
    zIndex: 999,   // Added high zIndex
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalBody: {
    padding: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  departmentBadge: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    backgroundColor: colors.primaryTransparent,
    padding: 12,
    borderRadius: 8,
    textAlign: 'center',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.text,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
    fontStyle: 'italic',
  },
  infoBox: {
    backgroundColor: colors.primaryTransparent,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  detailSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 20,
  },
  detailIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryTransparent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  detailDepartment: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  infoRow: {
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  statsSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  statsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.primaryTransparent,
    padding: 16,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statItemNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  statItemLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  actionButtons: {
    marginTop: 8,
    marginBottom: 16,
  },
});
