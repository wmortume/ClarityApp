import firebase from "firebase";
import "firebase/firestore";
import "firebase/storage";
// import 'firebase/analytics'
import { AgeFromDateString } from "age-calculator";

class FirestoreDB {
  // your firebase configs

  createUserAccount = async (user, rejectCallback) => {
    firebase
      .auth()
      .createUserWithEmailAndPassword(user.email, user.password)
      .then(
        () => {
          const getUser = firebase.auth().currentUser;
          getUser.updateProfile({ displayName: user.username }).then(() => {
            firebase
              .firestore()
              .collection("users")
              .doc(getUser.uid)
              .set({
                username: getUser.displayName,
                gender: user.gender,
                dob: user.dateofBirth
              });
          });
        },
        err => rejectCallback(err.message)
      );
  };

  deleteUserAccount = async () => {
    const getUser = firebase.auth().currentUser;

    await firebase
      .firestore()
      .collectionGroup("chats")
      .where("members", "array-contains", getUser.uid)
      .get()
      .then(snapshot => {
        snapshot.docs.forEach(doc => {
          doc.ref.delete();
        });
      });

    await firebase
      .firestore()
      .collection("users")
      .doc(getUser.uid)
      .delete();

    await firebase
      .storage()
      .ref(`profiles/${getUser.uid}/profile`)
      .delete();

    await getUser.delete();
  };

  signUserIn = async (user, successCallback, rejectCallback) => {
    firebase
      .auth()
      .signInWithEmailAndPassword(user.email, user.password)
      .then(successCallback, rejectCallback);
  };

  signUserOut = async () => {
    await firebase.auth().signOut();
  };

  uploadProfileImg = async uri => {
    const getUser = firebase.auth().currentUser;
    const response = await fetch(uri);
    const blob = await response.blob();
    await firebase
      .storage()
      .ref(`profiles/${getUser.uid}/profile`)
      .put(blob)
      .then(() =>
        firebase
          .storage()
          .ref(`profiles/${getUser.uid}/profile`)
          .getDownloadURL()
          .then(async url => {
            await getUser.updateProfile({ photoURL: url }).then(() => {
              firebase
                .firestore()
                .collection("users")
                .doc(getUser.uid)
                .update({
                  profile: getUser.photoURL
                });
            });
          })
      );
  };

  updateProfile = async (bio, interests) => {
    const uniqueInterests = Array.from(new Set(interests));
    await firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .update({
        bio,
        interests: uniqueInterests
      });
  };

  getBioInterests = async () => {
    const profile = await firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then(user => {
        return {
          bio: user.data().bio,
          interests: user.data().interests
        };
      });
    return profile;
  };

  get getUID() {
    return firebase.auth().currentUser.uid;
  }

  get getName() {
    return firebase.auth().currentUser.displayName;
  }

  get getAvatar() {
    return firebase.auth().currentUser.photoURL;
  }

  updateUserNotificationToken = async (showNotification, token = null) => {
    if (showNotification) {
      await firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .update({
          notificationToken: token
        });
    } else {
      await firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .update({
          notificationToken: firebase.firestore.FieldValue.delete()
        });
    }
  };

  updateUserSettings = async (
    showMen,
    showWomen,
    showOther,
    minAge,
    maxAge
  ) => {
    await firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .update({
        showMen,
        showWomen,
        showOther,
        minAge,
        maxAge
      });
  };

  getUser = async () => {
    const user = await firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();
    return user;
  };

  async getAllUsersExceptCurrent() {
    const lowerPromise = firebase
      .firestore()
      .collection("users")
      .where(
        firebase.firestore.FieldPath.documentId(),
        "<",
        firebase.auth().currentUser.uid
      )
      .get();

    const upperPromise = firebase
      .firestore()
      .collection("users")
      .where(
        firebase.firestore.FieldPath.documentId(),
        ">",
        firebase.auth().currentUser.uid
      )
      .get();

    const [lowerSnapshot, upperSnapshot] = await Promise.all([
      lowerPromise,
      upperPromise
    ]);

    const lowerData = lowerSnapshot.docs.map(user => {
      let event = null;
      if (typeof user.data().userEvents !== "undefined") {
        user.data().userEvents.forEach(_event => {
          if (
            _event.eventWith.id &&
            _event.eventWith.id === fireStoreDB.getUID
          ) {
            event = _event;
            event.dateTime = new Date(_event.dateTime.seconds * 1000);
          }
        });
      }
      return {
        id: user.id,
        age: new AgeFromDateString(user.data().dob).age,
        username: user.data().username,
        profile: user.data().profile,
        gender: user.data().gender,
        interests: user.data().interests,
        userEvents: event
      };
    });

    const upperData = upperSnapshot.docs.map(user => {
      let event = null;
      if (typeof user.data().userEvents !== "undefined") {
        user.data().userEvents.forEach(_event => {
          if (
            _event.eventWith.id &&
            _event.eventWith.id === fireStoreDB.getUID
          ) {
            event = _event;
            event.dateTime = new Date(_event.dateTime.seconds * 1000);
          }
        });
      }
      return {
        id: user.id,
        age: new AgeFromDateString(user.data().dob).age,
        username: user.data().username,
        profile: user.data().profile,
        gender: user.data().gender,
        interests: user.data().interests,
        userEvents: event
      };
    });

    return lowerData.concat(upperData);
  }

