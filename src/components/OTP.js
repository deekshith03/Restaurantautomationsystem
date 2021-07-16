import React, { Component } from "react";
import axios from "axios";
import Alert from "./Alert";
import Cookies from 'js-cookie';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import FormControl from '@material-ui/core/FormControl';
import classNames from 'classnames';
axios.defaults.xsrfHeaderName = "X-CSRFToken"
axios.defaults.xsrfCookieName = 'csrftoken'
class Otp extends Component {
  state = {
    number: "",
    error: "",
    show: false,
    message: "",
    type: "",
  };

  handleChange = (event) => {
    this.setState({ number: event.target.value });
  };

  handleSubmit = (event) => {
    const csrftoken = Cookies.get('csrftoken')
    axios({
      url:'api/OtpValidation',
      method:'POST',
       data:{
        email: sessionStorage.getItem("requestEmail"),
        number: this.state.number,
       },
       headers: {"X-CSRFToken": csrftoken},
       responseType: 'json',
      })
    .then((res) => {
        if (res.data.cango) {
          sessionStorage.setItem("otp_valid", "yes");
          this.props.history.push("/changePassword");
        } else {
          this.setState({ show: false });
          this.setState({
            show: true,
            message: res.data[0],
            type: res.data[1],
          });
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
          <h1>OTP</h1>
          <FormControl variant="outlined">
            <InputLabel htmlFor="outlined-adornment-password">Enter OTP</InputLabel>
            <OutlinedInput onChange={this.handleChange}
              type="number"
              variant="outlined"
              margin="normal"
              required
              fullWidth
              autoFocus
              autoComplete='number'
              name="Email"
              label="Email"
              value={this.state.number}
              style = {{marginBottom : "20px"}}
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
  }
}

export default Otp;
