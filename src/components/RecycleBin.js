import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    ScrollView,
    TouchableOpacity,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { categories, priorities } from '../theme/themes';

export default function RecycleBin({ visible, onClose, trashList, onRestore, onPurge, onClearAll }) {
    const { theme } = useTheme();

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
                            Recycle Bin
                        </Text>
                        <View style={styles.headerButtons}>
                            {trashList.length > 0 && (
                                <TouchableOpacity 
                                    onPress={onClearAll} 
                                    style={[styles.clearAllBtn, { backgroundColor: 'rgba(229, 62, 62, 0.1)' }]}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.clearAllText}>Empty Trash</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.bgGlassBorder }]}>
                                <Ionicons name="close" size={20} color={theme.textPrimary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Trash List */}
                    {trashList.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="trash-outline" size={48} color={theme.textSecondary} style={styles.emptyIcon} />
                            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Trash is Empty</Text>
                            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                                Tasks you delete will appear here for recovery.
                            </Text>
                        </View>
                    ) : (
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                            {trashList.map((item) => {
                                const cat = categories.find(c => c.id === item.categoryId) || categories[0];
                                const prio = priorities[item.priority || 'medium'];

                                return (
                                    <View 
                                        key={item.id} 
                                        style={[
                                            styles.trashCard, 
                                            { 
                                                backgroundColor: theme.bgCard, 
                                                borderColor: theme.bgGlassBorder 
                                            }
                                        ]}
                                    >
                                        <View style={styles.cardInfo}>
                                            <Text style={[styles.cardText, { color: theme.textSecondary, textDecorationLine: 'line-through' }]}>
                                                {item.text}
                                            </Text>
                                            
                                            <View style={styles.badgeRow}>
                                                {/* Category Badge */}
                                                <View style={[styles.badge, { backgroundColor: cat.color + '20' }]}>
                                                    <Text style={[styles.badgeText, { color: cat.color }]}>
                                                        {cat.name}
                                                    </Text>
                                                </View>

                                                {/* Priority Badge */}
                                                <View style={[styles.badge, { backgroundColor: prio.labelBg }]}>
                                                    <Text style={[styles.badgeText, { color: prio.color }]}>
                                                        {prio.name}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>

                                        {/* Actions */}
                                        <View style={styles.cardActions}>
                                            <TouchableOpacity 
                                                style={[styles.actionBtn, { backgroundColor: theme.bgGlassBorder }]}
                                                onPress={() => onRestore(item.id)}
                                                activeOpacity={0.7}
                                            >
                                                <Ionicons name="refresh-outline" size={16} color={theme.primary} />
                                            </TouchableOpacity>

                                            <TouchableOpacity 
                                                style={[styles.actionBtn, { backgroundColor: 'rgba(229, 62, 62, 0.1)' }]}
                                                onPress={() => onPurge(item.id)}
                                                activeOpacity={0.7}
                                            >
                                                <Ionicons name="trash-outline" size={16} color="#E53E3E" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            })}
                        </ScrollView>
                    )}
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
        height: '75%',
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
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    clearAllBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
    },
    clearAllText: {
        color: '#E53E3E',
        fontSize: 12,
        fontWeight: '700',
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 60,
    },
    emptyIcon: {
        marginBottom: 16,
        opacity: 0.5,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 6,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 30,
    },
    trashCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
    },
    cardInfo: {
        flex: 1,
        marginRight: 12,
    },
    cardText: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 6,
    },
    badge: {
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    cardActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        width: 34,
        height: 34,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
