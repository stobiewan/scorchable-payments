import React, { Component } from 'react'
import { Route } from 'react-router'
//import HomeContainer from './layouts/home/HomeContainer'
/* import the MainScreen component drawn above in Pagedraw */
import MainScreen from './pagedraw/mainscreen'

// Styles
import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

var DaysEnum = Object.freeze({"intro":1, "send":2, "receive":3})

class App extends Component {
  constructor() {
    super();
    this.state = {
      selectedTab: DaysEnum.intro
    };
  }

  render() {
    return <MainScreen selectedTab={this.state.selectedTab} setSelectedTab={(i) => this.setState({selectedTab: i})}/>;
  }

//  render() {
//    return (
//      <div className="App">
//        <Route exact path="/" component={HomeContainer}/>
//      </div>
//    );
//  }
}

export default App
