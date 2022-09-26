import React, { Component } from "react";
import { View } from "react-native";
import {
  Container,
  Content,
  Text,
  Button,
  Title,
  Body,
  Header,
  Card,
  CardItem,
  Footer,
  FooterTab
} from "native-base";
import Constants from "expo-constants";
import * as Progress from "react-native-progress";
import moment from "moment";
import { Icon } from "react-native-elements";
import fireStoreDB from "../database/FirestoreDB";

const Themes = {
  primaryTheme: "#30D921",
  secondaryTheme: "#B32D83",
  layoutTheme: "#c0c0c0"
};

export default class ManageEvents extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userEvents: [],
      isReady: false,
      isDeleting: false
    };
  }

  componentDidMount() {
    fireStoreDB
      .getUser()
      .then(user => {
        if (
          typeof user.data().userEvents !== "undefined" &&
          user.data().userEvents.length > 0
        ) {
          this.setState({
            userEvents: user.data().userEvents
          });
        } else {
          this.setState({ userEvents: [] });
        }
      })
      .then(() => this.setState({ isReady: true }));
  }

  render() {
    let eventCards = null;
    if (this.state.userEvents && this.state.userEvents.length > 0) {
      eventCards = this.state.userEvents.map(event => (
        <Card key={event.eventWith.id}>
          <CardItem>
            <Text>
              {`${event.event} with ${event.eventWith.name} ${moment(
                new Date(event.dateTime.seconds * 1000)
              ).calendar()} in ${event.location}`}
            </Text>
          </CardItem>
          <CardItem
            disabled={this.state.isDeleting}
            footer
            button
            onPress={() => {
              this.setState({ isDeleting: true });
              fireStoreDB
                .removeEvent(this.state.userEvents, event.eventWith.id)
                .then(() =>
                  this.setState(
                    prevState => ({
                      userEvents: prevState.userEvents.filter(
                        prevEvent =>
                          prevEvent.eventWith.id !== event.eventWith.id
                      )
                    }),
                    () => this.setState({ isDeleting: false })
                  )
                );
            }}
          >
            {this.state.isDeleting ? (
              <Text style={{ color: "#c0c0c0" }}>Cancel</Text>
            ) : (
              <Text style={{ color: "#ff0000" }}>Cancel</Text>
            )}
          </CardItem>
        </Card>
      ));
    }
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
              marginLeft: "5%"
            }}
          >
            <Title style={{ color: "#fff" }}>Meet-ups</Title>
          </Body>
        </Header>
        {this.state.userEvents.length > 0 ? (
          <Content>{eventCards}</Content>
        ) : (
          <Content
            contentContainerStyle={{
              alignItems: "center",
              justifyContent: "center",
              flex: 1
            }}
          >
            <Text>You have no scheduled events yet</Text>
          </Content>
        )}

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
            <Button>
              <Icon
                type="material-community"
                name="calendar-clock"
                color={Themes.primaryTheme}
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
            <Button onPress={() => this.props.navigation.navigate("Settings")}>
              <Icon
                type="material"
                name="settings"
                color={Themes.layoutTheme}
                size={28}
              />
            </Button>
          </FooterTab>
        </Footer>
      </Container>
    );
  }
}
