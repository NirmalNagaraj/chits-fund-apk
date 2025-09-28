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
  LoadingSpinner,
  TransactionList 
} from '../../components';
import { loanService } from '../../services';
import { LoanPaymentRequest, FormErrors, Loan } from '../../types';
import { formatCurrency } from '../../utils';

const LoanPaymentScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<LoanPaymentRequest>({
    user_id: '',
    loan_id: '',
    amount: 0,
    payment_mode: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [paymentResult, setPaymentResult] = useState<Loan | null>(null);

  const paymentModes = [
    { label: 'Cash', value: 'cash' },
    { label: 'Bank Transfer', value: 'bank_transfer' },
    { label: 'UPI', value: 'upi' },
    { label: 'Cheque', value: 'cheque' },
    { label: 'Online', value: 'online' },
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // User ID validation
    if (!formData.user_id.trim()) {
      newErrors.user_id = 'User ID is required';
    }

    // Loan ID validation
    if (!formData.loan_id.trim()) {
      newErrors.loan_id = 'Loan ID is required';
    }

    // Amount validation
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (formData.amount > 10000000) {
      newErrors.amount = 'Amount cannot exceed ₹1,00,00,000';
    }

    // Payment mode validation
    if (!formData.payment_mode.trim()) {
      newErrors.payment_mode = 'Payment mode is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof LoanPaymentRequest, value: string) => {
    let processedValue: any = value;

    if (field === 'amount') {
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

  const handlePaymentModeSelect = (mode: string) => {
    handleInputChange('payment_mode', mode);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await loanService.makeLoanPayment(formData);

      if (response.success && response.data) {
        setPaymentResult(response.data);
        Alert.alert(
          'Payment Successful',
          `Loan payment of ${formatCurrency(formData.amount)} has been processed successfully!`,
          [
            {
              text: 'Make Another Payment',
              onPress: handleReset,
            },
            {
              text: 'Done',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        // Handle API errors
        if (response.error === 'Loan not found') {
          setErrors({ 
            user_id: 'Invalid user ID or loan ID combination',
            loan_id: 'Please verify the user and loan IDs'
          });
        } else {
          Alert.alert('Error', response.message);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process loan payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      user_id: '',
      loan_id: '',
      amount: 0,
      payment_mode: '',
    });
    setErrors({});
    setPaymentResult(null);
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
          <Text style={styles.title}>Loan Payment</Text>
          <Text style={styles.subtitle}>
            Process a payment towards an existing loan
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
            label="Loan ID"
            value={formData.loan_id}
            onChangeText={(value) => handleInputChange('loan_id', value)}
            placeholder="Enter loan ID (e.g., loan_1234567890)"
            error={errors.loan_id}
            required
            autoCapitalize="none"
            autoCorrect={false}
          />

          <FormInput
            label="Payment Amount"
            value={formData.amount === 0 ? '' : formData.amount.toString()}
            onChangeText={(value) => handleInputChange('amount', value)}
            placeholder="Enter payment amount"
            error={errors.amount}
            required
            keyboardType="numeric"
          />

          {/* Payment Mode Selection */}
          <View style={styles.paymentModeSection}>
            <Text style={styles.paymentModeLabel}>
              Payment Mode <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.paymentModeGrid}>
              {paymentModes.map((mode) => (
                <TouchableOpacity
                  key={mode.value}
                  style={[
                    styles.paymentModeButton,
                    formData.payment_mode === mode.value && styles.paymentModeButtonSelected,
                  ]}
                  onPress={() => handlePaymentModeSelect(mode.value)}
                >
                  <Text style={[
                    styles.paymentModeText,
                    formData.payment_mode === mode.value && styles.paymentModeTextSelected,
                  ]}>
                    {mode.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.payment_mode && (
              <Text style={styles.errorText}>{errors.payment_mode}</Text>
            )}
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#2196F3" />
            <Text style={styles.infoText}>
              The payment will be applied to the loan balance. If the payment amount exceeds the remaining balance, 
              the loan will be marked as fully paid and the status will be updated accordingly.
            </Text>
          </View>
        </View>

        {/* Payment Result */}
        {paymentResult && (
          <View style={styles.resultSection}>
            <Text style={styles.sectionTitle}>Payment Details</Text>
            
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <Text style={styles.resultTitle}>Payment Processed</Text>
              </View>
              
              <View style={styles.resultDetails}>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Loan ID:</Text>
                  <Text style={styles.resultValue}>{paymentResult.loan_id}</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>User ID:</Text>
                  <Text style={styles.resultValue}>{paymentResult.user_id}</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Original Amount:</Text>
                  <Text style={styles.resultValue}>
                    {formatCurrency(paymentResult.borrowed_amount)}
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Total Paid:</Text>
                  <Text style={[styles.resultValue, { color: '#4CAF50' }]}>
                    {formatCurrency(paymentResult.amount_paid)}
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Remaining Balance:</Text>
                  <Text style={[styles.resultValue, { color: '#F44336' }]}>
                    {formatCurrency(paymentResult.balance)}
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Interest Rate:</Text>
                  <Text style={styles.resultValue}>
                    {paymentResult.interest_rate}% ({paymentResult.interest_type})
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Loan Status:</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: paymentResult.is_paid ? '#4CAF50' : paymentResult.is_active ? '#FF9800' : '#999' }
                  ]}>
                    <Text style={styles.statusText}>
                      {paymentResult.is_paid ? 'Fully Paid' : paymentResult.is_active ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
              </View>

              {paymentResult.transaction_history.length > 0 && (
                <TransactionList 
                  transactions={paymentResult.transaction_history}
                  title="Updated Transaction History"
                />
              )}

              {paymentResult.is_paid && (
                <View style={styles.congratsBox}>
                  <Ionicons name="trophy" size={24} color="#FFD700" />
                  <Text style={styles.congratsText}>
                    🎉 Congratulations! This loan has been fully repaid.
                  </Text>
                </View>
              )}
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
              <Text style={styles.submitButtonText}>Process Payment</Text>
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
  paymentModeSection: {
    marginBottom: 16,
  },
  paymentModeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  required: {
    color: '#F44336',
  },
  paymentModeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paymentModeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
  },
  paymentModeButtonSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  paymentModeText: {
    fontSize: 14,
    color: '#666',
  },
  paymentModeTextSelected: {
    color: '#FFF',
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginTop: 4,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
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
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  congratsBox: {
    backgroundColor: '#FFF9C4',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  congratsText: {
    fontSize: 14,
    color: '#F57F17',
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
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

export default LoanPaymentScreen;