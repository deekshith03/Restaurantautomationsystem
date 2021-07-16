import axios from "axios";
import React, { Component } from "react";
import Alert from "./Alert.js";
import Complement from "./Complement";
import Cookies from 'js-cookie';
import DeleteIcon from '@material-ui/icons/Delete';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import {FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, InputLabel, OutlinedInput, Select, MenuItem, Button} from '@material-ui/core';
axios.defaults.xsrfHeaderName = "X-CSRFToken"
axios.defaults.xsrfCookieName = 'csrftoken'

class Ingredients extends Component {
  state = {
    availablefood: [],
    foodname: "",
    price: '',
    priceclass: "visible",
    nameList: [],
    quantityList: [],
    newingredients: "",
    addNew: false,
    show: false,
    message: "",
    class: "",
    availableComplement: [],
    complement: [],
    selectedImage: null,
    val: 0,
  };

  handleSelectedImage = (event) => {
    this.setState({ selectedImage: event.target.files[0] });
  };

  checkAvailableComplement = (index) => {
    return (item) => {
      if (this.state.complement[index] === item) return true;
      return !this.state.complement.includes(item);
    };
  };

  handlenewingredients = (index, event) => {
    const values = [...this.state.newingredients];
    values[index][event.target.name] = event.target.value;
    this.setState({ newingredients: values });
  };

  handlenewadd = () => {
    const values = [...this.state.newingredients, { ingredientname: "" }];
    this.setState({ newingredients: values });
  };

  handlenewdelete = (event, index) => {
    let values = this.state.newingredients.slice();
    //const values = [...this.state.newingredients];

    if (values.length !== 0) values.splice(index, 1);

    this.setState({ newingredients: values });
  };

  handleNew = (event) => {
    if(this.state.newingredients !== ""){
      const csrftoken = Cookies.get('csrftoken')
      axios({
        url:'api/AddIngredients',
        method:'POST',
        data:{name:this.state.newingredients},
        headers: {"X-CSRFToken": csrftoken},
        responseType: 'json',
      })
        .then((res) => {
          this.setState({
            show: true,
            message: res.data["message"],
            class: res.data.message === "Ingredient Created" ? "success":"danger",
          });
        });
        window.location.reload()
    }
    else{
      this.setState({message: "Enter valid Ingredient Name"});
      this.setState({show: true});
      this.setState({class: "warning"});
    }
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
    const csrftoken = Cookies.get('csrftoken')
    axios({
      url:'api/GetComplement',
      method:'POST',
       data:{},
       headers: {"X-CSRFToken": csrftoken},
       responseType: 'json',
      })
    .then((response) => {
      let data = response.data;
      if (data !== 0) {
        this.setState({ availableComplement: data });
      }
    });
  }

  handlefoodname = (e) => {
    this.setState({ foodname: e.target.value });
  };

  handleprice = (e) => {
    this.setState({ price: e.target.value });
  };

  handleopenprice = () => {
    this.setState({ complement: [] });
    this.setState({ priceclass: "visible" });
  };

  handlecloseprice = () => {
    this.setState({ complement: [] });
    this.setState({ price: 0 });
    this.setState({ selectedImage: null });
    this.setState({ priceclass: "hidden" });
  };

  handleName = (event, index) => {
    let temp = [...this.state.nameList];
    temp[index] = event.target.value;
    this.setState({ nameList: temp });
  };

  handleComplementName = (event, index) => {
    let temp = [...this.state.complement];
    temp[index] = event.target.value;
    this.setState({ complement: temp });
  };
  handleQuantity = (event, index) => {
    let temp = [...this.state.quantityList];
    temp[index] = event.target.value;
    this.setState({ quantityList: temp });
  };

  handleadd = (e) => {
    let values = this.state.nameList.slice();
    let quantity = this.state.quantityList.slice();
    values.push(this.state.availablefood.filter(this.checkAvailable(-1))[0]);
    quantity.push(1);
    this.setState({ nameList: values, quantityList: quantity });
    e.preventDefault();
  };

