import axios from "axios";
import React, { Component } from "react";
import Expire from "./Expire.js";
import DeleteIcon from '@material-ui/icons/Delete';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Button from "@material-ui/core/Button";
import Cookies from 'js-cookie';
import {withStyles } from '@material-ui/core/styles';
import { TableRow, TableHead, TableCell, TableBody, Table, Paper, TableContainer } from '@material-ui/core';
axios.defaults.xsrfHeaderName = "X-CSRFToken"
axios.defaults.xsrfCookieName = 'csrftoken'

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    '&:nth-of-type(even)': {
      backgroundColor: theme.palette.action.disabled,
    },
    '&:last-child': {
      backgroundColor: theme.palette.common.black,
    },
  },
}))(TableRow);
class FoodPrice extends Component {
  state = { FoodList: [], changed: {}, value: "" };
  componentDidMount() {
    const csrftoken = Cookies.get('csrftoken')
    axios({
      url:'api/GetFoods',
      method:'POST',
       data:{},
       headers: {"X-CSRFToken": csrftoken},
       responseType: 'json',
      })
    .then((response) => {
      
      this.setState({ FoodList: response.data });
    });
  }

  handleDelete=(index)=>{

    let name=this.state.FoodList[index][1]
    const csrftoken = Cookies.get('csrftoken')
    axios({
      url:'api/DeleteFood',
      method:'POST',
       data:{
        name:name,
       },
       headers: {"X-CSRFToken": csrftoken},
       responseType: 'json',
      })
      .then((response) => {
          let userArr = response.data;

          if (typeof userArr === "object") {
            this.setState({ FoodList: userArr });
          } 
        })

        .catch((error) => {});

  }

  handleAdd = (item, index) => {
    item[2] = item[2] + 1;
    let temp = [...this.state.FoodList];
    let newChange = {};
    Object.assign(newChange, this.state.changed);
    temp[index][2] = item[2];
    newChange[item[0]] = item[2];
    temp[index][2] = item[2];
    this.setState({ FoodList: temp, changed: newChange });
  };
  handleSub = (item, index) => {
    if (item[2] > 5) {
      item[2] = item[2] - 1;
      let temp = [...this.state.FoodList];
      let newChange = {};
      Object.assign(newChange, this.state.changed);
      temp[index][2] = item[2];
      newChange[item[0]] = item[2];
      temp[index][2] = item[2];
      this.setState({ FoodList: temp, changed: newChange });
    } else {
      alert("Price cannot be less than 5");
    }
  };
  updatDb = () => {
    const csrftoken = Cookies.get('csrftoken')
    axios({
      url:'api/UpdatePrice',
      method:'POST',
       data:this.state.changed,
       headers: {"X-CSRFToken": csrftoken},
       responseType: 'json',
      })
      .then((response) => {
      this.setState({value: "done"})
      this.setState({ value: response.data });
    });
  };
  render() {
    return (
      <div>
        {this.state.value === "Success" && (
          <Expire delay="3000">
            <div className="alert alert-success" role="alert">
              success price list updated
            </div>
          </Expire>
        )}
        {this.state.value === "Db error" && (
          <Expire delay="3000">
            <div className="alert alert-danger" role="alert">
              Price list not updated, Try again later
            </div>
          </Expire>
        )}
        <Paper variant="outlined" style={{width:"95%", marginLeft: "auto", marginRight: "auto", marginTop: "5%", marginBottom: "auto",background: "rgba(40, 41, 41, 0.90)"}}>
          <TableContainer >
            <Table style={{padding:"0%"}}>
              <TableHead align = "center">
                <TableRow>
                  <StyledTableCell align = "center">Item Code</StyledTableCell>
                  <StyledTableCell align = "center">Name</StyledTableCell>
                  <StyledTableCell align = "center">Price</StyledTableCell>
                  <StyledTableCell align = "center">Action</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.state.FoodList.map((item, index) => {
                  return (
                    <StyledTableRow key={item[0]}>
                      <StyledTableCell align = "center">{item[0]}</StyledTableCell>
                      <StyledTableCell align = "center">{item[1].toString().toUpperCase()}</StyledTableCell>
                      <StyledTableCell align = "center">
                        <ChevronLeftIcon onClick={() => this.handleSub(item, index)} style={{ color: "yellow", fontSize: window.screen.availWidth < 1500 ? "medium" : "25px", float:'left'}}/>
                        {item[2]}
                        <ChevronRightIcon onClick={() => this.handleAdd(item, index)} style={{ color: "yellow", fontSize: window.screen.availWidth < 1500 ? "medium" : "25px", float:'right'}} />
                      </StyledTableCell>
                      <StyledTableCell align = "center">                    
                      <DeleteIcon onClick={()=>{this.handleDelete(index)}} style={{ color: "red", fontSize:"30px"}}/>
                      </StyledTableCell>
                    </StyledTableRow>
                  );
                })}
                <StyledTableRow >
                  <StyledTableCell align = "center" colSpan={4} align="right" float = "right">
                    <Button
                      onClick={this.updatDb}
                      disabled={Object.entries(this.state.changed).length === 0}
                      variant = 'contained'
                      color="primary"
                      style={{float:'right'}}
                    >
                    Update Prices
                    </Button>
                  </StyledTableCell>
                </StyledTableRow>
              </TableBody>
            </Table>
            </TableContainer>
          </Paper>
      </div>
    );
  }
}

export default FoodPrice;
