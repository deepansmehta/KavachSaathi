import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts, spacing, radius } from '../../constants';
import { PressableScale } from '../../components/common/PressableScale';
import { ScreenTransition } from '../../components/animations/ScreenTransition';
import { AnimatedEntry } from '../../components/common/AnimatedEntry';
import { AnimatedBackground } from '../../components/backgrounds/AnimatedBackground';
import { NeonButton } from '../../components/NeonButton';
import { GlassCard } from '../../components/common/GlassCard';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import {
  createOrder,
  confirmPayment,
  openRazorpayCheckout,
} from '../../services/cardOrder.service';
import { useAuthStore } from '../../store/authStore';

const PLANS = [
  {
    type: 'standard' as const,
    name: 'Standard Card',
    price: 249,
    tag: 'MOST POPULAR',
    features: ['QR Code Card', '1 Health Profile', 'Emergency Page', 'Medicine Reminders'],
    color: colors.teal,
  },
  {
    type: 'pro' as const,
    name: 'Pro Card',
    price: 449,
    tag: 'PREMIUM',
    features: ['QR + NFC Chip', '6 Family Members', 'Doctor Portal Access', 'Priority Support'],
    color: colors.gold,
  },
];

type AddressKey = 'name' | 'phone' | 'line1' | 'line2' | 'city' | 'state' | 'pincode';

