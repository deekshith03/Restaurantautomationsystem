import React, { Component } from "react";
import axios from "axios";
import { Redirect } from "react-router-dom";
import Alert from "./Alert";
import Cookies from 'js-cookie';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl'
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import classNames from 'classnames';
axios.defaults.xsrfHeaderName = "X-CSRFToken"
axios.defaults.xsrfCookieName = 'csrftoken'
class ChangePassword extends Component {
  state = {
    password: "",
    cnf_password: "",
    show: false,
    message: "",
    type: "",
    showPassword: false,
    showPassword1: false,
  };

  handleChange = (event) => {
    this.setState({ password: event.target.value });
  };

  handleChange1 = (event) => {
    this.setState({ cnf_password: event.target.value });
  };

  handleSubmit = (event) => {
    if (this.state.password !== this.state.cnf_password) {
      this.setState({ show: false }, () => {
        this.setState({
          show: true,
          message: "Passwords don't match",
          type: "info",
        });
      });
    } else {
      const csrftoken = Cookies.get('csrftoken')
      axios({
        url:'api/ChangePassword',
        method:'POST',
        data:{
          email: sessionStorage.getItem("requestEmail"),
          password: this.state.password,
        },
        headers: {"X-CSRFToken": csrftoken},
        responseType: 'json',
        })
        .then((res) => {
          if (res.data.cango) {
            this.setState({ show: false });
            this.setState({
              show: true,
              message: "Password changed",
              type: "success",
            });
            sessionStorage.removeItem("requestEmail");
            sessionStorage.removeItem("otp_valid");
            this.props.history.push("/");
          } else {
            this.setState({ show: false });
            this.setState({
              show: true,
              message: res.data[0],
              type: res.data[1],
            });
          }
        });
    }
    event.preventDefault();
  };

  render() {
    if (sessionStorage.getItem("otp_valid")) {
      return (
        <div className="bg-img">
        <form
          onSubmit={this.handleSubmit}
          className={classNames('login', 'createuser')}
        >
          <img
            src="https://www.fit2work.com.au/assets/img/avatars/LoginIconAppl.png"
            alt="profilepic"
            className="avatar"
          />
          <h1>Change Password</h1>
              <FormControl variant="outlined">
                <InputLabel htmlFor="outlined-adornment-password">Enter Password</InputLabel>
                <OutlinedInput onChange={this.handleChange}
                  type={this.state.showPassword ? 'text' : 'password'}
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  autoFocus
                  name="password"
                  label="Password"
                  id="password"
                  value={this.state.password}
                  style = {{marginBottom : "15px"}}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => this.setState({showPassword : !this.state.showPassword})}
                        edge="end"
                      >
                        {this.state.showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </FormControl>
              <FormControl variant="outlined">
                <InputLabel htmlFor="outlined-adornment-password">Confirm Password</InputLabel>
                <OutlinedInput onChange={this.handleChange1}
                  type={this.state.showPassword1 ? 'text' : 'password'}
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  id="password"
                  value={this.state.cnf_password}
                  style = {{marginBottom : "15px"}}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => this.setState({showPassword1 : !this.state.showPassword1})}
                        edge="end"
                      >
                        {this.state.showPassword1 ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </FormControl>
              <Alert
                time="5000"
                show={this.state.show}
                message={this.state.message}
                type={this.state.type}
              />
              <input type="submit" name="login_submit" value="submit" />
              <a href="/">Login</a>
            </form>
        </div>
      );
    } else {
      return <Redirect to="/" />;
    }
  }
}

export default ChangePassword;
