import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import {withStyles } from '@material-ui/core/styles';
import { TableRow, TableHead, TableCell, TableBody, Table, Paper, TableContainer, Button } from '@material-ui/core';
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

export default function PurchaseList(){
    const [purchase_list, set_purhase_list] = useState([])

    useEffect(()=>{
        const csrftoken = Cookies.get('csrftoken')
        axios({
        url:'api/GetPurchaseList',
        method:'GET',
        headers: {"X-CSRFToken": csrftoken},
        responseType: 'json',
        })
        .then((res) =>{
            set_purhase_list(res.data)
        })
    },[])

    const handleSubmit = () =>{
        const csrftoken = Cookies.get('csrftoken')
        axios({
        url:'api/GetPurchaseList',
        method:'POST',
        data:{},
        headers: {"X-CSRFToken": csrftoken},
        responseType: 'json',
        })
        .then((res) =>{
            set_purhase_list(res.data)
        })
    }

    return(
        <div>
            <Paper variant="outlined" style={{width:"95%", marginLeft: "auto", marginRight: "auto", marginTop: "5%", marginBottom: "auto",background: "rgba(40, 41, 41, 0.90)"}}>
                <TableContainer >
                    <Table>
                        <TableHead>
                            <TableRow>
                            <StyledTableCell align = "center">S.No</StyledTableCell>
                            <StyledTableCell align = "center">Ingredient name</StyledTableCell>
                            <StyledTableCell align = "center">Required amount</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>{purchase_list[0]?(purchase_list.map((cell)=>(
                            <StyledTableRow key={cell[0]}>
                                <StyledTableCell align = "center">{cell[0] }</StyledTableCell>
                                <StyledTableCell align = "center">{cell[1] }</StyledTableCell>
                                <StyledTableCell align = "center">{cell[2] + " units"}</StyledTableCell>
                            </StyledTableRow>
                        ))):
                        <StyledTableRow>
                            <StyledTableCell colSpan={3}>No items to purchase</StyledTableCell>
                        </StyledTableRow>}
                        {purchase_list[0] && 
                            <StyledTableRow>
                                <StyledTableCell colSpan={3} align="right">
                                    <Button
                                        color="primary"
                                        variant="contained"
                                        onClick={handleSubmit}>
                                            Ordered
                                    </Button>
                                </StyledTableCell>
                            </StyledTableRow>
                        }
                        </TableBody>
                    </Table>
                </TableContainer>
          </Paper>
        </div>
    )
}