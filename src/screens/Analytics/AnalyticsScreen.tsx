import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  LoadingSpinner,
  ErrorMessage,
  StatsCard
} from '../../components';
import { analyticsService } from '../../services';
import { Analytics, HealthStatus } from '../../types';
import { calculatePercentage } from '../../utils';

const AnalyticsScreen: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);

      // Fetch analytics and health status in parallel
      const [analyticsResponse, healthResponse] = await Promise.all([
        analyticsService.getAnalytics(),
        analyticsService.getHealthStatus(),
      ]);

      if (analyticsResponse.success && analyticsResponse.data) {
        setAnalytics(analyticsResponse.data);
      } else {
        setError(analyticsResponse.message || 'Failed to load analytics');
      }

      if (healthResponse.success && healthResponse.data) {
        setHealthStatus(healthResponse.data);
      }
    } catch (err) {
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return <LoadingSpinner message="Loading analytics..." />;
  }

  if (error && !analytics) {
    return (
      <View style={styles.container}>
        <ErrorMessage message={error} onRetry={fetchData} />
      </View>
    );
  }

  if (!analytics) {
    return (
      <View style={styles.container}>
        <ErrorMessage message="No analytics data available" />
      </View>
    );
  }

  // Calculate derived metrics
  const chitPaymentRate = calculatePercentage(
    analytics.total_number_of_active_chits - analytics.count_of_unpaid_chits,
    analytics.total_number_of_active_chits
  );

  const loanRepaymentRate = calculatePercentage(
    analytics.total_pending_loans - analytics.count_of_unpaid_loans,
    analytics.total_pending_loans
  );

  const totalChitAmount = analytics.amount_in_chits + analytics.amount_pending_to_be_paid_chits;
  const chitCollectionRate = calculatePercentage(analytics.amount_in_chits, totalChitAmount);

  const loanRecoveryRate = calculatePercentage(
    analytics.amount_paid_for_loans,
    analytics.amount_provided_for_loans
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* System Health */}
        {healthStatus && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>System Health</Text>
            <View style={styles.healthCard}>
              <View style={styles.healthHeader}>
                <Ionicons
                  name={healthStatus.status === 'ok' ? 'checkmark-circle' : 'alert-circle'}
                  size={24}
                  color={healthStatus.status === 'ok' ? '#4CAF50' : '#F44336'}
                />
                <Text style={[
                  styles.healthStatus,
                  { color: healthStatus.status === 'ok' ? '#4CAF50' : '#F44336' }
                ]}>
                  {healthStatus.status === 'ok' ? 'System Online' : 'System Error'}
                </Text>
              </View>
              <View style={styles.healthDetails}>
                <View style={styles.healthRow}>
                  <Text style={styles.healthLabel}>Environment:</Text>
                  <Text style={styles.healthValue}>{healthStatus.environment}</Text>
                </View>
                <View style={styles.healthRow}>
                  <Text style={styles.healthLabel}>Version:</Text>
                  <Text style={styles.healthValue}>{healthStatus.version}</Text>
                </View>
                <View style={styles.healthRow}>
                  <Text style={styles.healthLabel}>Uptime:</Text>
                  <Text style={styles.healthValue}>
                    {Math.floor(healthStatus.uptime / 3600)}h {Math.floor((healthStatus.uptime % 3600) / 60)}m
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* User Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Statistics</Text>

          <StatsCard
            title="Total Users (Chits)"
            value={analytics.total_persons_applied_for_chits}
            icon="people"
            color="#2196F3"
          />

          <StatsCard
            title="Total Users (Loans)"
            value={analytics.total_persons_applied_for_loans}
            icon="person"
            color="#4CAF50"
          />
        </View>

        {/* Chit Fund Analytics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chit Fund Analytics</Text>

          <StatsCard
            title="Active Chits"
            value={analytics.total_number_of_active_chits}
            icon="wallet"
            color="#FF9800"
          />

          <StatsCard
            title="Pending Chit Payments"
            value={analytics.total_pending_chits}
            icon="time"
            color="#F44336"
          />

          <StatsCard
            title="Unpaid Chits"
            value={analytics.count_of_unpaid_chits}
            icon="alert-circle"
            color="#F44336"
          />

          <StatsCard
            title="Chit Payment Rate"
            value={`${chitPaymentRate}%`}
            icon="trending-up"
            color={chitPaymentRate >= 80 ? '#4CAF50' : chitPaymentRate >= 60 ? '#FF9800' : '#F44336'}
          />
        </View>

        {/* Financial Overview - Chits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chit Fund Financials</Text>

          <StatsCard
            title="Amount Collected (Chits)"
            value={analytics.amount_in_chits}
            icon="cash"
            color="#4CAF50"
            isCurrency={true}
          />

          <StatsCard
            title="Pending Collections (Chits)"
            value={analytics.amount_pending_to_be_paid_chits}
            icon="hourglass"
            color="#FF9800"
            isCurrency={true}
          />

          <StatsCard
            title="Collection Rate"
            value={`${chitCollectionRate}%`}
            icon="pie-chart"
            color={chitCollectionRate >= 80 ? '#4CAF50' : chitCollectionRate >= 60 ? '#FF9800' : '#F44336'}
          />
        </View>

        {/* Loan Analytics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loan Analytics</Text>

          <StatsCard
            title="Active Loans"
            value={analytics.total_pending_loans}
            icon="card"
            color="#9C27B0"
          />

          <StatsCard
            title="Unpaid Loans"
            value={analytics.count_of_unpaid_loans}
            icon="warning"
            color="#F44336"
          />

          <StatsCard
            title="Loan Repayment Rate"
            value={`${loanRepaymentRate}%`}
            icon="trending-up"
            color={loanRepaymentRate >= 80 ? '#4CAF50' : loanRepaymentRate >= 60 ? '#FF9800' : '#F44336'}
          />
        </View>

        {/* Financial Overview - Loans */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loan Financials</Text>

          <StatsCard
            title="Total Loans Disbursed"
            value={analytics.amount_provided_for_loans}
            icon="trending-down"
            color="#9C27B0"
            isCurrency={true}
          />

          <StatsCard
            title="Amount Recovered"
            value={analytics.amount_paid_for_loans}
            icon="checkmark-circle"
            color="#4CAF50"
            isCurrency={true}
          />

          <StatsCard
            title="Outstanding Loans"
            value={analytics.amount_provided_for_loans - analytics.amount_paid_for_loans}
            icon="alert"
            color="#F44336"
            isCurrency={true}
          />

          <StatsCard
            title="Recovery Rate"
            value={`${loanRecoveryRate}%`}
            icon="pie-chart"
            color={loanRecoveryRate >= 80 ? '#4CAF50' : loanRecoveryRate >= 60 ? '#FF9800' : '#F44336'}
          />
        </View>

        {/* Key Performance Indicators */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Performance Indicators</Text>

          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiTitle}>Portfolio Health</Text>
              <Text style={[
                styles.kpiValue,
                { color: (chitPaymentRate + loanRepaymentRate) / 2 >= 75 ? '#4CAF50' : '#F44336' }
              ]}>
                {Math.round((chitPaymentRate + loanRepaymentRate) / 2)}%
              </Text>
              <Text style={styles.kpiSubtitle}>Overall Performance</Text>
            </View>

            <View style={styles.kpiCard}>
              <Text style={styles.kpiTitle}>Risk Level</Text>
              <Text style={[
                styles.kpiValue,
                { color: analytics.count_of_unpaid_chits + analytics.count_of_unpaid_loans <= 10 ? '#4CAF50' : '#F44336' }
              ]}>
                {analytics.count_of_unpaid_chits + analytics.count_of_unpaid_loans <= 10 ? 'Low' : 'High'}
              </Text>
              <Text style={styles.kpiSubtitle}>
                {analytics.count_of_unpaid_chits + analytics.count_of_unpaid_loans} Defaults
              </Text>
            </View>
          </View>
        </View>

        {error && (
          <ErrorMessage
            message={error}
            type="warning"
            onRetry={fetchData}
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  healthCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  healthStatus: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  healthDetails: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  healthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  healthLabel: {
    fontSize: 14,
    color: '#666',
  },
  healthValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  kpiTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  kpiSubtitle: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default AnalyticsScreen;