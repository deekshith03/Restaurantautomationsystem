import React, { Component } from "react";
import "../App.css";
import axios from "axios";
import {Redirect} from 'react-router-dom';
import Cookies from 'js-cookie';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl'
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
axios.defaults.xsrfHeaderName = "X-CSRFToken"
axios.defaults.xsrfCookieName = 'csrftoken'


const theme = createMuiTheme({
  palette: {
    type: "dark"
  }
});

class Login extends Component {
  state = {
    email: "",
    password: "",
    EmailError: "",
    pass_error: "",
    showPassword: false,
  };
  

  handleChange1 = (event) => {
    this.setState({ email: event.target.value });
  };

  handleChange2 = (event) => {
    this.setState({ password: event.target.value });
  };

  
  handleSubmit = (event) => {
    const csrftoken = Cookies.get('csrftoken')
    axios({
      url:'api/loginCheck',
      method:'POST',
       data:{
        email: this.state.email,
        password: this.state.password,
       },
       headers: {"X-CSRFToken": csrftoken},
       responseType: 'json',
      })
      .then((res) => {
        if (res.data.type) {
          window.sessionStorage.setItem("email", res.data.email);
          window.sessionStorage.setItem("type", res.data.type);  
          window.location.reload();
              
        } else {
          if (res.data.err === "email"){
            this.setState({ EmailError: res.data.msg});
            this.setState({ pass_error: ""});
          }
          else{
            this.setState({ pass_error: res.data.msg});
            this.setState({ EmailError: ""});
          }
        }
      });
    event.preventDefault();
  };

  render() {
    if (window.sessionStorage.getItem("email") != null) {
      return (<Redirect to="/Demo" />  ) ;   
    }

    return (
      <div id="login">
        <div className="bg-img"></div>
        <form onSubmit={this.handleSubmit} className="login">
          <img
            src="https://www.fit2work.com.au/assets/img/avatars/LoginIconAppl.png"
            alt="profilepic"
            className="avatar"
          />
          <h1>Login</h1>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <FormControl variant="outlined">
          <InputLabel htmlFor="outlined-adornment-password">User Name</InputLabel>
          <OutlinedInput onChange={this.handleChange1}
            variant="outlined"
            margin="normal"
            fullWidth
            required
            id="email"
            label="User Name"
            type="email"
            autoComplete="email"
            value={this.state.email}
            style = {{marginBottom : "15px"}}
            autoFocus
            endAdornment={
              <InputAdornment position="end">
                <AccountCircleIcon />
              </InputAdornment>
            }
          />
          </FormControl>
          </ThemeProvider>
          
          {/* <i className="far fa-user-circle fa-lg"></i> */}
          <p className="error">{this.state.EmailError && <i class="fa fa-exclamation-circle fa-s" aria-hidden="true"></i>}{"  "+this.state.EmailError}</p>
          <ThemeProvider theme={theme}>
            <CssBaseline />
          <FormControl variant="outlined">
          <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
          <OutlinedInput onChange={this.handleChange2}
            type={this.state.showPassword ? 'text' : 'password'}
            variant="outlined"
            margin="normal"
            required
            fullWidth
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
                  // onMouseDown={(event) => {event.preventDefault()}}
                  edge="end"
                >
                  {console.log(this.state.showPassword)}
                  {this.state.showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            }
          />
          </FormControl>
          </ThemeProvider>
          <p className="error">{this.state.pass_error && <i class="fa fa-exclamation-circle fa-s" aria-hidden="true"></i>}{"  "+this.state.pass_error}</p>
          <input type="submit" name="login_submit" value="Submit" />
          <a href="/#/static/ForgotPassword">Forgot password</a>
        </form>
      </div>
    );
  }
}

export default Login;
