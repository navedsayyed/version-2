import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../styles/colors';
import { Card } from '../components/Card';
import { getAllComplaints, getCurrentUser, getUserProfile, supabase } from '../config/supabaseClient';
import { BellIcon, MapPinIcon, CalendarIcon, CheckCircleIcon } from '../components/icons';

const TechnicianDashboard = ({ navigation }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [technicianProfile, setTechnicianProfile] = useState(null);

  useEffect(() => {
    loadComplaints();
  }, []);

  // Reload complaints whenever this screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadComplaints();
    }, [])
  );

  const loadComplaints = async () => {
    try {
      setLoading(true);
      console.log('========================================');
      console.log('TechnicianDashboard: Loading complaints...');
      console.log('========================================');
      
      // Get technician's profile to know their department
      const { user } = await getCurrentUser();
      if (!user) {
        console.error('No user logged in');
        setComplaints([]);
        return;
      }

      const { data: profileData, error: profileError } = await getUserProfile(user.id);
      console.log('📋 Profile loaded:', profileData);
      console.log('❌ Profile error:', profileError);
      
      if (profileError || !profileData) {
        console.error('Error loading technician profile:', profileError);
        setComplaints([]);
        return;
      }

      setTechnicianProfile(profileData);
      const technicianDepartment = profileData.department;
      console.log('🏢 Technician department:', technicianDepartment);
      console.log('📊 Full profile object:', JSON.stringify(profileData, null, 2));

      if (!technicianDepartment) {
        console.error('⚠️ Technician has no department assigned!');
        console.error('⚠️ Profile data:', profileData);
        setComplaints([]);
        return;
      }
      
      // Get only in-progress complaints for technician's department
      console.log('Loading in-progress complaints for department:', technicianDepartment);
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          *,
          users!complaints_user_id_fkey(full_name, email),
          complaint_images(url)
        `)
        .eq('status', 'in-progress')
        .eq('complaint_type', technicianDepartment) // Filter by technician's department
        .order('created_at', { ascending: false });
      
      console.log('Raw Response:');
      console.log('  - Data:', JSON.stringify(data, null, 2));
      console.log('  - Error:', JSON.stringify(error, null, 2));
      console.log('  - Data type:', typeof data);
      console.log('  - Data is array:', Array.isArray(data));
      console.log('  - Count:', data?.length || 0);
      
      if (error) {
        console.error('❌ ERROR loading complaints:');
        console.error('  - Message:', error.message);
        console.error('  - Details:', error.details);
        console.error('  - Hint:', error.hint);
        console.error('  - Code:', error.code);
        return;
      }

      if (!data || data.length === 0) {
        console.log('⚠️ No complaints found in database');
        console.log('  - Data is null:', data === null);
        console.log('  - Data is empty array:', Array.isArray(data) && data.length === 0);
        setComplaints([]);
        return;
      }

      console.log('✅ Found', data.length, 'complaints');
      console.log('First complaint sample:', data[0]);

      // Transform data to match UI format
      const formattedComplaints = data.map(complaint => {
        console.log('Processing complaint:', complaint.id, '-', complaint.title);
        return {
          id: complaint.id,
          title: complaint.title,
          type: complaint.type,
          description: complaint.description,
          location: complaint.location,
          place: complaint.place,
          status: complaint.status,
          date: new Date(complaint.created_at).toLocaleDateString(),
          userId: complaint.users?.full_name || complaint.users?.email || 'Unknown User',
          image: complaint.complaint_images?.[0]?.url || null,
        };
      });

      console.log('✅ Formatted', formattedComplaints.length, 'complaints');
      console.log('Setting state with complaints...');
      setComplaints(formattedComplaints);
      console.log('✅ State updated successfully!');
      console.log('========================================');
    } catch (error) {
      console.error('💥 EXCEPTION in loadComplaints:');
      console.error('  - Message:', error.message);
      console.error('  - Stack:', error.stack);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadComplaints();
    setRefreshing(false);
  };

  const navigateToDetail = (complaint) => {
    navigation.navigate('ComplaintDetail', { complaint });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Assigned Work</Text>
        <BellIcon size={24} color={colors.text} />
      </View>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.contentContainer} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading complaints...</Text>
          </View>
        ) : complaints.map(complaint => (
          <TouchableOpacity key={complaint.id} activeOpacity={0.85} onPress={() => navigateToDetail(complaint)}>
            <Card>
              <View style={styles.complaintCard}>
                <Text style={styles.complaintTitle}>{complaint.title}</Text>
                {complaint.type ? (
                  <View style={styles.typeContainer}>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>{complaint.type.charAt(0).toUpperCase() + complaint.type.slice(1)}</Text>
                    </View>
                  </View>
                ) : null}
                <View style={styles.complaintDetails}>
                  <View style={styles.detailRow}>
                    <MapPinIcon size={16} color={colors.textSecondary} />
                    <Text style={styles.detailText}>{complaint.location} - {complaint.place}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <CalendarIcon size={16} color={colors.textSecondary} />
                    <Text style={styles.detailText}>Submitted: {complaint.date}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Reported by:</Text>
                    <Text style={styles.detailText}>{complaint.userId}</Text>
                  </View>
                </View>
                <Text style={styles.complaintDescription}>{complaint.description}</Text>
                {complaint.image ? (
                  <View style={styles.imageContainer}>
                    <Text style={styles.imageLabel}>Issue Photo:</Text>
                    <Image source={{ uri: complaint.image }} style={styles.complaintImage} />
                  </View>
                ) : null}
                <View style={styles.viewDetailsContainer}>
                  <Text style={styles.viewDetailsText}>Tap to view details and complete this work</Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
        {!loading && complaints.length === 0 && (
          <View style={styles.emptyState}>
            <CheckCircleIcon size={60} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>No pending assignments</Text>
            <Text style={styles.emptyStateSubtext}>All assigned work has been completed!</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 80, // Add padding at the bottom for the tab bar
  },
  complaintCard: {
    gap: 16,
    padding: 8,
  },
  complaintTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  complaintDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  detailText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  complaintDescription: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
  },
  imageContainer: {
    gap: 8,
  },
  imageLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  complaintImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  viewDetailsContainer: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  viewDetailsText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  typeContainer: {
    marginBottom: 12,
  },
  typeBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  typeBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyStateText: { color: colors.text, fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  emptyStateSubtext: { color: colors.textSecondary, fontSize: 14, marginTop: 8 },
  loadingContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: { 
    color: colors.textSecondary, 
    fontSize: 16 
  },
});

export default TechnicianDashboard;
