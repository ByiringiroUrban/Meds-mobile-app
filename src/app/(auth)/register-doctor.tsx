// Doctor Registration with Credentials (SRS FR-1.6)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { THEME, SupportedCountry, getCountryConfig } from '../../constants/theme';
import { authService } from '../../services/api';
import { CountryChips } from '../../components/ui/CountryChips';
import { useCountry, useLocaleStore } from '../../stores/localeStore';
import { InputField } from '../../components/ui/InputField';
import { Button } from '../../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterDoctorScreen() {
  const country = useCountry();
  const setCountry = useLocaleStore((state) => state.setCountry);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(country.phonePrefix);
  const [password, setPassword] = useState('');
  const [specialty, setSpecialty] = useState('General Medicine');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [experienceYears, setExperienceYears] = useState('5');
  const [coverageLocations, setCoverageLocations] = useState<string[]>([]);
  const [locationDraft, setLocationDraft] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCountryChange = (code: SupportedCountry) => {
    setCountry(code);
    const next = getCountryConfig(code);
    setCoverageLocations([]);
    if (!phone.trim() || phone.trim().length <= 6) setPhone(next.phonePrefix);
  };

  const removeCoverageLocation = (location: string) => {
    setCoverageLocations(coverageLocations.filter((d) => d !== location));
  };

  const addCoverageLocation = () => {
    const next = locationDraft.trim();
    if (!next) return;
    const alreadySelected = coverageLocations.some((d) => d.toLowerCase() === next.toLowerCase());
    if (!alreadySelected) setCoverageLocations([...coverageLocations, next]);
    setLocationDraft('');
  };

  const handleRegister = async () => {
    if (!name.trim()) return setErrorMsg('Doctor full name is required.');
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim()))
      return setErrorMsg('Enter a valid work email — we send your code there.');
    if (password.length < 8)
      return setErrorMsg('Password must be at least 8 characters.');
    if (!licenseNumber.trim())
      return setErrorMsg(`${country.regulatoryBody} license number is required.`);
    if (coverageLocations.length === 0)
      return setErrorMsg('Please add at least one coverage location.');

    setErrorMsg('');
    setLoading(true);
    try {
      const challenge = await authService.registerDoctor({
        name: name.trim().startsWith('Dr.') ? name.trim() : `Dr. ${name.trim()}`,
        email: email.trim(),
        phone: phone.trim(),
        password,
        specialty,
        licenseNumber: licenseNumber.trim(),
        qualifications: qualifications.split(',').map((q) => q.trim()).filter(Boolean),
        experienceYears: parseInt(experienceYears, 10) || 1,
        coverageDistricts: coverageLocations,
        country: country.code,
      });

      router.push({
        pathname: '/(auth)/otp-verification',
        params: {
          userId: challenge.userId,
          destination: challenge.destination || email.trim(),
          role: 'doctor',
        },
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Doctor onboarding failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Join as a Doctor</Text>
        <Text style={styles.subtitle}>
          Home visits across {country.name}. We check your license before you go live.
        </Text>
      </View>

      <CountryChips value={country.code} onChange={handleCountryChange} label="Country of Practice" />

      {errorMsg ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}

      <InputField
        label="Doctor Full Name"
        placeholder="e.g. Dr. Eric Kayitare"
        value={name}
        onChangeText={setName}
      />

      <InputField
        label="Medical Specialty"
        placeholder="e.g. General Medicine, Pediatrics, Cardiology"
        value={specialty}
        onChangeText={setSpecialty}
      />

      <InputField
        label={`${country.regulatorShort} License No.`}
        placeholder={`e.g. ${country.licenseExample}`}
        value={licenseNumber}
        onChangeText={setLicenseNumber}
      />

      <InputField
        label="Qualifications & Degrees"
        placeholder="e.g. MBBS, M.Med Pediatrics (comma separated)"
        value={qualifications}
        onChangeText={setQualifications}
      />

      <InputField
        label="Years of Clinical Experience"
        placeholder="e.g. 8"
        value={experienceYears}
        onChangeText={setExperienceYears}
        keyboardType="numeric"
      />

      <InputField
        label="Contact Phone"
        placeholder={country.phonePlaceholder}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <InputField
        label="Work Email"
        placeholder={`doctor@example.${country.code.toLowerCase()}`}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        hint="We email your verification code here"
      />

      <InputField
        label="Password"
        placeholder="Create a secure password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        hint="Minimum 8 characters"
      />

      {/* Coverage Locations (typed by the doctor) */}
      <View style={styles.coverageSection}>
        <Text style={styles.sectionLabel}>Coverage Locations</Text>

        {coverageLocations.length > 0 && (
          <View style={styles.coverageChips}>
            {coverageLocations.map((d) => (
              <Pressable
                key={d}
                onPress={() => removeCoverageLocation(d)}
                style={[styles.coverageChip, styles.coverageChipActive]}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${d}`}
              >
                <View style={styles.coverageChipInner}>
                  <Ionicons name="location" size={14} color={THEME.colors.dark} style={{ marginRight: 4 }} />
                  <Text style={[styles.coverageChipText, styles.coverageChipTextActive]}>{d}</Text>
                  <Ionicons name="close" size={14} color={THEME.colors.dark} style={{ marginLeft: 4 }} />
                </View>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.coverageInputRow}>
          <InputField
            label="Add your coverage location"
            placeholder="e.g. Gasabo, Bugesera, Nyamirambo"
            value={locationDraft}
            onChangeText={setLocationDraft}
            onSubmitEditing={addCoverageLocation}
            returnKeyType="done"
            autoCapitalize="words"
            containerStyle={styles.coverageInput}
          />
          <Pressable
            onPress={addCoverageLocation}
            disabled={!locationDraft.trim()}
            style={[styles.addLocationBtn, !locationDraft.trim() && styles.addLocationBtnDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Add coverage location"
          >
            <Ionicons name="add" size={16} color={THEME.colors.dark} />
            <Text style={styles.addLocationText}>Add</Text>
          </Pressable>
        </View>

        <Text style={styles.coverageHint}>
          Add the districts, towns or neighbourhoods you can visit. Tap one to remove it.
        </Text>
      </View>

      <Button
        title="Submit for Review"
        onPress={handleRegister}
        loading={loading}
        size="lg"
        style={styles.submitBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: THEME.spacing.base,
    backgroundColor: THEME.colors.background,
    flexGrow: 1,
  },
  header: {
    marginBottom: THEME.spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  errorBox: {
    backgroundColor: THEME.colors.errorSoft,
    padding: 12,
    borderRadius: THEME.borderRadius.sm,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: THEME.colors.error,
    fontSize: 13,
    fontWeight: '600',
  },
  coverageSection: {
    marginBottom: THEME.spacing.lg,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
    marginBottom: 8,
  },
  coverageChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  coverageHint: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 6,
    lineHeight: 16,
  },
  coverageInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  coverageInput: {
    flex: 1,
    marginBottom: 0,
  },
  addLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.primary,
    borderWidth: 1,
    borderColor: THEME.colors.primary,
  },
  addLocationBtnDisabled: {
    opacity: 0.45,
  },
  addLocationText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.dark,
  },
  coverageChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.surface,
  },
  coverageChipInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coverageChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  coverageChipText: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
  },
  coverageChipTextActive: {
    color: THEME.colors.dark,
    fontWeight: '700',
  },
  submitBtn: {
    marginTop: THEME.spacing.sm,
    marginBottom: THEME.spacing.xxl,
  },
});
