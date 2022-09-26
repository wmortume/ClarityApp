const functions = require("firebase-functions");
const admin = require("firebase-admin");
var fetch = require("node-fetch");

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

//notifies receiver message from sender
exports.sendPushNotifications = functions.firestore
  .document("/messages/{chatId}/chats/{messageId}")
  .onCreate(data => {
    let message = "";
    const members = data.get("members");
    const senderId = data.get("user._id");
    const senderName = data.get("user.name");
    const receiverId = members.filter(member => member !== senderId)[0];
    const text = data.get("text");
    return db
      .collection("users")
      .where(admin.firestore.FieldPath.documentId(), "==", receiverId)
      .get()
      .then(users => {
        const token = users.docs[0].data().notificationToken;
        if (token) {
          message = {
            to: token,
            title: `${senderName} sent you a message`,
            body: text
          };
        }
        return message;
      })
      .then(message => {
        return fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: {
            host: "exp.host",
            accept: "application/json",
            "content-type": "application/json"
          },
          body: JSON.stringify(message)
        });
      });
  });
