import { useContext, useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';

export default function HomeScreen() {
  const { signOut } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        setUserData(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: signOut, style: 'destructive' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Cabriole!</Text>
      
      {userData && (
        <View style={styles.userInfo}>
          <Text style={styles.greeting}>Hello, {userData.name}!</Text>
          <Text style={styles.email}>{userData.email}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  greeting: {
    fontSize: 20,
    color: '#666',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#999',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});