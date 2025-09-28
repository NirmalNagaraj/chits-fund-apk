import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Animated,
  PanGestureHandler,
  State,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  LoadingSpinner, 
  ErrorMessage,
  FormInput 
} from '../../components';
import { userService, chitService } from '../../services';
import { UserDetails, ChitPayment } from '../../types';
import { formatCurrency, formatDate } from '../../utils';

interface PendingChit extends ChitPayment {
  user_name: string;
  user_mobile: number;
}

const ChitsOverviewScreen: React.FC = () => {
  const [pendingChits, setPendingChits] = useState<PendingChit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedChit, setSelectedChit] = useState<PendingChit | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');

  const fetchPendingChits = async () => {
    try {
      setError(null);
      
      // Get all users first
      const usersResponse = await userService.getAllUsers();
      if (!usersResponse.success || !usersResponse.data) {
        setError('Failed to load users');
        return;
      }

      // Get detailed info for each user to find pending chits
      const allPendingChits: PendingChit[] = [];
      
      for (const user of usersResponse.data) {
        try {
          const userDetailsResponse = await userService.getUserDetails(user.user_id);
          if (userDetailsResponse.success && userDetailsResponse.data) {
            const pendingUserChits = userDetailsResponse.data.chit_payment_history
              .filter(chit => !chit.is_paid && chit.balance > 0)
              .map(chit => ({
                ...chit,
                user_name: user.name,
                user_mobile: user.mobile,
              }));
            
            allPendingChits.push(...pendingUserChits);
          }
        } catch (err) {
          console.log(`Failed to fetch details for user ${user.user_id}`);
        }
      }

      setPendingChits(allPendingChits);
    } catch (err) {
      setError('Failed to load pending chits');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPendingChits();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPendingChits();
  };

  const handleSwipeToPayment = (chit: PendingChit) => {
    setSelectedChit(chit);
    setPaymentAmount(chit.balance.toString());
    setPaymentModalVisible(true);
  };

  const handlePayment = async () => {
    if (!selectedChit || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    if (amount <= 0 || amount > selectedChit.balance) {
      Alert.alert('Error', 'Please enter a valid payment amount');
      return;
    }

    try {
      const response = await chitService.makeChitPayment({
        user_id: selectedChit.user_id,
        chit_id: selectedChit.chit_id,
        amount: amount,
        payment_mode: paymentMode,
      });

      if (response.success) {
        Alert.alert('Success', 'Payment processed successfully!');
        setPaymentModalVisible(false);
        setSelectedChit(null);
        setPaymentAmount('');
        fetchPendingChits(); // Refresh the list
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process payment');
    }
  };

  const renderChitItem = ({ item }: { item: PendingChit }) => (
    <TouchableOpacity 
      style={styles.chitCard}
      onPress={() => handleSwipeToPayment(item)}
      activeOpacity={0.7}
    >
      <View style={styles.chitHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.user_name}</Text>
          <Text style={styles.userMobile}>+91 {item.user_mobile}</Text>
        </View>
        <View style={styles.chitInfo}>
          <Text style={styles.chitId}>#{item.chit_id.slice(-6)}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Pending</Text>
          </View>
        </View>
      </View>

      <View style={styles.chitDetails}>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Due Amount:</Text>
          <Text style={styles.dueAmount}>{formatCurrency(item.due_amount)}</Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Paid:</Text>
          <Text style={styles.paidAmount}>{formatCurrency(item.amount_paid)}</Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Balance:</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(item.balance)}</Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Weekly:</Text>
          <Text style={styles.weeklyAmount}>{formatCurrency(item.weekly_installment)}</Text>
        </View>
      </View>

      <View style={styles.swipeHint}>
        <Ionicons name="card" size={16} color="#2196F3" />
        <Text style={styles.swipeText}>Tap to pay</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingSpinner message="Loading pending chits..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Pending Chits</Text>
        <Text style={styles.subtitle}>
          {pendingChits.length} chits pending payment
        </Text>
      </View>

      {/* Pending Chits List */}
      <FlatList
        data={pendingChits}
        renderItem={renderChitItem}
        keyExtractor={(item) => `${item.user_id}-${item.chit_id}`}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
            <Text style={styles.emptyTitle}>All Chits Paid!</Text>
            <Text style={styles.emptySubtitle}>
              No pending chit payments at the moment
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Payment Modal */}
      {paymentModalVisible && selectedChit && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Make Payment</Text>
              <TouchableOpacity 
                onPress={() => setPaymentModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalUserName}>{selectedChit.user_name}</Text>
              <Text style={styles.modalChitId}>Chit #{selectedChit.chit_id.slice(-6)}</Text>
              
              <View style={styles.modalAmountInfo}>
                <Text style={styles.modalAmountLabel}>
                  Balance: {formatCurrency(selectedChit.balance)}
                </Text>
              </View>

              <FormInput
                label="Payment Amount"
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                placeholder="Enter amount"
                keyboardType="numeric"
              />

              <View style={styles.paymentModeSection}>
                <Text style={styles.paymentModeLabel}>Payment Mode</Text>
                <View style={styles.paymentModeButtons}>
                  {['cash', 'upi', 'bank_transfer'].map((mode) => (
                    <TouchableOpacity
                      key={mode}
                      style={[
                        styles.paymentModeButton,
                        paymentMode === mode && styles.paymentModeButtonActive
                      ]}
                      onPress={() => setPaymentMode(mode)}
                    >
                      <Text style={[
                        styles.paymentModeButtonText,
                        paymentMode === mode && styles.paymentModeButtonTextActive
                      ]}>
                        {mode.replace('_', ' ').toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setPaymentModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.payButton}
                onPress={handlePayment}
              >
                <Text style={styles.payButtonText}>Pay Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {error && (
        <ErrorMessage 
          message={error} 
          onRetry={fetchPendingChits} 
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 16,
  },
  chitCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  userMobile: {
    fontSize: 14,
    color: '#666',
  },
  chitInfo: {
    alignItems: 'flex-end',
  },
  chitId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: 4,
  },
  statusBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
  },
  chitDetails: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
  },
  dueAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  paidAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  balanceAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F44336',
  },
  weeklyAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  swipeText: {
    fontSize: 12,
    color: '#2196F3',
    marginLeft: 4,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  modalUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  modalChitId: {
    fontSize: 14,
    color: '#2196F3',
    marginBottom: 16,
  },
  modalAmountInfo: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalAmountLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  paymentModeSection: {
    marginTop: 16,
  },
  paymentModeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  paymentModeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentModeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  paymentModeButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  paymentModeButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  paymentModeButtonTextActive: {
    color: '#FFF',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  payButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#4CAF50',
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default ChitsOverviewScreen;