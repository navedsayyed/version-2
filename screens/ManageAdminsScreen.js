import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Modal, TextInput, Alert, SafeAreaView, StatusBar, Platform } from 'react-native';
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
    <Card style={{ marginBottom: 12 }}>
      <Text style={styles.name}>{item.full_name || 'N/A'}</Text>
      <Text style={styles.detail}>Dept: {item.department || '-'}</Text>
      {item.floor ? <Text style={styles.detail}>Floor: {item.floor}</Text> : null}
      <Text style={styles.detail}>Email: {item.email}</Text>
      <Text style={styles.detail}>Phone: {item.phone || '-'}</Text>
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
      <View style={styles.header}>
        <Text style={styles.title}>Manage Admins</Text>
        <CustomButton title="Add Admin" onPress={() => setShowModal(true)} size="small" />
      </View>
      <FlatList
        data={admins}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>No admins found</Text>}
      />

      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add New Admin</Text>
            <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor={colors.textSecondary} value={form.fullName} onChangeText={(t) => setForm({ ...form, fullName: t })} />
            <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" placeholderTextColor={colors.textSecondary} value={form.email} onChangeText={(t) => setForm({ ...form, email: t })} />
            <TextInput style={styles.input} placeholder="Phone" keyboardType="phone-pad" placeholderTextColor={colors.textSecondary} value={form.phone} onChangeText={(t) => setForm({ ...form, phone: t })} />
            <TextInput style={styles.input} placeholder="Password" secureTextEntry placeholderTextColor={colors.textSecondary} value={form.password} onChangeText={(t) => setForm({ ...form, password: t })} />

            <View style={[styles.modeRow]}>
              <TouchableOpacity style={[styles.modePill, !floorMode && styles.modePillActive]} onPress={() => setFloorMode(false)}>
                <Text style={[styles.modePillText, !floorMode && styles.modePillTextActive]}>Department Mode</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modePill, floorMode && styles.modePillActive]} onPress={() => setFloorMode(true)}>
                <Text style={[styles.modePillText, floorMode && styles.modePillTextActive]}>Floor Mode</Text>
              </TouchableOpacity>
            </View>

            {!floorMode ? (
              <View style={styles.deptRow}>
                {DEPARTMENTS.map((d) => (
                  <TouchableOpacity key={d} style={[styles.deptPill, form.department === d && styles.deptPillActive]} onPress={() => setForm({ ...form, department: d })}>
                    <Text style={[styles.deptPillText, form.department === d && styles.deptPillTextActive]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.deptRow}>
                {FLOORS.map((f) => (
                  <TouchableOpacity key={f} style={[styles.deptPill, selectedFloor === f && styles.deptPillActive]} onPress={() => setSelectedFloor(f)}>
                    <Text style={[styles.deptPillText, selectedFloor === f && styles.deptPillTextActive]}>Floor {f}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.modalActions}>
              <CustomButton title="Cancel" variant="secondary" onPress={() => setShowModal(false)} />
              <CustomButton title="Add" onPress={addAdmin} />
            </View>
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  name: { fontSize: 16, fontWeight: '600', color: colors.text },
  detail: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 16 },
  modal: { backgroundColor: colors.surface, borderRadius: 16, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, color: colors.text, marginBottom: 10 },
  deptRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 8 },
  deptPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  deptPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  deptPillText: { fontSize: 12, color: colors.textSecondary },
  deptPillTextActive: { color: colors.white },
  modeRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  modePill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  modePillActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  modePillText: { fontSize: 12, color: colors.textSecondary },
  modePillTextActive: { color: colors.white },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
});

export default ManageAdminsScreen;
