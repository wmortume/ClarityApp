import { createStackNavigator } from "react-navigation-stack";
import { createAppContainer } from "react-navigation";
// eslint-disable-next-line import/no-unresolved
import StackViewTransitionConfigs from "react-navigation-stack/src/views/StackView/StackViewTransitionConfigs";
import Register from "./components/Register";
import Chat from "./components/Chat";
import Login from "./components/Login";
import Home from "./components/Home";
import Profile from "./components/Profile";
import Settings from "./components/Settings";
import ManageEvents from "./components/ManageEvents";
import ViewProfile from "./components/ViewProfile";

// TODO: add additional firebase rules
const RootStack = createStackNavigator(
  {
    Login,
    ManageEvents,
    ViewProfile,
    Home,
    Profile,
    Settings,
    Register,
    Chat
  },
  {
    transitionConfig: () => StackViewTransitionConfigs.SlideFromRightIOS,
    headerMode: "none"
  }
);

const AppContainer = createAppContainer(RootStack);

export default AppContainer;
