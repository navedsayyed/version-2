import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { colors } from '../styles/colors';
import { Card } from '../components/Card';
import { MapPinIcon, CalendarIcon, UserIcon, CheckCircleIcon } from '../components/icons';

const { width } = Dimensions.get('window');

const CompletedWorkDetailScreen = ({ route, navigation }) => {
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
        <Text style={styles.headerTitle}>Completed Work Details</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{complaint.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: colors.success }]}>
              <CheckCircleIcon size={16} color="#fff" />
              <Text style={styles.statusText}>Completed</Text>
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
                <Text style={styles.infoLabel}>Completed Date</Text>
                <Text style={styles.infoText}>{complaint.completedAt || complaint.date}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <UserIcon size={20} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Reported By</Text>
                <Text style={styles.infoText}>{complaint.userId}</Text>
              </View>
            </View>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{complaint.description}</Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Before & After Photos</Text>
          <Text style={styles.sectionSubtitle}>Compare the original issue with the completed work</Text>
          
          <View style={styles.photosContainer}>
            {/* User's Original Photo */}
            <View style={styles.photoSection}>
              <View style={styles.photoHeader}>
                <Text style={styles.photoLabel}>📷 Before (User's Photo)</Text>
              </View>
              <Image 
                source={{ uri: complaint.image }} 
                style={styles.photoImage}
                resizeMode="cover"
              />
              <Text style={styles.photoCaption}>Original complaint photo submitted by user</Text>
            </View>

            {/* Technician's Completion Photo */}
            {complaint.completedImage && (
              <View style={styles.photoSection}>
                <View style={styles.photoHeader}>
                  <Text style={styles.photoLabel}>✅ After (Technician's Photo)</Text>
                </View>
                <Image 
                  source={{ uri: complaint.completedImage }} 
                  style={styles.photoImage}
                  resizeMode="cover"
                />
                <Text style={styles.photoCaption}>Work completion photo submitted by technician</Text>
              </View>
            )}
          </View>
        </Card>

        {complaint.completedDescription && (
          <Card>
            <Text style={styles.sectionTitle}>Work Completion Notes</Text>
            <Text style={styles.completedNotes}>{complaint.completedDescription}</Text>
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
    color: colors.textSecondary,
    marginBottom: 20,
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
  completedNotes: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    fontStyle: 'italic',
  },
});

export default CompletedWorkDetailScreen;
