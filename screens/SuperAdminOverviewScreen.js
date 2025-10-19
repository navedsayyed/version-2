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
      <ScrollView style={styles.scrollContent} contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.headerTitle}>Department-wise Progress</Text>
        <Text style={styles.headerSubtitle}>All complaints across departments</Text>

      {/* Department filter (horizontal pills) */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterRowContent}>
        {KNOWN_DEPARTMENTS.map((dept) => (
          <TouchableOpacity
            key={dept}
            style={[styles.filterPill, selectedDept === dept && styles.filterPillActive]}
            onPress={() => setSelectedDept(dept)}
            activeOpacity={0.85}
          >
            <Text style={[styles.filterPillText, selectedDept === dept && styles.filterPillTextActive]}>{dept}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Floor filter (horizontal pills) */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterRowContent}>
        {KNOWN_FLOORS.map((floor) => (
          <TouchableOpacity
            key={floor}
            style={[styles.filterPill, selectedFloor === floor && styles.filterPillActive]}
            onPress={() => setSelectedFloor(floor)}
            activeOpacity={0.85}
          >
            <Text style={[styles.filterPillText, selectedFloor === floor && styles.filterPillTextActive]}>
              {floor === 'All' ? 'All Floors' : `Floor ${floor}`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {departments.length === 0 && (
        <Text style={{ color: colors.textSecondary, marginTop: 24, textAlign: 'center' }}>No data for selected department.</Text>
      )}

      {departments.map((dept) => {
        const s = byDepartment[dept];
        const completion = s.total ? Math.round((s.completed / s.total) * 100) : 0;
        return (
          <Card key={dept} style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.dept}>{dept}</Text>
              <Text style={styles.total}>{s.total} total</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${completion}%` }]} />
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.stat}>Completed: {s.completed}</Text>
              <Text style={styles.stat}>Assigned: {s.assigned}</Text>
              <Text style={styles.stat}>In-Progress: {s.inProgress}</Text>
              <Text style={styles.stat}>Rejected: {s.rejected}</Text>
            </View>

            {/* Simple bar visualization */}
            <View style={styles.barRow}>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { height: Math.max(6, (s.completed / chartMax) * 120), backgroundColor: colors.success }]} />
                <Text style={styles.barLabel}>Done</Text>
              </View>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { height: Math.max(6, (s.assigned / chartMax) * 120), backgroundColor: colors.accent }]} />
                <Text style={styles.barLabel}>Assigned</Text>
              </View>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { height: Math.max(6, (s.inProgress / chartMax) * 120), backgroundColor: colors.primary }]} />
                <Text style={styles.barLabel}>In-Progress</Text>
              </View>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { height: Math.max(6, (s.rejected / chartMax) * 120), backgroundColor: colors.error }]} />
                <Text style={styles.barLabel}>Rejected</Text>
              </View>
            </View>
          </Card>
        );
      })}
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
  loadingText: { marginTop: 12, color: colors.text },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 12 },
  card: { marginBottom: 12 },
  filterRow: { marginBottom: 12, maxHeight: 44 },
  filterRowContent: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingRight: 8 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 22, borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.surface, marginRight: 8 },
  filterPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterPillText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  filterPillTextActive: { color: colors.white },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dept: { fontSize: 16, fontWeight: '700', color: colors.text },
  total: { fontSize: 12, color: colors.textSecondary },
  progressBar: { height: 10, backgroundColor: colors.border, borderRadius: 8, marginTop: 8, overflow: 'hidden' },
  progressFill: { height: 10, backgroundColor: colors.success },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10 },
  stat: { fontSize: 12, color: colors.textSecondary },
  barRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 16, marginTop: 14 },
  barContainer: { alignItems: 'center' },
  bar: { width: 18, borderRadius: 6 },
  barLabel: { fontSize: 10, color: colors.textSecondary, marginTop: 6 },
});

export default SuperAdminOverviewScreen;
