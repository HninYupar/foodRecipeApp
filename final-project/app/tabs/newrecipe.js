import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import db from "@/database/db";
import Theme from "@/assets/theme";
import useSession from "@/utils/useSession";
import { Buffer } from "buffer";

export default function AddRecipe() {
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [serving, setServing] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const session = useSession();
  const [imageData, setImageData] = useState("");

  const addIngredient = () => {
    setIngredients([...ingredients, ""]);
  };

  const updateIngredient = (text, index) => {
    const updated = [...ingredients];
    updated[index] = text;
    setIngredients(updated);
  };

  const addStep = () => {
    setSteps([...steps, ""]);
  };

  const updateStep = (text, index) => {
    const updated = [...steps];
    updated[index] = text;
    setSteps(updated);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    console.log("result from pickImage", result);
    if (!result.canceled) {
      setImageData(result.assets[0].base64);
      setImage(result.assets[0].uri);
    }
  };

  const uploadImageToBucket = async () => {
    try {
      const response = await fetch(image);
      if (!response.ok) {
        throw new Error("Failed to fetch the file from the URI");
      }

      const fileName = `${session.user.id}_${Date.now()}_recipe_image.png`;
      const buffer = Buffer.from(imageData, "base64");
      const { data, error } = await db.storage
        .from("recipes_image")
        .upload(`image/${fileName}`, buffer, {
          cacheControl: "3600", // Cache for 1 hour
          contentType: "image/png",
        });

      if (error) {
        console.error("Error uploading file:", error.message);
        return null;
      }

      return fileName; // Return the file path for further use
    } catch (error) {
      console.error("Error during file upload:", error.message);
      return null;
    }
  };

  const getPublicUrl = (fileName) => {
    const { data } = db.storage
      .from("recipes_image")
      .getPublicUrl(`image/${fileName}`);
    return data?.publicUrl || null;
  };

  const submitRecipe = async () => {
    if (!title || ingredients.length === 0 || steps.length === 0) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setIsLoading(true);
      const fileName = await uploadImageToBucket();
      if (!fileName) {
        alert("Failed to upload image.");
        setIsLoading(false);
        return;
      }
      const imageUrl = getPublicUrl(fileName);
      const recipeToSubmit = await db.from("recipes").insert([
        {
          image: imageUrl, // Store the image URL
          title: title,
          prepTime: prepTime,
          steps: steps, // Store as an array
          serving: serving,
          ingredient: ingredients, // Store as an array
          user_id: session.user.id,
        },
      ]);
      alert("Recipe added successfully!");
      // Reset form fields
      setImage(null);
      setTitle("");
      setPrepTime("");
      setServing("");
      setIngredients([]);
      setSteps([]);
      setIsLoading(false);
    } catch (error) {
      console.error("Error adding recipe:", error);
      alert("Error adding recipe. Please try again.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <Text style={styles.header}>Upload Recipe</Text>

        <ScrollView style={styles.scrollContainer}>
          {/* Image Picker */}
          <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
            {image ? (
              <Image source={{ uri: image }} style={styles.image} />
            ) : (
              <Text style={styles.imagePickerText}>Upload Image</Text>
            )}
          </TouchableOpacity>

          {/* Title */}
          <TextInput
            style={styles.input}
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
          />

          {/* Preparation Time & Serves */}
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Preparation time"
              value={prepTime}
              onChangeText={setPrepTime}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Serving"
              value={serving}
              onChangeText={setServing}
            />
          </View>

          {/* Ingredients */}
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            {ingredients.map((ingredient, index) => (
              <TextInput
                key={index}
                style={styles.input}
                placeholder={`Ingredient ${index + 1}`}
                value={ingredient}
                onChangeText={(text) => updateIngredient(text, index)}
              />
            ))}
            <TouchableOpacity onPress={addIngredient} style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Add Ingredient</Text>
            </TouchableOpacity>
          </View>

          {/* Preparation Steps */}
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.sectionTitle}>Directions</Text>
            {steps.map((step, index) => (
              <TextInput
                key={index}
                style={styles.input}
                placeholder={`Step ${index + 1}`}
                value={step}
                onChangeText={(text) => updateStep(text, index)}
              />
            ))}
            <TouchableOpacity onPress={addStep} style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Add Step</Text>
            </TouchableOpacity>
          </View>

          {/* Add new recipe buttom */}
          <View style={styles.publishButtonContainer}>
            <TouchableOpacity
              onPress={submitRecipe}
              style={styles.publishButton}
            >
              <Text style={styles.publishButtonText}>Add New Recipe</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.backgroundPrimary,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  header: {
    fontSize: Theme.sizes.textLarge,
    fontWeight: "bold",
    marginBottom: 20,
    paddingLeft: 10,
    paddingTop: 10,
  },
  imagePicker: {
    height: 200,
    borderRadius: 5,
    borderStyle: "solid",
    borderWidth: 2,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  imagePickerText: {
    color: "#aaa",
    fontSize: Theme.sizes.textSmall,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    resizeMode: "contain",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: Theme.sizes.textSmall,
    fontColor: "black",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  halfInput: {
    flex: 1,
    marginRight: 10,
    color: "black",
  },
  addButton: {
    padding: 10,
    borderRadius: 5,
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: Theme.colors.iconHighlighted,
  },
  addButtonText: {
    color: Theme.colors.iconHighlighted,
    textAlign: "center",
    fontSize: Theme.sizes.textSmall,
  },
  sectionTitle: {
    fontSize: Theme.sizes.textMedium,
    fontWeight: "bold",
    marginBottom: 10,
  },
  publishButton: {
    backgroundColor: Theme.colors.iconHighlighted,
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  publishButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
