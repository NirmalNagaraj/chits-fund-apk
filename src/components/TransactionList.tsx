import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../types';
import { formatCurrency, formatDateTime } from '../utils';

interface TransactionListProps {
  transactions: Transaction[];
  title?: string;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions, 
  title = 'Transaction History' 
}) => {
  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <Ionicons name="card" size={16} color="#4CAF50" />
      </View>
      
      <View style={styles.transactionContent}>
        <View style={styles.transactionHeader}>
          <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
          <Text style={styles.mode}>{item.mode}</Text>
        </View>
        <Text style={styles.timestamp}>
          {formatDateTime(item.timestamp)}
        </Text>
      </View>
    </View>
  );

  if (transactions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={48} color="#CCC" />
          <Text style={styles.emptyText}>No transactions found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item, index) => `${item.timestamp}-${index}`}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionContent: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  mode: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'capitalize',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});

export default TransactionList;