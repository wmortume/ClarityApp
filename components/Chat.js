import React, { Component } from "react";
import {
  View,
  KeyboardAvoidingView,
  Dimensions,
  Keyboard,
  Alert
} from "react-native";
import { GiftedChat } from "react-native-gifted-chat";
import * as Progress from "react-native-progress";
import {
  Container,
  Header,
  Left,
  Button as NBButton,
  Icon,
  Body,
  Title,
  Right
} from "native-base";
import Constants from "expo-constants";
import moment from "moment";
import DateTimePicker from "react-native-modal-datetime-picker";
import Modal, {
  ModalContent,
  ModalTitle,
  SlideAnimation
} from "react-native-modals";
import { TextInput, Button } from "react-native-paper";
import fireStoreDB from "../database/FirestoreDB";

const Themes = {
  primaryTheme: "#30D921",
  secondaryTheme: "#B32D83",
  layoutTheme: "#c0c0c0"
};

export default class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      newConvo: false,
      userToId: this.props.navigation.getParam("userToId"),
      isModalVisible: false,
      isDateTimePickerVisible: false,
      eventName: null,
      displayDateTime: null,
      dateTime: null,
      location: ""
    };
  }

  componentDidMount() {
    this.unsubscribe = fireStoreDB.getMessages(
      message =>
        this.setState(previousState => ({
          messages: GiftedChat.append(previousState.messages, message)
        })),
      this.chatId
    );
    fireStoreDB
      .getLastMessageBetweenUsers(fireStoreDB.getUID, this.state.userToId)
      .then(msg => {
        if (msg === "Say hi!") {
          this.setState({ newConvo: true });
        }
      });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  // gifted chat user props
  get user() {
    return {
      _id: fireStoreDB.getUID,
      name: fireStoreDB.getName,
      avatar: fireStoreDB.getAvatar
    };
  }

  // merge ids between two parties for one to one chat
  get chatId() {
    const userFromId = fireStoreDB.getUID;
    const chatIdArray = [];
    chatIdArray.push(userFromId);
    chatIdArray.push(this.state.userToId);
    chatIdArray.sort(); // prevents other party from recreating key
    return chatIdArray.join("_");
  }

  showDateTimePicker = () => {
    this.setState({ isDateTimePickerVisible: true });
  };

  hideDateTimePicker = () => {
    this.setState({ isDateTimePickerVisible: false });
  };

  onDateTimePicked = dateTime => {
    this.setState({
      dateTime,
      displayDateTime: moment(dateTime).format("MMMM Do YYYY, h:mm a")
    });
    this.hideDateTimePicker();
  };

  onCreateEvent = () => {
    if (this.state.eventName && this.state.dateTime && this.state.location) {
      fireStoreDB
        .createEvent(
          this.state.userToId,
          this.props.navigation.getParam("UserToName"),
          this.state.eventName,
          this.state.dateTime,
          this.state.location
        )
        .catch(() =>
          Alert.alert("Failed to create event", "One already exist.")
        );
    }
  };

  render() {
    const { width } = Dimensions.get("window");
    const optionalPadding = 40;
    const modalWidth = width - 2 * optionalPadding;
    if (this.state.newConvo === false && this.state.messages.length === 0) {
      return (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            flex: 1
          }}
        >
          <View
            style={{
              backgroundColor: Themes.primaryTheme,
              height: Constants.statusBarHeight
            }}
          />
          <Progress.Bar indeterminate color={Themes.primaryTheme} />
        </View>
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
            <NBButton
              transparent
              onPress={() => this.props.navigation.goBack()}
            >
              <Icon name="arrow-back" />
            </NBButton>
          </Left>
          <Body
            style={{
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              marginLeft: "20%"
            }}
          >
            <Title style={{ color: "#fff" }}>
              {this.props.navigation.getParam("UserToName")}
            </Title>
          </Body>
          <Right>
            <NBButton
              transparent
              style={{ marginTop: "4%" }}
              onPress={() => {
                this.setState({ isModalVisible: true });
              }}
            >
              <Icon name="calendar-clock" type="MaterialCommunityIcons" />
            </NBButton>
          </Right>
        </Header>
        <Modal
          modalStyle={{ marginBottom: "40%" }}
          visible={this.state.isModalVisible}
          width={modalWidth}
          modalTitle={<ModalTitle title="Schedule a Meet-up" />}
          modalAnimation={
            new SlideAnimation({
              initialValue: 0,
              slideFrom: "top",
              useNativeDriver: true
            })
          }
        >
          <ModalContent>
            <View
              style={{
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <TextInput
                label="Event Name"
                style={{ width: "100%", marginTop: "6%", marginBottom: "3%" }}
                theme={{ colors: { primary: Themes.primaryTheme } }}
                onChangeText={text => this.setState({ eventName: text })}
                value={this.state.eventName}
              />
              <TextInput
                label="Date & Time"
                style={{ width: "100%", marginVertical: "3%" }}
                theme={{ colors: { primary: Themes.primaryTheme } }}
                onFocus={Keyboard.dismiss}
                onTouchStart={this.showDateTimePicker}
                value={
                  this.state.displayDateTime ? this.state.displayDateTime : ""
                }
              />
              <TextInput
                label="Location"
                style={{ width: "100%", marginVertical: "3%" }}
                theme={{ colors: { primary: Themes.primaryTheme } }}
                onChangeText={text => this.setState({ location: text })}
                value={this.state.location}
              />
              <View style={{ flexDirection: "row", marginTop: "3%" }}>
                <Button
                  mode="text"
                  style={{ width: "40%", marginRight: "5%" }}
                  theme={{ colors: { primary: Themes.primaryTheme } }}
                  onPress={() => this.setState({ isModalVisible: false })}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  style={{
                    width: "40%",
                    marginRight: "5%",
                    backgroundColor: Themes.primaryTheme
                  }}
                  onPress={() => {
                    this.onCreateEvent();
                    this.setState({ isModalVisible: false });
                  }}
                >
                  Create
                </Button>
              </View>
              <DateTimePicker
                isVisible={this.state.isDateTimePickerVisible}
                mode="datetime"
                is24Hour={false}
                onConfirm={value => {
                  this.onDateTimePicked(value);
                }}
                onCancel={this.hideDateTimePicker}
              />
            </View>
          </ModalContent>
        </Modal>
        <View style={{ flex: 1 }}>
          <GiftedChat
            messages={this.state.messages}
            onSend={messages => fireStoreDB.sendMessages(messages, this.chatId)}
            user={this.user}
          />
          <KeyboardAvoidingView
            behavior="padding"
            keyboardVerticalOffset={80}
          />
        </View>
      </Container>
    );
  }
}
