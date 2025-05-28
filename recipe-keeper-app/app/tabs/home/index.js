import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import db from "@/database/db";
import Theme from "@/assets/theme";
import { useNavigation } from "@react-navigation/native";
import useSession from "@/utils/useSession";

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const navigation = useNavigation();
  const session = useSession();

  const fetchRecipes = async () => {
    try {
      if (session && session.user) {
        const { data, error } = await db
          .from("recipes")
          .select("*")
          .eq("user_id", session.user.id);

        if (error) {
          console.error("Error fetching recipes:", error);
          return;
        }

        setRecipes(data || []);
      }
    } catch (error) {
      console.error("Unexpected error in fetchRecipes:", error);
    }
  };

  useEffect(() => {
    if (session && session.user) {
      fetchRecipes();

      // Subscribe to real-time updates for new inserts
      const subscription = db
        .channel("schema-db-changes")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "recipes",
          },
          (payload) => {
            if (payload.new.user_id === session.user.id) {
              setRecipes((prev) => [payload.new, ...prev]);
            }
          }
        )
        .subscribe();

      // Cleanup subscription on unmount
      return () => {
        db.removeChannel(subscription);
      };
    }
  }, [session]); // Add `session` as a dependency to re-run the effect when it changes

  const adjustedData =
    recipes.length % 2 === 0
      ? recipes
      : [...recipes, { id: "placeholder", isPlaceholder: true }];

  const handleNavigate = ({ item }) => {
    navigation.navigate("detail", item);
  };

  const renderRecipe = ({ item }) => {
    if (item.isPlaceholder) {
      // Render an invisible card for layout alignment
      return <View style={[styles.card, styles.placeholderCard]} />;
    }
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleNavigate({ item })}
      >
        <Image source={{ uri: item.image }} style={styles.image} />
        <Text style={styles.title}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>My Recipe</Text>
      <FlatList
        data={adjustedData}
        renderItem={renderRecipe}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2} // Display in a grid layout
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.backgroundPrimary,
  },

  header: {
    fontSize: Theme.sizes.textLarge,
    fontWeight: "bold",
    color: "#333",
    padding: 10,
  },
  recipeName: {
    marginTop: 8,
    fontSize: Theme.sizes.textSmall,
    fontWeight: "500",
  },
  card: {
    flex: 1,
    margin: 10,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    overflow: "hidden",
    elevation: 3,
  },
  placeholderCard: {
    backgroundColor: "transparent",
    elevation: 0, // Remove shadow for the placeholder
  },
  image: {
    width: "100%",
    height: 150,
  },
  title: {
    padding: 10,
    fontSize: Theme.sizes.textSmall,
    fontWeight: "bold",
    textAlign: "center",
  },
});
