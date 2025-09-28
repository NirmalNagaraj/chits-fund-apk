import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { 
  LoadingSpinner, 
  ErrorMessage, 
  StatsCard 
} from '../../components';
import { userService } from '../../services';
import { UserDetails, UsersStackParamList } from '../../types';
import { formatCurrency, formatDate, formatDateTime } from '../../utils';

type UserDetailsRouteProp = RouteProp<UsersStackParamList, 'UserDetails'>;

const UserDetailsScreen: React.FC = () => {
  const route = useRoute<UserDetailsRouteProp>();
  const { userId } = route.params;
  
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserDetails = async () => {
    try {
      setError(null);
      const response = await userService.getUserDetails(userId);
      
      if (response.success && response.data) {
        setUserDetails(response.data);
      } else {
        setError(response.message || 'Failed to load user details');
      }
    } catch (err) {
      setError('Failed to load user details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserDetails();
  };

  if (loading) {
    return <LoadingSpinner message="Loading user details..." />;
  }

  if (error && !userDetails) {
    return (
      <View style={styles.container}>
        <ErrorMessage message={error} onRetry={fetchUserDetails} />
      </View>
    );
  }

  if (!userDetails) {
    return (
      <View style={styles.container}>
        <ErrorMessage message="User not found" />
      </View>
    );
  }

  // Calculate totals
  const totalChitsPaid = userDetails.chit_payment_history.reduce(
    (sum, payment) => sum + payment.amount_paid, 0
  );
  const totalChitsBalance = userDetails.chit_payment_history.reduce(
    (sum, payment) => sum + payment.balance, 0
  );
  const totalLoansBorrowed = userDetails.loan_details.reduce(
    (sum, loan) => sum + loan.borrowed_amount, 0
  );
  const totalLoansBalance = userDetails.loan_details.reduce(
    (sum, loan) => sum + loan.balance, 0
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color="#FFF" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userDetails.name}</Text>
            <Text style={styles.userMobile}>+91 {userDetails.mobile}</Text>
            <Text style={styles.userChits}>Total Chits: {userDetails.total_chits}</Text>
          </View>
        </View>

        {/* Summary Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Summary</Text>
          
          <View style={styles.statsGrid}>
            <StatsCard
              title="Chits Paid"
              value={totalChitsPaid}
              icon="checkmark-circle"
              color="#4CAF50"
              isCurrency={true}
            />
            
            <StatsCard
              title="Chits Balance"
              value={totalChitsBalance}
              icon="time"
              color="#FF9800"
              isCurrency={true}
            />
            
            <StatsCard
              title="Loans Borrowed"
              value={totalLoansBorrowed}
              icon="card"
              color="#2196F3"
              isCurrency={true}
            />
            
            <StatsCard
              title="Loans Balance"
              value={totalLoansBalance}
              icon="trending-up"
              color="#F44336"
              isCurrency={true}
            />
          </View>
        </View>

        {/* Chit Payment History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chit Payment History</Text>
          
          {userDetails.chit_payment_history.length > 0 ? (
            userDetails.chit_payment_history.map((payment, index) => (
              <View key={payment.id} style={styles.paymentCard}>
                <View style={styles.paymentHeader}>
                  <Text style={styles.paymentTitle}>Chit #{payment.chit_id.slice(-6)}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: payment.is_paid ? '#4CAF50' : '#FF9800' }
                  ]}>
                    <Text style={styles.statusText}>
                      {payment.is_paid ? 'Paid' : 'Pending'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.paymentDetails}>
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Due Amount:</Text>
                    <Text style={styles.paymentValue}>
                      {formatCurrency(payment.due_amount)}
                    </Text>
                  </View>
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Amount Paid:</Text>
                    <Text style={[styles.paymentValue, { color: '#4CAF50' }]}>
                      {formatCurrency(payment.amount_paid)}
                    </Text>
                  </View>
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Balance:</Text>
                    <Text style={[styles.paymentValue, { color: '#F44336' }]}>
                      {formatCurrency(payment.balance)}
                    </Text>
                  </View>
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Weekly Installment:</Text>
                    <Text style={styles.paymentValue}>
                      {formatCurrency(payment.weekly_installment)}
                    </Text>
                  </View>
                  {payment.paid_on && (
                    <View style={styles.paymentRow}>
                      <Text style={styles.paymentLabel}>Last Payment:</Text>
                      <Text style={styles.paymentValue}>
                        {formatDate(payment.paid_on)}
                      </Text>
                    </View>
                  )}
                </View>

                {payment.transaction_history.length > 0 && (
                  <TransactionList 
                    transactions={payment.transaction_history}
                    title="Payment History"
                  />
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="wallet-outline" size={48} color="#CCC" />
              <Text style={styles.emptyText}>No chit payments found</Text>
            </View>
          )}
        </View>

        {/* Loan Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loan Details</Text>
          
          {userDetails.loan_details.length > 0 ? (
            userDetails.loan_details.map((loan, index) => (
              <View key={loan.id} style={styles.loanCard}>
                <View style={styles.loanHeader}>
                  <Text style={styles.loanTitle}>Loan #{loan.loan_id.slice(-6)}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: loan.is_active ? '#4CAF50' : '#999' }
                  ]}>
                    <Text style={styles.statusText}>
                      {loan.is_active ? 'Active' : 'Closed'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.loanDetails}>
                  <View style={styles.loanRow}>
                    <Text style={styles.loanLabel}>Borrowed Amount:</Text>
                    <Text style={styles.loanValue}>
                      {formatCurrency(loan.borrowed_amount)}
                    </Text>
                  </View>
                  <View style={styles.loanRow}>
                    <Text style={styles.loanLabel}>Amount Paid:</Text>
                    <Text style={[styles.loanValue, { color: '#4CAF50' }]}>
                      {formatCurrency(loan.amount_paid)}
                    </Text>
                  </View>
                  <View style={styles.loanRow}>
                    <Text style={styles.loanLabel}>Balance:</Text>
                    <Text style={[styles.loanValue, { color: '#F44336' }]}>
                      {formatCurrency(loan.balance)}
                    </Text>
                  </View>
                  <View style={styles.loanRow}>
                    <Text style={styles.loanLabel}>Interest Rate:</Text>
                    <Text style={styles.loanValue}>
                      {loan.interest_rate}% ({loan.interest_type})
                    </Text>
                  </View>
                  <View style={styles.loanRow}>
                    <Text style={styles.loanLabel}>Created:</Text>
                    <Text style={styles.loanValue}>
                      {formatDate(loan.created_at)}
                    </Text>
                  </View>
                </View>

                {loan.transaction_history.length > 0 && (
                  <TransactionList 
                    transactions={loan.transaction_history}
                    title="Payment History"
                  />
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="card-outline" size={48} color="#CCC" />
              <Text style={styles.emptyText}>No loans found</Text>
            </View>
          )}
        </View>

        {error && (
          <ErrorMessage 
            message={error} 
            type="warning"
            onRetry={fetchUserDetails} 
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
  },
  userCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userMobile: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  userChits: {
    fontSize: 14,
    color: '#999',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    gap: 12,
  },
  paymentCard: {
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
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentTitle: {
    fontSize: 16,
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
  paymentDetails: {
    marginBottom: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  loanCard: {
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
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  loanTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  loanDetails: {
    marginBottom: 12,
  },
  loanRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  loanLabel: {
    fontSize: 14,
    color: '#666',
  },
  loanValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});

export default UserDetailsScreen;