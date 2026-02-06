import AddCustomerModal from '@/components/add-customer-modal';
import LandingScreen from '@/components/landing-screen';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

export default function TabLayout() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLanding, setShowLanding] = useState(true);

  if (showLanding) {
    return <LandingScreen onGetStarted={() => setShowLanding(false)} />;
  }

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#4A90D9',
          tabBarInactiveTintColor: '#94A3B8',
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="search" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: '',
            tabBarIcon: () => (
              <View style={styles.addButtonContainer}>
                <View style={styles.addButton}>
                  <MaterialIcons name="add" size={32} color="#fff" />
                </View>
              </View>
            ),
            tabBarLabel: () => null,
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setShowAddModal(true);
            },
          }}
        />
        <Tabs.Screen
          name="dashboard"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="bar-chart" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="menu"
          options={{
            title: 'Menu',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="menu" size={size} color={color} />
            ),
          }}
        />
      </Tabs>

      <AddCustomerModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCustomerAdded={() => setShowAddModal(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingTop: 4,
    backgroundColor: '#fff',
    borderTopWidth: 0,
    elevation: 12,
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  addButtonContainer: {
    position: 'relative',
    top: -16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A90D9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
});
