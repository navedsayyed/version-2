import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../styles/colors';
import { Card } from '../components/Card';
import { getCurrentUser, getUserProfile, supabase } from '../config/supabaseClient';
import { 
  CheckCircleIcon,
  MapPinIcon,
  CalendarIcon 
} from '../components/icons';

const CompletedWorkScreen = ({ navigation }) => {
  const [completedComplaints, setCompletedComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [technicianProfile, setTechnicianProfile] = useState(null);

  useEffect(() => {
    loadCompletedWork();
  }, []);

  // Reload completed work whenever this screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadCompletedWork();
    }, [])
  );

  const loadCompletedWork = async () => {
    try {
      setLoading(true);
      console.log('CompletedWorkScreen: Loading completed complaints...');
      
      // Get current user to determine their department
      const { user } = await getCurrentUser();
      if (!user) {
        console.error('No user found');
        setLoading(false);
        return;
      }

      // Get technician profile to get their department
      const { data: profile, error: profileError } = await getUserProfile(user.id);
      console.log('📋 Profile loaded:', profile);
      console.log('❌ Profile error:', profileError);
      
      if (profileError || !profile) {
        console.error('No profile found for technician:', profileError);
        setLoading(false);
        return;
      }

      setTechnicianProfile(profile);
      const technicianDepartment = profile.department;
      console.log('🏢 Technician department:', technicianDepartment);
      console.log('📊 Full profile object:', JSON.stringify(profile, null, 2));

      if (!technicianDepartment) {
        console.error('⚠️ Technician has no department assigned!');
        console.error('⚠️ Profile data:', profile);
        setCompletedComplaints([]);
        setLoading(false);
        return;
      }

      // Get only completed complaints for technician's department
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          *,
          user:users!complaints_user_id_fkey(full_name, email),
          images:complaint_images(url)
        `)
        .eq('status', 'completed')
        .eq('complaint_type', technicianDepartment)
        .order('created_at', { ascending: false });
      
      console.log('Completed complaints data:', data);
      console.log('Completed complaints count:', data?.length || 0);
      
      if (error) {
        console.error('Error loading completed complaints:', error);
        return;
      }

      if (!data || data.length === 0) {
        console.log('No completed complaints found for this department');
        setCompletedComplaints([]);
        return;
      }

      // Transform data to match UI format
      const formattedComplaints = data.map(complaint => ({
        id: complaint.id,
        title: complaint.title,
        type: complaint.type,
        description: complaint.description,
        location: complaint.location,
        place: complaint.place,
        status: complaint.status,
        date: new Date(complaint.created_at).toLocaleDateString(),
        completedAt: complaint.completed_at ? new Date(complaint.completed_at).toLocaleDateString() : null,
        userId: complaint.user?.full_name || complaint.user?.email || 'Unknown User',
        image: complaint.images?.[0]?.url || null,
        completedImage: complaint.completion_image_url || null,
        completedDescription: complaint.completion_notes || null,
      }));

      console.log('Formatted completed complaints:', formattedComplaints.length);
      setCompletedComplaints(formattedComplaints);
    } catch (error) {
      console.error('Exception loading completed work:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCompletedWork();
    setRefreshing(false);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Completed Work</Text>
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
            <Text style={styles.loadingText}>Loading completed work...</Text>
          </View>
        ) : completedComplaints.map(complaint => (
          <TouchableOpacity 
            key={complaint.id}
            onPress={() => navigation.navigate('CompletedWorkDetail', { complaint })}
          >
            <Card>
              <View style={styles.complaintCard}>
                <View style={styles.complaintHeader}>
                  <Text style={styles.complaintTitle}>{complaint.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: colors.success }]}>
                    <Text style={styles.statusText}>Completed</Text>
                  </View>
                </View>
              
              <View style={styles.complaintDetails}>
                <View style={styles.detailRow}>
                  <MapPinIcon size={16} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{complaint.location} - {complaint.place}</Text>
                </View>
                <View style={styles.detailRow}>
                  <CalendarIcon size={16} color={colors.textSecondary} />
                  <Text style={styles.detailText}>Completed: {complaint.completedAt || complaint.date}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Reported by:</Text>
                  <Text style={styles.detailText}>{complaint.userId}</Text>
                </View>
              </View>

              <Text style={styles.complaintDescription}>{complaint.description}</Text>

              <View style={styles.beforeAfterContainer}>
                <View style={styles.imageSection}>
                  <Text style={styles.imageLabel}>Before</Text>
                  <Image source={{ uri: complaint.image }} style={styles.beforeAfterImage} />
                </View>
                {complaint.completedImage && (
                  <View style={styles.imageSection}>
                    <Text style={styles.imageLabel}>After</Text>
                    <Image source={{ uri: complaint.completedImage }} style={styles.beforeAfterImage} />
                  </View>
                )}
              </View>

              {complaint.completedDescription && (
                <View style={styles.completedSection}>
                  <Text style={styles.completedLabel}>Work Completed:</Text>
                  <Text style={styles.completedDescription}>{complaint.completedDescription}</Text>
                </View>
              )}
            </View>
          </Card>
          </TouchableOpacity>
        ))}

        {completedComplaints.length === 0 && (
          <View style={styles.emptyState}>
            <CheckCircleIcon size={60} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>No completed work</Text>
            <Text style={styles.emptyStateSubtext}>Completed work will appear here</Text>
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
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  complaintTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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
  beforeAfterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  imageSection: {
    flex: 1,
  },
  imageLabel: {
    color: colors.textSecondary,
    marginBottom: 6,
    fontSize: 14,
  },
  beforeAfterImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  completedSection: {
    marginTop: 8,
  },
  completedLabel: {
    color: colors.textSecondary,
    marginBottom: 6,
    fontSize: 14,
  },
  completedDescription: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptyStateSubtext: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});

export default CompletedWorkScreen;