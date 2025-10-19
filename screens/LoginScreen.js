import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Alert, 
  Modal, 
  TouchableOpacity, 
  ActivityIndicator, 
  Platform,
  Keyboard,
  Animated
} from 'react-native';
import { colors } from '../styles/colors';
import { CustomButton } from '../components/CustomButton';
import { Card } from '../components/Card';
import { SettingsIcon, UserIcon, UsersIcon } from '../components/icons';
import { signIn, getUserProfile } from '../config/supabaseClient';

export const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const cardTranslateY = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(1)).current;

  const animateCardUp = () => {
    Animated.parallel([
      Animated.timing(cardTranslateY, {
        toValue: -140,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateCardDown = () => {
    Animated.parallel([
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      animateCardDown
    );

    return () => {
      keyboardWillHide.remove();
    };
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        Alert.alert('Login Failed', error.message || 'Invalid credentials');
        setLoading(false);
        return;
      }

      if (!data.user) {
        Alert.alert('Error', 'No user data returned');
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await getUserProfile(data.user.id);
      
      console.log('User ID:', data.user.id);
      console.log('Profile data:', profile);
      console.log('Profile error:', profileError);
      
      if (profileError || !profile) {
        console.log('No profile found, showing role selection');
        setShowRoleSelection(true);
        setLoading(false);
        return;
      }

      console.log('User role from database:', profile.role);
      console.log('Role type:', typeof profile.role);
      console.log('Navigating to dashboard for role:', profile.role);
      
      setLoading(false);
      navigateByRole(profile.role);
    } catch (err) {
      console.error('Login error:', err);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const navigateByRole = (role) => {
    console.log('navigateByRole called with:', role);
    
    const cleanRole = role?.trim().toLowerCase();
    console.log('Cleaned role:', cleanRole);
    
    switch (cleanRole) {
      case 'user':
        console.log('Navigating to UserDashboard');
        navigation.replace('UserDashboard');
        break;
      case 'technician':
        console.log('Navigating to TechnicianDashboard');
        navigation.replace('TechnicianDashboard');
        break;
      case 'admin':
        console.log('Navigating to AdminDashboard');
        navigation.replace('AdminDashboard');
        break;
      case 'super_admin':
      case 'super-admin':
      case 'superadmin':
        console.log('Navigating to SuperAdminDashboard');
        navigation.replace('SuperAdminDashboard');
        break;
      default:
        console.log('Unknown role, showing alert');
        Alert.alert('Error', `Invalid user role: "${role}"`);
        break;
    }
  };

  const selectRole = (role) => {
    setShowRoleSelection(false);
    navigateByRole(role);
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginContainer}>
        <Animated.View 
          style={[
            styles.logoContainer,
            { opacity: logoOpacity }
          ]}
        >
          {/* <SettingsIcon size={60} color="#00BFFF" /> */}
          <Text style={styles.logoText}>Version-1</Text>
          <Text style={styles.logoSubtext}>Efficient Complaint Management</Text>
        </Animated.View>

        <Animated.View
          style={{
            transform: [{ translateY: cardTranslateY }]
          }}
        >
          <Card>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                onFocus={animateCardUp}
                placeholder="Enter your email"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={animateCardUp}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Signing in...</Text>
              </View>
            ) : (
              <CustomButton
                title="Sign In"
                onPress={handleLogin}
                size="large"
                icon={UserIcon}
              />
            )}

            <TouchableOpacity 
              style={styles.signUpLink}
              onPress={() => navigation.navigate('SignUp')}
            >
              <Text style={styles.signUpLinkText}>
                Don't have an account? <Text style={styles.signUpLinkBold}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </Card>
        </Animated.View>
      </View>

      <Modal visible={showRoleSelection} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Your Role</Text>
            <Text style={styles.modalSubtitle}>Choose how you want to access the app</Text>

            <View style={styles.roleContainer}>
              <TouchableOpacity 
                style={styles.roleCard} 
                onPress={() => selectRole('user')}
                activeOpacity={0.8}
              >
                <UserIcon size={40} color={colors.primary} />
                <Text style={styles.roleTitle}>User</Text>
                <Text style={styles.roleDescription}>Submit and track complaints</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.roleCard} 
                onPress={() => selectRole('technician')}
                activeOpacity={0.8}
              >
                <SettingsIcon size={40} color={colors.secondary} />
                <Text style={styles.roleTitle}>Technician</Text>
                <Text style={styles.roleDescription}>Solve assigned complaints</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.roleCard} 
                onPress={() => selectRole('admin')}
                activeOpacity={0.8}
              >
                <UsersIcon size={40} color={colors.accent} />
                <Text style={styles.roleTitle}>Admin</Text>
                <Text style={styles.roleDescription}>Manage all complaints</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loginContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
  },
  logoSubtext: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    color: colors.text,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 16,
  },
  eyeIconText: {
    fontSize: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  roleContainer: {
    gap: 16,
  },
  roleCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
  },
  signUpLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  signUpLinkText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  signUpLinkBold: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});