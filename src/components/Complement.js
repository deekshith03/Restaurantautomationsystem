import DeleteIcon from '@material-ui/icons/Delete';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import PublishIcon from '@material-ui/icons/Publish';
import {FormControl, Select, MenuItem, Button, Typography, InputLabel} from '@material-ui/core';
import { useState } from 'react';

const checkAvailableComplement = (index, props) => {
    return (item) => {
      if (props.complement[index] === item) return true;
      return !props.complement.includes(item);
    };
  };
  
  const Complement = (props) => {
    const [msg,setmsg] = useState('');
    return (
      <div>
        {props.complement.map((food, index) => {
          return (
            <div key={index} style = {{display:"flex"}}>
              <FormControl variant="outlined" style = {{width:"100%", marginRight: "5px", marginBottom : "15px"}}>
                <InputLabel id="demo-simple-select-outlined-label">Complement</InputLabel>
                <Select
                  labelId="demo-simple-select-outlined-label"
                  id={index}
                  value={props.complement[index]}
                  onChange={(event)=>props.handleComplementName(event,index)}
                  label="Age"
                  fullWidth
                  style = {{width: window.screen.availWidth < 1200 ? "150px" : "210px"}}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {props.availableComplement
                    .filter(checkAvailableComplement(index, props))
                    .map((item, i) => (
                      <MenuItem key={index * 1000 + i} value={item}>{item.toString().toUpperCase()}</MenuItem>
                    ))}
                </Select>
              </FormControl>
              <DeleteIcon style = {{color:"red", fontSize: "30px"}} onClick={() => props.removeComplement(index)}/>
            </div>
          );
        })}
        <Button onClick={(e) => props.addComplement(e)} variant="contained" style = {{backgroundColor: "green", color : "white", marginBottom:"15px"}}>
          <AddCircleIcon/>{" Add Complement"}
        </Button><br/>
        <Button
          variant="contained"
          component="label"
            style={{marginBottom:"15px", backgroundColor:"	#FF1493", color: "white", textAlign:"center"}}
        >
          <PublishIcon/>Image
          <input
            type="file"
            onChange={(event)=>{props.handleImage(event); setmsg('uploaded')}}
            hidden
          />
        </Button>
        <Typography style={{marginBottom:"15px", marginLeft : window.screen.availWidth < 1200 ? "33%":"35%", color: "lightgreen", fontWeight: "bold"}}>{msg}</Typography>
      </div>
    );
  };
  
  export default Complement;