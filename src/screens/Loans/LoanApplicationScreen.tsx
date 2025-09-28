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
import { Ionicons } from '@expo/vector-icons';
import { 
  FormInput, 
  LoadingSpinner 
} from '../../components';
import { loanService } from '../../services';
import { LoanApplicationRequest, FormErrors, Loan } from '../../types';
import { formatCurrency, formatDate } from '../../utils';

const LoanApplicationScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<LoanApplicationRequest>({
    user_id: '',
    interest_rate: '',
    interest_type: '',
    borrowed_amount: 0,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [applicationResult, setApplicationResult] = useState<Loan | null>(null);

  const interestTypes = [
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' },
    { label: 'Quarterly', value: 'quarterly' },
    { label: 'Half-yearly', value: 'half-yearly' },
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // User ID validation
    if (!formData.user_id.trim()) {
      newErrors.user_id = 'User ID is required';
    }

    // Interest rate validation
    if (!formData.interest_rate.trim()) {
      newErrors.interest_rate = 'Interest rate is required';
    } else {
      const rate = parseFloat(formData.interest_rate);
      if (isNaN(rate) || rate <= 0) {
        newErrors.interest_rate = 'Interest rate must be a positive number';
      } else if (rate > 50) {
        newErrors.interest_rate = 'Interest rate cannot exceed 50%';
      }
    }

    // Interest type validation
    if (!formData.interest_type.trim()) {
      newErrors.interest_type = 'Interest type is required';
    }

    // Borrowed amount validation
    if (!formData.borrowed_amount || formData.borrowed_amount <= 0) {
      newErrors.borrowed_amount = 'Borrowed amount must be greater than 0';
    } else if (formData.borrowed_amount > 10000000) {
      newErrors.borrowed_amount = 'Borrowed amount cannot exceed ₹1,00,00,000';
    } else if (formData.borrowed_amount < 1000) {
      newErrors.borrowed_amount = 'Minimum loan amount is ₹1,000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof LoanApplicationRequest, value: string) => {
    let processedValue: any = value;

    if (field === 'borrowed_amount') {
      processedValue = value ? parseFloat(value) || 0 : 0;
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

  const handleInterestTypeSelect = (type: string) => {
    handleInputChange('interest_type', type);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await loanService.applyForLoan(formData);

      if (response.success && response.data) {
        setApplicationResult(response.data);
        Alert.alert(
          'Loan Application Successful',
          `Loan application for ${formatCurrency(formData.borrowed_amount)} has been created successfully!`,
          [
            {
              text: 'Create Another Application',
              onPress: handleReset,
            },
            {
              text: 'Done',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create loan application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      user_id: '',
      interest_rate: '',
      interest_type: '',
      borrowed_amount: 0,
    });
    setErrors({});
    setApplicationResult(null);
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
          <Text style={styles.title}>Loan Application</Text>
          <Text style={styles.subtitle}>
            Submit a new loan application with interest details
          </Text>
        </View>

        <View style={styles.form}>
          <FormInput
            label="User ID"
            value={formData.user_id}
            onChangeText={(value) => handleInputChange('user_id', value)}
            placeholder="Enter user ID (e.g., usr_1234567890)"
            error={errors.user_id}
            required
            autoCapitalize="none"
            autoCorrect={false}
          />

          <FormInput
            label="Interest Rate (%)"
            value={formData.interest_rate}
            onChangeText={(value) => handleInputChange('interest_rate', value)}
            placeholder="Enter interest rate (e.g., 12.5)"
            error={errors.interest_rate}
            required
            keyboardType="numeric"
          />

          {/* Interest Type Selection */}
          <View style={styles.interestTypeSection}>
            <Text style={styles.interestTypeLabel}>
              Interest Type <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.interestTypeGrid}>
              {interestTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.interestTypeButton,
                    formData.interest_type === type.value && styles.interestTypeButtonSelected,
                  ]}
                  onPress={() => handleInterestTypeSelect(type.value)}
                >
                  <Text style={[
                    styles.interestTypeText,
                    formData.interest_type === type.value && styles.interestTypeTextSelected,
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.interest_type && (
              <Text style={styles.errorText}>{errors.interest_type}</Text>
            )}
          </View>

          <FormInput
            label="Loan Amount"
            value={formData.borrowed_amount === 0 ? '' : formData.borrowed_amount.toString()}
            onChangeText={(value) => handleInputChange('borrowed_amount', value)}
            placeholder="Enter loan amount"
            error={errors.borrowed_amount}
            required
            keyboardType="numeric"
          />

          <View style={styles.calculationBox}>
            <Ionicons name="calculator" size={20} color="#2196F3" />
            <View style={styles.calculationContent}>
              <Text style={styles.calculationTitle}>Loan Summary</Text>
              {formData.borrowed_amount > 0 && formData.interest_rate && (
                <View style={styles.calculationDetails}>
                  <Text style={styles.calculationText}>
                    Principal Amount: {formatCurrency(formData.borrowed_amount)}
                  </Text>
                  <Text style={styles.calculationText}>
                    Interest Rate: {formData.interest_rate}% ({formData.interest_type || 'Not selected'})
                  </Text>
                  {formData.interest_type && (
                    <Text style={styles.calculationText}>
                      {formData.interest_type === 'monthly' && 'Monthly interest will be calculated'}
                      {formData.interest_type === 'yearly' && 'Yearly interest will be calculated'}
                      {formData.interest_type === 'quarterly' && 'Quarterly interest will be calculated'}
                      {formData.interest_type === 'half-yearly' && 'Half-yearly interest will be calculated'}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#2196F3" />
            <Text style={styles.infoText}>
              The loan will be created with active status. Interest calculations will be based on the selected type and rate. 
              Ensure the user ID exists in the system before submitting.
            </Text>
          </View>
        </View>

        {/* Application Result */}
        {applicationResult && (
          <View style={styles.resultSection}>
            <Text style={styles.sectionTitle}>Loan Application Details</Text>
            
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <Text style={styles.resultTitle}>Application Approved</Text>
              </View>
              
              <View style={styles.resultDetails}>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Loan ID:</Text>
                  <Text style={styles.resultValue}>{applicationResult.loan_id}</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>User ID:</Text>
                  <Text style={styles.resultValue}>{applicationResult.user_id}</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Loan Amount:</Text>
                  <Text style={[styles.resultValue, { color: '#4CAF50' }]}>
                    {formatCurrency(applicationResult.borrowed_amount)}
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Interest Rate:</Text>
                  <Text style={styles.resultValue}>
                    {applicationResult.interest_rate}% ({applicationResult.interest_type})
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Current Balance:</Text>
                  <Text style={[styles.resultValue, { color: '#F44336' }]}>
                    {formatCurrency(applicationResult.balance)}
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Status:</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: applicationResult.is_active ? '#4CAF50' : '#999' }
                  ]}>
                    <Text style={styles.statusText}>
                      {applicationResult.is_active ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Created:</Text>
                  <Text style={styles.resultValue}>
                    {formatDate(applicationResult.created_at)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

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
              <Text style={styles.submitButtonText}>Submit Application</Text>
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
    marginBottom: 24,
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
  interestTypeSection: {
    marginBottom: 16,
  },
  interestTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  required: {
    color: '#F44336',
  },
  interestTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
  },
  interestTypeButtonSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  interestTypeText: {
    fontSize: 14,
    color: '#666',
  },
  interestTypeTextSelected: {
    color: '#FFF',
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginTop: 4,
  },
  calculationBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  calculationContent: {
    flex: 1,
    marginLeft: 8,
  },
  calculationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8,
  },
  calculationDetails: {
    gap: 4,
  },
  calculationText: {
    fontSize: 12,
    color: '#1976D2',
    lineHeight: 16,
  },
  infoBox: {
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 18,
    marginLeft: 8,
    flex: 1,
  },
  resultSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 8,
  },
  resultDetails: {
    gap: 8,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
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
    backgroundColor: '#4CAF50',
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

export default LoanApplicationScreen;