import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import ClientsListScreen from '../../screens/clients/ClientsListScreen';
import ClientDetailScreen from '../../screens/clients/ClientDetailScreen';
import ClientFormScreen from '../../screens/clients/ClientFormScreen';
import MeasurementsScreen from '../../screens/clients/MeasurementsScreen';

export type ClientsStackParamList = {
  ClientsList: undefined;
  ClientDetail: { clientId: string };
  ClientForm: { clientId?: string };
  Measurements: { clientId: string };
};

const Stack = createNativeStackNavigator<ClientsStackParamList>();

export default function ClientsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.primary,
        headerTitleStyle: { fontWeight: '700', color: Colors.textPrimary },
      }}
    >
      <Stack.Screen name="ClientsList" component={ClientsListScreen} options={{ title: 'Mes clientes' }} />
      <Stack.Screen name="ClientDetail" component={ClientDetailScreen} options={{ title: 'Fiche cliente' }} />
      <Stack.Screen name="ClientForm" component={ClientFormScreen} options={({ route }) => ({
        title: route.params?.clientId ? 'Modifier la cliente' : 'Nouvelle cliente',
      })} />
      <Stack.Screen name="Measurements" component={MeasurementsScreen} options={{ title: 'Mesures' }} />
    </Stack.Navigator>
  );
}
