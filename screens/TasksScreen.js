import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../styles/colors';
import { Card } from '../components/Card';
import { 
  ClockIcon,
  CheckCircleIcon,
  MapPinIcon,
  CalendarIcon 
} from '../components/icons';
import { getCurrentUser, getComplaints } from '../config/supabaseClient';

const TasksScreen = ({ navigation }) => {
  const [complaintsTab, setComplaintsTab] = useState('in-progress');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const { user, error } = await getCurrentUser();
        if (error) {
          Alert.alert('Error', 'Unable to load your account.');
          return;
        }
        if (!user) {
          Alert.alert('Session expired', 'Please sign in again.');
          return;
        }
        setCurrentUser(user);
      } catch (err) {
        console.error('TasksScreen init error:', err);
        Alert.alert('Error', 'Failed to fetch user info.');
      }
    };

    init();
  }, []);

  const fetchComplaints = useCallback(async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const status = complaintsTab === 'in-progress' ? 'in-progress' : 'completed';
      const { data, error } = await getComplaints(currentUser.id, status);

      if (error) {
        console.error('TasksScreen complaints error:', error);
        Alert.alert('Error', 'Failed to load complaints.');
        return;
      }

      const formatted = data.map(complaint => ({
        id: complaint.id,
        title: complaint.title,
        type: complaint.type,
        description: complaint.description,
        location: complaint.location,
        place: complaint.place,
        date: new Date(complaint.created_at).toISOString().split('T')[0],
        status: complaint.status,
        image: complaint.complaint_images?.[0]?.url || null,
        images: complaint.complaint_images?.map(img => img.url) || [],
        completedImage: complaint.completion_image_url || null,
        completedAt: complaint.completed_at ? new Date(complaint.completed_at).toISOString().split('T')[0] : null,
        completedNotes: complaint.completion_notes || null,
      }));

      setComplaints(formatted);
    } catch (err) {
      console.error('TasksScreen fetch error:', err);
      Alert.alert('Error', 'Something went wrong while loading complaints.');
    } finally {
      setLoading(false);
    }
  }, [currentUser, complaintsTab]);

  // Reload complaints when screen comes into focus (after submitting)
  useFocusEffect(
    useCallback(() => {
      fetchComplaints();
    }, [fetchComplaints])
  );

  // Also reload when tab changes
  useEffect(() => {
    fetchComplaints();
  }, [complaintsTab, fetchComplaints]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Complaints</Text>
      </View>

      <View style={styles.subTabContainer}>
        <TouchableOpacity
          style={[styles.subTab, complaintsTab === 'in-progress' && styles.activeSubTab]}
          onPress={() => setComplaintsTab('in-progress')}
          activeOpacity={0.8}
        >
          <ClockIcon size={16} color={complaintsTab === 'in-progress' ? colors.text : colors.textSecondary} />
          <Text style={[styles.subTabText, complaintsTab === 'in-progress' && styles.activeSubTabText]}>
            In Progress
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.subTab, complaintsTab === 'completed' && styles.activeSubTab]}
          onPress={() => setComplaintsTab('completed')}
          activeOpacity={0.8}
        >
          <CheckCircleIcon size={16} color={complaintsTab === 'completed' ? colors.text : colors.textSecondary} />
          <Text style={[styles.subTabText, complaintsTab === 'completed' && styles.activeSubTabText]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading complaints...</Text>
          </View>
        ) : complaints.length ? (
          complaints.map(complaint => (
            <TouchableOpacity
              key={complaint.id}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('UserComplaintDetail', { complaint })}
            >
              <Card>
                <View style={styles.complaintCard}>
                  <View style={styles.complaintHeader}>
                    <Text style={styles.complaintTitle}>{complaint.title}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: complaint.status === 'completed' ? colors.success : colors.accent },
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {complaint.status === 'completed' ? 'Completed' : 'In Progress'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.complaintDetails}>
                    <View style={styles.detailRow}>
                      <MapPinIcon size={16} color={colors.textSecondary} />
                      <Text style={styles.detailText}>{complaint.location}{complaint.place ? ` • ${complaint.place}` : ''}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <CalendarIcon size={16} color={colors.textSecondary} />
                      <Text style={styles.detailText}>{complaint.date}</Text>
                    </View>
                  </View>

                  <Text style={styles.complaintDescription}>{complaint.description}</Text>

                  {complaint.image ? (
                    <Image source={{ uri: complaint.image }} style={styles.complaintImage} />
                  ) : null}
                </View>
              </Card>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No {complaintsTab === 'in-progress' ? 'in-progress' : 'completed'} complaints yet.
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
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
  content: {
    flex: 1,
    padding: 24,
  },
  scrollViewContent: {
    paddingBottom: 120, // Add more padding to ensure content is above tab bar
  },
  bottomSpacer: {
    height: 100, // Extra space at the bottom
  },
  subTabContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
  },
  subTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeSubTab: {
    backgroundColor: colors.primary,
  },
  subTabText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeSubTabText: {
    color: colors.text,
  },
  complaintCard: {
    gap: 12,
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  complaintTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
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
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  complaintDescription: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  complaintImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    color: colors.text,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default TasksScreen;