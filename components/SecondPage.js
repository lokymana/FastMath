import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Text, StyleSheet, View, Dimensions, SafeAreaView, Pressable, Alert, Vibration } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { t } from './i18n';

const HIGH_SCORE_KEY = 'fastmath_high_score';
const OP_SYMBOLS = { add: '+', sub: '-', mul: 'x', div: '÷' };
const OP_LABELS = { add: t('Toplama', 'Addition'), sub: t('Çıkarma', 'Subtraction'), mul: t('Çarpma', 'Multiplication'), div: t('Bölme', 'Division') };
const palette = { bg: '#fff7f0', card: '#fff2e8', border: '#f3d6bc', text: '#7c2d12', muted: '#a26d4d', accent: '#e85d2a', accentSoft: '#ffe2d1', green: '#2f9e44', red: '#e03131', answer: '#f08c00' };

const getBaseMax = (difficulty) => difficulty === 'Easy' ? 10 : difficulty === 'Medium' ? 50 : 200;
const getOps = (operationMode) => operationMode === 'all' ? ['add', 'sub', 'mul', 'div'] : [operationMode];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const durationLabel = (duration) => duration === 0 ? t('Sonsuz pratik', 'Endless practice') : `${duration} ${t('sn', 'sec')}`;

const generateQuestion = ({ difficulty, operationMode, streak }) => {
  const baseMax = getBaseMax(difficulty);
  const dynamicMax = Math.min(baseMax + streak * (difficulty === 'Easy' ? 2 : 4), baseMax * 3);
  const ops = getOps(operationMode);
  const op = ops[randomInt(0, ops.length - 1)];
  let a = 1; let b = 1; let correct = 0;
  if (op === 'add') { a = randomInt(1, dynamicMax); b = randomInt(1, dynamicMax); correct = a + b; }
  else if (op === 'sub') { a = randomInt(1, dynamicMax); b = randomInt(1, dynamicMax); if (b > a) [a, b] = [b, a]; correct = a - b; }
  else if (op === 'mul') { const mulMax = Math.max(5, Math.floor(dynamicMax / 2)); a = randomInt(1, mulMax); b = randomInt(1, mulMax); correct = a * b; }
  else { b = randomInt(1, Math.max(2, Math.floor(dynamicMax / 2))); correct = randomInt(1, Math.max(2, Math.floor(dynamicMax / 2))); a = b * correct; }
  let delta = difficulty === 'Easy' ? randomInt(-2, 2) : randomInt(-5, 5); if (delta === 0) delta = 1;
  const fake = correct + delta;
  const correctSide = randomInt(0, 1) === 0 ? 'left' : 'right';
  return { a, b, op, correct, left: correctSide === 'left' ? correct : fake, right: correctSide === 'right' ? correct : fake, correctSide };
};

const TopBar = ({ title, onBack }) => (
  <View style={styles.topBar}>
    <Pressable style={styles.backButton} onPress={onBack}><Text style={styles.backIcon}>‹</Text></Pressable>
    <Text style={styles.topBarTitle}>{title}</Text>
    <View style={styles.backSpacer} />
  </View>
);

