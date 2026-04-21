import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import MoreMenuScreen from '../../screens/MoreMenuScreen';
import GalleryScreen from '../../screens/GalleryScreen';
import AIPhotoScreen from '../../screens/ai/AIPhotoScreen';
import SettingsScreen from '../../screens/SettingsScreen';
import DeliveriesScreen from '../../screens/DeliveriesScreen';
import StockScreen from '../../screens/StockScreen';
import PaymentsScreen from '../../screens/PaymentsScreen';

export type MoreStackParamList = {
  MoreMenu: undefined;
  Gallery: { orderId?: string; clientId?: string };
  AIPhoto: { photoId?: string };
  Settings: undefined;
  Deliveries: undefined;
  Stock: undefined;
  Payments: undefined;
};

const Stack = createNativeStackNavigator<MoreStackParamList>();

export default function MoreStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.primary,
        headerTitleStyle: { fontWeight: '700', color: Colors.textPrimary },
      }}
    >
      <Stack.Screen name="MoreMenu" component={MoreMenuScreen} options={{ title: 'Plus' }} />
      <Stack.Screen name="Gallery" component={GalleryScreen} options={{ title: 'Galerie' }} />
      <Stack.Screen name="AIPhoto" component={AIPhotoScreen} options={{ title: 'Retouche IA' }} />
      <Stack.Screen name="Deliveries" component={DeliveriesScreen} options={{ title: 'Livraisons' }} />
      <Stack.Screen name="Stock" component={StockScreen} options={{ title: 'Stock' }} />
      <Stack.Screen name="Payments" component={PaymentsScreen} options={{ title: 'Paiements' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Paramètres' }} />
    </Stack.Navigator>
  );
}
