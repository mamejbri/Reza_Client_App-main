// src/screens/SignupScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { signup } from '../../services/auth';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// ✅ Prefilled with values that pass your validators:
// - email: valid format
// - password: non-empty
// - phone: exactly 13 digits (you currently require 13 digits)

const SignupScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState("+212");
  const [phoneNumber, setPhoneNumber] = useState("");
  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.toLowerCase());
const isValidPhone = (digitsOnly: string) =>
  digitsOnly.length >= 11 && digitsOnly.length <= 16;  const route = useRoute<RouteProp<RootStackParamList, 'Signup'>>();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

const phoneDigits = useMemo(() => {
  const cc = countryCode.replace(/\D/g, ''); // 212
  const num = phoneNumber.replace(/\D/g, ''); // local number
  return cc + num; // e.g. 212612345678
}, [countryCode, phoneNumber]);

  const canSubmit =
  isValidEmail(email) &&
  passwordsMatch &&
  isValidPhone(phoneDigits) &&
  accepted &&
  !loading;

  const handleSignup = async () => {
    if (!canSubmit) {
      Alert.alert('Erreur', "Veuillez remplir correctement le formulaire et accepter les CGU.");
      return;
    }
    try {
      setLoading(true);
      const result = await signup(phoneDigits.trim(), email.trim(), password);
      setLoading(false);

      if (result.success) {
if (route.params?.redirectAfterLogin) {
  navigation.reset({
    index: 0,
    routes: [
      {
        name: route.params.redirectAfterLogin.screen,
        params: route.params.redirectAfterLogin.params,
      },
    ],
  });
} else {
  navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
}      } else {
        Alert.alert('Inscription échouée', result.message || 'Une erreur est survenue.');
      }
    } catch (e: any) {
      setLoading(false);
      Alert.alert('Erreur', e?.message ?? 'Une erreur est survenue.');
    }
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <View className="flex-1 pt-12 px-4 pb-4 bg-white">
        <View className="bg-white rounded-xl p-5">

          <Text className="text-center text-2xl font-bold mb-6">
            Nouveau sur Reza ?
          </Text>

          {/* Email */}
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
          {email && !isValidEmail(email) && (
            <Text className="text-danger text-sm mb-2">
              Adresse e-mail invalide
            </Text>
          )}
          <View className="relative mb-4">

        <TextInput
          placeholder="Mot de passe"
          secureTextEntry={!passwordVisible}
          className="input-base pr-12"
          placeholderTextColor="#000"
          value={password}
          onChangeText={setPassword}
          returnKeyType="next"
        />

        <Pressable
          onPress={() => setPasswordVisible((v) => !v)}
          style={{
            position: 'absolute',
            right: 16,
            top: 0,
            bottom: 0,
            justifyContent: 'center',
          }}
          hitSlop={10}
        >
          <Text className="text-lg">
            {passwordVisible ? '🙈' : '👁'}
          </Text>
        </Pressable>

</View>
{/* Confirm password */}
<TextInput
  placeholder="Confirmer le mot de passe"
  secureTextEntry={!passwordVisible}
  className={`input-base mb-2 ${
    confirmPassword && !passwordsMatch ? 'border-danger' : ''
  }`}
  placeholderTextColor="#000"
  value={confirmPassword}
  onChangeText={setConfirmPassword}
  returnKeyType="next"
/>
{confirmPassword && !passwordsMatch && (
  <Text className="text-danger text-sm mb-3">
    Les mots de passe ne correspondent pas
  </Text>
)}
          {/* Phone (country + number) */}
          <View className="flex-row gap-2">

            <TextInput
              placeholder="+212"
                    style={{ width: '20%' }}

              keyboardType="phone-pad"
              placeholderTextColor="#000"
              value={countryCode}
              onChangeText={(v) => {
                let value = v.replace(/[^+\d]/g, '');
                if (!value.startsWith('+')) {
                  value = '+' + value.replace(/\+/g, '');
                }
                setCountryCode(value.slice(0, 4));
              }}
              maxLength={4}
              className="input-base flex-1"
            />

            <TextInput
              placeholder="Numéro Whatsapp"
              style={{ width: '80%' }}
              keyboardType="phone-pad"
              placeholderTextColor="#000"
              value={phoneNumber}
              onChangeText={(v) => {
                const digits = v.replace(/\D/g, '');
                setPhoneNumber(digits.slice(0, 12));
              }}
              maxLength={12}
              className="input-base flex-[3]"
            />
          
          </View>
{phoneNumber && !isValidPhone(phoneDigits) && (
            <Text className="text-danger text-sm mt-2">
              Numéro WhatsApp invalide
            </Text>
          )}
      </View>



        {/* ✅ Pretty checkbox + label, side-by-side */}
        <View className="px-4 mt-4"
        style={{ marginBottom: 8 }}
        >
        <Pressable
        style={{ marginTop: 16}}
          onPress={() => setAccepted((prev) => !prev)}
          className="flex-row items-center gap-3 mb-11"
          android_ripple={{ color: '#eee' }}
          hitSlop={8}

        >
          <View
          style={{width: 24, height: 24}}
            className={`w-6 h-6 rounded-md border items-center justify-center ${
              accepted ? 'bg-danger border-danger' : 'bg-white border-gray-400'
            }`}
          >
            {accepted ? (
              <Text className="text-white text-sm">✓</Text>
            ) : (
              <Text className="text-transparent text-sm">✓</Text>
            )}
          </View>
          <Text className="text-base underline">J’accepte les CGU de Reza</Text>
          
        </Pressable>
        {!accepted && (
          <Text className="text-danger text-sm mt-2">
            Vous devez accepter les CGU
          </Text>
        )}
        </View>
        {/* --- BUTTON Submit Signup --- */}
          <View className="px-4" style={{ marginBottom: 16 }}>
            <TouchableOpacity
              onPress={handleSignup}
              style={{ opacity: 10 }}
              activeOpacity={canSubmit ? 0.7 : 1}
              className={`btn-primary ${
                !canSubmit || loading ? 'opacity-10' : ''
              }`}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="btn-primary-text">Créer un compte</Text>
              )}
            </TouchableOpacity>
          </View>


        <View className="flex-row items-center my-11 px-4">
          <View className="flex-1 h-px bg-black" />
          <Text className="mx-3 text-base text-black" 
          style={{marginBottom: 16}}
          >Ou</Text>
          <View className="flex-1 h-px bg-black" />
        </View>

        <Text className="text-center text-lg font-medium mb-8"
        style={{marginBottom: 16}}
        >Vous avez déjà un compte</Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('Login', {
              redirectAfterLogin: { screen: 'Home' },
            })
          }
          className="btn-outline"
        >
          <Text className="btn-outline-text">Se connecter</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default SignupScreen;
