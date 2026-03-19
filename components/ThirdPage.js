import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { t } from './i18n';

const opLabel = (operationMode) => {
  if (operationMode === 'all') return t('Tüm işlemler', 'All operations');
  if (operationMode === 'add') return t('Toplama', 'Addition');
  if (operationMode === 'sub') return t('Çıkarma', 'Subtraction');
  if (operationMode === 'mul') return t('Çarpma', 'Multiplication');
  return t('Bölme', 'Division');
};
const difficultyLabel = (difficulty) => difficulty === 'Easy' ? t('Kolay', 'Easy') : difficulty === 'Medium' ? t('Orta', 'Medium') : t('Zor', 'Hard');
const resultTone = (result) => result.score >= result.highScore && result.score > 0
  ? { title: t('Yeni rekor!', 'New record!'), subtitle: t('Bugün tempo gerçekten yüksekti.', 'That was a seriously strong run.'), color: '#2f9e44', bg: '#eefbea', ring: '#2f9e44' }
  : result.correctCount >= result.wrongCount
    ? { title: t('Gayet iyi tur.', 'Nice round.'), subtitle: t('Bir sonraki turda seriyi daha da uzatabilirsin.', 'You can stretch that streak even further next round.'), color: '#e67700', bg: '#fff1e3', ring: '#f08c00' }
    : { title: t('Bir tur daha atalım.', 'Let us go one more round.'), subtitle: t('Modu koru, ritim birazdan oturur.', 'Keep the mode, the rhythm will click soon.'), color: '#e03131', bg: '#fff1f0', ring: '#e03131' };

const TopBar = ({ title, onBack }) => (
  <View style={styles.topBar}>
    <Pressable style={styles.backButton} onPress={onBack}><Text style={styles.backIcon}>‹</Text></Pressable>
    <Text style={styles.topBarTitle}>{title}</Text>
    <View style={styles.backSpacer} />
  </View>
);

