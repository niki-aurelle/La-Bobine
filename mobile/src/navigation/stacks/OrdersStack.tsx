import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import OrdersListScreen from '../../screens/orders/OrdersListScreen';
import OrderDetailScreen from '../../screens/orders/OrderDetailScreen';
import OrderFormScreen from '../../screens/orders/OrderFormScreen';

export type OrdersStackParamList = {
  OrdersList: undefined;
  OrderDetail: { orderId: string };
  OrderForm: { orderId?: string; clientId?: string };
};

const Stack = createNativeStackNavigator<OrdersStackParamList>();

export default function OrdersStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.primary,
        headerTitleStyle: { fontWeight: '700', color: Colors.textPrimary },
      }}
    >
      <Stack.Screen name="OrdersList" component={OrdersListScreen} options={{ title: 'Commandes' }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Détail commande' }} />
      <Stack.Screen name="OrderForm" component={OrderFormScreen} options={({ route }) => ({
        title: route.params?.orderId ? 'Modifier la commande' : 'Nouvelle commande',
      })} />
    </Stack.Navigator>
  );
}
