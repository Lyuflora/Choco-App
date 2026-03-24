// ChocolateBar turns the first Today interaction into a small ritual instead of a plain button.
import { useEffect, useMemo, useRef } from "react";
import { Animated, PanResponder, StyleSheet, Text, View } from "react-native";
import { palette, radii, spacing } from "../../ui/theme";

export type ChocolateBarPhase = "idle" | "interacting" | "logging" | "saved";

interface ChocolateBarProps {
  phase: ChocolateBarPhase;
  onBreakRequest: () => void;
  onBreakComplete: () => void;
}

const CHOCOLATE_SQUARES = [0, 1, 2, 3];

export function ChocolateBar({ phase, onBreakRequest, onBreakComplete }: ChocolateBarProps) {
  const phaseRef = useRef(phase);
  const breakProgress = useRef(new Animated.Value(0)).current;
  const impactScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    if (phase === "interacting") {
      Animated.sequence([
        Animated.timing(impactScale, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.spring(breakProgress, {
            toValue: 1,
            friction: 7,
            tension: 90,
            useNativeDriver: true,
          }),
          Animated.timing(impactScale, {
            toValue: 0,
            duration: 180,
            useNativeDriver: true,
          }),
        ]),
      ]).start(({ finished }) => {
        if (finished) {
          onBreakComplete();
        }
      });

      return;
    }

    if (phase === "idle") {
      Animated.parallel([
        Animated.spring(breakProgress, {
          toValue: 0,
          friction: 8,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(impactScale, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [breakProgress, impactScale, onBreakComplete, phase]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => phaseRef.current === "idle",
        onMoveShouldSetPanResponder: (_, gesture) =>
          phaseRef.current === "idle" && (Math.abs(gesture.dx) > 6 || Math.abs(gesture.dy) > 6),
        onPanResponderRelease: (_, gesture) => {
          if (phaseRef.current !== "idle") {
            return;
          }

          const isTap = Math.abs(gesture.dx) < 6 && Math.abs(gesture.dy) < 6;
          const isSwipe = Math.abs(gesture.dx) > 24;

          if (isTap || isSwipe) {
            onBreakRequest();
          }
        },
      }),
    [onBreakRequest],
  );

  const barScale = impactScale.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const leftTranslate = breakProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -26],
  });

  const rightTranslate = breakProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 26],
  });

  const leftRotate = breakProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-7deg"],
  });

  const rightRotate = breakProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "7deg"],
  });

  const crumbOpacity = breakProgress.interpolate({
    inputRange: [0, 0.25, 1],
    outputRange: [0, 0.2, 1],
  });

  const crumbRise = breakProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.barFrame, { transform: [{ scale: barScale }] }]} {...panResponder.panHandlers}>
        <Animated.View style={[styles.crumb, styles.crumbLeft, { opacity: crumbOpacity, transform: [{ translateY: crumbRise }, { translateX: leftTranslate }] }]} />
        <Animated.View style={[styles.crumb, styles.crumbRight, { opacity: crumbOpacity, transform: [{ translateY: crumbRise }, { translateX: rightTranslate }] }]} />

        <Animated.View style={[styles.half, styles.leftHalf, { transform: [{ translateX: leftTranslate }, { rotate: leftRotate }] }]}>
          <View style={styles.squareGrid}>
            {CHOCOLATE_SQUARES.map((square) => (
              <View key={`left-${square}`} style={styles.square} />
            ))}
          </View>
        </Animated.View>

        <Animated.View style={[styles.half, styles.rightHalf, { transform: [{ translateX: rightTranslate }, { rotate: rightRotate }] }]}>
          <View style={styles.squareGrid}>
            {CHOCOLATE_SQUARES.map((square) => (
              <View key={`right-${square}`} style={styles.square} />
            ))}
          </View>
        </Animated.View>
      </Animated.View>

      <Text style={styles.caption}>{phase === "idle" ? "Tap or swipe to break today's bar." : "A tiny ritual before the log."}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    gap: spacing.md,
  },
  barFrame: {
    width: 272,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  half: {
    position: "absolute",
    width: 118,
    height: 156,
    borderRadius: radii.lg,
    backgroundColor: palette.chocolate,
    borderWidth: 1,
    borderColor: "#42281A",
    padding: spacing.sm,
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  leftHalf: {
    left: 18,
  },
  rightHalf: {
    right: 18,
  },
  squareGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  square: {
    width: "46%",
    aspectRatio: 1,
    borderRadius: radii.sm,
    backgroundColor: "#6E452D",
    borderWidth: 1,
    borderColor: "#815238",
  },
  crumb: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: radii.pill,
    backgroundColor: "#8A5A3D",
  },
  crumbLeft: {
    left: 108,
    top: 66,
  },
  crumbRight: {
    right: 108,
    top: 88,
  },
  caption: {
    fontSize: 13,
    color: palette.textMuted,
    textAlign: "center",
  },
});
