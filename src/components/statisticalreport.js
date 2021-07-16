import React, { Component } from "react";
import {Doughnut} from "react-chartjs-2";
import "./statisticalreport.css";
import axios from "axios";
import Cookies from 'js-cookie';
import Paper from '@material-ui/core/Paper';
axios.defaults.xsrfHeaderName = "X-CSRFToken"
axios.defaults.xsrfCookieName = 'csrftoken'
class Statisticalreport extends Component {
  state = {
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

  render() {
    return (
      <div className="charts">
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
      </div>
    );
  }
}

export default Statisticalreport;
