import Login from "./components/Login.js";
import Manager from "./components/Manager.js";
import CreateUser from "./components/CreateUser.js";
import { HashRouter  as Router, Switch, Route } from "react-router-dom";
import Forgot_password from "./components/forgot_password.js";
import Otp from "./components/OTP.js";
import ChangePassword from "./components/ChangePassword.js";
import LogOut from "./components/logout.js";
import PrimaryAppBar from "./components/PrimaryAppBar.js";

const Routes = () => (
  <Router basename="/static">
    <Switch>
      <Route exact path="/" component={Login} />
      <Route path="/Manager" component={Manager} />
      <Route path="/CreateUser" component={CreateUser} />
      <Route path="/ForgotPassword" component={Forgot_password} />
      <Route path="/Otp" component={Otp} />
      <Route path="/changePassword" component={ChangePassword} />
      <Route path="/Logout" component={LogOut} />
      <Route path="/Demo" component={PrimaryAppBar} />
    </Switch>
  </Router>
);

export default Routes;
