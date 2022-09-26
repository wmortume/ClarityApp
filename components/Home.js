import React, { Component } from "react";
import { View, FlatList } from "react-native";
import { ListItem, Icon, SearchBar, Avatar } from "react-native-elements";
import * as Progress from "react-native-progress";
import {
  Container,
  Content,
  Button,
  Text,
  Footer,
  FooterTab
} from "native-base";
import { Ionicons } from "@expo/vector-icons";
import * as Font from "expo-font";
import Constants from "expo-constants";
import _ from "lodash";
import moment from "moment";
import fireStoreDB from "../database/FirestoreDB";

const Themes = {
  primaryTheme: "#30D921",
  secondaryTheme: "#B32D83",
  layoutTheme: "#c0c0c0"
};

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isReady: false,
      usersExist: true,
      usersMatch: true,
      usersInfo: [],
      showMen: true,
      showWomen: true,
      showOther: true,
      minAge: 18,
      maxAge: 100,
      query: "",
      searchLoading: false
    };
    this.onChangeTextDelayed = _.debounce(this.LoadUsers, 1200);
  }

  async componentDidMount() {
    await Font.loadAsync({
      "open-sans-semi-bold": require("../assets/fonts/OpenSans-SemiBold.ttf"),
      Roboto: require("../node_modules/native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("../node_modules/native-base/Fonts/Roboto_medium.ttf"),
      ...Ionicons.font
    });

    this.unsubscribeMsg = fireStoreDB.lastMsgListener(this.LoadUsers);
    this.unsubscribeUser = fireStoreDB.userProfileListener(this.LoadUsers);
    this.setState({ isReady: true });
  }

  componentWillUnmount() {
    this.unsubscribeUser();
    this.unsubscribeMsg();
  }

  LoadUsers = search => {
    this.setState({ searchLoading: true });
    fireStoreDB.getUser().then(user => {
      if (user.data().showMen) {
        this.setState({ showMen: true });
      } else {
        this.setState({ showMen: false });
      }
      if (user.data().showWomen) {
        this.setState({ showWomen: true });
      } else {
        this.setState({ showWomen: false });
      }
      if (user.data().showOther) {
        this.setState({ showOther: true });
      } else {
        this.setState({ showOther: false });
      }

      if (user.data().minAge && user.data().maxAge) {
        this.setState({
          minAge: user.data().minAge,
          maxAge: user.data().maxAge
        });
      }
    });
    fireStoreDB
      .getAllUsersExceptCurrent()
      .then(users =>
        Promise.all(
          users.map(
            ({ id, username, profile, age, gender, interests, userEvents }) =>
              fireStoreDB
                .getLastMessageBetweenUsers(fireStoreDB.getUID, id)
                .then(message => ({
                  id,
                  username,
                  profile,
                  message,
                  age,
                  gender,
                  interests,
                  userEvents
                }))
          )
        )
      )
      .then(users => {
        if (users.length === 0) {
          this.setState({ usersExist: false });
        } else {
          this.setState({ usersExist: true });
          const { minAge } = this.state;
          const { maxAge } = this.state;
          const genders = [];
          if (this.state.showMen) {
            genders.push("Male");
          }
          if (this.state.showWomen) {
            genders.push("Female");
          }
          if (this.state.showOther) {
            genders.push("Other");
          }

          this.setState({
            usersInfo: users.filter(
              x =>
                typeof x.profile !== "undefined" &&
                x.age >= minAge &&
                x.age <= maxAge &&
                (genders.length ? genders.includes(x.gender) : x) &&
                (search
                  ? x.interests
                      .map(interest => interest.toLowerCase())
                      .includes(search)
                  : x)
            )
          });
          if (this.state.usersInfo.length === 0) {
            this.setState({ usersMatch: false });
          } else {
            this.setState({ usersMatch: true });
          }
        }
      })
      .then(() => this.setState({ searchLoading: false }));
  };

  renderItem = ({ item }) => (
    <ListItem
      onPress={() => {
        this.props.navigation.navigate("Chat", {
          userToId: item.id,
          UserToName: item.username
        });
      }}
      titleStyle={{
        marginTop: "5%",
        fontFamily: "open-sans-semi-bold",
        fontSize: 20
      }}
      title={item.username}
      leftAvatar={(
        <Avatar
          containerStyle={{
            width: 50,
            height: 50,
            borderRadius: 25,
            overflow: "hidden"
          }}
          source={{ uri: item.profile }}
          onPress={() => {
            this.props.navigation.navigate("ViewProfile", {
              profile: item.profile,
              name: item.username,
              age: item.age,
              gender: item.gender,
              interests: item.interests
            });
          }}
        />
      )}
      subtitleStyle={{ fontSize: 14, marginBottom: "5%" }}
      subtitle={item.message}
      rightSubtitleStyle={{
        width: "250%",
        marginLeft: "20%",
        marginBottom: "20%",
        fontSize: 10,
        color: Themes.secondaryTheme
      }}
      rightSubtitle={
        item.userEvents
          ? `${item.userEvents.event} ${moment(
              item.userEvents.dateTime
            ).calendar()}\nin ${item.userEvents.location}`
          : ""
      }
      bottomDivider
      chevron
    />
  );

  render() {
    if (
      !this.state.isReady ||
      (this.state.usersExist &&
        this.state.usersMatch &&
        this.state.usersInfo.length === 0)
    ) {
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
      <Container>
        <View
          style={{
            backgroundColor: Themes.primaryTheme,
            height: Constants.statusBarHeight
          }}
        />
        <SearchBar
          showLoading={this.state.searchLoading}
          placeholder="Search users by interest..."
          lightTheme
          round
          onChangeText={search => {
            this.setState({ query: search });
            this.onChangeTextDelayed(search.toLowerCase());
          }}
          value={this.state.query}
        />
        {!this.state.usersExist || !this.state.usersMatch ? (
          <Content
            contentContainerStyle={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Text>
              No Users
              {!this.state.usersExist ? " Yet" : " Found"}
            </Text>
          </Content>
        ) : (
          <Content>
            <FlatList
              data={this.state.usersInfo}
              renderItem={this.renderItem}
              keyExtractor={item => item.id}
            />
          </Content>
        )}
        <Footer>
          <FooterTab style={{ backgroundColor: "#fff" }}>
            <Button>
              <Icon
                type="material-community"
                name="chat"
                color={Themes.primaryTheme}
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