  async getLastMessageBetweenUsers(currentUserId, userToId) {
    let id = [currentUserId, userToId];
    id.sort();
    id = id.join("_");
    const snapshot = await firebase
      .firestore()
      .collection("messages")
      .doc(id)
      .collection("chats")
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();
    return typeof snapshot.docs[0] !== "undefined"
      ? snapshot.docs[0].data().text
      : "Say hi!";
  }

  lastMsgListener = loadUsersCallback => {
    return firebase
      .firestore()
      .collectionGroup("chats")
      .onSnapshot(() => {
        loadUsersCallback();
      });
  };

  userProfileListener = loadUsersCallback => {
    return firebase
      .firestore()
      .collection("users")
      .onSnapshot(() => {
        loadUsersCallback();
      });
  };

  createEvent = async (userToId, userToName, event, dateTime, location) => {
    const eventExist = await firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then(e => {
        if (e.data().userEvents) {
          if (
            e.data().userEvents.filter(f => f.eventWith.id === userToId)
              .length > 0
          ) {
            return true;
          }
          return false;
        }
        return false;
      });

    if (eventExist) {
      return Promise.reject(new Error("Exist"));
    }
    const userEvent = {
      event,
      eventWith: {
        id: userToId,
        name: userToName
      },
      dateTime,
      location
    };

    const userEvents = [];
    await firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then(e => {
        if (e.data().userEvents) {
          e.data().userEvents.forEach(_e => userEvents.push(_e));
        }
      });
    userEvents.push(userEvent);

    await firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .update({
        userEvents
      });

    const userAccepterEvents = [];
    await firebase
      .firestore()
      .collection("users")
      .doc(userToId)
      .get()
      .then(e => {
        if (e.data().userEvents) {
          e.data().userEvents.forEach(_e => userAccepterEvents.push(_e));
        }
      });
    userEvent.eventWith.id = fireStoreDB.getUID;
    userEvent.eventWith.name = fireStoreDB.getName;
    userAccepterEvents.push(userEvent);

    await firebase
      .firestore()
      .collection("users")
      .doc(userToId)
      .update({
        userEvents: userAccepterEvents
      });
    return Promise.resolve();
  };

  removeEvent = async (events, eventWithId) => {
    if (
      events.filter(event => event.eventWith.id !== eventWithId).length === 0
    ) {
      await firebase
        .firestore()
        .collection("users")
        .doc(fireStoreDB.getUID)
        .update({
          userEvents: firebase.firestore.FieldValue.delete()
        });
    } else {
      await firebase
        .firestore()
        .collection("users")
        .doc(fireStoreDB.getUID)
        .update({
          userEvents: events.filter(event => event.eventWith.id !== eventWithId)
        });
    }

    const userToEvents = await firebase
      .firestore()
      .collection("users")
      .doc(eventWithId)
      .get()
      .then(event => {
        return event.data().userEvents;
      });

    if (
      userToEvents.filter(event => event.eventWith.id !== fireStoreDB.getUID)
        .length === 0
    ) {
      await firebase
        .firestore()
        .collection("users")
        .doc(eventWithId)
        .update({
          userEvents: firebase.firestore.FieldValue.delete()
        });
    } else {
      await firebase
        .firestore()
        .collection("users")
        .doc(eventWithId)
        .update({
          userEvents: userToEvents.filter(
            event => event.eventWith.id !== fireStoreDB.getUID
          )
        });
    }
  };

  // all props are gifted chat props except for stamps and members which are custom
  parseUserMessages = snapshot => {
    const _id = snapshot.doc.id;
    const { text, user } = snapshot.doc.data();
    const stampInSeconds = snapshot.doc.data().createdAt.seconds;
    const createdAt = new Date(stampInSeconds * 1000);
    const { members } = snapshot.doc.data();
    const message = {
      _id,
      createdAt,
      text,
      user,
      members
    };
    return message;
  };

  getMessages = (callback, chatId) => {
    return firebase
      .firestore()
      .collection("messages")
      .doc(chatId)
      .collection("chats")
      .orderBy("createdAt")
      .onSnapshot(snapshot => {
        const changes = snapshot.docChanges();
        changes.map(change => callback(this.parseUserMessages(change)));
      });
  };

  // sends only specific properties to firestore
  sendMessages = (messages, chatId) => {
    for (let i = 0; i < messages.length; i++) {
      const { text, user } = messages[i];
      const message = {
        text,
        user,
        createdAt: firebase.firestore.Timestamp.now(),
        members: chatId.split("_")
      };
      this.concat(chatId, message);
    }
  };

  concat = async (chatId, message) => {
    await firebase
      .firestore()
      .collection("messages")
      .doc(chatId)
      .collection("chats")
      .add(message);
  };
}

const fireStoreDB = new FirestoreDB();
export default fireStoreDB;
