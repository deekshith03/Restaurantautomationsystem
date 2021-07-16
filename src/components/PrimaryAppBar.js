import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MoreIcon from '@material-ui/icons/MoreVert';
import PropTypes from 'prop-types';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import Users from './Users.js';
import CreateUser from './CreateUser';
import { Link, Redirect } from 'react-router-dom';
import Manager from './Manager.js'
import ViewFood from './ViewFood.js';
import Invoice from "./Invoice";
import PurchaseList from './PurchaseList.js';
import Ingredients from './Ingredients.js';
import FoodPrice from './FoodPrice.js';
import TabContext from "@material-ui/lab/TabContext";
const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  root: {
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
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
  appbarbackground:
  {
    background:'black',
  },
}));



export default function PrimaryAppBar() {    
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
    event.preventDefault()
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
    
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
    event.preventDefault()
  };
  
  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose} component={Link} to="/Logout">Logout</MenuItem>
    </Menu>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem onClick={handleMenuClose} component={Link} to="/Logout">
        Logout
      </MenuItem>
    </Menu>
  );
  function TabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-force-tabpanel-${index}`}
      aria-labelledby={`scrollable-force-tab-${index}`}
      {...other}
    >
        {value === index && (
          <Box>
            <Typography component="div">{children}</Typography>
          </Box>
        )}
      </div>
    );
  }
  
  TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
  };
  
  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }
  
  const [value, setValue] = React.useState(sessionStorage.getItem('tab') !== null ? parseInt(sessionStorage.getItem('tab')) : 0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
    sessionStorage.setItem('tab', newValue);
  };
  if(!sessionStorage.getItem("type")){
    return (<Redirect to="/" />  ) ; 
  }

  const type= sessionStorage["type"];
  
  return (
    <div className={classes.grow}>
      <AppBar position="static" className={classes.appbarbackground}>

        {/* <Toolbar> */}
          {type === 'Owner' &&
            <div style={{display : "flex"}}>
              <TabContext>
                <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons="off" selectionFollowsFocus = {true} aria-label="scrollable auto tabs example">
                  <Tab label="Users"  {...a11yProps(0)} />
                  <Tab label="Create Users"  {...a11yProps(1)} />
                </Tabs>
                <MoreIcon onClick={handleMobileMenuOpen} color="inherit" style={{marginLeft: "auto", marginTop:window.screen.availWidth < 1200 ? "2%" : "0.7%", marginRight: "2%", float :"right"}}/>
              </TabContext>
            </div>
          }

          {type === 'Manager' &&
          <div style={{display : "flex"}}>
            <TabContext >
              <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons="off" selectionFollowsFocus = {true} aria-label="scrollable force tabs example">
                <Tab label="Report"  {...a11yProps(0)} />
                <Tab label="Change Price"  {...a11yProps(1)} />
                <Tab label="Food"  {...a11yProps(2)} />
                <Tab label="Invoice" {...a11yProps(3)} />
                <Tab label="Purchase List" {...a11yProps(4)} />
              </Tabs>
              <MoreIcon onClick={handleMobileMenuOpen} color="inherit" style={{marginLeft: "auto", marginTop:window.screen.availWidth < 1200 ? "2%" : "0.7%", marginRight: "2%", float :"right"}}/>
            </TabContext>
          </div>
          }
          

          {type === 'Clerk' &&
          <div style={{display : "flex"}}>
            <TabContext>
              <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons="off" selectionFollowsFocus = {true} aria-label="scrollable auto tabs example">
                <Tab label="Order"  {...a11yProps(0)} />
              </Tabs>
              <MoreIcon onClick={handleMobileMenuOpen} color="inherit" style={{marginLeft: "auto", marginTop:window.screen.availWidth < 1200 ? "2%" : "0.7%", marginRight: "2%", float :"right"}}/>
            </TabContext>
          </div>
          }
        {/* </Toolbar> */}
      </AppBar>

      <div>{type === 'Owner' &&
        <div>
        <TabPanel value={value} index={0}>
          <Users/>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <CreateUser/>
        </TabPanel>
        </div>}
      </div>

      <div>{type === 'Manager' &&
        <div>
        <TabPanel value={value} index={0}>
          <Manager/>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <FoodPrice/>
        </TabPanel>
        <TabPanel value={value} index={2}>
           <Ingredients/>
        </TabPanel>
        <TabPanel value={value} index={3}>
            <Invoice />
        </TabPanel>
        <TabPanel value={value} index={4}>
          <PurchaseList/>
        </TabPanel>
        </div>}
      </div>
      

      <div>{type === 'Clerk' &&
        <div>
        <TabPanel value={value} index={0}>
          <ViewFood/>
        </TabPanel>
        </div>}
      </div>
      
      {renderMobileMenu}
      {renderMenu}
    </div>
  );
}