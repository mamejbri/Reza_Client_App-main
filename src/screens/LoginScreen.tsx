// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { login } from '../../services/auth';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const isValidEmail = (e: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim().toLowerCase());

  const canSubmit = !!email && !!password && isValidEmail(email) && !loading;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse e-mail valide.');
      return;
    }

    try {
      setLoading(true);
      const result = await login(email.trim(), password);
      setLoading(false);

      if (result.success) {
    

        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      } else {
        Alert.alert('Connexion échouée', result.message);
      }
    } catch (e: any) {
      setLoading(false);
      Alert.alert('Erreur', e?.message ?? 'Une erreur est survenue.');
    }
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <View className="flex-1 pt-12 px-4 pb-4 bg-white">
        <Text className="text-center text-2xl font-bold mb-10"
                          style={{ marginBottom: 16 }}

        >
          Vous avez déjà un compte
        </Text>

        <TextInput
          placeholder="E-mail"
          className="input-base mb-4"
          placeholderTextColor="#000"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="next"
        />

        <View className="relative mb-2.5">
          <TextInput
            placeholder="Mot de passe"
            secureTextEntry={!passwordVisible}
            className="input-base pr-12"
            placeholderTextColor="#000"
            value={password}
            onChangeText={setPassword}
            returnKeyType="done"
            onSubmitEditing={() => canSubmit && handleLogin()}
          />

          <TouchableOpacity
            onPress={() => setPasswordVisible(v => !v)}
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: [{ translateY: -12 }],
            }}
          >
            <Text style={{ fontSize: 18 }}>
              {passwordVisible ? '🚫' : '👁'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 🔹 Ouverture de l'écran "Mot de passe oublié" */}
        <TouchableOpacity
          className="mb-4"
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          <Text className="text-base italic underline mb-11"
          style={{ margin: 16 }}
          >
            Mot de passe oublié ?
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogin}
          className={`btn-primary ${!canSubmit ? 'opacity-50' : ''}`}
          disabled={!canSubmit}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="btn-primary-text"
            >Se connecter</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row items-center my-11 px-4">
          <View className="flex-1 h-px bg-black" />
          <Text className="mx-3 text-base text-black"
          style={{ margin: 16 }}
          >Ou</Text>
          <View className="flex-1 h-px bg-black" />
        </View>

        <Text className="text-center text-lg font-medium mb-8"
                  style={{ marginBottom: 16 }}

        >
          Nouveau sur REZA ?
        </Text>
        <TouchableOpacity
          className="btn-outline"
            onPress={() =>
              navigation.navigate('Signup', {
                redirectAfterLogin: undefined,
              })
            }        >
          <Text className="btn-outline-text">Créer un compte</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default LoginScreen;
