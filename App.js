import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from './styles/colors';
import { LoginScreen } from './screens/LoginScreen';
import { SignUpScreen } from './screens/SignUpScreen';
import { UserDashboard } from './screens/UserDashboard';
import TechnicianDashboard from './screens/TechnicianDashboard';
import { AdminDashboard } from './screens/AdminDashboard';
import { AdminTechniciansScreen } from './screens/AdminTechniciansScreen';
import AdminDepartmentsScreen from './screens/AdminDepartmentsScreen';
import ProfileScreen from './screens/ProfileScreen'; // user profile
import AdminProfileScreen from './screens/AdminProfileScreen';
import AdminProfileDetailScreen from './screens/AdminProfileDetailScreen';
import TasksScreen from './screens/TasksScreen';
import TechnicianProfileScreen from './screens/TechnicianProfileScreen';
import CompletedWorkScreen from './screens/CompletedWorkScreen';
import CompletedWorkDetailScreen from './screens/CompletedWorkDetailScreen';
import ComplaintDetailScreen from './screens/ComplaintDetailScreen';
import UserComplaintDetailScreen from './screens/UserComplaintDetailScreen';
import { FileTextIcon, UserIcon, SettingsIcon, CheckCircleIcon, LayersIcon, QRCodeIcon, UsersIcon } from './components/icons';
import SuperAdminOverviewScreen from './screens/SuperAdminOverviewScreen';
import ManageAdminsScreen from './screens/ManageAdminsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Common tab navigator screen options
const tabNavigatorScreenOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.textSecondary,
  tabBarStyle: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 8,
    height: 60,
    paddingBottom: 5,
    paddingTop: 5,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: '500',
  },
};

// Bottom tab navigator for user screens
const UserTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={tabNavigatorScreenOptions}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={UserDashboard} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <QRCodeIcon size={size} color={color} />
          ),
          tabBarLabel: 'Scan'
        }}
      />
      <Tab.Screen 
        name="Tasks" 
        component={TasksScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <FileTextIcon size={size} color={color} />
          ),
          tabBarLabel: 'My Complaints'
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <SettingsIcon size={size} color={color} />
          ),
          tabBarLabel: 'Profile'
        }}
      />
    </Tab.Navigator>
  );
};

// Bottom tab navigator for technician screens
const TechnicianTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={tabNavigatorScreenOptions}
    >
      <Tab.Screen 
        name="AssignedWork" 
        component={TechnicianDashboard} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <FileTextIcon size={size} color={color} />
          ),
          tabBarLabel: 'Assigned'
        }}
      />
      <Tab.Screen 
        name="CompletedWork" 
        component={CompletedWorkScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <CheckCircleIcon size={size} color={color} />
          ),
          tabBarLabel: 'Completed'
        }}
      />
      <Tab.Screen 
        name="TechProfile" 
        component={TechnicianProfileScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <UserIcon size={size} color={color} />
          ),
          tabBarLabel: 'Profile'
        }}
      />
    </Tab.Navigator>
  );
};

// Bottom tab navigator for admin screens
const AdminTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={tabNavigatorScreenOptions}
    >
      <Tab.Screen 
        name="Overview" 
        component={AdminDashboard} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <FileTextIcon size={size} color={color} />
          ),
          tabBarLabel: 'Overview'
        }}
      />
      <Tab.Screen 
        name="Departments" 
        component={AdminDepartmentsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <LayersIcon size={size} color={color} />
          ),
          tabBarLabel: 'Departments'
        }}
      />
      <Tab.Screen 
        name="Technicians" 
        component={AdminTechniciansScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <UsersIcon size={size} color={color} />
          ),
          tabBarLabel: 'Technicians'
        }}
      />
      <Tab.Screen 
        name="AdminProfile" 
        component={AdminProfileDetailScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <UserIcon size={size} color={color} />
          ),
          tabBarLabel: 'Profile'
        }}
      />
    </Tab.Navigator>
  );
};

// Bottom tab navigator for super admin screens
const SuperAdminTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={tabNavigatorScreenOptions}
    >
      <Tab.Screen 
        name="SAOverview" 
        component={SuperAdminOverviewScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <FileTextIcon size={size} color={color} />
          ),
          tabBarLabel: 'Overview'
        }}
      />
      <Tab.Screen 
        name="ManageAdmins" 
        component={ManageAdminsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <UsersIcon size={size} color={color} />
          ),
          tabBarLabel: 'Manage Admins'
        }}
      />
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <View style={styles.container}>
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor={colors.surface} 
          translucent={false}
        />
        
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: colors.background }
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="UserDashboard" component={UserTabNavigator} />
          <Stack.Screen name="TechnicianDashboard" component={TechnicianTabNavigator} />
          <Stack.Screen name="AdminDashboard" component={AdminTabNavigator} />
          <Stack.Screen name="SuperAdminDashboard" component={SuperAdminTabNavigator} />
          <Stack.Screen name="ComplaintDetail" component={ComplaintDetailScreen} />
          <Stack.Screen name="CompletedWorkDetail" component={CompletedWorkDetailScreen} />
          <Stack.Screen name="UserComplaintDetail" component={UserComplaintDetailScreen} />
        </Stack.Navigator>
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});