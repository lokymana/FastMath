import React, { useMemo, useState } from 'react';
import {
  Text,
  Pressable,
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { t } from './i18n';

const difficultyData = [
  { value: 'Easy', label: t('Kolay', 'Easy'), accent: '#ff8a3d', ribbon: '#f7c948', ink: '#a61e1e', helper: '1 - 10', cardTint: '#fff0df' },
  { value: 'Medium', label: t('Orta', 'Medium'), accent: '#ff6b35', ribbon: '#f6b73c', ink: '#a61e1e', helper: '1 - 50', cardTint: '#ffe6d6' },
  { value: 'Difficult', label: t('Zor', 'Hard'), accent: '#e6492d', ribbon: '#f08c3a', ink: '#a61e1e', helper: '1 - 200', cardTint: '#ffe0db' },
];

const operationData = [
  { value: 'all', label: t('Karışık', 'Mixed'), symbol: 'mix', accent: '#ffd166', tint: '#fff5db' },
  { value: 'add', label: t('Toplama', 'Addition'), symbol: '+', accent: '#ff8a3d', tint: '#fff0df' },
  { value: 'sub', label: t('Çıkarma', 'Subtraction'), symbol: '-', accent: '#ff6b35', tint: '#ffe8df' },
  { value: 'mul', label: t('Çarpma', 'Multiply'), symbol: 'x', accent: '#f06543', tint: '#ffe4dc' },
  { value: 'div', label: t('Bölme', 'Division'), symbol: '÷', accent: '#e6492d', tint: '#ffe0db' },
];

const durationData = [
  { value: 30, label: t('30 sn', '30 sec') },
  { value: 60, label: t('60 sn', '60 sec') },
  { value: 0, label: t('Sonsuz', 'Endless') },
];

const SectionHeader = ({ badge, title }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionBadge}><Text style={styles.sectionBadgeText}>{badge}</Text></View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

export default function FirstPage({ navigation }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedOperation, setSelectedOperation] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState(60);
  const startDisabled = useMemo(() => !selectedDifficulty, [selectedDifficulty]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.appTitle}>FastMath</Text>
          <Text style={styles.appSubtitle}>{t('Dokun, çöz, devam et', 'Tap, solve, keep going')}</Text>
        </View>

        <SectionHeader badge="01" title={t('Zorluk', 'Difficulty')} />
        <View style={styles.difficultyRow}>
          {difficultyData.map((item) => {
            const selected = selectedDifficulty === item.value;
            return (
              <Pressable key={item.value} onPress={() => setSelectedDifficulty(item.value)} style={[styles.difficultyCard, { backgroundColor: selected ? item.cardTint : '#fffaf6' }, selected && styles.difficultyCardSelected, selected && { borderColor: item.accent }]}>
                <View style={[styles.difficultyPoster, { backgroundColor: selected ? '#f6dfc8' : '#e8f0d8' }]}>
                  <View style={[styles.difficultyRibbon, { backgroundColor: item.ribbon }]}>
                    <Text style={[styles.difficultyPosterLabel, { color: item.ink }]}>{item.label.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={[styles.difficultyHelper, selected && { color: item.accent }]}>{item.helper}</Text>
              </Pressable>
            );
          })}
        </View>

        <SectionHeader badge="02" title={t('İşlem', 'Operation')} />
        <View style={styles.operationGrid}>
          {operationData.map((item) => {
            const selected = selectedOperation === item.value;
            return (
              <Pressable key={item.value} onPress={() => setSelectedOperation(item.value)} style={[styles.operationCard, { backgroundColor: selected ? item.accent : item.tint }, selected && styles.operationCardSelected]}>
                <View style={[styles.operationBadge, { backgroundColor: selected ? '#fff4e6' : '#fffaf5' }]}>
                  {item.symbol === 'mix' ? (
                    <View style={styles.mixBadge}><Text style={styles.mixBadgeText}>Mix</Text></View>
                  ) : (
                    <Text style={[styles.operationSymbol, selected && styles.operationSymbolSelected]}>{item.symbol}</Text>
                  )}
                </View>
                <Text style={[styles.operationLabel, selected && styles.operationLabelSelected]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <SectionHeader badge="03" title={t('Süre', 'Time')} />
        <View style={styles.durationRow}>
          {durationData.map((item, index) => {
            const selected = selectedDuration === item.value;
            const isLast = index === durationData.length - 1;
            return (
              <Pressable key={item.label} onPress={() => setSelectedDuration(item.value)} style={[styles.durationChip, selected && styles.durationChipSelected, isLast && styles.durationChipLast]}>
                <Text style={[styles.durationText, selected && styles.durationTextSelected]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable disabled={startDisabled} onPress={() => navigation.navigate('SecondPage', { difficulty: selectedDifficulty, operationMode: selectedOperation, duration: selectedDuration })} style={[styles.startButton, startDisabled && styles.startButtonDisabled]}>
          <Text style={styles.startButtonText}>{startDisabled ? t('Önce zorluk seç', 'Select difficulty first') : t('Oyuna başla', 'Start game')}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff7f0' },
  container: { padding: 20, paddingBottom: 34 },
  heroCard: { backgroundColor: '#fff1e8', borderRadius: 28, paddingVertical: 22, paddingHorizontal: 20, marginBottom: 22, alignItems: 'center' },
  appTitle: { fontSize: 38, fontWeight: '900', color: '#d9480f', textAlign: 'center', letterSpacing: 0.3 },
  appSubtitle: { fontSize: 16, color: '#b05b34', textAlign: 'center', marginTop: 8, lineHeight: 22 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 2 },
  sectionBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#ffe2d1', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  sectionBadgeText: { fontSize: 11, fontWeight: '900', color: '#d9480f' },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#7c2d12' },
  difficultyRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  difficultyCard: { width: '31%', borderRadius: 24, padding: 10, borderWidth: 2, borderColor: '#f3d6bc', alignItems: 'center' },
  difficultyCardSelected: { transform: [{ translateY: -2 }], shadowColor: '#e85d2a', shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  difficultyPoster: { width: '100%', aspectRatio: 1, borderRadius: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, marginBottom: 10 },
  difficultyRibbon: { width: '100%', borderRadius: 18, minHeight: 58, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  difficultyPosterLabel: { fontSize: 16, fontWeight: '900', letterSpacing: 0.8, textAlign: 'center', includeFontPadding: false },
  difficultyHelper: { fontSize: 13, fontWeight: '700', color: '#8b6b58' },
  operationGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  operationCard: { width: '31%', borderRadius: 20, borderWidth: 1, borderColor: '#f1ccb1', paddingVertical: 16, paddingHorizontal: 8, alignItems: 'center', marginBottom: 12 },
  operationCardSelected: { borderColor: 'transparent' },
  operationBadge: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  mixBadge: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 999, backgroundColor: '#ffd166' },
  mixBadgeText: { fontSize: 11, fontWeight: '900', color: '#8d3b00' },
  operationSymbol: { fontSize: 28, fontWeight: '900', color: '#8d3b00' },
  operationSymbolSelected: { color: '#d9480f' },
  operationLabel: { fontSize: 13, fontWeight: '700', color: '#7a4a2f', textAlign: 'center', lineHeight: 17 },
  operationLabelSelected: { color: '#fffaf5' },
  durationRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 },
  durationChip: { flex: 1, backgroundColor: '#fff3e8', borderRadius: 999, borderWidth: 1, borderColor: '#f1ccb1', paddingVertical: 14, alignItems: 'center', marginRight: 8 },
  durationChipLast: { marginRight: 0 },
  durationChipSelected: { backgroundColor: '#ff6b35', borderColor: '#ff6b35' },
  durationText: { color: '#7a4a2f', fontWeight: '700' },
  durationTextSelected: { color: '#fffaf5' },
  startButton: { backgroundColor: '#e85d2a', borderRadius: 20, paddingVertical: 18, alignItems: 'center' },
  startButtonDisabled: { backgroundColor: '#efb39e' },
  startButtonText: { color: '#fffaf5', fontSize: 18, fontWeight: '800' },
});
