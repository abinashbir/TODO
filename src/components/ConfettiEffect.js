import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';

const { width, height } = Dimensions.get('window');

const CONFETTI_COLORS = ['#F6E05E', '#4299E1', '#ED64A6', '#48BB78', '#38B2AC', '#ED8936', '#9F7AEA'];

export default function ConfettiEffect({ trigger }) {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        if (!trigger) return;

        // Generate 45 randomized particle objects
        const newParticles = Array.from({ length: 45 }).map((_, index) => {
            const xPos = Math.random() * width;
            const size = Math.random() * 8 + 6; // Size between 6 and 14
            const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
            const rotation = Math.random() * 360;
            const shape = Math.random() > 0.5 ? 'square' : 'circle';

            return {
                id: index + '-' + trigger,
                xPos,
                size,
                color,
                shape,
                rotation,
                animatedY: new Animated.Value(-20),
                animatedX: new Animated.Value(xPos),
                animatedRotation: new Animated.Value(rotation),
                opacity: new Animated.Value(1),
            };
        });

        setParticles(newParticles);

        const animations = newParticles.map((p) => {
            const duration = Math.random() * 1800 + 1200; // 1.2s to 3s fall duration
            const endY = height + 20;
            const driftX = p.xPos + (Math.random() * 140 - 70); // Slight wind drift left/right
            const spin = p.rotation + (Math.random() * 720 - 360);

            return Animated.parallel([
                Animated.timing(p.animatedY, {
                    toValue: endY,
                    duration,
                    useNativeDriver: true,
                }),
                Animated.timing(p.animatedX, {
                    toValue: driftX,
                    duration,
                    useNativeDriver: true,
                }),
                Animated.timing(p.animatedRotation, {
                    toValue: spin,
                    duration,
                    useNativeDriver: true,
                }),
                Animated.timing(p.opacity, {
                    toValue: 0,
                    delay: duration * 0.7,
                    duration: duration * 0.3,
                    useNativeDriver: true,
                })
            ]);
        });

        Animated.parallel(animations).start(() => {
            // Clear memory once animation finishes
            setParticles([]);
        });
    }, [trigger]);

    if (particles.length === 0) return null;

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {particles.map((p) => {
                const rotateStr = p.animatedRotation.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                });

                return (
                    <Animated.View
                        key={p.id}
                        style={[
                            styles.particle,
                            {
                                backgroundColor: p.color,
                                width: p.size,
                                height: p.size,
                                borderRadius: p.shape === 'circle' ? p.size / 2 : 2,
                                opacity: p.opacity,
                                transform: [
                                    { translateX: p.animatedX },
                                    { translateY: p.animatedY },
                                    { rotate: rotateStr },
                                ],
                            },
                        ]}
                    />
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    particle: {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 9999,
    },
});
