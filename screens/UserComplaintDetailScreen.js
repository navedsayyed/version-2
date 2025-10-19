import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { colors } from '../styles/colors';
import { Card } from '../components/Card';
import { MapPinIcon, CalendarIcon, ClockIcon, CheckCircleIcon } from '../components/icons';

const { width } = Dimensions.get('window');

const UserComplaintDetailScreen = ({ route, navigation }) => {
  const { complaint } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complaint Details</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{complaint.title}</Text>
            <View style={[styles.statusBadge, { 
              backgroundColor: complaint.status === 'completed' ? colors.success : colors.accent 
            }]}>
              {complaint.status === 'completed' && (
                <CheckCircleIcon size={16} color="#fff" />
              )}
              {complaint.status === 'in-progress' && (
                <ClockIcon size={16} color="#fff" />
              )}
              <Text style={styles.statusText}>
                {complaint.status === 'completed' ? 'Completed' : 'In Progress'}
              </Text>
            </View>
          </View>

          <View style={styles.typeTag}>
            <Text style={styles.typeText}>{complaint.type}</Text>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <MapPinIcon size={20} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoText}>{complaint.location} - {complaint.place}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <CalendarIcon size={20} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Submitted Date</Text>
                <Text style={styles.infoText}>{complaint.date}</Text>
              </View>
            </View>

            {complaint.completedAt && (
              <View style={styles.infoRow}>
                <CheckCircleIcon size={20} color={colors.success} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Completed Date</Text>
                  <Text style={styles.infoText}>{complaint.completedAt}</Text>
                </View>
              </View>
            )}
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{complaint.description}</Text>
        </Card>

        {complaint.status === 'completed' && complaint.completedImage ? (
          <Card>
            <Text style={styles.sectionTitle}>Before & After Photos</Text>
            <Text style={styles.sectionSubtitle}>Your complaint has been resolved!</Text>
            
            <View style={styles.photosContainer}>
              {/* User's Original Photo */}
              {complaint.image && (
                <View style={styles.photoSection}>
                  <View style={styles.photoHeader}>
                    <Text style={styles.photoLabel}>📷 Before (Your Photo)</Text>
                  </View>
                  <Image 
                    source={{ uri: complaint.image }} 
                    style={styles.photoImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.photoCaption}>Original complaint photo you submitted</Text>
                </View>
              )}

              {/* Technician's Completion Photo */}
              <View style={styles.photoSection}>
                <View style={styles.photoHeader}>
                  <Text style={styles.photoLabel}>✅ After (Completed Work)</Text>
                </View>
                <Image 
                  source={{ uri: complaint.completedImage }} 
                  style={styles.photoImage}
                  resizeMode="cover"
                />
                <Text style={styles.photoCaption}>Work completion photo from technician</Text>
              </View>
            </View>
          </Card>
        ) : (
          complaint.image && (
            <Card>
              <Text style={styles.sectionTitle}>Complaint Photo</Text>
              <Image 
                source={{ uri: complaint.image }} 
                style={styles.singleImage}
                resizeMode="cover"
              />
            </Card>
          )
        )}

        {complaint.completedNotes && (
          <Card>
            <Text style={styles.sectionTitle}>Technician's Notes</Text>
            <View style={styles.notesBox}>
              <Text style={styles.completedNotes}>{complaint.completedNotes}</Text>
            </View>
          </Card>
        )}

        {complaint.status === 'in-progress' && (
          <Card>
            <View style={styles.inProgressBox}>
              <ClockIcon size={40} color={colors.accent} />
              <Text style={styles.inProgressTitle}>Work In Progress</Text>
              <Text style={styles.inProgressText}>
                Your complaint is being worked on by our technician team. 
                You'll be able to see the completion photos once the work is done.
              </Text>
            </View>
          </Card>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.primary,
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  typeTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 20,
  },
  typeText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.success,
    marginBottom: 20,
    fontWeight: '500',
  },
  description: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  photosContainer: {
    gap: 30,
  },
  photoSection: {
    marginBottom: 10,
  },
  photoHeader: {
    marginBottom: 12,
  },
  photoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  photoImage: {
    width: '100%',
    height: width - 80,
    borderRadius: 12,
    backgroundColor: colors.background,
    marginBottom: 8,
  },
  photoCaption: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  singleImage: {
    width: '100%',
    height: width - 80,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  notesBox: {
    backgroundColor: colors.background,
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  completedNotes: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  inProgressBox: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.accent + '10',
    borderRadius: 12,
  },
  inProgressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  inProgressText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default UserComplaintDetailScreen;
