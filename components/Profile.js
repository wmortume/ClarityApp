import React, { Component } from "react";
import {
  View,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Alert
} from "react-native";
import { Chip } from "react-native-paper";
import * as Progress from "react-native-progress";
import { Avatar, Icon, Input } from "react-native-elements";
import {
  Container,
  Content,
  Button,
  Text,
  Icon as NBIcon,
  Body,
  Right,
  Header,
  Title,
  Left,
  Footer,
  FooterTab
} from "native-base";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import fireStoreDB from "../database/FirestoreDB";

const Themes = {
  primaryTheme: "#30D921",
  secondaryTheme: "#B32D83",
  layoutTheme: "#c0c0c0"
};

const input = React.createRef();
export default class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      profile: null,
      bio: "",
      loading: false,
      interests: [],
      avatarError: ""
    };
  }

  componentDidMount() {
    if (fireStoreDB.getAvatar != null) {
      this.setState({ profile: fireStoreDB.getAvatar });
    }

    fireStoreDB.getBioInterests().then(profile => {
      this.setState({
        bio: profile.bio,
        interests: profile.interests,
        isReady: true
      });
    });
  }

  onChooseImageUpload = async () => {
    let perm = true;
    if (Platform.OS === "ios") {
      perm = false;
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status === "granted") {
        perm = true;
      }
    }
    if (perm === true) {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images
      });
      if (!result.cancelled) {
        this.setState({ profile: result.uri, loading: true });
        await fireStoreDB
          .uploadProfileImg(result.uri)
          .then(() => this.setState({ loading: false }));
      }
    }
  };

  GetTags = () => {
    const tagsComponent = [];
    if (typeof this.state.interests !== "undefined") {
      for (let i = 0; i < this.state.interests.length; i++) {
        tagsComponent.push(
          <Chip
            key={i}
            style={{ margin: 3 }}
            onClose={() => {
              this.setState(prevState => ({
                interests: prevState.interests.filter(
                  x => x !== prevState.interests[i]
                )
              }));
            }}
          >
            {this.state.interests[i]}
          </Chip>
        );
      }
    }
    return tagsComponent;
  };

  render() {
    const displayTags = this.GetTags();
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
              onPress={() => {
                Alert.alert("Sign Out", "Are you sure you want to sign out?", [
                  {
                    text: "Cancel",
                    style: "destructive"
                  },
                  {
                    text: "Confirm",
                    onPress: () =>
                      fireStoreDB
                        .signUserOut()
                        .then(() => this.props.navigation.navigate("Login"))
                  }
                ]);
              }}
            >
              <NBIcon name="logout" type="AntDesign" />
            </Button>
          </Left>
          <Body
            style={{
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              marginLeft: "20%"
            }}
          >
            <Title style={{ color: "#fff" }}>Profile</Title>
          </Body>
          <Right>
            <Button
              transparent
              style={{ marginTop: "3%" }}
              disabled={this.state.loading}
              onPress={() => {
                if (fireStoreDB.getAvatar == null) {
                  this.setState({
                    avatarError: {
                      containerStyle: { borderWidth: 1, borderColor: "red" }
                    }
                  });
                } else {
                  fireStoreDB
                    .updateProfile(
                      this.state.bio ? this.state.bio : "",
                      this.state.interests
                    )
                    .then(() => this.props.navigation.navigate("Home"));
                }
              }}
            >
              <Text>Save</Text>
            </Button>
          </Right>
        </Header>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          <Content>
            <View style={{ marginTop: "7%" }} />
            {this.state.profile ? (
              <Avatar
                size="xlarge"
                rounded
                containerStyle={{ alignSelf: "center" }}
                source={{ uri: this.state.profile }}
                showEditButton
                onEditPress={() => this.onChooseImageUpload()}
              />
            ) : (
              <Avatar
                {...this.state.avatarError}
                size="xlarge"
                rounded
                containerStyle={{ alignSelf: "center" }}
                icon={{
                  name: "user",
                  type: "font-awesome"
                }}
                showEditButton
                onEditPress={() => this.onChooseImageUpload()}
              />
            )}
            <Text
              uppercase={false}
              style={{
                fontWeight: "500",
                fontSize: 20,
                marginTop: "6%",
                marginLeft: "1%",
                color: "#5b5b5b"
              }}
            >
              About me
            </Text>
            <TextInput
              style={{
                borderColor: Themes.layoutTheme,
                borderWidth: 1,
                width: "100%",
                marginTop: 5,
                padding: 5,
                textAlignVertical: "top"
              }}
              multiline
              numberOfLines={7}
              placeholder="Type something about yourself..."
              onChangeText={text => this.setState({ bio: text })}
              value={this.state.bio}
            />
            <Text
              style={{
                fontWeight: "500",
                fontSize: 20,
                marginTop: 22,
                marginLeft: "1.5%",
                color: "#5b5b5b"
              }}
            >
              Interests
            </Text>
            <View
              style={{
                marginTop: 15,
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "flex-start"
              }}
            >
              {displayTags}
            </View>
            <Input
              ref={input}
              style
              inputContainerStyle={{
                borderBottomColor: Themes.layoutTheme
              }}
              placeholder="What are your interests?"
              onChangeText={text => {
                if (text.endsWith(",") || text.endsWith(" ")) {
                  const newText = text.substring(0, text.length - 1);
                  if (typeof this.state.interests === "undefined") {
                    this.setState({ interests: [newText] });
                  } else {
                    this.setState(prevState => ({
                      interests: [...prevState.interests, newText]
                    }));
                  }
                  input.current.clear();
                }
              }}
            />
          </Content>
        </KeyboardAvoidingView>
        {fireStoreDB.getAvatar !== null ? (
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
              <Button>
                <Icon
                  type="material-community"
                  name="account-edit"
                  color={Themes.primaryTheme}
                  size={32}
                />
              </Button>
              <Button
                onPress={() => this.props.navigation.navigate("Settings")}
              >
                <Icon
                  type="material"
                  name="settings"
                  color={Themes.layoutTheme}
                  size={28}
                />
              </Button>
            </FooterTab>
          </Footer>
        ) : (
          <View />
        )}
      </Container>
    );
  }
}
