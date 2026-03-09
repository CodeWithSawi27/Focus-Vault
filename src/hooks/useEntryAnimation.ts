import { useRef, useEffect } from "react";
import { Animated } from "react-native";

interface EntryAnimationOptions {
  delay?: number;
  duration?: number;
  fromY?: number;
  fromX?: number;
}

export const useEntryAnimation = ({
  delay = 0,
  duration = 240,
  fromY = 10,
  fromX = 0,
}: EntryAnimationOptions = {}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(fromY)).current;
  const translateX = useRef(new Animated.Value(fromX)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return {
    style: {
      opacity,
      transform: [{ translateY }, { translateX }],
    },
  };
};

// For staggered lists — returns array of animated styles
export const useStaggeredEntryAnimation = (
  count: number,
  staggerMs = 70,
  options: Omit<EntryAnimationOptions, "delay"> = {},
) => {
  const animations = useRef(
    Array.from({ length: count }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(options.fromY ?? 10),
    })),
  ).current;

  useEffect(() => {
    const staggered = animations.map((anim, i) =>
      Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: options.duration ?? 240,
          delay: i * staggerMs,
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateY, {
          toValue: 0,
          duration: options.duration ?? 240,
          delay: i * staggerMs,
          useNativeDriver: true,
        }),
      ]),
    );

    Animated.parallel(staggered).start();
  }, []);

  return animations.map((anim) => ({
    opacity: anim.opacity,
    transform: [{ translateY: anim.translateY }],
  }));
};
