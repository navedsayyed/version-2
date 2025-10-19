import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator, SafeAreaView, Platform, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../styles/colors';
import { getCurrentUser, getUserProfile, supabase } from '../config/supabaseClient';

const AdminProfileDetailScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { user, error: userError } = await getCurrentUser();
      
      if (userError || !user) {
        Alert.alert('Error', 'Unable to load user data');
        return;
      }

      const { data: profileData, error: profileError } = await getUserProfile(user.id);
      
      if (profileError || !profileData) {
        Alert.alert('Error', 'Unable to load profile data');
        return;
      }

      setProfile({
        id: user.id,
        name: profileData.full_name || user.email.split('@')[0],
        email: user.email,
        phone: profileData.phone || 'Not set',
        department: profileData.department || 'Administration',
        role: profileData.role || 'admin',
        joinedDate: new Date(user.created_at).toISOString().split('T')[0],
        avatar: profileData.avatar_url || 'https://randomuser.me/api/portraits/men/12.jpg'
      });
    } catch (err) {
      console.error('Error loading profile:', err);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPress = () => setIsEditing(!isEditing);

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: profile.name,
          phone: profile.phone,
          avatar_url: profile.avatar
        })
        .eq('id', profile.id);

      if (error) throw error;

      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => setIsEditing(false) }
      ]);
    } catch (err) {
      console.error('Error updating profile:', err);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => {
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        } }
    ]);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setProfile(p => ({ ...p, avatar: result.assets[0].uri }));
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Unable to load profile</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Profile</Text>
        <TouchableOpacity onPress={handleEditPress} style={styles.editButton}>
          <MaterialIcons name={isEditing ? 'close' : 'edit'} size={22} color={colors.primary} />
          <Text style={styles.editButtonText}>{isEditing ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.avatarSection}>
        <Image source={{ uri: profile.avatar }} style={styles.avatar} />
        {isEditing && (
          <TouchableOpacity style={styles.changePhotoButton} onPress={pickImage}>
            <MaterialIcons name="photo-camera" size={18} color="white" />
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.infoCard}>
        <Field label="Full Name" value={profile.name} editable={isEditing} onChange={t => setProfile(p => ({ ...p, name: t }))} />
        <Field label="Email" value={profile.email} editable={false} keyboardType="email-address" onChange={t => setProfile(p => ({ ...p, email: t }))} />
        <Field label="Phone" value={profile.phone} editable={isEditing} keyboardType="phone-pad" onChange={t => setProfile(p => ({ ...p, phone: t }))} />
        <StaticField label="Department" value={profile.department} />
        <StaticField label="Role" value={profile.role.toUpperCase()} />
        <StaticField label="Joined Date" value={profile.joinedDate} />
      </View>

      {isEditing && (
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialIcons name="logout" size={22} color="white" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const Field = ({ label, value, editable, onChange, keyboardType }) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    {editable ? (
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={label}
        placeholderTextColor={colors.textSecondary}
        keyboardType={keyboardType || 'default'}
      />
    ) : (
      <Text style={styles.fieldValue}>{value}</Text>
    )}
  </View>
);

const StaticField = ({ label, value }) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: colors.text },
  errorText: { fontSize: 16, color: colors.error, marginBottom: 16 },
  retryButton: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryButtonText: { color: 'white', fontWeight: '600', fontSize: 16 },
  scrollContainer: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 10 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text },
  editButton: { flexDirection: 'row', alignItems: 'center' },
  editButtonText: { marginLeft: 6, color: colors.primary, fontSize: 16, fontWeight: '600' },
  avatarSection: { alignItems: 'center', marginVertical: 20 },
  avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.card, borderWidth: 3, borderColor: colors.primary },
  changePhotoButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 22, marginTop: 12 },
  changePhotoText: { color: 'white', marginLeft: 6, fontWeight: '600' },
  infoCard: { backgroundColor: colors.card, marginHorizontal: 20, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, color: colors.textSecondary, marginBottom: 6, fontWeight: '500' },
  fieldValue: { fontSize: 16, color: colors.text, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10, fontSize: 16, color: colors.text, backgroundColor: colors.surface },
  saveButton: { backgroundColor: colors.success, marginHorizontal: 20, marginTop: 24, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  logoutButton: { backgroundColor: colors.error, marginHorizontal: 20, marginTop: 20, paddingVertical: 14, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  logoutButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
});

export default AdminProfileDetailScreen;
