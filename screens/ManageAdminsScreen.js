import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Modal, TextInput, Alert, SafeAreaView, StatusBar, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import { colors } from '../styles/colors';
import { Card } from '../components/Card';
import { CustomButton } from '../components/CustomButton';
import { supabase, getCurrentUser } from '../config/supabaseClient';

const DEPARTMENTS = ['Civil', 'Electrical', 'Mechanical', 'IT', 'Housekeeping', 'First Year'];
const FLOORS = ['1', '2', '3', '4', '5'];

const ManageAdminsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', department: 'Civil' });
  const [floorMode, setFloorMode] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState('');

  useEffect(() => {
    loadAdmins();
  }, []);

  const ensureSuperAdmin = async () => {
    const { user } = await getCurrentUser();
    if (!user) return false;
    const { data, error } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (error) return false;
    return (data?.role || '').toLowerCase() === 'super_admin' || (data?.role || '').toLowerCase() === 'super-admin' || (data?.role || '').toLowerCase() === 'superadmin';
  };

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'admin')
        .order('department', { ascending: true });
      if (error) throw error;
      setAdmins(data || []);
    } catch (e) {
      console.error('Failed to load admins:', e);
    } finally {
      setLoading(false);
    }
  };

  const addAdmin = async () => {
    if (!(await ensureSuperAdmin())) {
      Alert.alert('Forbidden', 'Only Super Admin can add admins.');
      return;
    }

    const { fullName, email, phone, password, department } = form;
    if (!fullName || !email || !phone || !password) {
      Alert.alert('Missing Fields', 'Please fill all fields');
      return;
    }

    try {
      // create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: { full_name: fullName.trim(), phone: phone.trim(), role: 'admin', department, floor: floorMode ? selectedFloor : null }
        }
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error('Auth creation failed');

      // upsert profile
      const { error: profileError } = await supabase.from('users').upsert([
        { id: authData.user.id, email: email.trim(), full_name: fullName.trim(), phone: phone.trim(), role: 'admin', department, floor: floorMode ? selectedFloor : null }
      ], { onConflict: 'id' });
      if (profileError) throw profileError;

      Alert.alert('Success', `Admin ${fullName} added${floorMode ? ` for Floor ${selectedFloor}` : ` for ${department}`}`);
      setShowModal(false);
      setForm({ fullName: '', email: '', phone: '', password: '', department: 'Civil' });
      setSelectedFloor('');
      setFloorMode(false);
      loadAdmins();
    } catch (e) {
      console.error('Failed to add admin:', e);
      Alert.alert('Error', e.message || 'Failed to add admin');
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.adminCard}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {(item.full_name || 'N').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.cardHeaderInfo}>
          <Text style={styles.adminName}>{item.full_name || 'N/A'}</Text>
          <View style={styles.badgeContainer}>
            <View style={styles.deptBadge}>
              <Text style={styles.badgeText}>Dept: {item.department || '-'}</Text>
            </View>
            {item.floor && (
              <View style={[styles.deptBadge, { backgroundColor: colors.accentLight }]}>
                <Text style={styles.badgeText}>Floor {item.floor}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue} numberOfLines={1}>{item.email}</Text>
        </View>
      </View>
      
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Phone</Text>
          <Text style={styles.infoValue}>{item.phone || '-'}</Text>
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 8 }}>Loading admins...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerSection}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Manage Admins</Text>
          <Text style={styles.subtitle}>{admins.length} admin{admins.length !== 1 ? 's' : ''} registered</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)} activeOpacity={0.8}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={admins}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No admins found</Text>
            <Text style={styles.emptySubtext}>Add your first admin to get started</Text>
          </View>
        }
      />

      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            style={styles.modalOverlayTouchable}
            onPress={() => setShowModal(false)}
          >
            <TouchableOpacity activeOpacity={1} style={styles.modal} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Admin</Text>
                <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={styles.modalBody}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="Enter full name" 
                    placeholderTextColor={colors.textSecondary} 
                    value={form.fullName} 
                    onChangeText={(t) => setForm({ ...form, fullName: t })} 
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="admin@example.com" 
                    autoCapitalize="none" 
                    keyboardType="email-address" 
                    placeholderTextColor={colors.textSecondary} 
                    value={form.email} 
                    onChangeText={(t) => setForm({ ...form, email: t })} 
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="+91-XXXXXXXXXX" 
                    keyboardType="phone-pad" 
                    placeholderTextColor={colors.textSecondary} 
                    value={form.phone} 
                    onChangeText={(t) => setForm({ ...form, phone: t })} 
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="Enter password" 
                    secureTextEntry 
                    placeholderTextColor={colors.textSecondary} 
                    value={form.password} 
                    onChangeText={(t) => setForm({ ...form, password: t })} 
                  />
                </View>

                <View style={styles.selectorSection}>
                  <Text style={styles.selectorTitle}>Admin Type</Text>
                  <View style={styles.modeRow}>
                    <TouchableOpacity 
                      style={[styles.modePill, !floorMode && styles.modePillActive]} 
                      onPress={() => setFloorMode(false)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.modePillText, !floorMode && styles.modePillTextActive]}>By Department</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.modePill, floorMode && styles.modePillActive]} 
                      onPress={() => setFloorMode(true)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.modePillText, floorMode && styles.modePillTextActive]}>By Floor</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {!floorMode ? (
                  <View style={styles.selectorSection}>
                    <Text style={styles.selectorTitle}>Select Department</Text>
                    <View style={styles.deptRow}>
                      {DEPARTMENTS.map((d) => (
                        <TouchableOpacity 
                          key={d} 
                          style={[styles.deptPill, form.department === d && styles.deptPillActive]} 
                          onPress={() => setForm({ ...form, department: d })}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.deptPillText, form.department === d && styles.deptPillTextActive]}>{d}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ) : (
                  <View style={styles.selectorSection}>
                    <Text style={styles.selectorTitle}>Select Floor</Text>
                    <View style={styles.deptRow}>
                      {FLOORS.map((f) => (
                        <TouchableOpacity 
                          key={f} 
                          style={[styles.deptPill, selectedFloor === f && styles.deptPillActive]} 
                          onPress={() => setSelectedFloor(f)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.deptPillText, selectedFloor === f && styles.deptPillTextActive]}>Floor {f}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowModal(false)} activeOpacity={0.7}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitButton} onPress={addAdmin} activeOpacity={0.7}>
                  <Text style={styles.submitButtonText}>Add Admin</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  center: { justifyContent: 'center', alignItems: 'center' },
  
  // Header Section
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  headerLeft: {
    flex: 1,
  },
  title: { 
    fontSize: 28, 
    fontWeight: '700', 
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '700',
  },

  // Admin Card
  adminCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  adminName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  deptBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  infoRow: {
    marginBottom: 10,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  // Modal
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.75)', 
    justifyContent: 'flex-end',
  },
  modalOverlayTouchable: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modal: { 
    backgroundColor: colors.surface, 
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },

  // Input Fields
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: { 
    backgroundColor: colors.background, 
    borderWidth: 1.5, 
    borderColor: colors.border, 
    borderRadius: 12, 
    padding: 14,
    paddingHorizontal: 16,
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
  },

  // Selector Section
  selectorSection: {
    marginBottom: 20,
  },
  selectorTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modeRow: { 
    flexDirection: 'row', 
    gap: 10,
  },
  modePill: { 
    flex: 1,
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderRadius: 12, 
    borderWidth: 1.5, 
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  modePillActive: { 
    backgroundColor: colors.accent, 
    borderColor: colors.accent,
    elevation: 2,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modePillText: { 
    fontSize: 14, 
    color: colors.textSecondary,
    fontWeight: '700',
  },
  modePillTextActive: { 
    color: colors.white,
  },

  // Department/Floor Pills
  deptRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 10,
  },
  deptPill: { 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 12, 
    borderWidth: 1.5, 
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  deptPillActive: { 
    backgroundColor: colors.primary, 
    borderColor: colors.primary,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  deptPillText: { 
    fontSize: 13, 
    color: colors.textSecondary,
    fontWeight: '600',
  },
  deptPillTextActive: { 
    color: colors.white,
    fontWeight: '700',
  },

  // Modal Actions
  modalActions: { 
    flexDirection: 'row', 
    gap: 12,
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    elevation: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
});

export default ManageAdminsScreen;
