import React, {useState,useEffect } from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { TableRow, TableHead, TableCell, TableBody, Table, Paper } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Button from "@material-ui/core/Button";
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import { green, red, orange } from '@material-ui/core/colors';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ReceiptIcon from '@material-ui/icons/Receipt';
import CloseIcon from '@material-ui/icons/Close';
import axios from "axios";
import printJS from "print-js";
import Cookies from 'js-cookie';
import AddIcon from '@material-ui/icons/Add';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import TableContainer from '@material-ui/core/TableContainer';
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

const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      //backgroundImage: `url(${'https://allfreedesigns.com/wp-content/uploads/2015/06/black-patterns-5.jpg'})`,
      overflow: 'hidden',
      backgroundSize: '100%',
      margin: theme.spacing(0),
      padding: '0.8%',
      marginBottom: '10px',
      width: 'auto',
      margin: "auto",
    },

    gridList: {
      width: 1200,
      height: 750,
      
    },
    table:{
        borderCollapse: "collapse",
        borderSpacing: "0",
    },
    icon: {
      color: 'rgba(255, 255, 255, 0.8)',
    },
  }));

export default function Tables(){
    const classes = useStyles();
    const [editCell, setEditcell] = useState()
    const [editTable, setEdittable] = useState()
    const [quantity, setQuantity] = useState()
    const [curTable, addCurTable] = useState("")
    const [tables, addTables] = useState([])
    const [changes, setChanges] = useState("");
    
    const [dochanges, setdoChanges] = React.useState("");
    useEffect (() => {
        function updateTables(){
          if(localStorage.getItem("tables")){
            addTables(JSON.parse(localStorage.getItem("tables")))
          }
        }
      updateTables();
      },[])

    useEffect (() => {
        setChanges(0)
    },[changes])

    useEffect (() => {
        localStorage.setItem("tables", JSON.stringify(tables))
        localStorage.setItem("curTable", curTable)
        setdoChanges(1)
        
       },[tables]
       )

    useEffect (() => {
        setdoChanges(0)
    },[dochanges])
    

    const handleSubmit = () =>{
        if (curTable === null || curTable === "" || curTable<=0){
            alert("invalid Input")
            return 
        }
        
        localStorage.setItem("curTable", curTable)
        if (!(tables.includes(curTable))){
            let updateTables = tables
            updateTables.push(curTable);
            addTables(updateTables)
            setChanges(1)
        }
        localStorage.setItem("tables",JSON.stringify(tables));
        
    }
    const handleChange = (event) =>{
        addCurTable(event.target.value);
    }
    
    const SetCurTable = (table) =>{
        addCurTable(table);
        localStorage.setItem("curTable",table);
    }

    const handleChange1 = (event) =>{
        setQuantity(event.target.value)
    }
    
    const handleDoneIcon = (food, table) =>{
        if (quantity != null && quantity > 0){
            setEditcell("")
            setEdittable("")
            let food_list = JSON.parse(localStorage.getItem(table))
            food_list[food][2] = (food_list[food][2]/food_list[food][1]) * quantity
            food_list[food][1] = parseInt(quantity)
            localStorage.setItem(table, JSON.stringify(food_list))
            setdoChanges(1)
        }
        else{
            alert("quantity given is invalid!!")
            setdoChanges(1)
            
        }
    }

    const deleteItem = (id, table) => {
        
        var food=JSON.parse(localStorage.getItem(table))
        delete food[id]
        localStorage.setItem(table, JSON.stringify(food))
        setdoChanges(1)
    }

    const handleDeleteTable = (table) => {
        localStorage.removeItem(table);
        if (tables.length === 1){
            let updateTables =  []
            addTables(updateTables)
            addCurTable("")
        }
        else if(tables.indexOf(table) === 0){
            let updateTables =  tables
            updateTables.shift();
            addTables(updateTables)
            addCurTable(tables[0])
        }
        else{
            let updateTables =  tables
            updateTables.splice(tables.indexOf(table),tables.indexOf(table))
            addTables(updateTables)
            addCurTable(tables[0])
        }
        localStorage.setItem("tables", JSON.stringify(tables))
        localStorage.setItem("curTable", curTable)
    }

    const generatebill = (table) => {
        const csrftoken = Cookies.get('csrftoken')
        axios({
        url:'api/BillGenerator',
        method:'POST',
        data:{
            no:table,
            email:sessionStorage.getItem("email"),
            order: Object.values(JSON.parse(localStorage.getItem(table))),
        },
        headers: {"X-CSRFToken": csrftoken},
        responseType: 'arraybuffer',
        })
        .then((response) => {
            handleDeleteTable(table) 
            const url = window.URL.createObjectURL(new Blob([response.data]));
            printJS(url);
            })
            .catch((error) => {});
          
    }


    const TableHeader = (table) =>{
        return ( 
            <TableHead>
                    <TableRow key={table+"no"}>
                        <StyledTableCell  colSpan={3} align="center" onClick = {() => {SetCurTable(table)}}>
                            Table { " " +table} 
                        </StyledTableCell >
                        <StyledTableCell >
                            <CloseIcon style={{ color: red[600], float:"right", fontSize:"30px", align:'right',cursor: "pointer"}} onClick = {() => handleDeleteTable(table)}/>
                        </StyledTableCell >
                    </TableRow>
                    <TableRow key={table+"items"}>
                        <StyledTableCell align = "center">Food</StyledTableCell >
                        <StyledTableCell align = "center">Quantity</StyledTableCell >
                        <StyledTableCell align = "center">Price</StyledTableCell >
                        <StyledTableCell align = "center">Delete</StyledTableCell >
                    </TableRow>
                </TableHead>
        );
    }

    const Tablebody = (table) =>{
        if(localStorage.getItem(table) !== null){
            var arr = Object.values(JSON.parse(localStorage.getItem(table)))
            if(arr[0]!=null)
            {
                return (
                    <TableBody>{arr[0] && arr.map((cell) => (
                        <>
                        <StyledTableRow  key={cell[0]}>
                            <StyledTableCell  component="th" scope="cell" align = "center">{cell[0]}</StyledTableCell >
                            
                            { editCell===cell[0] && editTable===table?
                            (<StyledTableCell  align = "center"><TextField type="number" onChange={handleChange1} style = {{float:"left",width: 30}} />
                                <span>
                                    <CheckCircleIcon style={{ color: green[600] , float:"right", fontSize:"30px", align:'right',cursor: "pointer"}} onClick={() => handleDoneIcon(cell[0],table)}/>
                                </span>
                            </StyledTableCell >)
                            :(<StyledTableCell  align = "center">{cell[1]}
                                <EditIcon style={{ color: orange[600], float:"right", fontSize:"30px", align:'right',cursor: "pointer"}} onClick={() => {setEdittable(table); setEditcell(cell[0])}}/>
                            </StyledTableCell >)}
                            <StyledTableCell  align = "center">{cell[2]}</StyledTableCell >
                            <StyledTableCell  align = "center">
                                <DeleteIcon onClick={() => deleteItem(cell[0], table)}  color="secondary" style = {{cursor: "pointer"}}/>
                            </StyledTableCell >
                            
                        </StyledTableRow >
                        </>
                        ))} 
                        <StyledTableRow >
                            <StyledTableCell  colSpan={4} align="right">
                                <Button color="secondary" variant="contained" onClick = {() => generatebill(table)}><ReceiptIcon/>Generate Bill</Button>
                            </StyledTableCell >
                        </StyledTableRow >
                    </TableBody>
                );
            }
        }
         return (<TableBody></TableBody>)
    }    
    return (
        
        <div> 
        <Paper style={{width:"70%", marginBottom:'20px',padding: '3%'}} variant="outlined">
          <FormControl variant="outlined">
            <InputLabel htmlFor="outlined-adornment-password">Add Table</InputLabel>
            <OutlinedInput
                id="outlined-search" 
                label="Add Table" 
                type="number" 
                onKeyUp={handleChange}
                onChange={handleChange}
                value = {curTable}
                variant="outlined"   
                autoFocus
                style = {{}}
                endAdornment={
                <InputAdornment position="end">
                    <AddIcon onClick={handleSubmit} color="secondary" style = {{cursor: "pointer"}}/>
                </InputAdornment>
                }
            />
        </FormControl>
        </Paper>
            {tables.map((table) => (
                <Paper className={classes.root} variant="outlined">
                    <TableContainer >
                    <Table className={classes.table} key={table} >
                        {TableHeader(table)}
                        {Tablebody(table)}
                    </Table>
                    </TableContainer>
                </Paper>
            ))}
        </div>
    );
}
 