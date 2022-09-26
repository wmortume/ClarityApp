import React, { Component } from "react";
import { View, Switch, Alert, Dimensions } from "react-native";
import { Icon } from "react-native-elements";
import * as Progress from "react-native-progress";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import {
  Container,
  Content,
  Button,
  Text,
  ListItem,
  Body,
  Right,
  Header,
  Title,
  Left,
  Footer,
  FooterTab
} from "native-base";
import Constants from "expo-constants";
import { Notifications } from "expo";
import * as Permissions from "expo-permissions";
import fireStoreDB from "../database/FirestoreDB";

const Themes = {
  primaryTheme: "#30D921",
  secondaryTheme: "#B32D83",
  layoutTheme: "#c0c0c0",
  textTheme: "#808080"
};

export default class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isReady: false,
      showNotification: false,
      showMen: true,
      showWomen: true,
      showOther: true,
      minAge: 18,
      maxAge: 100
    };
  }

  componentDidMount() {
    fireStoreDB
      .getUser()
      .then(user => {
        if (
          typeof user.data().showMen !== "undefined" &&
          typeof user.data().showWomen !== "undefined" &&
          typeof user.data().showOther !== "undefined" &&
          user.data().minAge &&
          user.data().maxAge
        ) {
          this.setState({
            showMen: user.data().showMen,
            showWomen: user.data().showWomen,
            showOther: user.data().showOther,
            minAge: user.data().minAge,
            maxAge: user.data().maxAge
          });
        }
        if (user.data().notificationToken) {
          this.setState({ showNotification: true });
        }
      })
      .then(() => this.setState({ isReady: true }));
  }

  registerForPushNotifications = async () => {
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }
    if (finalStatus === "granted") {
      await Notifications.getExpoPushTokenAsync().then(
        token => {
          fireStoreDB.updateUserNotificationToken(
            this.state.showNotification,
            token
          );
        },
        () => this.setState({ showNotification: false })
      );
    } else {
      this.setState({ showNotification: false });
    }
  };

  render() {
    const { width } = Dimensions.get("window");
    const optionalPadding = 30;
    const mySliderLength = width - 2 * optionalPadding;
    if (!this.state.isReady) {
      return (
        <Container>
          <View
            style={{
              backgroundColor: Themes.primaryTheme,
              height: Constants.statusBarHeight
            }}
          />
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              flex: 1
            }}
          >
            <Progress.Bar indeterminate color={Themes.primaryTheme} />
          </View>
        </Container>
      );
    }
    return (
      <Container
        style={{
          backgroundColor: "#f4f4f4"
        }}
      >
        <View
          style={{
            backgroundColor: Themes.primaryTheme,
            height: Constants.statusBarHeight
          }}
        />
        <Header
          style={{
            backgroundColor: Themes.primaryTheme
          }}
        >
          <Body
            style={{
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              marginLeft: "35%"
            }}
          >
            <Title style={{ color: "#fff" }}>Settings</Title>
          </Body>
          <Right>
            <Button
              transparent
              style={{ marginTop: "3%" }}
              onPress={() => {
                if (
                  !this.state.showMen &&
                  !this.state.showWomen &&
                  !this.state.showOther
                ) {
                  Alert.alert(
                    "Cant update settings",
                    "At least one gender must be enabled"
                  );
                } else {
                  fireStoreDB
                    .updateUserSettings(
                      this.state.showMen,
                      this.state.showWomen,
                      this.state.showOther,
                      this.state.minAge,
                      this.state.maxAge
                    )
                    .then(() => this.props.navigation.navigate("Home"));
                }
              }}
            >
              <Text>Done</Text>
            </Button>
          </Right>
        </Header>
        <Content>
          <ListItem itemDivider>
            <Text
              style={{
                fontWeight: "500",
                fontSize: 18
              }}
            >
              Show
            </Text>
          </ListItem>
          <View style={{ backgroundColor: "#fff" }}>
            <ListItem
              style={{
                borderBottomWidth: 0,
                height: 35
              }}
            >
              <Body>
                <Text style={{ color: Themes.textTheme }}>Men</Text>
              </Body>
              <Right>
                <Switch
                  thumbColor={Themes.primaryTheme}
                  value={this.state.showMen}
                  onValueChange={value => this.setState({ showMen: value })}
                />
              </Right>
            </ListItem>
          </View>
          <View style={{ backgroundColor: "#fff" }}>
            <ListItem style={{ borderBottomWidth: 0, height: 35 }}>
              <Body>
                <Text style={{ color: Themes.textTheme }}>Women</Text>
              </Body>
              <Right>
                <Switch
                  thumbColor={Themes.primaryTheme}
                  value={this.state.showWomen}
                  onValueChange={value => this.setState({ showWomen: value })}
                />
              </Right>
            </ListItem>
          </View>
          <View style={{ backgroundColor: "#fff" }}>
            <ListItem style={{ borderBottomWidth: 0, height: 35 }}>
              <Body>
                <Text style={{ color: Themes.textTheme }}>Other</Text>
              </Body>
              <Right>
                <Switch
                  thumbColor={Themes.primaryTheme}
                  value={this.state.showOther}
                  onValueChange={value => this.setState({ showOther: value })}
                />
              </Right>
            </ListItem>
          </View>
          <ListItem itemDivider>
            <Left>
              <Text
                style={{
                  fontWeight: "500",
                  fontSize: 18
                }}
              >
                Age Range
              </Text>
            </Left>
            <Right style={{ marginRight: 10 }}>
              <Text>{`${this.state.minAge} - ${this.state.maxAge}`}</Text>
            </Right>
          </ListItem>
          <View style={{ backgroundColor: "#fff" }}>
            <ListItem style={{ borderBottomWidth: 0, height: 50 }}>
              <Body>
                <MultiSlider
                  selectedStyle={{ backgroundColor: Themes.primaryTheme }}
                  containerStyle={{
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  markerStyle={{
                    borderWidth: 10,
                    borderColor: Themes.primaryTheme
                  }}
                  min={18}
                  max={100}
                  sliderLength={mySliderLength}
                  values={[this.state.minAge, this.state.maxAge]}
                  onValuesChange={values =>
                    this.setState({ minAge: values[0], maxAge: values[1] })}
                />
              </Body>
            </ListItem>
          </View>
          <ListItem itemDivider>
            <Text
              style={{
                fontWeight: "500",
                fontSize: 18
              }}
            >
              Other Settings
            </Text>
          </ListItem>
          <View style={{ backgroundColor: "#fff" }}>
            <ListItem style={{ borderBottomWidth: 0, height: 50 }}>
              <Body>
                <Text style={{ color: Themes.textTheme }}>
                  Allow Notifications
                </Text>
              </Body>
              <Right>
                <Switch
                  thumbColor={Themes.primaryTheme}
                  value={this.state.showNotification}
                  onValueChange={value => {
                    this.setState({ showNotification: value });
                    if (value) {
                      this.registerForPushNotifications();
                    } else {
                      fireStoreDB.updateUserNotificationToken(value);
                    }
                  }}
                />
              </Right>
            </ListItem>
          </View>
          <ListItem
            itemDivider
            style={{ alignItems: "center", justifyContent: "center" }}
          >
            <Button
              block
              style={{
                backgroundColor: "#ff0000",
                marginRight: 5,
                marginTop: 15,
                width: "100%"
              }}
              onPress={() =>
                Alert.alert(
                  "Delete Account",
                  "Deleting your account will delete all of your data and can't be undone!",
                  [
                    {
                      text: "Cancel",
                      style: "destructive"
                    },
                    {
                      text: "Confirm",
                      onPress: () =>
                        fireStoreDB
                          .deleteUserAccount()
                          .then(() => this.props.navigation.navigate("Login"))
                    }
                  ]
                )}
            >
              <Text>Delete Account</Text>
            </Button>
          </ListItem>
        </Content>
        <Footer>
          <FooterTab style={{ backgroundColor: "#fff" }}>
            <Button onPress={() => this.props.navigation.navigate("Home")}>
              <Icon
                type="material-community"
                name="chat"
                color={Themes.layoutTheme}
                size={32}
              />
            </Button>
            <Button
              onPress={() => this.props.navigation.navigate("ManageEvents")}
            >
              <Icon
                type="material-community"
                name="calendar-clock"
                color={Themes.layoutTheme}
                size={28}
              />
            </Button>
            <Button onPress={() => this.props.navigation.navigate("Profile")}>
              <Icon
                type="material-community"
                name="account-edit"
                color={Themes.layoutTheme}
                size={32}
              />
            </Button>
            <Button>
              <Icon
                type="material"
                name="settings"
                color={Themes.primaryTheme}
                size={28}
              />
            </Button>
          </FooterTab>
        </Footer>
      </Container>
    );
  }
}