export function CardOrderScreen() {
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'pro'>('standard');
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  });

  const validateAddress = () => {
    if (
      !address.name ||
      !address.phone ||
      !address.line1 ||
      !address.city ||
      !address.state ||
      !address.pincode
    ) {
      Alert.alert('Incomplete Address', 'Saare required fields bharo.');
      return false;
    }
    if (address.pincode.length !== 6) {
      Alert.alert('Invalid Pincode', '6-digit pincode daalo.');
      return false;
    }
    if (address.phone.replace(/\D/g, '').length !== 10) {
      Alert.alert('Invalid Phone', '10-digit phone number daalo.');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateAddress()) return;
    if (!user || user.uid === 'guest') {
      Alert.alert('Login Required', 'Card order ke liye pehle login karo.');
      return;
    }

    setLoading(true);
    try {
      const plan = PLANS.find((p) => p.type === selectedPlan)!;
      const orderData = await createOrder(selectedPlan, {
        ...address,
        phone: address.phone.replace(/\D/g, ''),
      });

      const paymentData = await openRazorpayCheckout({
        amountPaise: orderData.amount,
        razorpayOrderId: orderData.razorpayOrderId,
        description: `KavachSaathi ${plan.name}`,
        name: address.name,
        email: user.email || '',
        contact: address.phone.replace(/\D/g, ''),
      });

      const result = await confirmPayment({
        orderId: orderData.orderId,
        razorpayPaymentId: paymentData.razorpay_payment_id,
        razorpaySignature: paymentData.razorpay_signature,
      });

      if (result.success) {
        navigation.replace('CardOrderSuccess', {
          cardId: result.cardId,
          qrToken: result.qrToken,
          orderId: orderData.orderId,
          plan: plan.name,
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      if (message !== 'PAYMENT_CANCELLED') {
        Alert.alert('Payment Failed', message);
      }
    } finally {
      setLoading(false);
    }
  };

  const fields: { key: AddressKey; placeholder: string; keyboard: 'default' | 'phone-pad' | 'numeric' }[] = [
    { key: 'name', placeholder: 'Full Name *', keyboard: 'default' },
    { key: 'phone', placeholder: 'Phone Number *', keyboard: 'phone-pad' },
    { key: 'line1', placeholder: 'Address Line 1 *', keyboard: 'default' },
    { key: 'line2', placeholder: 'Address Line 2', keyboard: 'default' },
    { key: 'city', placeholder: 'City *', keyboard: 'default' },
    { key: 'state', placeholder: 'State *', keyboard: 'default' },
    { key: 'pincode', placeholder: '6-digit Pincode *', keyboard: 'numeric' },
  ];

  return (
    <ScreenTransition type="slideUp">
      <AnimatedBackground variant="light">
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <AnimatedEntry>
              <ScreenHeader title="Get Your Card" style={{ paddingHorizontal: 0 }} />
              <Text style={styles.subtitle}>
                Plan choose karo — digital card turant milta hai
              </Text>
            </AnimatedEntry>

            {PLANS.map((plan, idx) => (
              <AnimatedEntry key={plan.type} delay={60 + idx * 40}>
                <PressableScale onPress={() => setSelectedPlan(plan.type)}>
                  <GlassCard
                    glowColor={selectedPlan === plan.type ? plan.color : undefined}
                    style={
                      selectedPlan === plan.type
                        ? { ...styles.planCard, borderColor: plan.color, borderWidth: 2 }
                        : styles.planCard
                    }
                  >
                    <View style={styles.planHeader}>
                      <View>
                        <Text style={styles.planName}>{plan.name}</Text>
                        <Text style={styles.planPrice}>
                          ₹{plan.price}
                          <Text style={styles.planYear}>/year</Text>
                        </Text>
                      </View>
                      <View style={[styles.planTag, { backgroundColor: plan.color + '33' }]}>
                        <Text style={[styles.planTagText, { color: plan.color }]}>
                          {plan.tag}
                        </Text>
                      </View>
                    </View>
                    {plan.features.map((f) => (
                      <Text key={f} style={styles.feature}>
                        ✓  {f}
                      </Text>
                    ))}
                    {selectedPlan === plan.type ? (
                      <View style={[styles.selectedBadge, { backgroundColor: plan.color }]}>
                        <Text style={styles.selectedText}>SELECTED</Text>
                      </View>
                    ) : null}
                  </GlassCard>
                </PressableScale>
              </AnimatedEntry>
            ))}

            <Text style={styles.sectionTitle}>Delivery Address</Text>
            {fields.map((field) => (
              <TextInput
                key={field.key}
                style={styles.input}
                placeholder={field.placeholder}
                placeholderTextColor={colors.gray500}
                keyboardType={field.keyboard}
                value={address[field.key]}
                onChangeText={(v) => setAddress((prev) => ({ ...prev, [field.key]: v }))}
                maxLength={
                  field.key === 'pincode' ? 6 : field.key === 'phone' ? 10 : undefined
                }
                autoCapitalize={field.key === 'name' ? 'words' : 'sentences'}
              />
            ))}

            <View style={{ marginVertical: spacing.lg }}>
              <NeonButton
                label={
                  loading
                    ? 'Processing...'
                    : `Pay ₹${PLANS.find((p) => p.type === selectedPlan)!.price} with Razorpay`
                }
                onPress={() => void handlePayment()}
                color="#FF5722"
                size="lg"
                disabled={loading}
                loading={loading}
              />
            </View>

            <Text style={styles.secureNote}>
              100% Secure · Razorpay · UPI / Cards / NetBanking
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      </AnimatedBackground>
    </ScreenTransition>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  back: {
    color: colors.teal,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.white,
    fontFamily: fonts.heading,
    fontSize: 30,
  },
  subtitle: {
    color: colors.gray500,
    fontFamily: fonts.body,
    fontSize: 14,
    marginBottom: spacing.lg,
    marginTop: spacing.xs,
  },
  planCard: {
    marginBottom: spacing.md,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  planName: {
    color: colors.white,
    fontFamily: fonts.heading,
    fontSize: 18,
  },
  planPrice: {
    color: colors.orange,
    fontFamily: fonts.heading,
    fontSize: 28,
  },
  planYear: {
    color: colors.gray500,
    fontFamily: fonts.body,
    fontSize: 14,
  },
  planTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  planTagText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 1,
  },
  feature: {
    color: colors.gray300,
    fontFamily: fonts.body,
    fontSize: 13,
    marginTop: 4,
  },
  selectedBadge: {
    marginTop: spacing.sm,
    borderRadius: radius.sm,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  selectedText: {
    color: colors.navy,
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 1,
  },
  sectionTitle: {
    color: colors.white,
    fontFamily: fonts.heading,
    fontSize: 20,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    color: colors.white,
    fontFamily: fonts.body,
    fontSize: 15,
  },
  secureNote: {
    color: colors.gray500,
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 12,
    marginBottom: spacing.xl,
  },
});