const SecondPage = ({ route, navigation }) => {
  const difficulty = route?.params?.difficulty ?? 'Easy';
  const operationMode = route?.params?.operationMode ?? 'all';
  const configuredDuration = route?.params?.duration ?? 60;
  const [question, setQuestion] = useState(() => generateQuestion({ difficulty, operationMode, streak: 0 }));
  const [timeLeft, setTimeLeft] = useState(configuredDuration);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [wrongQuestions, setWrongQuestions] = useState([]);
  const isEndedRef = useRef(false);
  const isInfinite = configuredDuration === 0;

  useEffect(() => {
    let mounted = true;
    const loadState = async () => {
      try {
        const stored = await AsyncStorage.getItem(HIGH_SCORE_KEY);
        if (mounted && stored) setHighScore(Number(stored) || 0);
      } catch (_err) {}
    };
    loadState().catch(() => {});
    return () => { mounted = false; };
  }, []);

  const finishGame = useCallback(async () => {
    if (isEndedRef.current) return;
    isEndedRef.current = true;
    let nextHighScore = highScore;
    try {
      if (score > highScore) {
        nextHighScore = score;
        setHighScore(score);
        await AsyncStorage.setItem(HIGH_SCORE_KEY, String(score));
      }
    } catch (_err) {
      nextHighScore = score > highScore ? score : highScore;
    }
    navigation.replace('ThirdPage', { result: { score, correctCount, wrongCount, bestStreak, highScore: nextHighScore, difficulty, operationMode, duration: configuredDuration, wrongQuestions } });
  }, [bestStreak, configuredDuration, correctCount, difficulty, highScore, navigation, operationMode, score, wrongCount, wrongQuestions]);

  useEffect(() => {
    if (isInfinite) return undefined;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isInfinite]);

  useEffect(() => {
    if (isInfinite || timeLeft > 0) return;
    finishGame().catch(() => {});
  }, [finishGame, isInfinite, timeLeft]);

  const modeText = useMemo(() => {
    const opText = operationMode === 'all' ? t('Tüm işlemler', 'All operations') : OP_LABELS[operationMode];
    return `${opText} | ${durationLabel(configuredDuration)}`;
  }, [configuredDuration, operationMode]);

  const playFeedback = useCallback((isCorrect) => {
    if (isCorrect) return Vibration.vibrate(35);
    Vibration.vibrate([0, 70, 40, 70]);
  }, []);

  const handleAnswer = (selectedSide) => {
    const isCorrect = selectedSide === question.correctSide;
    playFeedback(isCorrect);
    if (isCorrect) {
      const nextStreak = streak + 1;
      setCorrectCount((prev) => prev + 1);
      setStreak(nextStreak);
      setBestStreak((prev) => (nextStreak > prev ? nextStreak : prev));
      setScore((prev) => prev + 10 + streak * 2);
      setQuestion(generateQuestion({ difficulty, operationMode, streak: nextStreak }));
      return;
    }
    setWrongCount((prev) => prev + 1);
    setStreak(0);
    setWrongQuestions((prev) => [...prev, `${question.a} ${OP_SYMBOLS[question.op]} ${question.b} = ${question.correct}`]);
    setQuestion(generateQuestion({ difficulty, operationMode, streak: 0 }));
  };

  const stopAndShow = () => Alert.alert(t('Oyunu bitir', 'End game'), t('Bu tur sonlandırılsın mı?', 'Do you want to finish this round?'), [
    { text: t('Devam et', 'Keep playing'), style: 'cancel' },
    { text: t('Bitir', 'Finish'), onPress: () => finishGame().catch(() => {}) },
  ]);

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar title={t('Oyun', 'Game')} onBack={() => navigation.navigate('FirstPage')} />
      <View style={styles.container}>
        <View style={styles.topCard}>
          <Text style={styles.modeText}>{modeText}</Text>
          <View style={styles.scoreRow}>
            <View style={styles.statPill}><Text style={styles.statLabel}>{t('Skor', 'Score')}</Text><Text style={styles.statValue}>{score}</Text></View>
            <View style={styles.statPill}><Text style={styles.statLabel}>{t('Yanlış', 'Wrong')}</Text><Text style={styles.statValue}>{wrongCount}</Text></View>
            <View style={styles.statPill}><Text style={styles.statLabel}>{t('Seri', 'Streak')}</Text><Text style={styles.statValue}>{streak}</Text></View>
            <View style={styles.statPill}><Text style={styles.statLabel}>{t('Rekor', 'Best')}</Text><Text style={styles.statValue}>{highScore}</Text></View>
          </View>
        </View>
        <View style={styles.questionCard}>
          <View style={styles.questionRow}><Text style={styles.numberText}>{question.a}</Text><View style={styles.opBox}><Text style={styles.opText}>{OP_SYMBOLS[question.op]}</Text></View><Text style={styles.numberText}>{question.b}</Text></View>
          <View style={styles.timerWrap}><Text style={styles.timerText}>{isInfinite ? t('Sonsuz pratik', 'Endless practice') : `${t('Kalan', 'Left')}: ${timeLeft}`}</Text></View>
        </View>
        <Text style={styles.answerTitle}>{t('Doğru cevabı seç', 'Pick the correct answer')}</Text>
        <View style={styles.answersRow}>
          <Pressable style={styles.answerBtn} onPress={() => handleAnswer('left')}><Text style={styles.answerSide}>{t('Sol', 'Left')}</Text><Text style={styles.answerText}>{question.left}</Text></Pressable>
          <Pressable style={styles.answerBtn} onPress={() => handleAnswer('right')}><Text style={styles.answerSide}>{t('Sağ', 'Right')}</Text><Text style={styles.answerText}>{question.right}</Text></Pressable>
        </View>
        <View style={styles.footerStats}><Text style={styles.correctText}>{t('Doğru', 'Correct')}: {correctCount}</Text><Text style={styles.wrongText}>{t('Yanlış', 'Wrong')}: {wrongCount}</Text><Text style={styles.streakText}>{t('En iyi seri', 'Best streak')}: {bestStreak}</Text></View>
        <Pressable style={styles.endBtn} onPress={stopAndShow}><Text style={styles.endBtnText}>{t('Turu bitir', 'End round')}</Text></Pressable>
      </View>
    </SafeAreaView>
  );
};

