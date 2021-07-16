import React, { Component } from "react";
import axios from "axios";
import Cookies from 'js-cookie';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import FormControl from '@material-ui/core/FormControl';
import classNames from 'classnames';
axios.defaults.xsrfHeaderName = "X-CSRFToken"
axios.defaults.xsrfCookieName = 'csrftoken'

class Forgot_password extends Component {
  state = {
    email: "",
    error: "",
  };

  handleChange = (event) => {
    this.setState({ email: event.target.value });
  };

  handleSubmit = (event) => {
    alert("OTP has sent to your mail");
    sessionStorage.setItem("requestEmail", this.state.email);
    const csrftoken = Cookies.get('csrftoken')
    axios({
      url:'api/ForgotPassword',
      method:'POST',
       data:{
        email: this.state.email,
       },
       headers: {"X-CSRFToken": csrftoken},
       responseType: 'json',
      })
      .then((res) => {
        if (res.data.cango) {
          this.props.history.push("/Otp");
        } else {
          this.setState({ error: this.state.email + res.data });
        }
      });
    event.preventDefault();
  };

  render() {
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
          <h1>Forgot Password</h1>
          <FormControl variant="outlined">
          <InputLabel htmlFor="outlined-adornment-password">Email</InputLabel>
          <OutlinedInput onChange={this.handleChange}
            type="email"
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="Email"
            label="Email"
            autoFocus
            autoComplete="email"
            value={this.state.email}
            style = {{marginBottom : "20px"}}
          />
          </FormControl>
          <p className="error">{this.state.error}</p>
          <input type="submit" name="login_submit" value="submit" />
          <a href="/">Login</a>
        </form>
      </div>
    );
  }
}

export default Forgot_password;