  handledelete = (index) => {
    let values = this.state.nameList.slice();
    let quantity = this.state.quantityList.slice();
    if (values.length !== 0 && quantity.length !== 0) {
      values.splice(index, 1);
      quantity.splice(index, 1);
    }
    this.setState({ nameList: values, quantityList: quantity });
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
      url:'api/AddFoodItems',
      method:'POST',
       data:this.state,
       headers: {"X-CSRFToken": csrftoken},
       responseType: 'json',
      })
      .then((res) => {
        this.setState({ show: false });
        this.setState({
          show: true,
          message: res.data[0],
          class: res.data[1],
        });
        console.log(this.state.selectedImage);
        if (
          this.state.priceclass === "visible" &&
          this.state.message === "food created" && 
          this.state.selectedImage
        ) {
          const fd = new FormData();
          fd.append(
            "image",
            this.state.selectedImage,
            this.state.selectedImage.name
          );
          fd.append("name", this.state.selectedImage, this.state.foodname);
          const csrftoken = Cookies.get('csrftoken')
            axios({
              url:'api/image',
              method:'POST',
              data: fd,
              headers: {"X-CSRFToken": csrftoken},
              responseType: 'json',
              })
            .then((res) => {
          });
          
          window.location.reload()
        }
        
      });

    this.setState({ addNew: false, show: false, message: "", class: "" });

    event.preventDefault();
  };

  handleAddComplement = (e) => {
    let values = this.state.complement.slice();
    values.push(
      this.state.availableComplement.filter(
        this.checkAvailableComplement(-1)
      )[0]
    );
    this.setState({ complement: values });
    e.preventDefault();
  };

  handleRemoveComplement = (index) => {
    let values = this.state.complement.slice();
    if (values.length !== 0) {
      values.splice(index, 1);
    }
    this.setState({ complement: values });
  };

  change = () => {
    this.setState({ val: this.state.val ? 0 : 1 });
    this.state.val ? this.handleopenprice() : this.handlecloseprice();
  }

  render() {
    return (
      <div >
        <form onSubmit={this.handlesubmit} className="login" style={{marginTop: window.screen.availWidth < 1200 ? "5%" : "1%", width: window.screen.availWidth < 1400 ? "95%" : "30%",overflowY: "scroll"}}>
          <h1>ADD FOOD</h1>
          <FormControl variant="outlined">
            <InputLabel htmlFor="outlined-adornment-password">Food Name</InputLabel>
            <OutlinedInput
              onChange = {this.handlefoodname}
              value = {this.state.foodname}
              variant="outlined"
              id="outlined-search"
              name="Food Name"
              label="Food Name"
              type="text"
              required
              autoFocus
              style = {{marginBottom : "15px"}}
            />
          </FormControl>

          <FormControl component="fieldset" style = {{marginBottom : "15px"}}>
            <FormLabel component="legend">complementary</FormLabel>
            <RadioGroup aria-label="gender" name="complementary" value={this.state.val} onChange={this.change} row>
              <FormControlLabel value={0} control={<Radio />} label="Food Item" labelPlacement="bottom"/>
              <FormControlLabel value={1} control={<Radio />} label="Complementary" labelPlacement="bottom"/>
            </RadioGroup>
          </FormControl>
          
        {this.state.priceclass === 'visible' && <FormControl variant="outlined">
          <InputLabel htmlFor="outlined-adornment-password">price</InputLabel>
          <OutlinedInput onChange={this.handleprice}
            variant="outlined"
            margin="normal"
            fullWidth
            required
            id="Price"
            label="Price"
            type="number"
            autoComplete="number"
            value={this.state.price}
            style = {{marginBottom : "15px"}}
          />
        </FormControl>}
            
          {this.state.priceclass === "visible" && (
            <Complement
              complement={this.state.complement}
              availableComplement={this.state.availableComplement}
              addComplement={(e) => this.handleAddComplement(e)}
              removeComplement={(index) => this.handleRemoveComplement(index)}
              handleComplementName={(event, index) =>
                this.handleComplementName(event, index)
              }
              handleImage={(event) => this.handleSelectedImage(event)}
            />
          )}
          {this.state.nameList.map((name, index) => {
            return (
              <div key={index} style = {{display:"flex"}}>
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
                  <DeleteIcon style = {{color:"red", fontSize: "30px"}} onClick={() => this.handledelete(index)}/>
              </div>
            );
          })}
          <Button onClick={(e) => this.handleadd(e)} variant="contained" style = {{backgroundColor: "green", color : "white", marginBottom:"15px"}}>
            <AddCircleIcon/>{" Add Ingredient"}
          </Button>
          <input
            className="submit-btn"
            type="submit"
            value="create food"
            style = {{width: "70%", marginLeft:"15%", marginBottom: "20px"}}
          />
          <h1>Create Ingredient</h1>
            <div style={{display:"flex"}}>
              <FormControl variant="outlined">
                <InputLabel htmlFor="outlined-adornment-password">Ingredient Name</InputLabel>
                <OutlinedInput onChange={(event) => {this.setState({newingredients: event.target.value})}}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="Ingredient Name"
                  label="Ingredient Name"
                  type="text"
                  autoComplete="text"
                  overflow = "hidden"
                  value={this.state.newingredients}
                  style = {{width:"100%", marginRight: "5px", marginBottom: "10px"}}
                />
              </FormControl>
            </div>
          <input className="add-btn" type="button" value="Add" style = {{width: "70%", marginLeft:"15%"}} onClick={this.handleNew}/>
        </form>

        <Alert
          show={this.state.show}
          time="5000"
          type={this.state.class}
          message={this.state.message}
        />
    </div>
    );
  }
}
export default Ingredients;
