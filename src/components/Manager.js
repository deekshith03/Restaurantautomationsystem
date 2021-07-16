import React, { Component } from "react";
import axios from 'axios';
import {Doughnut} from "react-chartjs-2";
import TextField from '@material-ui/core/TextField';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Button from '@material-ui/core/Button';
import Cookies from 'js-cookie';
import Paper from '@material-ui/core/Paper';
import "./statisticalreport.css";
axios.defaults.xsrfHeaderName = "X-CSRFToken"
axios.defaults.xsrfCookieName = 'csrftoken'

var fileDownload = require('js-file-download');

class Manager extends Component {
  state = {
    date : "",
    file : "sales_report",
    format: "pdf",
    chartdata: {
      labels: [],
      datasets: [
        {
          label: "",
          data: [],
        },
      ],
    },
    chartdata1: {
      labels: [],
      datasets: [
        {
          label: "",
          data: [],
        },
      ],
    },
  };

  componentDidMount() {
    const csrftoken = Cookies.get('csrftoken')
    axios({
      url:'api/GetSalesGraphSales',
      method:'POST',
       data:{},
       headers: {"X-CSRFToken": csrftoken},
       responseType: 'json',
      })
    .then((response) => {
        let chartdata = response.data;
        this.setState({ chartdata: chartdata });
      })

      .catch((error) => {});
    axios({
      url:'api/GetSalesGraphPurchase',
      method:'POST',
       data:{},
       headers: {"X-CSRFToken": csrftoken},
       responseType: 'json',
      })
    .then((response) => {
        let chartdata = response.data;
        this.setState({ chartdata1: chartdata });
      })

      .catch((error) => {});
  }


  handleChange = (event) =>{
    this.setState({...this.state, [event.target.name]: event.target.value});
  }

  async post()
  {
    const csrftoken = Cookies.get('csrftoken')
    axios({
      url:'api/get_excel',
      method:'GET',
      params: {
        filename: this.state.file
      },
       headers: {"X-CSRFToken": csrftoken},
      })
    .then((res)=>{
        fileDownload(res.data, this.state.file+"."+this.state.format);}
      )

  }

  handleSubmit = (event) => {
    if(this.state.format === 'pdf')
    {
      const csrftoken = Cookies.get('csrftoken')
      axios({
        url:'api/CreatePdf',
        method:'POST',
        data:{
          date : this.state.date,
        file : this.state.file,
        },
        headers: {"X-CSRFToken": csrftoken},
        })
      .then((res) => {
        const file = new Blob(
              [res.data], 
              {type: 'application/pdf'});
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL,"Mypdf.pdf");
      });  
    }

    else if(this.state.format === 'csv')
    {
      const csrftoken = Cookies.get('csrftoken')
      axios({
        url:'api/CreateCsv',
        method:'POST',
        data:{
          date : this.state.date,
          file : this.state.file
        },
        headers: {"X-CSRFToken": csrftoken},
        })
      .then((res) => {
        fileDownload(res.data, this.state.file+"."+this.state.format);
      });
    }
    else{
      const csrftoken = Cookies.get('csrftoken')
      axios({
        url:'api/CreateExcel',
        method:'POST',
        data:{
          date : this.state.date,
          file : this.state.file
        },
        headers: {"X-CSRFToken": csrftoken},
        responseType: 'arraybuffer',
        })
       .then((res) => {
        var blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        fileDownload(blob, this.state.file+"."+this.state.format);
       }).catch( err => {});
    }
    event.preventDefault()
  }

  render() {

    return (
      <div className = "charts">
      <Paper variant="outlined" className="ind" style = {{background: "rgba(0, 0, 0, 0.85)"}}>
          <Doughnut
            data={this.state.chartdata1}
            options={{ 
              title: {
                display: true,
                text: 'MONTHLY PURCHASE',
                fontColor: 'white',
              },
               responsive: true,
               maintainAspectRatio: false,
               legend:{
                display:true,
                position:'top',
                labels: {
                  fontColor: 'white'
                },
              },
             }}
          />
      </Paper>
        <Paper variant="outlined" className="ind" style = {{background: "rgba(0, 0, 0, 0.85)"}}>
          <Doughnut
            data={this.state.chartdata}
            options={{
              title: {
                display: true,
                text: 'MONTHLY SALES',
                fontColor: 'white',
              },
              responsive: true,
              maintainAspectRatio: false,
              legend:{
                display:true,
                position:'top',
                labels: {
                  fontColor: 'white'
                },
              },
            }}
          />
        </Paper>
      <Paper variant="outlined" className = "ind" style = {{background: "rgba(0, 0, 0, 0.85)"}}>
        <h2>Download reports</h2>
        <form onSubmit={this.handleSubmit}>
        <p>Enter date:</p>
        <TextField
          onChange = {this.handleChange}
          value = {this.state.date}
          variant="outlined"
          id="outlined-search"
          name="date"
          type="date"
          required
        /><br/><br/>
        
        <FormControl component="fieldset">
          <FormLabel component="legend">Choose file:</FormLabel>
          <RadioGroup aria-label="gender" name="file" value={this.state.file} onChange={this.handleChange} row>
            <FormControlLabel value="sales_report" control={<Radio />} label="Sales Report" labelPlacement="bottom"/>
            <FormControlLabel value="purchase_report" control={<Radio />} label="Purchase Report" labelPlacement="bottom"/>
            <FormControlLabel value="gross_income" control={<Radio />} label="Gross Income" labelPlacement="bottom"/>
          </RadioGroup>
        </FormControl><br/><br/>
        <FormControl component="fieldset">
          <FormLabel component="legend">Choose type:</FormLabel>
          <RadioGroup aria-label="gender" name="format" value={this.state.format} onChange={this.handleChange} row>
            <FormControlLabel value="pdf" control={<Radio />} label="PDF" labelPlacement="bottom"/>
            <FormControlLabel value="csv" control={<Radio />} label="CSV" labelPlacement="bottom"/>
            <FormControlLabel value="xlsx" control={<Radio />} label="XLSX" labelPlacement="bottom"/>
          </RadioGroup>
        </FormControl><br/><br/>

        <Button
          name = "generate_file_submit"
          value = "Submit"
          color="primary"
          variant="contained"
          type="submit"
        >Submit</Button>
        </form> 
        
      </Paper>
      </div>
    );
  }
}

export default Manager;
