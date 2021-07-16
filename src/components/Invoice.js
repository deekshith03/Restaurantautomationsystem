import axios from "axios";
import React, { Component } from "react";
import printJS from "print-js";
import Cookies from 'js-cookie';
import DeleteIcon from '@material-ui/icons/Delete';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import {FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, InputLabel, OutlinedInput, Select, MenuItem, Button} from '@material-ui/core';
axios.defaults.xsrfHeaderName = "X-CSRFToken"
axios.defaults.xsrfCookieName = 'csrftoken'

class Invoice extends Component {
  state = {
    availablefood: [],
    priceList: ["1"],
    nameList: ["OIL"],
    quantityList: ["1"],
    addNew: false,
    show: false,
    message: "",
    class: "",
  };

  getIngredients = () => {
    const csrftoken = Cookies.get('csrftoken')
    axios({
      url:'api/GetIngredients',
      method:'POST',
       data:{},
       headers: {"X-CSRFToken": csrftoken},
       responseType: 'json',
      })
    .then((response) => {
        let userArr = response.data;

        if (userArr.length !== 0) {
          this.setState({ availablefood: userArr });
        }
      })

      .catch((error) => {});
  };

  componentDidMount() {
    this.getIngredients();
  }

  handleprice = (event, index) => {
    let temp = [...this.state.priceList];
    temp[index] = event.target.value;
    this.setState({ priceList: temp });
  };

  handleName = (event, index) => {
    let temp = [...this.state.nameList];
    temp[index] = event.target.value;
    this.setState({ nameList: temp });
  };
  handleQuantity = (event, index) => {
    let temp = [...this.state.quantityList];
    temp[index] = event.target.value;
    this.setState({ quantityList: temp });
  };

  handleadd = (e) => {
    let values = this.state.nameList.slice();
    let quantity = this.state.quantityList.slice();
    let price = this.state.priceList.slice();
    values.push(this.state.availablefood.filter(this.checkAvailable(-1))[0]);
    quantity.push(1);
    price.push(1);
    this.setState({
      nameList: values,
      quantityList: quantity,
      priceList: price,
    });
    e.preventDefault();
  };

  handledelete = (index) => {
    let values = this.state.nameList.slice();
    let quantity = this.state.quantityList.slice();
    let price = this.state.priceList.slice();
    if (values.length !== 1 && quantity.length !== 1) {
      values.splice(index, 1);
      quantity.splice(index, 1);
      price.splice(index, 1);
    }
    this.setState({
      nameList: values,
      quantityList: quantity,
      priceList: price,
    });
  };

  checkAvailable = (index) => {
    return (item) => {
      if (this.state.nameList[index] === item) return true;
      return !this.state.nameList.includes(item);
    };
  };

  handlesubmit = (event) => {
    const csrftoken = Cookies.get('csrftoken')
    axios({
      url:'api/GenerateInvoice',
      method:'POST',
       data:this.state,
       headers: {"X-CSRFToken": csrftoken},
       responseType: 'blob',
      })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        printJS(url, "image");
      });

    event.preventDefault();
  };

  render() {
    return (
      <div>
        <form onSubmit={this.handlesubmit} className="login" style={{marginTop: window.screen.availWidth < 1200 ? "5%" : "1%", width: window.screen.availWidth < 1400 ? "95%" : "30%",overflowY: "scroll"}}>
          <h1 className="title">Invoice</h1>
            {this.state.nameList.map((name, index) => {
              return (
                
                <div key={index} className="dropdowns form-field col-12">
                  <FormControl variant="outlined" style = {{width:"100%", marginRight: "5px", marginBottom: "5%"}}>
                    <InputLabel id="demo-simple-select-outlined-label">Ingredient</InputLabel>
                    <Select
                      labelId="demo-simple-select-outlined-label"
                      id={index}
                      value={this.state.nameList[index]}
                      onChange={(event) => {this.handleName(event, index)}}
                      label="Age"
                      overflow = "hidden"
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {this.state.availablefood
                        .filter(this.checkAvailable(index))
                        .map((item, i) => (
                          <MenuItem key={index * 1000 + i} value={item}>{item.toString().toUpperCase()}</MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                  <div style={{display:"flex", justifyContent: "space-between"}}>
                    <FormControl variant="outlined">
                      <InputLabel htmlFor="outlined-adornment-password">Quantity</InputLabel>
                      <OutlinedInput onChange={(event) => {this.handleQuantity(event, index);}}
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        required
                        id="quantity"
                        label="quantity"
                        type="number"
                        autoComplete="number"
                        step="any"
                        min="0.0001"
                        overflow = "hidden"
                        value={this.state.quantityList[index]}
                        style = {{width:"100%", marginRight: "5px"}}
                      />
                    </FormControl>
                    <FormControl variant="outlined">
                      <InputLabel htmlFor="outlined-adornment-password">Price</InputLabel>
                      <OutlinedInput onChange={(event) => {this.handleprice(event, index);}}
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        required
                        id="Ingredient Price"
                        label="Ingredient Price"
                        type="number"
                        autoComplete="number"
                        step="any"
                        min="0.1"
                        overflow = "hidden"
                        value={this.state.priceList[index]}
                        style = {{width:"100%", marginRight: "15px", marginBottom:"15px", marginLeft:'5px'}}
                      />
                    </FormControl>
                    <DeleteIcon style = {{color:"red", fontSize: "30px", marginLeft:'5px'}} onClick={() => this.handledelete(index)}/>
                  </div>
                </div>
              );
            })}
            <Button onClick={(e) => this.handleadd(e)} variant="contained" style = {{backgroundColor: "green", color : "white", marginBottom:"15px"}}>
              <AddCircleIcon/>{" Add Ingredient"}
            </Button>
            <input
              className="submit-btn"
              type="submit"
              value="genarate cheque"
              style = {{width: "70%", marginLeft:"15%", marginBottom: "15px", marginTop:"20px"}}
            />
        </form>
      </div>
    );
  }
}
export default Invoice;
