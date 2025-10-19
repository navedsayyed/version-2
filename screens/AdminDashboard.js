import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, Platform, StatusBar } from 'react-native';
import { colors } from '../styles/colors';
import { Card } from '../components/Card';
import { BellIcon, FileTextIcon, CheckCircleIcon, ClockIcon, UsersIcon, LayersIcon } from '../components/icons';
import { getCurrentUser, getUserProfile, supabase } from '../config/supabaseClient';

export const AdminDashboard = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [hodProfile, setHodProfile] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [complaintFilter, setComplaintFilter] = useState('department'); // 'department' or 'technicians'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', or 'completed'
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { user } = await getCurrentUser();
      if (!user) {
        Alert.alert('Error', 'Unable to load user data');
        return;
      }

      const { data: profileData } = await getUserProfile(user.id);
      if (profileData) {
        setHodProfile({
          id: user.id,
          name: profileData.full_name || 'HOD',
          department: profileData.department || 'General',
          email: user.email,
        });
        
        await loadComplaints(profileData.department);
        await loadTechnicians(profileData.department);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadComplaints = async (department) => {
    try {
      // Get all complaints
      const { data: allComplaints, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Import the complaint type to department mapping
      const { getDepartmentForComplaintType } = await import('../utils/departmentMapping');

      // Filter complaints for this department (same logic for all admins)
      const filteredComplaints = (allComplaints || []).filter(complaint => {
        // Check if complaint has explicit department assignment (from QR code)
        if (complaint.department === department) {
          return true;
        }
        
        // Check if complaint type maps to this department (type-based routing)
        const mappedDept = getDepartmentForComplaintType(complaint.type);
        if (mappedDept === department) {
          return true;
        }
        
        return false;
      });

      setComplaints(filteredComplaints);
    } catch (error) {
      console.error('Error loading complaints:', error);
    }
  };

  const loadTechnicians = async (department) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'technician')
        .eq('department', department);

      if (error) throw error;
      
      // Get work stats for each technician
      const techsWithStats = await Promise.all((data || []).map(async (tech) => {
        const { data: assigned } = await supabase
          .from('complaints')
          .select('id')
          .eq('assigned_to', tech.id)
          .eq('status', 'in-progress');
        
        const { data: completed } = await supabase
          .from('complaints')
          .select('id')
          .eq('assigned_to', tech.id)
          .eq('status', 'completed');

        return {
          ...tech,
          assignedWork: assigned?.length || 0,
          completedWork: completed?.length || 0
        };
      }));
      
      setTechnicians(techsWithStats);
    } catch (error) {
      console.error('Error loading technicians:', error);
    }
  };

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'in-progress').length,
    completed: complaints.filter(c => c.status === 'completed').length,
    unassigned: complaints.filter(c => c.status === 'in-progress' && !c.assigned_to).length
  };

  // Calculate floor-wise statistics
  const floorStats = complaints.reduce((acc, complaint) => {
    const floor = complaint.floor || 'Unknown';
    if (!acc[floor]) {
      acc[floor] = { total: 0, pending: 0, completed: 0 };
    }
    acc[floor].total++;
    if (complaint.status === 'completed') acc[floor].completed++;
    else acc[floor].pending++;
    return acc;
  }, {});

  // Calculate department completion rate
  const departmentCompletionRate = stats.total > 0 
    ? ((stats.completed / stats.total) * 100).toFixed(1) 
    : 0;

  // Filter complaints based on selected filters
  const getFilteredComplaints = () => {
    const { getDepartmentForComplaintType } = require('../utils/departmentMapping');
    let filtered = [...complaints];

    console.log('=== FILTERING DEBUG ===');
    console.log('Total complaints loaded:', complaints.length);
    console.log('Current filter:', complaintFilter);
    console.log('HOD Department:', hodProfile?.department);

    // DEPARTMENT TAB: Show ONLY floor-based complaints (from QR codes)
    // MY TECHNICIANS TAB: Show ONLY type-based complaints (complaint type matches department)
    if (complaintFilter === 'department') {
      // Show complaints where department field matches (floor-based routing)
      filtered = filtered.filter(c => {
        const matches = c.department === hodProfile?.department;
        console.log(`Complaint ${c.id}: department="${c.department}", type="${c.type}", matches=${matches}`);
        return matches;
      });
      console.log('Department tab filtered count:', filtered.length);
    } else if (complaintFilter === 'technicians') {
      // Show complaints where complaint type maps to this department (type-based routing)
      filtered = filtered.filter(c => {
        const mappedDept = getDepartmentForComplaintType(c.type);
        const matches = mappedDept === hodProfile?.department;
        console.log(`Complaint ${c.id}: type="${c.type}" → "${mappedDept}", matches=${matches}`);
        return matches;
      });
      console.log('My Technicians tab filtered count:', filtered.length);
    }

    // Filter by status
    if (statusFilter === 'pending') {
      filtered = filtered.filter(c => c.status === 'in-progress');
    } else if (statusFilter === 'completed') {
      filtered = filtered.filter(c => c.status === 'completed');
    }

    return filtered;
  };

  const filteredComplaints = getFilteredComplaints();

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>HOD Dashboard</Text>
          <Text style={styles.headerSubtitle}>{hodProfile?.department} Department</Text>
        </View>
        <BellIcon size={24} color={colors.text} />
      </View>

      <View style={styles.tabContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          {['overview', 'complaints'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.tabContent}>
          {activeTab === 'overview' && (
            <View>
              {/* Department Statistics */}
              <View style={styles.statsGrid}>
                <Card style={styles.statCard}>
                  <View style={[styles.iconCircle, { backgroundColor: 'rgba(0, 191, 255, 0.2)' }]}>
                    <FileTextIcon size={20} color="#00BFFF" />
                  </View>
                  <Text style={styles.statNumber}>{stats.total}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </Card>

                <Card style={styles.statCard}>
                  <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 165, 0, 0.2)' }]}>
                    <ClockIcon size={20} color="#FFA500" />
                  </View>
                  <Text style={styles.statNumber}>{stats.pending}</Text>
                  <Text style={styles.statLabel}>Pending</Text>
                </Card>

                <Card style={styles.statCard}>
                  <View style={[styles.iconCircle, { backgroundColor: 'rgba(76, 175, 80, 0.2)' }]}>
                    <CheckCircleIcon size={20} color={colors.success} />
                  </View>
                  <Text style={styles.statNumber}>{stats.completed}</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </Card>

                <Card style={styles.statCard}>
                  <View style={[styles.iconCircle, { backgroundColor: 'rgba(244, 67, 54, 0.2)' }]}>
                    <UsersIcon size={20} color={colors.error} />
                  </View>
                  <Text style={styles.statNumber}>{stats.unassigned}</Text>
                  <Text style={styles.statLabel}>Unassigned</Text>
                </Card>
              </View>

              {/* Department Performance */}
              <Card style={styles.performanceCard}>
                <Text style={styles.sectionTitle}>Department Performance</Text>
                <View style={styles.performanceBox}>
                  <View style={styles.performanceRow}>
                    <Text style={styles.performanceLabel}>Completion Rate</Text>
                    <Text style={[styles.performanceValue, { color: colors.success }]}>
                      {departmentCompletionRate}%
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${departmentCompletionRate}%` }]} />
                  </View>
                  <View style={styles.performanceDetails}>
                    <Text style={styles.performanceDetail}>
                      ✓ Completed: {stats.completed}
                    </Text>
                    <Text style={styles.performanceDetail}>
                      ⏱ Pending: {stats.pending}
                    </Text>
                  </View>
                </View>
              </Card>

              {/* Technician Performance */}
              <Card style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <UsersIcon size={24} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Technician Performance</Text>
                </View>
                
                {technicians.length > 0 ? (
                  technicians.map((tech) => {
                    const total = tech.assignedWork + tech.completedWork;
                    const completionRate = total > 0 ? ((tech.completedWork / total) * 100).toFixed(1) : 0;
                    
                    return (
                      <View key={tech.id} style={styles.techPerformanceItem}>
                        <View style={styles.techPerformanceHeader}>
                          <View>
                            <Text style={styles.techPerformanceName}>{tech.full_name}</Text>
                            <Text style={styles.techPerformanceContact}>{tech.phone}</Text>
                          </View>
                          <View style={styles.techPerformanceRateBox}>
                            <Text style={styles.techPerformanceRate}>{completionRate}%</Text>
                            <Text style={styles.techPerformanceRateLabel}>Done</Text>
                          </View>
                        </View>
                        
                        <View style={styles.progressBar}>
                          <View style={[styles.progressFill, { width: `${completionRate}%` }]} />
                        </View>
                        
                        <View style={styles.techPerformanceStats}>
                          <View style={styles.techStatItem}>
                            <Text style={styles.techStatNumber}>{tech.assignedWork}</Text>
                            <Text style={styles.techStatLabel}>Assigned</Text>
                          </View>
                          <View style={styles.techStatItem}>
                            <Text style={[styles.techStatNumber, { color: colors.success }]}>
                              {tech.completedWork}
                            </Text>
                            <Text style={styles.techStatLabel}>Completed</Text>
                          </View>
                          <View style={styles.techStatItem}>
                            <Text style={[styles.techStatNumber, { color: colors.primary }]}>
                              {total}
                            </Text>
                            <Text style={styles.techStatLabel}>Total</Text>
                          </View>
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <View style={styles.emptyState}>
                    <UsersIcon size={48} color={colors.textSecondary} />
                    <Text style={styles.emptyText}>No technicians assigned yet</Text>
                  </View>
                )}
              </Card>

              {/* Floor-wise Reports */}
              <Card style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <LayersIcon size={24} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Floor-wise Reports</Text>
                </View>
                
                {Object.entries(floorStats).length > 0 ? (
                  Object.entries(floorStats).map(([floor, data]) => (
                    <View key={floor} style={styles.floorItem}>
                      <View style={styles.floorHeader}>
                        <View style={styles.floorTitleRow}>
                          <View style={styles.floorIconCircle}>
                            <Text style={styles.floorNumber}>{floor}</Text>
                          </View>
                          <Text style={styles.floorTitle}>Floor {floor}</Text>
                        </View>
                        <Text style={styles.floorTotal}>Total: {data.total}</Text>
                      </View>
                      
                      <View style={styles.floorStatsRow}>
                        <View style={styles.floorStat}>
                          <View style={[styles.floorDot, { backgroundColor: '#FFA500' }]} />
                          <Text style={styles.floorStatText}>Pending: {data.pending}</Text>
                        </View>
                        <View style={styles.floorStat}>
                          <View style={[styles.floorDot, { backgroundColor: colors.success }]} />
                          <Text style={styles.floorStatText}>Completed: {data.completed}</Text>
                        </View>
                      </View>
                      
                      <View style={styles.floorProgressBar}>
                        <View 
                          style={[
                            styles.floorProgressFill, 
                            { 
                              width: `${data.total > 0 ? (data.completed / data.total * 100) : 0}%`,
                              backgroundColor: colors.success 
                            }
                          ]} 
                        />
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <LayersIcon size={48} color={colors.textSecondary} />
                    <Text style={styles.emptyText}>No floor data available</Text>
                  </View>
                )}
              </Card>

              {/* Recent Complaints Preview */}
              <Card style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Recent Complaints</Text>
                {complaints.slice(0, 5).map((complaint) => (
                  <View key={complaint.id} style={styles.complaintItem}>
                    <Text style={styles.complaintTitle}>{complaint.title}</Text>
                    <Text style={styles.complaintLocation}>{complaint.location}</Text>
                    <View style={[styles.statusBadge, { 
                      backgroundColor: complaint.status === 'completed' ? colors.success : '#FFA500'
                    }]}>
                      <Text style={styles.statusText}>
                        {complaint.status === 'completed' ? 'Completed' : 'Pending'}
                      </Text>
                    </View>
                  </View>
                ))}
              </Card>
            </View>
          )}

          {activeTab === 'complaints' && (
            <View>
              {/* Filter Buttons Row 1: Department vs Technicians */}
              <View style={styles.filterRow}>
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    complaintFilter === 'department' && styles.filterButtonActive
                  ]}
                  onPress={() => setComplaintFilter('department')}
                >
                  <LayersIcon 
                    size={16} 
                    color={complaintFilter === 'department' ? colors.white : colors.textSecondary} 
                  />
                  <Text style={[
                    styles.filterButtonText,
                    complaintFilter === 'department' && styles.filterButtonTextActive
                  ]}>
                    Department
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    complaintFilter === 'technicians' && styles.filterButtonActive
                  ]}
                  onPress={() => setComplaintFilter('technicians')}
                >
                  <UsersIcon 
                    size={16} 
                    color={complaintFilter === 'technicians' ? colors.white : colors.textSecondary} 
                  />
                  <Text style={[
                    styles.filterButtonText,
                    complaintFilter === 'technicians' && styles.filterButtonTextActive
                  ]}>
                    My Technicians
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Status Filter Dropdown */}
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowStatusDropdown(!showStatusDropdown)}
              >
                <View style={styles.dropdownButtonContent}>
                  {statusFilter === 'all' && <FileTextIcon size={18} color={colors.primary} />}
                  {statusFilter === 'pending' && <ClockIcon size={18} color="#FFA500" />}
                  {statusFilter === 'completed' && <CheckCircleIcon size={18} color={colors.success} />}
                  <Text style={styles.dropdownButtonText}>
                    {statusFilter === 'all' ? 'All Complaints' : 
                     statusFilter === 'pending' ? 'Pending' : 'Completed'}
                  </Text>
                </View>
                <Text style={styles.dropdownArrow}>{showStatusDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {/* Dropdown Menu */}
              {showStatusDropdown && (
                <View style={styles.dropdownMenu}>
                  <TouchableOpacity
                    style={[styles.dropdownItem, statusFilter === 'all' && styles.dropdownItemActive]}
                    onPress={() => {
                      setStatusFilter('all');
                      setShowStatusDropdown(false);
                    }}
                  >
                    <FileTextIcon size={18} color={statusFilter === 'all' ? colors.primary : colors.textSecondary} />
                    <Text style={[styles.dropdownItemText, statusFilter === 'all' && styles.dropdownItemTextActive]}>
                      All Complaints
                    </Text>
                    {statusFilter === 'all' && <CheckCircleIcon size={18} color={colors.primary} />}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.dropdownItem, statusFilter === 'pending' && styles.dropdownItemActive]}
                    onPress={() => {
                      setStatusFilter('pending');
                      setShowStatusDropdown(false);
                    }}
                  >
                    <ClockIcon size={18} color={statusFilter === 'pending' ? '#FFA500' : colors.textSecondary} />
                    <Text style={[styles.dropdownItemText, statusFilter === 'pending' && styles.dropdownItemTextActive]}>
                      Pending
                    </Text>
                    {statusFilter === 'pending' && <CheckCircleIcon size={18} color={colors.primary} />}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.dropdownItem, statusFilter === 'completed' && styles.dropdownItemActive]}
                    onPress={() => {
                      setStatusFilter('completed');
                      setShowStatusDropdown(false);
                    }}
                  >
                    <CheckCircleIcon size={18} color={statusFilter === 'completed' ? colors.success : colors.textSecondary} />
                    <Text style={[styles.dropdownItemText, statusFilter === 'completed' && styles.dropdownItemTextActive]}>
                      Completed
                    </Text>
                    {statusFilter === 'completed' && <CheckCircleIcon size={18} color={colors.primary} />}
                  </TouchableOpacity>
                </View>
              )}

              {/* Filter Results Summary */}
              <View style={styles.filterSummary}>
                <Text style={styles.filterSummaryText}>
                  Showing {filteredComplaints.length} {statusFilter === 'all' ? '' : statusFilter} complaint(s) 
                  {complaintFilter === 'technicians' ? ' assigned to your technicians' : ' in your department'}
                </Text>
              </View>

              {/* Filtered Complaints List */}
              {filteredComplaints.length > 0 ? (
                filteredComplaints.map((complaint) => {
                  const assignedTech = technicians.find(t => t.id === complaint.assigned_to);
                  return (
                    <Card key={complaint.id} style={styles.complaintCard}>
                      <View style={styles.complaintHeader}>
                        <Text style={styles.complaintCardTitle}>{complaint.title}</Text>
                        <View style={[styles.statusBadge, { 
                          backgroundColor: complaint.status === 'completed' ? colors.success : '#FFA500'
                        }]}>
                          <Text style={styles.statusText}>
                            {complaint.status === 'completed' ? 'Completed' : 'Pending'}
                          </Text>
                        </View>
                      </View>
                      
                      <Text style={styles.complaintDescription}>{complaint.description}</Text>
                      
                      <Text style={styles.complaintLocation}>
                        📍 {complaint.location} • Floor {complaint.floor || 'N/A'}
                      </Text>
                      
                      {assignedTech && (
                        <Text style={styles.complaintTech}>
                          👤 Assigned to: {assignedTech.full_name}
                        </Text>
                      )}
                      
                      {!assignedTech && complaint.status === 'in-progress' && (
                        <Text style={[styles.complaintTech, { color: colors.error }]}>
                          ⚠️ Not assigned yet
                        </Text>
                      )}
                    </Card>
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <FileTextIcon size={48} color={colors.textSecondary} />
                  <Text style={styles.emptyText}>
                    No {statusFilter === 'all' ? '' : statusFilter} complaints found
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  tabContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.primary,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  sectionCard: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  complaintItem: {
    backgroundColor: 'rgba(100, 100, 100, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  complaintTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  complaintLocation: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: 'bold',
  },
  complaintCard: {
    padding: 16,
    marginBottom: 16,
  },
  complaintCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  complaintDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  techCard: {
    padding: 16,
    marginBottom: 16,
  },
  techName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  techContact: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  techEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  performanceCard: {
    padding: 16,
    marginBottom: 16,
  },
  performanceBox: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  performanceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  performanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 10,
    backgroundColor: colors.border,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 5,
  },
  performanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  performanceDetail: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  techPerformanceItem: {
    backgroundColor: 'rgba(100, 100, 100, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  techPerformanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  techPerformanceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  techPerformanceContact: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  techPerformanceRateBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  techPerformanceRate: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.success,
  },
  techPerformanceRateLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  techPerformanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  techStatItem: {
    alignItems: 'center',
  },
  techStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  techStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  floorItem: {
    backgroundColor: 'rgba(100, 100, 100, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  floorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  floorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  floorIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  floorNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  floorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  floorTotal: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  floorStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  floorStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  floorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  floorStatText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  floorProgressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  floorProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.border,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  statusFilterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: colors.border,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusFilterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusFilterText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  statusFilterTextActive: {
    color: colors.white,
  },
  filterSummary: {
    backgroundColor: 'rgba(0, 191, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  filterSummaryText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  complaintTech: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  dropdownButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dropdownButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  dropdownArrow: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  dropdownMenu: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(0, 191, 255, 0.1)',
  },
  dropdownItemText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  dropdownItemTextActive: {
    fontWeight: '600',
    color: colors.primary,
  },
});