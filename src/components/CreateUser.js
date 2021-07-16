import React, { Component } from "react";
import axios from "axios";
import Alert from "./Alert";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import Cookies from 'js-cookie';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl'
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
axios.defaults.xsrfHeaderName = "X-CSRFToken"
axios.defaults.xsrfCookieName = 'csrftoken'
class CreateUser extends Component {
  state = {
    email: "",
    password: "",
    type: "manager",
    message: "",
    class: "",
    showPassword: false,
  };
  handleEmail = (e) => {
    this.setState({ email: e.target.value });
  };
  handlePassword = (e) => {
    this.setState({ password: e.target.value });
  };
  handleType = (e) => {
    this.setState({ type: e.target.value });
  };
  handleSubmit = (e) => {
    const csrftoken = Cookies.get('csrftoken')
    axios({
      url:'api/createUser',
      method:'POST',
       data:this.state,
       headers: {"X-CSRFToken": csrftoken},
       responseType: 'json',
      })
      .then((res) => {
        if (res.data) {
          this.setState({ show: false });
          this.setState({
            show: true,
            message: res.data[0],
            class: res.data[1],
          });
        }
      });
    e.preventDefault();
  };
  handleVisibility = () => {
    if (this.state.pass_type === "password") {
      this.setState({
        pass_type: "text",
        toggle: "far fa-eye  fa-lg fa-eye-slash fa-lg",
      });
    } else {
      this.setState({ pass_type: "password", toggle: "far fa-eye fa-lg" });
    }
  };
  render() {
    return (
      <form onSubmit={this.handleSubmit} className="login" style = {{top : window.screen.availWidth < 780 ? "61%" : "55%"}}>
        <img
          src="https://png.pngtree.com/png-clipart/20190520/original/pngtree-vector-add-user-icon-png-image_4101807.jpg"
          alt="profilepic"
          className="avatar"
        />
        <FormControl variant="outlined">
          <InputLabel htmlFor="outlined-adornment-password">Enter email</InputLabel>
          <OutlinedInput onChange={(e) => this.handleEmail(e)}
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
        <FormControl variant="outlined">
          <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
          <OutlinedInput onChange={(e) => this.handlePassword(e)}
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
                  edge="end"
                >
                  {this.state.showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
        <FormControl component="fieldset">
          <FormLabel component="legend">Type</FormLabel>
          <RadioGroup
            aria-label="gender"
            name="file"
            value={this.state.type}
            onChange={(e) => this.handleType(e)}
            row
          >
            <FormControlLabel
              value="manager"
              control={<Radio />}
              label="Manager"
              labelPlacement="bottom"
            />
            <FormControlLabel
              value="clerk"
              control={<Radio />}
              label="Clerk"
              labelPlacement="bottom"
            />
            <FormControlLabel
              value="owner"
              control={<Radio />}
              label="Owner"
              labelPlacement="bottom"
            />
          </RadioGroup>
        </FormControl>

        <Alert
          show={this.state.show}
          time="5000"
          message={this.state.message}
          type={this.state.class}
        />

        <input type="submit" value="create User" style={{marginTop:"20px", marginLeft:"10%"}}/>
      </form>
    );
  }
}

export default CreateUser;
