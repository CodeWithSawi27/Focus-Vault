import { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { Typography, Radius, Shadow } from "@/src/constants/theme";
import { Spacing } from "@/src/constants/spacing";

const QUOTES = [
  {
    text: "Small daily improvements are the key to staggering long-term results.",
    author: "Robin Sharma",
  },
  {
    text: "Success is the sum of small efforts repeated day in and day out.",
    author: "Robert Collier",
  },
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  {
    text: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar",
  },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  {
    text: "It is not enough to be busy. The question is: what are we busy about?",
    author: "Henry David Thoreau",
  },
  { text: "Either you run the day or the day runs you.", author: "Jim Rohn" },
  {
    text: "Do what you have to do until you can do what you want to do.",
    author: "Oprah Winfrey",
  },
  {
    text: "Discipline is choosing between what you want now and what you want most.",
    author: "Augusta F. Kantra",
  },
  {
    text: "The key is not to prioritize your schedule but to schedule your priorities.",
    author: "Stephen Covey",
  },
  {
    text: "Don't watch the clock. Do what it does — keep going.",
    author: "Sam Levenson",
  },
  {
    text: "Action is the foundational key to all success.",
    author: "Pablo Picasso",
  },
  {
    text: "Motivation is what gets you started. Habit is what keeps you going.",
    author: "Jim Ryun",
  },
  {
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Aristotle",
  },
];

export const MotivationalQuoteCard = () => {
  const { colors, isDark } = useTheme();

  const quote = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        86400000,
    );
    return QUOTES[dayOfYear % QUOTES.length];
  }, []);

  // Always a rich dark card — stays intentionally dark even in dark mode
  // In dark mode: use a slightly elevated dark surface with accent border
  const cardBg = isDark ? "rgba(255,255,255,0.06)" : colors.primary;
  const quoteMarkColor = isDark
    ? "rgba(255,255,255,0.10)"
    : "rgba(255,255,255,0.15)";
  const quoteTextColor = isDark
    ? "rgba(255,255,255,0.80)"
    : "rgba(255,255,255,0.90)";
  const authorColor = isDark
    ? "rgba(255,255,255,0.40)"
    : "rgba(255,255,255,0.50)";

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: cardBg,
          borderRadius: Radius.xl,
          padding: Spacing.lg,
          gap: 8,
          borderWidth: isDark ? 1 : 0,
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "transparent",
          ...Shadow.md,
        },
        quoteMark: {
          fontSize: 48,
          fontWeight: "700",
          color: quoteMarkColor,
          lineHeight: 40,
          marginBottom: -4,
        },
        quoteText: {
          ...Typography.callout,
          color: quoteTextColor,
          lineHeight: 24,
          fontWeight: "400",
          fontStyle: "italic",
        },
        author: {
          ...Typography.footnote,
          color: authorColor,
          fontWeight: "500",
          marginTop: 4,
        },
      }),
    [colors, isDark],
  );

  return (
    <View style={styles.card}>
      <Text style={styles.quoteMark}>"</Text>
      <Text style={styles.quoteText}>{quote.text}</Text>
      <Text style={styles.author}>— {quote.author}</Text>
    </View>
  );
};
