import React, { Component } from "react";
import { Text, View, TouchableOpacity, Keyboard } from "react-native";
import { Input, Button } from "react-native-elements";
import { Formik } from "formik";
import * as Yup from "yup";
import { Snackbar } from "react-native-paper";
import Constants from "expo-constants";
import { Container } from "native-base";
import fireStoreDB from "../database/FirestoreDB";

const Themes = {
  primaryTheme: "#30D921",
  secondaryTheme: "#B32D83",
  layoutTheme: "#c0c0c0"
};

const emailInput = React.createRef();
const passwordInput = React.createRef();

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .label("Email")
    .email()
    .required("Email is required"),
  password: Yup.string()
    .label("Password")
    .required("Password is required")
    .min(6)
});

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      invalidFields: false
    };
  }

  onSignIn = async (email, password) => {
    const user = {
      email,
      password
    };

    await fireStoreDB.signUserIn(user, this.loginSuccess, () => {
      this.setState({ visible: true });
      Keyboard.dismiss();
    });
  };

  loginSuccess = () => {
    if (fireStoreDB.getAvatar == null) {
      this.props.navigation.navigate("Profile");
    } else {
      this.props.navigation.navigate("Home");
    }
    emailInput.current.clear();
    passwordInput.current.clear();
  };

  render() {
    return (
      <Formik
        initialValues={{
          email: "",
          password: ""
        }}
        onSubmit={values => {
          this.onSignIn(values.email, values.password);
        }}
        validationSchema={validationSchema}
      >
        {formikProps => (
          <Container>
            <View
              style={{
                backgroundColor: Themes.primaryTheme,
                height: Constants.statusBarHeight
              }}
            />
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Input
                ref={emailInput}
                containerStyle={{ width: "80%", margin: 10 }}
                leftIconContainerStyle={{ marginLeft: 0, marginRight: 10 }}
                leftIcon={{
                  type: "material",
                  name: "email",
                  color: Themes.layoutTheme
                }}
                placeholder="Email Address"
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={formikProps.handleChange("email")}
                errorMessage={
                  this.state.invalidFields ||
                  formikProps.getFieldMeta("email").value
                    ? formikProps.errors.email
                    : ""
                }
              />
              <Input
                ref={passwordInput}
                containerStyle={{ width: "80%", margin: 10 }}
                leftIconContainerStyle={{ marginLeft: 0, marginRight: 10 }}
                leftIcon={{
                  type: "simple-line-icon",
                  name: "lock",
                  color: Themes.layoutTheme
                }}
                placeholder="Password"
                secureTextEntry
                onChangeText={formikProps.handleChange("password")}
                errorMessage={
                  this.state.invalidFields ||
                  formikProps.getFieldMeta("password").value
                    ? formikProps.errors.password
                    : ""
                }
              />
              <Button
                containerStyle={{
                  width: "75%",
                  marginTop: 25
                }}
                buttonStyle={{
                  backgroundColor: Themes.primaryTheme
                }}
                title="Login"
                raised
                onPress={() => {
                  formikProps.validateForm().then(() => {
                    formikProps.handleSubmit();
                  }, this.setState({ invalidFields: true }));
                }}
              />
              <TouchableOpacity
                style={{ marginTop: 22 }}
                onPress={() => {
                  this.props.navigation.navigate("Register");
                }}
              >
                <Text style={{ color: Themes.primaryTheme, fontSize: 15 }}>
                  Create Account
                </Text>
              </TouchableOpacity>
              <Snackbar
                style={{ position: "absolute", bottom: -2 }}
                theme={{ colors: { accent: Themes.secondaryTheme } }}
                visible={this.state.visible}
                onDismiss={() => this.setState({ visible: false })}
                action={{
                  label: "Okay",

                  onPress: () => {
                    this.setState({ visible: false });
                  }
                }}
              >
                Incorrect Username or Password
              </Snackbar>
            </View>
          </Container>
        )}
      </Formik>
    );
  }
}
