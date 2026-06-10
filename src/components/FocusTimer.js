import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Dimensions,
    Platform,
    Alert,
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { useAudioPlayer } from 'expo-audio';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const AMBIENT_SOUNDS = {
    none: { name: 'Silence', url: null },
    rain: { name: 'Gentle Rain', url: 'https://www.soundjay.com/nature/sounds/rain-07.mp3' },
    ocean: { name: 'Ocean Waves', url: 'https://www.soundjay.com/nature/sounds/ocean-wave-1.mp3' },
    river: { name: 'Forest Stream', url: 'https://www.soundjay.com/nature/sounds/river-1.mp3' }
};

const radius = 90;
const strokeWidth = 8;

export default function FocusTimer({ visible, onClose, todo, onFocusComplete }) {
    const { theme } = useTheme();

    const [isFocus, setIsFocus] = useState(true); // true = Focus, false = Break
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 mins in seconds
    const [isActive, setIsActive] = useState(false);
    const [soundType, setSoundType] = useState('none');

    const intervalRef = useRef(null);
    const player = useAudioPlayer();

    const initialTime = isFocus ? 25 * 60 : 5 * 60;
    const progress = ((initialTime - timeLeft) / initialTime) * 100;

    // Radius & Circumference for SVG Progress Circle
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    // Timer Interval logic
    useEffect(() => {
        if (isActive) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current);
                        handleSessionEnd();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }

        return () => clearInterval(intervalRef.current);
    }, [isActive, isFocus]);

    // Handle session end (Focus or Break)
    const handleSessionEnd = () => {
        setIsActive(false);
        if (isFocus) {
            onFocusComplete(todo.id);
            Alert.alert(
                "Focus Complete! 🍅",
                "Great job focusing! Ready for a 5-minute break?",
                [
                    { text: "Start Break", onPress: () => startBreak() },
                    { text: "Dismiss", style: "cancel" }
                ]
            );
        } else {
            Alert.alert(
                "Break Over! ⚡",
                "Break finished. Ready to focus again?",
                [
                    { text: "Start Focus", onPress: () => startFocus() },
                    { text: "Dismiss", style: "cancel" }
                ]
            );
        }
    };

    const startBreak = () => {
        setIsFocus(false);
        setTimeLeft(5 * 60);
        setIsActive(true);
    };

    const startFocus = () => {
        setIsFocus(true);
        setTimeLeft(25 * 60);
        setIsActive(true);
    };

    // Sound Management
    useEffect(() => {
        const soundConfig = AMBIENT_SOUNDS[soundType];
        if (soundConfig.url && isActive) {
            try {
                player.replace({ uri: soundConfig.url });
                player.loop = true;
                player.volume = 0.6;
                player.play();
            } catch (e) {
                console.warn("Failed to load ambient audio", e);
            }
        } else {
            player.pause();
        }
    }, [soundType, isActive]);

    const handlePlayPause = () => {
        setIsActive(!isActive);
    };

    const handleSkip = () => {
        setIsActive(false);
        if (isFocus) {
            startBreak();
        } else {
            startFocus();
        }
    };

    const handleReset = () => {
        setIsActive(false);
        setTimeLeft(initialTime);
    };

    const handleClose = () => {
        setIsActive(false);
        player.pause();
        onClose();
    };

    // Format seconds to MM:SS
    const formatTime = (secs) => {
        const mins = Math.floor(secs / 60);
        const remainingSecs = secs % 60;
        return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
    };

    return (
        <Modal
            animationType="fade"
            transparent={false}
            visible={visible}
            onRequestClose={handleClose}
        >
            <LinearGradient
                colors={['#0F0A1C', '#040108']}
                style={styles.flex}
            >
                {/* Header Row */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleClose} style={[styles.closeBtn, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                        <Ionicons name="close" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Focus Session</Text>
                    <View style={styles.headerSpacer} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    {/* Task Title */}
                    <View style={styles.taskCard}>
                        <Text style={styles.taskLabel}>FOCUSING ON</Text>
                        <Text style={styles.taskText}>{todo?.text}</Text>
                    </View>

                    {/* Circular Svg Progress Timer */}
                    <View style={styles.timerContainer}>
                        {/* Glow effect */}
                        <View style={[styles.glowOrb, { backgroundColor: isFocus ? theme.primary : theme.accent }]} />

                        <Svg width={radius * 2 + strokeWidth * 2} height={radius * 2 + strokeWidth * 2} style={styles.svg}>
                            {/* Track Circle */}
                            <Circle
                                cx={radius + strokeWidth}
                                cy={radius + strokeWidth}
                                r={radius}
                                stroke="rgba(255,255,255,0.04)"
                                strokeWidth={strokeWidth}
                                fill="transparent"
                            />
                            {/* Progress Circle */}
                            <Circle
                                cx={radius + strokeWidth}
                                cy={radius + strokeWidth}
                                r={radius}
                                stroke={isFocus ? theme.primary : theme.accent}
                                strokeWidth={strokeWidth}
                                fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                transform={`rotate(-90 ${radius + strokeWidth} ${radius + strokeWidth})`}
                            />
                        </Svg>

                        {/* Centered text timer details */}
                        <View style={styles.timerLabels}>
                            <Text style={[styles.statusText, { color: isFocus ? theme.primary : theme.accent }]}>
                                {isFocus ? 'FOCUS' : 'BREAK'}
                            </Text>
                            <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>
                            <Text style={styles.totalPomosText}>🍅 {todo?.pomodoros || 0} complete</Text>
                        </View>
                    </View>

                    {/* Controls Row */}
                    <View style={styles.controlsRow}>
                        <TouchableOpacity style={styles.controlBtnSecondary} onPress={handleReset}>
                            <Ionicons name="refresh" size={22} color="#FFFFFF" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.controlBtnPrimary} onPress={handlePlayPause}>
                            <LinearGradient
                                colors={[theme.primary, theme.accent]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.playGradient}
                            >
                                <Ionicons name={isActive ? "pause" : "play"} size={32} color="#FFFFFF" />
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.controlBtnSecondary} onPress={handleSkip}>
                            <Ionicons name="play-forward" size={22} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Audio Ambiance Selector */}
                    <View style={styles.soundContainer}>
                        <Text style={styles.soundLabel}>AMBIENT BACKGROUND NOISE</Text>
                        <View style={styles.soundRow}>
                            {Object.keys(AMBIENT_SOUNDS).map((key) => {
                                const active = soundType === key;
                                return (
                                    <TouchableOpacity
                                        key={key}
                                        style={[
                                            styles.soundChip,
                                            { 
                                                backgroundColor: active ? theme.primary : 'rgba(255,255,255,0.04)',
                                                borderColor: active ? theme.primary : 'rgba(255,255,255,0.1)'
                                            }
                                        ]}
                                        onPress={() => setSoundType(key)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons 
                                            name={key === 'none' ? 'volume-mute-outline' : 'musical-notes-outline'} 
                                            size={12} 
                                            color="#FFFFFF" 
                                        />
                                        <Text style={styles.soundChipText}>{AMBIENT_SOUNDS[key].name}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </ScrollView>
            </LinearGradient>
        </Modal>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        height: Platform.OS === 'ios' ? 94 : 64,
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    headerSpacer: {
        width: 40,
    },
    scrollContent: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    taskCard: {
        width: width - 40,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        padding: 16,
        alignItems: 'center',
        marginBottom: 40,
    },
    taskLabel: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 6,
    },
    taskText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    timerContainer: {
        width: radius * 2 + strokeWidth * 2,
        height: radius * 2 + strokeWidth * 2,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        marginBottom: 40,
    },
    glowOrb: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        opacity: 0.1,
        filter: 'blur(30px)',
    },
    svg: {
        position: 'absolute',
    },
    timerLabels: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: 4,
    },
    timeText: {
        color: '#FFFFFF',
        fontSize: 38,
        fontWeight: '800',
    },
    totalPomosText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 11,
        fontWeight: '600',
        marginTop: 6,
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 30,
        marginBottom: 40,
    },
    controlBtnPrimary: {
        width: 80,
        height: 80,
        borderRadius: 40,
        overflow: 'hidden',
    },
    playGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlBtnSecondary: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    soundContainer: {
        width: width - 40,
        alignItems: 'center',
    },
    soundLabel: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 12,
    },
    soundRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
    },
    soundChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
    },
    soundChipText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '600',
    },
});