const ThirdPage = ({ route, navigation }) => {
  const result = route?.params?.result;
  if (!result) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>{t('Sonuç bulunamadı', 'Result not found')}</Text>
          <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('FirstPage')}><Text style={styles.primaryButtonText}>{t('Ana menüye dön', 'Back to home')}</Text></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const tone = resultTone(result);
  const accuracyBase = result.correctCount + result.wrongCount;
  const accuracy = accuracyBase === 0 ? 0 : Math.round((result.correctCount / accuracyBase) * 100);
  const statCards = [
    { label: t('Skor', 'Score'), value: result.score, accent: '#ff922b', tint: '#fff1e3' },
    { label: t('Doğruluk', 'Accuracy'), value: `%${accuracy}`, accent: '#f08c00', tint: '#fff3e8' },
    { label: t('En iyi seri', 'Best streak'), value: result.bestStreak, accent: '#ff6b35', tint: '#ffe8df' },
    { label: t('Yanlış', 'Wrong'), value: result.wrongCount, accent: '#fa5252', tint: '#fff1f0' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <TopBar title={t('Tur Özeti', 'Round Summary')} onBack={() => navigation.navigate('FirstPage')} />
      <ScrollView contentContainerStyle={styles.scrollWrap} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: tone.bg }]}>
          <View style={[styles.scoreOrb, { borderColor: tone.ring }]}>
            <Text style={styles.scoreOrbValue}>{result.score}</Text>
            <Text style={styles.scoreOrbLabel}>{t('puan', 'score')}</Text>
          </View>
          <Text style={[styles.heroTitle, { color: tone.color }]}>{tone.title}</Text>
          <Text style={styles.heroSubtitle}>{tone.subtitle}</Text>
        </View>

        <View style={styles.statsGrid}>
          {statCards.map((item) => (
            <View key={item.label} style={[styles.statCard, { backgroundColor: item.tint }]}>
              <View style={[styles.statAccent, { backgroundColor: item.accent }]} />
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{t('Tur özeti', 'Round summary')}</Text>
          <View style={styles.summaryRow}><Text style={styles.summaryKey}>{t('Zorluk', 'Difficulty')}</Text><Text style={styles.summaryValue}>{difficultyLabel(result.difficulty)}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryKey}>{t('Mod', 'Mode')}</Text><Text style={styles.summaryValue}>{opLabel(result.operationMode)}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryKey}>{t('Süre', 'Duration')}</Text><Text style={styles.summaryValue}>{result.duration === 0 ? t('Sonsuz pratik', 'Endless practice') : `${result.duration} ${t('sn', 'sec')}`}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryKey}>{t('Rekor', 'High score')}</Text><Text style={styles.summaryValue}>{result.highScore}</Text></View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{t('Yanlışlar', 'Mistakes')}</Text>
          {result.wrongQuestions.length === 0 ? (
            <View style={styles.perfectPill}><Text style={styles.perfectText}>{t('Harika, bu tur yanlış yok.', 'Nice job, no mistakes this round.')}</Text></View>
          ) : (
            result.wrongQuestions.map((q, idx) => (<View key={`${q}-${idx}`} style={styles.wrongCard}><Text style={styles.wrongIndex}>#{idx + 1}</Text><Text style={styles.wrongText}>{q}</Text></View>))
          )}
        </View>

        <Pressable style={styles.primaryButton} onPress={() => navigation.replace('SecondPage', { difficulty: result.difficulty, operationMode: result.operationMode, duration: result.duration })}><Text style={styles.primaryButtonText}>{t('Aynı ayarla tekrar oyna', 'Play again with same settings')}</Text></Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('FirstPage')}><Text style={styles.secondaryButtonText}>{t('Ana menüye dön', 'Back to home')}</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff7f0' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#e85d2a', paddingHorizontal: 14, paddingVertical: 12, paddingTop: 18 },
  backButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,250,245,0.2)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: '#fffaf5', fontSize: 34, lineHeight: 34, marginTop: -2 },
  backSpacer: { width: 42, height: 42 },
  topBarTitle: { color: '#fffaf5', fontSize: 22, fontWeight: '900' },
  scrollWrap: { padding: 20, paddingBottom: 30 },
  heroCard: { borderRadius: 30, padding: 22, alignItems: 'center', marginBottom: 18 },
  scoreOrb: { width: 132, height: 132, borderRadius: 66, backgroundColor: '#fffaf5', borderWidth: 6, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  scoreOrbValue: { fontSize: 34, fontWeight: '900', color: '#7c2d12' },
  scoreOrbLabel: { fontSize: 13, fontWeight: '800', color: '#9a745d', marginTop: 2 },
  heroTitle: { fontSize: 28, fontWeight: '900', marginBottom: 6, textAlign: 'center' },
  heroSubtitle: { fontSize: 15, lineHeight: 22, color: '#8c6b58', textAlign: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 18 },
  statCard: { width: '48%', borderRadius: 22, padding: 16, marginBottom: 12 },
  statAccent: { width: 36, height: 6, borderRadius: 999, marginBottom: 12 },
  statValue: { fontSize: 28, fontWeight: '900', color: '#7c2d12', marginBottom: 4 },
  statLabel: { fontSize: 13, color: '#a07a62' },
  summaryCard: { backgroundColor: '#fffaf5', borderRadius: 24, padding: 18, marginBottom: 16 },
  summaryTitle: { fontSize: 20, fontWeight: '800', color: '#7c2d12', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f4dfcf' },
  summaryKey: { fontSize: 15, color: '#9a745d' },
  summaryValue: { fontSize: 15, color: '#7c2d12', fontWeight: '700' },
  perfectPill: { backgroundColor: '#eefbea', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 14 },
  perfectText: { color: '#2f9e44', fontWeight: '800' },
  wrongCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff1f0', borderRadius: 16, padding: 12, marginBottom: 10 },
  wrongIndex: { width: 36, fontSize: 13, fontWeight: '800', color: '#e03131' },
  wrongText: { flex: 1, fontSize: 15, color: '#7c2d12', lineHeight: 20 },
  primaryButton: { backgroundColor: '#e85d2a', borderRadius: 20, paddingVertical: 17, alignItems: 'center', marginTop: 6 },
  primaryButtonText: { color: '#fffaf5', fontSize: 16, fontWeight: '800' },
  secondaryButton: { backgroundColor: '#fff1e8', borderRadius: 20, paddingVertical: 17, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#f0cbb1' },
  secondaryButtonText: { color: '#a44d21', fontSize: 16, fontWeight: '800' },
  emptyCard: { margin: 18, marginTop: 48, backgroundColor: '#fffaf5', borderRadius: 24, padding: 18 },
  emptyTitle: { fontSize: 22, fontWeight: '800', marginBottom: 16, textAlign: 'center', color: '#7c2d12' },
});

export default ThirdPage;
