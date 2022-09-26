import React, { Component } from "react";
import { View, Alert, Keyboard } from "react-native";
import * as Progress from "react-native-progress";
import { Input, Button, ButtonGroup } from "react-native-elements";
import DateTimePicker from "react-native-modal-datetime-picker";
import { Formik } from "formik";
import * as Yup from "yup";
import moment from "moment";
import Constants from "expo-constants";
import { Container } from "native-base";
import fireStoreDB from "../database/FirestoreDB";

const Themes = {
  primaryTheme: "#30D921",
  layoutTheme: "#c0c0c0"
};

const validationSchema = Yup.object().shape({
  username: Yup.string()
    .label("Username")
    .required("Username is required")
    .min(3),
  email: Yup.string()
    .label("Email")
    .email("Email must be valid")
    .required("Email is required"),
  password: Yup.string()
    .label("Password")
    .required("Password is required")
    .min(6),
  confirmPassword: Yup.string()
    .label("Confirm password")
    .required("Password confirmation is required")
    .test("passwords-match", "Passwords must match", function matchTest(value) {
      return this.parent.password === value;
    }),
  dateofBirth: Yup.string().required()
});

const genders = new Map([
  [0, "Male"],
  [1, "Female"],
  [2, "Other"]
]);

export default class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDateTimePickerVisible: false,
      displayDate: null,
      invalidFields: false,
      selectedIndex: 0
    };
  }

  showDateTimePicker = () => {
    this.setState({ isDateTimePickerVisible: true });
  };

  hideDateTimePicker = () => {
    this.setState({ isDateTimePickerVisible: false });
  };

  onDateTimePicked = date => {
    this.setState({ displayDate: moment(date).format("MM/DD/YYYY") });
    this.hideDateTimePicker();
  };

  onSignUp = async (
    username,
    email,
    password,
    confirmPassword,
    gender,
    dateofBirth
  ) => {
    const user = {
      username,
      email,
      password,
      confirmPassword,
      gender,
      dateofBirth
    };

    await fireStoreDB.createUserAccount(user, this.registerReject);
    this.props.navigation.navigate("Login");
  };

  registerReject = msg => {
    Alert.alert("Registration Failed", msg);
    this.props.navigation.navigate("Login");
  };

  render() {
    return (
      <Formik
        initialValues={{
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
          dateofBirth: ""
        }}
        onSubmit={values => {
          this.onSignUp(
            values.username,
            values.email,
            values.password,
            values.confirmPassword,
            genders.get(this.state.selectedIndex),
            moment(values.dateofBirth).format("MM/DD/YYYY")
          );
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
                containerStyle={{ width: "80%", margin: 10 }}
                leftIconContainerStyle={{ marginLeft: 3.2, marginRight: 14 }}
                leftIcon={{
                  type: "font-awesome",
                  name: "user",
                  color: Themes.layoutTheme
                }}
                placeholder="Username"
                autoCapitalize="none"
                onChangeText={formikProps.handleChange("username")}
                errorMessage={
                  this.state.invalidFields ||
                  formikProps.getFieldMeta("username").value
                    ? formikProps.errors.username
                    : ""
                }
              />
              <Input
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
              <Input
                containerStyle={{ width: "80%", margin: 10 }}
                leftIconContainerStyle={{ marginLeft: 0, marginRight: 10 }}
                leftIcon={{
                  type: "simple-line-icon",
                  name: "lock",
                  color: Themes.layoutTheme
                }}
                placeholder="Confirm Password"
                secureTextEntry
                onChangeText={formikProps.handleChange("confirmPassword")}
                errorMessage={
                  this.state.invalidFields ||
                  formikProps.getFieldMeta("confirmPassword").value
                    ? formikProps.errors.confirmPassword
                    : ""
                }
              />
              <Input
                containerStyle={{ width: "80%", margin: 10 }}
                leftIconContainerStyle={{ marginLeft: 1, marginRight: 10 }}
                leftIcon={{
                  name: "calendar",
                  type: "simple-line-icon",
                  color: Themes.layoutTheme
                }}
                placeholder="Date of Birth"
                onFocus={Keyboard.dismiss}
                onTouchStart={this.showDateTimePicker}
                value={this.state.displayDate ? this.state.displayDate : ""}
                errorMessage={
                  this.state.invalidFields && this.state.displayDate == null
                    ? "Date of Birth is required"
                    : ""
                }
              />
              <ButtonGroup
                containerStyle={{ marginTop: 20, height: 40, width: "70%" }}
                selectedButtonStyle={{ backgroundColor: Themes.primaryTheme }}
                selectedIndex={this.state.selectedIndex}
                buttons={Array.from(genders.values())}
                onPress={index => {
                  this.setState({ selectedIndex: index });
                }}
              />
              <DateTimePicker
                isVisible={this.state.isDateTimePickerVisible}
                onConfirm={value => {
                  this.onDateTimePicked(value);
                  formikProps.setFieldValue("dateofBirth", value);
                }}
                onCancel={this.hideDateTimePicker}
              />
              {formikProps.isSubmitting ? (
                <Progress.Bar
                  style={{ marginTop: 25 }}
                  indeterminate
                  color={Themes.primaryTheme}
                />
              ) : (
                <Button
                  raised
                  containerStyle={{
                    width: "75%",
                    marginTop: 20
                  }}
                  buttonStyle={{ backgroundColor: Themes.primaryTheme }}
                  title="Sign Up"
                  onPress={() => {
                    formikProps.validateForm().then(() => {
                      formikProps.handleSubmit();
                    }, this.setState({ invalidFields: true }));
                  }}
                />
              )}
            </View>
          </Container>
        )}
      </Formik>
    );
  }
}
