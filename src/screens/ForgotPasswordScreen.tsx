// src/screens/ForgotPasswordScreen.tsx
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
import { requestPasswordReset } from '../../services/auth';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidEmail = (e: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim().toLowerCase());

  const canSubmit = !!email && isValidEmail(email) && !loading;

  const handleSubmit = async () => {
    if (!email) {
      Alert.alert('Erreur', 'Veuillez saisir votre adresse e-mail.');
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse e-mail valide.');
      return;
    }

    try {
      setLoading(true);
      await requestPasswordReset(email.trim());
      setLoading(false);

      Alert.alert(
        'E-mail envoyé',
        "Si un compte existe avec cette adresse, un e-mail de réinitialisation a été envoyé.",
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (e: any) {
      setLoading(false);
      Alert.alert(
        'Erreur',
        e?.message ?? 'Une erreur est survenue lors de la demande.'
      );
    }
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <View className="flex-1 pt-12 px-4 pb-4 bg-white">
        <Text className="text-center text-2xl font-bold mb-6">
          Mot de passe oublié
        </Text>

        <Text className="text-center text-base mb-8">
          Saisissez l’adresse e-mail associée à votre compte.
          {'\n'}
          Nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </Text>

        <TextInput
          placeholder="E-mail"
          className="input-base mb-6"
          placeholderTextColor="#000"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="done"
          onSubmitEditing={() => canSubmit && handleSubmit()}
        />

        <TouchableOpacity
          onPress={handleSubmit}
          className={`btn-primary ${!canSubmit ? 'opacity-50' : ''}`}
          disabled={!canSubmit}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="btn-primary-text">
              Envoyer le lien de réinitialisation
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-6"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-center text-base underline">
            Retour à la connexion
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ForgotPasswordScreen;