const size = Dimensions.get('window').width * 0.36;
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: palette.accent, paddingHorizontal: 14, paddingVertical: 12 },
  backButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,250,245,0.2)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: '#fffaf5', fontSize: 34, lineHeight: 34, marginTop: -2 },
  backSpacer: { width: 42, height: 42 },
  topBarTitle: { color: '#fffaf5', fontSize: 24, fontWeight: '900' },
  container: { flex: 1, backgroundColor: palette.bg, alignItems: 'center', justifyContent: 'center', padding: 18 },
  topCard: { width: '100%', backgroundColor: palette.card, borderRadius: 28, padding: 18, marginBottom: 16 },
  modeText: { fontSize: 18, fontWeight: '800', color: palette.text, textAlign: 'center', marginBottom: 14 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statPill: { flex: 1, backgroundColor: '#fffaf5', borderRadius: 18, paddingVertical: 10, marginHorizontal: 3, alignItems: 'center' },
  statLabel: { fontSize: 11, color: palette.muted, fontWeight: '700' },
  statValue: { fontSize: 20, color: palette.text, fontWeight: '900', marginTop: 4 },
  questionCard: { width: '100%', backgroundColor: '#fffaf5', borderRadius: 32, paddingVertical: 24, paddingHorizontal: 18, alignItems: 'center', marginBottom: 18, borderWidth: 1, borderColor: palette.border },
  questionRow: { width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
  numberText: { fontSize: 52, fontWeight: '900', color: palette.text, marginHorizontal: 12 },
  opBox: { width: 60, height: 60, borderRadius: 30, backgroundColor: palette.accent, alignItems: 'center', justifyContent: 'center', shadowColor: '#e85d2a', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  opText: { color: '#fffaf5', fontSize: 29, fontWeight: '900' },
  timerWrap: { backgroundColor: palette.accentSoft, borderRadius: 999, paddingHorizontal: 18, paddingVertical: 10 },
  timerText: { fontSize: 18, fontWeight: '800', color: palette.text },
  answerTitle: { fontSize: 18, fontWeight: '800', color: palette.text, marginBottom: 16 },
  answersRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-around', marginBottom: 22 },
  answerBtn: { borderRadius: 30, width: size, height: size + 14, backgroundColor: palette.answer, justifyContent: 'center', alignItems: 'center', shadowColor: '#f08c00', shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  answerSide: { fontSize: 13, fontWeight: '800', color: '#ffe8d1', marginBottom: 8 },
  answerText: { fontSize: 36, textAlign: 'center', fontWeight: '900', color: '#fffaf5' },
  footerStats: { alignItems: 'center', marginBottom: 20 },
  correctText: { marginTop: 8, fontSize: 21, color: palette.green, fontWeight: '800' },
  wrongText: { marginTop: 8, fontSize: 21, color: palette.red, fontWeight: '800' },
  streakText: { marginTop: 8, fontSize: 18, color: palette.muted, fontWeight: '700' },
  endBtn: { backgroundColor: palette.accent, borderRadius: 20, paddingHorizontal: 28, paddingVertical: 15 },
  endBtnText: { color: '#fffaf5', fontWeight: '800', fontSize: 16 },
});

export default SecondPage;
