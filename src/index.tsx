// Theming
import { loadTheme, ITheme } from "@microsoft/load-themed-styles";

// Override theme
loadTheme({
  themeDarker: "#cfac1e",
  themeDark: "#dfbb28",
  themeDarkAlt: "#e3c23e",
  themePrimary: "#e6c954",
  themeSecondary: "#e9d06a",
  themeTertiary: "#edd780",
  themeLight: "#f3e5ad",
  themeLighter: "#faf3d9",
  themeLighterAlt: "#fdfaf0",
});

import "./styles/index.scss";

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Redux from "redux";
import { Provider } from "react-redux";

import { Router, Route, IndexRoute, browserHistory } from "react-router";
import { syncHistoryWithStore, routerMiddleware } from "react-router-redux";
import thunkMiddleware from "redux-thunk";
import * as createLogger from "redux-logger";
import promiseMiddleware from "./middleware/promise-middleware";

// Reducers
import { makeImmutable, IImmutable } from "immuts";
import rootReducer from "./reducers/index";

// Components
import MainLayout from "./components/layouts/main";
import PublicLayout from "./components/layouts/public";
import PublicNav from "./components/navigation/public";
import Game from "./components/navigation/game";
import Create from "./pages/create/create";
import { Home, Signup, Login } from "./pages/public";


// Create main store
const store = Redux.createStore(
  rootReducer,
  Redux.compose(
    Redux.applyMiddleware(
      routerMiddleware(browserHistory),
      promiseMiddleware as any,
      thunkMiddleware,
      createLogger()),
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__({
      serializeState: (key, value) => value && value.data ? value.data : value,
      deserializeState: (state) => ({
        routing: state && state.routing,
        sessions: makeImmutable(state.session),
        create: makeImmutable(state.create)
      }),
      shouldHotReload: false
    })));

// Work around typings error by casting to any
const history: any = syncHistoryWithStore(browserHistory as any, store);

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      { /* main layout */}
      <Route component={MainLayout}>
        {/* public */}
        <Route path="/" components={{ nav: PublicNav, content: PublicLayout }}>
          <IndexRoute component={Home} />

          <Route path="signup" component={Signup} />
          <Route path="login" component={Login} />
        </Route>

        {/* in game */}
        <Route path="game" components={{ nav: Game, content: Home }}>

        </Route>
      </Route>
    </Router>
  </Provider >,
  document.getElementById("root")
);