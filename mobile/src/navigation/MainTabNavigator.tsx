import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Sizes } from '../constants/sizes';

import DashboardScreen from '../screens/DashboardScreen';
import ClientsStack from './stacks/ClientsStack';
import OrdersStack from './stacks/OrdersStack';
import AgendaScreen from '../screens/AgendaScreen';
import MoreStack from './stacks/MoreStack';

export type MainTabParamList = {
  Dashboard: undefined;
  Clients: undefined;
  Orders: undefined;
  Agenda: undefined;
  More: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          height: Sizes.tabBarHeight,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, [string, string]> = {
            Dashboard: ['grid', 'grid-outline'],
            Clients: ['people', 'people-outline'],
            Orders: ['clipboard', 'clipboard-outline'],
            Agenda: ['calendar', 'calendar-outline'],
            More: ['menu', 'menu-outline'],
          };
          const [active, inactive] = icons[route.name] || ['ellipse', 'ellipse-outline'];
          return <Ionicons name={(focused ? active : inactive) as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: 'Accueil' }} />
      <Tab.Screen name="Clients" component={ClientsStack} options={{ tabBarLabel: 'Clientes' }} />
      <Tab.Screen name="Orders" component={OrdersStack} options={{ tabBarLabel: 'Commandes' }} />
      <Tab.Screen name="Agenda" component={AgendaScreen} options={{ tabBarLabel: 'Agenda' }} />
      <Tab.Screen name="More" component={MoreStack} options={{ tabBarLabel: 'Plus' }} />
    </Tab.Navigator>
  );
}
