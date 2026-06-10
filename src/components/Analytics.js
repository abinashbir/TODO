import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, Text as SvgText, Line, G, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { categories } from '../theme/themes';

const { width } = Dimensions.get('window');

export default function Analytics({ visible, onClose, todos, trash, streak }) {
    const { theme } = useTheme();

    // 1. Core Analytics Math
    const activeCompleted = todos.filter(t => t.completed).length;
    const trashedCompleted = trash.filter(t => t.completed).length;
    const totalCompleted = activeCompleted + trashedCompleted;
    const totalPending = todos.filter(t => !t.completed).length;

    // Sum pomodoros
    const activePomos = todos.reduce((acc, t) => acc + (t.pomodoros || 0), 0);
    const trashedPomos = trash.reduce((acc, t) => acc + (t.pomodoros || 0), 0);
    const totalFocusMinutes = (activePomos + trashedPomos) * 25;

    // 2. Last 7 Days Completion Calculations
    const getCompletionsLast7Days = () => {
        const counts = {};
        const dates = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d;
        }).reverse();

        dates.forEach(d => {
            counts[d.toDateString()] = {
                label: d.toLocaleDateString('en-US', { weekday: 'short' }),
                count: 0
            };
        });

        const allTasks = [...todos, ...trash];
        allTasks.forEach(t => {
            if (t.completed && t.completedAt) {
                const dateKey = new Date(t.completedAt).toDateString();
                if (counts[dateKey]) {
                    counts[dateKey].count++;
                }
            }
        });

        return Object.values(counts);
    };

    const completionData = getCompletionsLast7Days();
    const maxCount = Math.max(...completionData.map(d => d.count), 4); // default base height helper

    // 3. Category Breakdown Math
    const getCategoryStats = () => {
        const stats = {};
        categories.forEach(c => {
            stats[c.id] = { name: c.name, color: c.color, count: 0 };
        });

        const allTasks = [...todos, ...trash];
        allTasks.forEach(t => {
            if (stats[t.categoryId]) {
                stats[t.categoryId].count++;
            }
        });

        return Object.values(stats).filter(s => s.count > 0);
    };

    const categoryStats = getCategoryStats();

    // SVG Chart dimensions
    const chartHeight = 160;
    const chartWidth = width - 80;
    const padding = 20;
    const graphHeight = chartHeight - padding * 2;
    const barSpacing = graphHeight + 10;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: theme.bgApp, borderTopColor: theme.bgGlassBorder }]}>
                    <View style={styles.dragBar} />

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.textPrimary }]}>
                            Analytics
                        </Text>
                        <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.bgGlassBorder }]}>
                            <Ionicons name="close" size={20} color={theme.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        
                        {/* Stats Summary Grid */}
                        <View style={styles.statsGrid}>
                            <View style={[styles.statBox, { backgroundColor: theme.bgCard, borderColor: theme.bgGlassBorder }]}>
                                <Ionicons name="checkmark-circle-outline" size={24} color={theme.primary} />
                                <Text style={[styles.statNum, { color: theme.textPrimary }]}>{totalCompleted}</Text>
                                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Completed</Text>
                            </View>

                            <View style={[styles.statBox, { backgroundColor: theme.bgCard, borderColor: theme.bgGlassBorder }]}>
                                <Ionicons name="time-outline" size={24} color={theme.accent} />
                                <Text style={[styles.statNum, { color: theme.textPrimary }]}>{totalFocusMinutes}m</Text>
                                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Focus Time</Text>
                            </View>

                            <View style={[styles.statBox, { backgroundColor: theme.bgCard, borderColor: theme.bgGlassBorder }]}>
                                <Ionicons name="flame-outline" size={24} color="orange" />
                                <Text style={[styles.statNum, { color: theme.textPrimary }]}>{streak.count || 0}</Text>
                                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Current Streak</Text>
                            </View>

                            <View style={[styles.statBox, { backgroundColor: theme.bgCard, borderColor: theme.bgGlassBorder }]}>
                                <Ionicons name="clipboard-outline" size={24} color="#319795" />
                                <Text style={[styles.statNum, { color: theme.textPrimary }]}>{totalPending}</Text>
                                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Pending</Text>
                            </View>
                        </View>

                        {/* Custom SVG Weekly Chart */}
                        <View style={[styles.sectionCard, { backgroundColor: theme.bgCard, borderColor: theme.bgGlassBorder }]}>
                            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                                Activity History (Last 7 days)
                            </Text>

                            <View style={styles.chartContainer}>
                                <Svg height={chartHeight} width={chartWidth}>
                                    <Defs>
                                        <SvgLinearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                            <Stop offset="0" stopColor={theme.accent} stopOpacity="1" />
                                            <Stop offset="1" stopColor={theme.primary} stopOpacity="0.8" />
                                        </SvgLinearGradient>
                                    </Defs>
                                    
                                    {/* Grid Lines */}
                                    <Line x1="0" y1={padding} x2={chartWidth} y2={padding} stroke={theme.divider} strokeWidth="1" />
                                    <Line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke={theme.divider} strokeWidth="1" />
                                    <Line x1="0" y1={chartHeight - padding} x2={chartWidth} y2={chartHeight - padding} stroke={theme.textSecondary} strokeWidth="1" strokeOpacity="0.3" />

                                    {/* Draw Bars */}
                                    {completionData.map((d, index) => {
                                        const barWidth = 24;
                                        const gap = (chartWidth - barWidth * 7) / 8;
                                        const x = gap + index * (barWidth + gap);
                                        const h = maxCount === 0 ? 0 : (d.count / maxCount) * (graphHeight);
                                        const y = chartHeight - padding - h;

                                        return (
                                            <G key={index}>
                                                {/* Active completion bar */}
                                                <Rect
                                                    x={x}
                                                    y={y}
                                                    width={barWidth}
                                                    height={h}
                                                    fill="url(#barGrad)"
                                                    rx={4}
                                                />
                                                {/* Numerical count on top of bar */}
                                                {d.count > 0 && (
                                                    <SvgText
                                                        x={x + barWidth / 2}
                                                        y={y - 6}
                                                        fill={theme.textPrimary}
                                                        fontSize="10"
                                                        fontWeight="700"
                                                        textAnchor="middle"
                                                    >
                                                        {d.count}
                                                    </SvgText>
                                                )}
                                                {/* Weekday label */}
                                                <SvgText
                                                    x={x + barWidth / 2}
                                                    y={chartHeight - 4}
                                                    fill={theme.textSecondary}
                                                    fontSize="9"
                                                    fontWeight="600"
                                                    textAnchor="middle"
                                                >
                                                    {d.label}
                                                </SvgText>
                                            </G>
                                        );
                                    })}
                                </Svg>
                            </View>
                        </View>

                        {/* Category Task Shares */}
                        {categoryStats.length > 0 && (
                            <View style={[styles.sectionCard, { backgroundColor: theme.bgCard, borderColor: theme.bgGlassBorder }]}>
                                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                                    Task Breakdown by Category
                                </Text>
                                <View style={styles.catStatsList}>
                                    {categoryStats.map((item, index) => {
                                        const totalTasks = todos.length + trash.length;
                                        const sharePercent = totalTasks === 0 ? 0 : Math.round((item.count / totalTasks) * 100);

                                        return (
                                            <View key={index} style={styles.catStatRow}>
                                                <View style={styles.catStatInfo}>
                                                    <View style={[styles.catDot, { backgroundColor: item.color }]} />
                                                    <Text style={[styles.catStatName, { color: theme.textPrimary }]}>
                                                        {item.name}
                                                    </Text>
                                                </View>
                                                <View style={styles.catStatProgressContainer}>
                                                    <View style={[styles.catStatTrack, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                                                        <View style={[styles.catStatFill, { width: `${sharePercent}%`, backgroundColor: item.color }]} />
                                                    </View>
                                                    <Text style={[styles.catStatPercent, { color: theme.textSecondary }]}>
                                                        {item.count} ({sharePercent}%)
                                                    </Text>
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    container: {
        height: '80%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderTopWidth: 1,
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    },
    dragBar: {
        width: 40,
        height: 5,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 3,
        alignSelf: 'center',
        marginVertical: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 24,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
    },
    statBox: {
        width: (width - 52) / 2,
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        alignItems: 'center',
        gap: 6,
    },
    statNum: {
        fontSize: 20,
        fontWeight: '800',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    sectionCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 16,
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    catStatsList: {
        gap: 12,
    },
    catStatRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    catStatInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        width: 110,
    },
    catDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    catStatName: {
        fontSize: 13,
        fontWeight: '600',
    },
    catStatProgressContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    catStatTrack: {
        flex: 1,
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    catStatFill: {
        height: '100%',
        borderRadius: 3,
    },
    catStatPercent: {
        fontSize: 11,
        fontWeight: '500',
        width: 50,
        textAlign: 'right',
    },
});
