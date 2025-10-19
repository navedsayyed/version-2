import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { colors } from '../styles/colors';
import { Card } from '../components/Card';
import { supabase } from '../config/supabaseClient';
import { getDepartmentFromFloor, floorToDepartment } from '../utils/departmentMapping';

// Simple departments list; consider deriving distinct departments from DB later
const KNOWN_DEPARTMENTS = ['All', 'Civil', 'Electrical', 'Mechanical', 'IT', 'Housekeeping', 'First Year'];
const KNOWN_FLOORS = ['All', ...Object.keys(floorToDepartment)];

const SuperAdminOverviewScreen = () => {
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedFloor, setSelectedFloor] = useState('All');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('complaints')
          .select('id, department, floor, status');
        if (error) throw error;
        setComplaints(data || []);
      } catch (e) {
        console.error('Failed to load complaints for super admin:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filter by selected department and floor (using mapping for floor → department if needed)
  const filteredComplaints = useMemo(() => {
    const mappedDeptForFloor = selectedFloor === 'All' ? null : getDepartmentFromFloor(selectedFloor);
    return complaints.filter((c) => {
      const deptOk = selectedDept === 'All' || c.department === selectedDept;
      const floorOk = selectedFloor === 'All' || c.floor === selectedFloor || (mappedDeptForFloor && c.department === mappedDeptForFloor);
      return deptOk && floorOk;
    });
  }, [complaints, selectedDept, selectedFloor]);

  // Calculate overall stats
  const overallStats = useMemo(() => {
    const stats = { total: 0, completed: 0, inProgress: 0, assigned: 0, rejected: 0 };
    filteredComplaints.forEach(c => {
      stats.total += 1;
      if (c.status === 'completed') stats.completed += 1;
      else if (c.status === 'assigned') stats.assigned += 1;
      else if (c.status === 'rejected') stats.rejected += 1;
      else stats.inProgress += 1;
    });
    return stats;
  }, [filteredComplaints]);

  const byDepartment = useMemo(() => {
    const base = {};
    KNOWN_DEPARTMENTS.filter(d => d !== 'All').forEach(d => base[d] = { total: 0, completed: 0, inProgress: 0, assigned: 0, rejected: 0 });
    for (const c of filteredComplaints) {
      const dept = c.department || 'Unassigned';
      if (!base[dept]) base[dept] = { total: 0, completed: 0, inProgress: 0, assigned: 0, rejected: 0 };
      base[dept].total += 1;
      if (c.status === 'completed') base[dept].completed += 1;
      else if (c.status === 'assigned') base[dept].assigned += 1;
      else if (c.status === 'rejected') base[dept].rejected += 1;
      else base[dept].inProgress += 1;
    }
    return base;
  }, [filteredComplaints]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading overview...</Text>
      </SafeAreaView>
    );
  }

  const departments = selectedDept === 'All'
    ? Object.keys(byDepartment)
    : byDepartment[selectedDept] ? [selectedDept] : [];
  const chartMax = Math.max(1, ...departments.map(d => byDepartment[d].total));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContent} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Super Admin Overview</Text>
          <Text style={styles.headerSubtitle}>Monitor all departments and floors</Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{overallStats.total}</Text>
            <Text style={styles.summaryLabel} numberOfLines={1}>Total</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.successLight || '#e8f5e9' }]}>
            <Text style={[styles.summaryValue, { color: colors.success }]}>{overallStats.completed}</Text>
            <Text style={styles.summaryLabel} numberOfLines={1}>Done</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.primaryLight || '#e3f2fd' }]}>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>{overallStats.inProgress}</Text>
            <Text style={styles.summaryLabel} numberOfLines={1}>Active</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.accentLight || '#fff3e0' }]}>
            <Text style={[styles.summaryValue, { color: colors.accent }]}>{overallStats.assigned}</Text>
            <Text style={styles.summaryLabel} numberOfLines={1}>Assigned</Text>
          </View>
        </View>

        {/* Filters Section */}
        <View style={styles.filtersSection}>
          <Text style={styles.filterSectionTitle}>Filter by Department</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {KNOWN_DEPARTMENTS.map((dept) => (
              <TouchableOpacity
                key={dept}
                style={[styles.filterPill, selectedDept === dept && styles.filterPillActive]}
                onPress={() => setSelectedDept(dept)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterPillText, selectedDept === dept && styles.filterPillTextActive]}>{dept}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.filterSectionTitle, { marginTop: 16 }]}>Filter by Floor</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {KNOWN_FLOORS.map((floor) => (
              <TouchableOpacity
                key={floor}
                style={[styles.filterPill, selectedFloor === floor && styles.filterPillActive]}
                onPress={() => setSelectedFloor(floor)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterPillText, selectedFloor === floor && styles.filterPillTextActive]}>
                  {floor === 'All' ? 'All Floors' : `Floor ${floor}`}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Department Cards */}
        <View style={styles.departmentSection}>
          <Text style={styles.sectionTitle}>Department-wise Breakdown</Text>
          {departments.length === 0 && (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No data available for selected filters</Text>
            </Card>
          )}

          {departments.map((dept) => {
            const s = byDepartment[dept];
            const completion = s.total ? Math.round((s.completed / s.total) * 100) : 0;
            return (
              <Card key={dept} style={styles.deptCard}>
                {/* Department Header */}
                <View style={styles.deptHeader}>
                  <View>
                    <Text style={styles.deptName}>{dept}</Text>
                    <Text style={styles.deptSubtext}>{s.total} total complaints</Text>
                  </View>
                  <View style={styles.completionBadge}>
                    <Text style={styles.completionText}>{completion}%</Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${completion}%` }]} />
                  </View>
                  <Text style={styles.progressLabel}>Completion Rate</Text>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <View style={[styles.statIndicator, { backgroundColor: colors.success }]} />
                    <View>
                      <Text style={styles.statValue}>{s.completed}</Text>
                      <Text style={styles.statLabel}>Completed</Text>
                    </View>
                  </View>
                  <View style={styles.statBox}>
                    <View style={[styles.statIndicator, { backgroundColor: colors.accent }]} />
                    <View>
                      <Text style={styles.statValue}>{s.assigned}</Text>
                      <Text style={styles.statLabel}>Assigned</Text>
                    </View>
                  </View>
                  <View style={styles.statBox}>
                    <View style={[styles.statIndicator, { backgroundColor: colors.primary }]} />
                    <View>
                      <Text style={styles.statValue}>{s.inProgress}</Text>
                      <Text style={styles.statLabel}>In Progress</Text>
                    </View>
                  </View>
                  <View style={styles.statBox}>
                    <View style={[styles.statIndicator, { backgroundColor: colors.error }]} />
                    <View>
                      <Text style={styles.statValue}>{s.rejected}</Text>
                      <Text style={styles.statLabel}>Rejected</Text>
                    </View>
                  </View>
                </View>

                {/* Bar Chart */}
                <View style={styles.chartContainer}>
                  <View style={styles.barRow}>
                    <View style={styles.barContainer}>
                      <View style={[styles.bar, { height: Math.max(8, (s.completed / chartMax) * 100), backgroundColor: colors.success }]} />
                      <Text style={styles.barLabel}>Done</Text>
                    </View>
                    <View style={styles.barContainer}>
                      <View style={[styles.bar, { height: Math.max(8, (s.assigned / chartMax) * 100), backgroundColor: colors.accent }]} />
                      <Text style={styles.barLabel}>Assigned</Text>
                    </View>
                    <View style={styles.barContainer}>
                      <View style={[styles.bar, { height: Math.max(8, (s.inProgress / chartMax) * 100), backgroundColor: colors.primary }]} />
                      <Text style={styles.barLabel}>Progress</Text>
                    </View>
                    <View style={styles.barContainer}>
                      <View style={[styles.bar, { height: Math.max(8, (s.rejected / chartMax) * 100), backgroundColor: colors.error }]} />
                      <Text style={styles.barLabel}>Rejected</Text>
                    </View>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  scrollContent: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: colors.text, fontSize: 16 },
  
  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: '700', 
    color: colors.text, 
    marginBottom: 4 
  },
  headerSubtitle: { 
    fontSize: 15, 
    color: colors.textSecondary,
    fontWeight: '500'
  },

  // Summary Cards
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 20,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 90,
  },
  summaryValue: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
  },

  // Filters
  filtersSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterRow: { 
    marginBottom: 8,
  },
  filterPill: { 
    paddingHorizontal: 18, 
    paddingVertical: 10, 
    borderRadius: 20, 
    backgroundColor: colors.background,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  filterPillActive: { 
    backgroundColor: colors.primary, 
    borderColor: colors.primary,
    elevation: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  filterPillText: { 
    fontSize: 14, 
    color: colors.textSecondary, 
    fontWeight: '600' 
  },
  filterPillTextActive: { 
    color: colors.white,
    fontWeight: '700'
  },

  // Department Section
  departmentSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    paddingLeft: 4,
  },
  
  // Department Cards
  deptCard: {
    marginBottom: 20,
    padding: 18,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  deptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  deptName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  deptSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  completionBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  completionText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },

  // Progress Bar
  progressBarContainer: {
    marginBottom: 20,
  },
  progressBar: { 
    height: 12, 
    backgroundColor: colors.border, 
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: { 
    height: 12, 
    backgroundColor: colors.success,
    borderRadius: 10,
  },
  progressLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  statIndicator: {
    width: 4,
    height: 36,
    borderRadius: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  // Chart
  chartContainer: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  barRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    justifyContent: 'space-around',
    gap: 12,
  },
  barContainer: { 
    alignItems: 'center',
    flex: 1,
  },
  bar: { 
    width: '100%',
    maxWidth: 40,
    borderRadius: 8,
    minHeight: 8,
  },
  barLabel: { 
    fontSize: 11, 
    color: colors.textSecondary, 
    marginTop: 8,
    fontWeight: '600',
  },

  // Empty State
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default SuperAdminOverviewScreen;
