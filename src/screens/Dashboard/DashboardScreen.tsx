import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { 
  LoadingSpinner, 
  ErrorMessage, 
  StatsCard,
  UserCard 
} from '../../components';
import { analyticsService, userService } from '../../services';
import { Analytics, User } from '../../types';
import { debounce } from '../../utils';

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      setError(null);
      
      // Fetch analytics and users in parallel
      const [analyticsResponse, usersResponse] = await Promise.all([
        analyticsService.getAnalytics(),
        userService.getAllUsers(),
      ]);
      
      if (analyticsResponse.success && analyticsResponse.data) {
        setAnalytics(analyticsResponse.data);
      }

      if (usersResponse.success && usersResponse.data) {
        setUsers(usersResponse.data);
        setFilteredUsers(usersResponse.data);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const debouncedSearch = debounce((query: string) => {
    if (!query.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.mobile.toString().includes(query)
    );
    setFilteredUsers(filtered);
  }, 300);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, users]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleUserPress = (user: User) => {
    // Navigate to user details in Users tab
    navigation.navigate('Users', {
      screen: 'UserDetails',
      params: { userId: user.user_id }
    });
  };

  const renderUser = ({ item }: { item: User }) => (
    <UserCard 
      user={item} 
      onPress={() => handleUserPress(item)}
    />
  );

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Search Section */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users by name or mobile..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Analytics Overview */}
        {analytics && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>System Overview</Text>
            
            <View style={styles.statsRow}>
              <StatsCard
                title="Total Users"
                value={analytics.total_persons_applied_for_chits}
                icon="people"
                color="#2196F3"
              />
              
              <StatsCard
                title="Active Chits"
                value={analytics.total_number_of_active_chits}
                icon="wallet"
                color="#FF9800"
              />
            </View>

            <View style={styles.statsRow}>
              <StatsCard
                title="Pending Loans"
                value={analytics.total_pending_loans}
                icon="card"
                color="#9C27B0"
              />
              
              <StatsCard
                title="Collections"
                value={analytics.amount_in_chits}
                icon="cash"
                color="#4CAF50"
                isCurrency={true}
              />
            </View>
          </View>
        )}

        {/* Users List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Users {searchQuery ? `(${filteredUsers.length} found)` : `(${users.length} total)`}
          </Text>
          
          {filteredUsers.length > 0 ? (
            <FlatList
              data={filteredUsers.slice(0, 10)} // Show only first 10 users
              renderItem={renderUser}
              keyExtractor={(item) => item.user_id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#CCC" />
              <Text style={styles.emptyText}>
                {searchQuery ? 'No users found' : 'No users available'}
              </Text>
            </View>
          )}

          {filteredUsers.length > 10 && (
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('Users')}
            >
              <Text style={styles.viewAllText}>
                View All Users ({filteredUsers.length})
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#2196F3" />
            </TouchableOpacity>
          )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
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
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  viewAllText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
    marginRight: 4,
  },
});

export default DashboardScreen;