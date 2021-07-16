import React, { Component } from "react";
import axios from "axios";
import Expire from './Expire';
import Cookies from 'js-cookie';
import {withStyles} from "@material-ui/core/styles";
import PropTypes from 'prop-types';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Paper from '@material-ui/core/Paper';
import { red } from '@material-ui/core/colors';
import DeleteIcon from '@material-ui/icons/Delete';
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
  },
}))(TableRow);

const styles = (theme) => ({
  
    table: {
      
      borderCollapse: "collapse",
      borderSpacing: "0",
    },

    widthing:{
      margin: "auto",
      marginTop: "10%",
      background: "rgba(40, 40, 40, 0.95)",
      width : "95%",
      
    },

    paper: {
      marginTop: theme.spacing(0),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    avatar: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.secondary.main,
    },
    form: {
      width: '100%', // Fix IE 11 issue.
      marginTop: theme.spacing(0),
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
    },
    inputborder:{
      border:red 
    },
    error:{
      color: red,
      fontsize: 'small',
      fontweight: 'lighter!important', 
      textalign: 'center !important',
    },inputInput: {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
      transition: theme.transitions.create('width'),
      width: '100%',
      [theme.breakpoints.up('md')]: {
        width: '20ch',
      },
    },
    sectionDesktop: {
      display: 'none',
      [theme.breakpoints.up('md')]: {
        display: 'flex',
      },
    },
    sectionMobile: {
      display: 'flex',
      [theme.breakpoints.up('md')]: {
        display: 'none',
      },
    },
    root: {
      flexGrow: 1,
      backgroundColor: theme.palette.background.paper,
    },
    
  
    spacing: {
      '& > *': {
        margin: theme.spacing(1),
      },
    },

      
});
class Users extends Component {
  state = { result: [] };
  componentDidMount() {
    const csrftoken = Cookies.get('csrftoken')
    axios({
      url:'api/getUsers',
      method:'POST',
       data:{},
       headers: {"X-CSRFToken": csrftoken},
       responseType: 'json',
      })
    .then((response) => {

        let userArr = response.data;

        if (userArr.length !== 0) {

          
          this.setState({result:userArr});
  
        }

      })

      .catch((error) => {});
  }

  handleOperation=(item)=>{

    if(item.type==="Owner")
    { 
        this.setState({showalert:true});
    }

    else{
    const csrftoken = Cookies.get('csrftoken')
    axios({
      url:'api/deleteUsers',
      method:'POST',
       data:{
        email:item.email
       },
       headers: {"X-CSRFToken": csrftoken},
       responseType: 'json',
      })
    .then((response) => {

      let userArr = response.data;

      if (userArr.length !== 0) {

        
        this.setState({result:userArr});

      }

    })

    .catch((error) => {});

  }

}

  render() {
    
    const { classes } = this.props;
    return (
      <div className="">
         <Paper className={classes.widthing} variant="outlined">
            <TableContainer >
              <Table className={classes.table} stickyHeader aria-label="simple table">
                <TableHead align = "center">
                  <TableRow>
                    <StyledTableCell align = "center" >Email</StyledTableCell >
                    <StyledTableCell align = "center" >Type</StyledTableCell >
                    <StyledTableCell align = "center" >Delete</StyledTableCell >
                  </TableRow>
                </TableHead>
                <TableBody >
                  {this.state.result.map((row) => (
                    <StyledTableRow  key={row.email} >
                      <StyledTableCell component="th" scope="row">
                        {row.email}
                      </StyledTableCell>
                      <StyledTableCell align = "center" >{row.type}</StyledTableCell >
                      <StyledTableCell align = "center" >
                        <DeleteIcon 
                          onClick={() => this.handleOperation(row)}
                          style={{ color: "red" }}
                        />                        
                      </StyledTableCell >
                    </StyledTableRow >
                  ))}
                </TableBody >
              </Table>
            </TableContainer>
          </Paper>
        {this.state.showalert && (<Expire delay="3000">
              <div className="alert alert-danger" role="alert">
                Owner cannot be deleted
              </div></Expire>)}
        
      </div>
    );
  }
}
Users.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(Users);
