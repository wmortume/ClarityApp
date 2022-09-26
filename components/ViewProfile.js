import React, { Component } from "react";
import { View, Platform, Dimensions, ImageBackground } from "react-native";
import {
  Card,
  Title,
  CardItem,
  Body,
  Text,
  Container,
  Header,
  Left,
  Button,
  Icon
} from "native-base";
import Constants from "expo-constants";

const BOTTOM_BAR_HEIGHT = !Platform.isPad ? 29 : 49;

const Themes = {
  primaryTheme: "#30D921",
  secondaryTheme: "#B32D83",
  layoutTheme: "#c0c0c0",
  textTheme: "#808080"
};

export default class ViewProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      profile: this.props.navigation.getParam("profile"),
      name: this.props.navigation.getParam("name"),
      age: this.props.navigation.getParam("age"),
      gender: this.props.navigation.getParam("gender"),
      interests: this.props.navigation.getParam("interests")
    };
  }

  render() {
    const { width } = Dimensions.get("window");
    const { height } = Dimensions.get("window");
    return (
      <Container>
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
          <Left>
            <Button
              transparent
              style={{ marginTop: "4%", width: 42 }}
              onPress={() => this.props.navigation.goBack()}
            >
              <Icon name="arrow-back" />
            </Button>
          </Left>
          <Body
            style={{
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              marginRight: "16%"
            }}
          >
            <Title style={{ color: "#fff" }}>
              {`Viewing ${this.state.name}'s Profile`}
            </Title>
          </Body>
        </Header>
        <Card
          style={{
            marginTop: "5%",
            borderRadius: 20,
            overflow: "hidden",
            width: width - 30,
            alignSelf: "center"
          }}
        >
          <CardItem cardBody>
            <ImageBackground
              source={{
                uri: this.state.profile
              }}
              style={{
                width: width - 30,
                height: height - BOTTOM_BAR_HEIGHT * 6
              }}
            >
              <Text
                style={{
                  position: "absolute",
                  left: "5%",
                  bottom: "3%",
                  color: "#fff",
                  fontSize: 25,
                  fontFamily: "open-sans-semi-bold"
                }}
              >
                {`${this.state.name}, ${this.state.gender}, ${this.state.age}`}
              </Text>
            </ImageBackground>
          </CardItem>
          {this.state.interests.length > 0 && (
            <CardItem style={{ backgroundColor: Themes.primaryTheme }}>
              <Text>
                <Text
                  style={{ color: "#fff", fontFamily: "open-sans-semi-bold" }}
                >
                  {`Likes ${this.state.interests.join(", ")}`}
                </Text>
              </Text>
            </CardItem>
          )}
        </Card>
      </Container>
    );
  }
}
