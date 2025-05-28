import { useState } from "react";
import {
  Text,
  Alert,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import db from "@/database/db";

import Theme from "@/assets/theme";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const signInWithEmail = async () => {
    setLoading(true);
    try {
      const { data, error } = await db.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        Alert.alert(error.message);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const signUpWithEmail = async () => {
    setLoading(true);
    try {
      const { data, error } = await db.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        Alert.alert(error.message);
      } else {
        Alert.alert(
          "Sign up successful! Make sure you confirm your email before you sign in."
        );
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const isSignInDisabled =
    loading || email.length === 0 || password.length === 0;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.splash}>
        <MaterialCommunityIcons
          size={64}
          name="chef-hat"
          color={Theme.colors.iconHighlighted}
        />
        <Text style={styles.splashText}>Cheffie</Text>
      </View>
      <TextInput
        onChangeText={(text) => setEmail(text)}
        value={email}
        placeholder="Username"
        placeholderTextColor={Theme.colors.textSecondary}
        autoCapitalize={"none"}
        style={[
          styles.input,
          { borderTopLeftRadius: 10, borderTopRightRadius: 10 },
        ]}
      />
      <TextInput
        onChangeText={(text) => setPassword(text)}
        value={password}
        placeholder="Password"
        placeholderTextColor={Theme.colors.textSecondary}
        secureTextEntry={true}
        autoCapitalize={"none"}
        style={[
          styles.input,
          { borderBottomLeftRadius: 10, borderBottomRightRadius: 10 },
        ]}
      />
      <View style={styles.buttonContainer}>
        {isSignUp ? (
          <TouchableOpacity
            onPress={() => signUpWithEmail()}
            disabled={isSignInDisabled}
          >
            <Text
              style={[
                styles.button,
                isSignInDisabled ? styles.buttonDisabled : undefined,
              ]}
            >
              Sign up
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => signInWithEmail()}
            disabled={isSignInDisabled}
          >
            <Text
              style={[
                styles.button,
                isSignInDisabled ? styles.buttonDisabled : undefined,
              ]}
            >
              Sign in
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
          <Text style={styles.switchModeText}>
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: 12,
    paddingRight: 12,
    paddingBottom: 20,
    backgroundColor: Theme.colors.backgroundPrimary,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  splash: {
    marginBottom: 12,
  },
  splashText: {
    fontWeight: "bold",
    color: Theme.colors.textPrimary,
    fontSize: 40,
    paddingLeft: 5,
  },
  buttonContainer: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  verticallySpaced: {
    marginVertical: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
  input: {
    color: Theme.colors.textPrimary,
    backgroundColor: Theme.colors.iconHighlighted,
    width: "100%",
    padding: 16,
  },
  button: {
    color: Theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: 18,
    padding: 8,
    backgroundColor: Theme.colors.iconHighlighted,
    borderRadius: 10,
  },
  buttonDisabled: {
    color: Theme.colors.textSecondary,
  },
  switchModeText: {},
});
