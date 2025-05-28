import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import Theme from "@/assets/theme";

export default function Detail() {
  const route = useRoute();
  const item = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.image} />
        </View>

        {/* Title */}
        <Text style={styles.title}>{item.title}</Text>

        {/* Prep Time and Serving */}
        <View style={styles.timeAndServingcontainer}>
          <Text style={styles.timeAndServingText}>
            <Text style={{ fontWeight: "bold" }}>Total Time: </Text>
            {item.prepTime || "N/A"}
          </Text>
          <Text style={styles.timeAndServingText}>
            <Text style={{ fontWeight: "bold" }}>Serves: </Text>
            {item.serving || "N/A"}
          </Text>
        </View>

        {/* Ingredients */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {item.ingredient ? (
            item.ingredient.map((ing, index) => (
              <Text key={index} style={styles.Text}>
                • {ing}
              </Text>
            ))
          ) : (
            <Text style={styles.emptyText}>No ingredients available</Text>
          )}
        </View>

        {/* Directions */}
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.sectionTitle}>Directions</Text>
          {item.steps ? (
            item.steps.map((step, index) => (
              <Text key={index} style={styles.Text}>
                {index + 1}. {step}
              </Text>
            ))
          ) : (
            <Text style={styles.emptyText}>No directions available</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.backgroundSecondary,
  },
  scrollContainer: {
    padding: 10,
  },
  imageContainer: {
    width: "100%",
    height: 350,
    borderRadius: 8,
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  title: {
    fontSize: Theme.sizes.textLarge,
    fontWeight: "bold",
    marginBottom: 16,
  },
  timeAndServingcontainer: {
    flexDirection: "column",
    marginBottom: 15,
  },
  timeAndServingText: {
    fontSize: 16,
    marginBottom: 4,
  },
  sectionContainer: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  Text: {
    fontSize: 16,
    marginLeft: 8,
    marginBottom: 7,
  },
  emptyText: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#888",
  },
});
