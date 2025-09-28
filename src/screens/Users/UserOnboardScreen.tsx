import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { 
  FormInput, 
  LoadingSpinner 
} from '../../components';
import { userService } from '../../services';
import { UserOnboardRequest, UsersStackParamList, FormErrors } from '../../types';
import { validateMobile } from '../../utils';

type NavigationProp = StackNavigationProp<UsersStackParamList, 'UserOnboard'>;

const UserOnboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UserOnboardRequest>({
    name: '',
    total_chits: 1,
    mobile: 0,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Mobile validation
    const mobileStr = formData.mobile.toString();
    if (!mobileStr || mobileStr === '0') {
      newErrors.mobile = 'Mobile number is required';
    } else if (!validateMobile(mobileStr)) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }

    // Total chits validation
    if (!formData.total_chits || formData.total_chits < 1) {
      newErrors.total_chits = 'Total chits must be at least 1';
    } else if (formData.total_chits > 100) {
      newErrors.total_chits = 'Total chits cannot exceed 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof UserOnboardRequest, value: string) => {
    let processedValue: any = value;

    if (field === 'mobile' || field === 'total_chits') {
      processedValue = value ? parseInt(value, 10) || 0 : 0;
    }

    setFormData(prev => ({
      ...prev,
      [field]: processedValue,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await userService.onboardUser(formData);

      if (response.success) {
        Alert.alert(
          'Success',
          'User onboarded successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        // Handle API validation errors
        if (response.error === 'Mobile number already exists') {
          setErrors({ mobile: response.message });
        } else {
          Alert.alert('Error', response.message);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to onboard user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      total_chits: 1,
      mobile: 0,
    });
    setErrors({});
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Add New User</Text>
          <Text style={styles.subtitle}>
            Enter user details to create a new chit fund account
          </Text>
        </View>

        <View style={styles.form}>
          <FormInput
            label="Full Name"
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            placeholder="Enter full name"
            error={errors.name}
            required
            autoCapitalize="words"
            autoCorrect={false}
          />

          <FormInput
            label="Mobile Number"
            value={formData.mobile === 0 ? '' : formData.mobile.toString()}
            onChangeText={(value) => handleInputChange('mobile', value)}
            placeholder="Enter 10-digit mobile number"
            error={errors.mobile}
            required
            keyboardType="phone-pad"
            maxLength={10}
          />

          <FormInput
            label="Total Chits"
            value={formData.total_chits === 0 ? '' : formData.total_chits.toString()}
            onChangeText={(value) => handleInputChange('total_chits', value)}
            placeholder="Enter number of chits"
            error={errors.total_chits}
            required
            keyboardType="numeric"
            maxLength={3}
          />

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 A chit entry will be automatically created for this user with the specified number of chits.
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.resetButton} 
            onPress={handleReset}
            disabled={loading}
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <LoadingSpinner size="small" color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>Create User</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  form: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#BBBBBB',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default UserOnboardScreen;