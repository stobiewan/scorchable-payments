import React, { Component } from 'react'
import { Route } from 'react-router'
/* import the MainScreen component drawn above in Pagedraw */
import MainScreen from './pagedraw/mainscreen'

import DrizzleAppContainer from './layouts/drizzle_app/DrizzleAppContainer'

// Styles
import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

var DaysEnum = Object.freeze({"intro" : 1, "manageDai" : 2, "create" : 3, "ountgoing" : 4, "incoming" : 5})

class App extends Component {
  constructor() {
    super();
    this.state = {
      selectedTab: DaysEnum.intro,
      accountsApprovedDai: "123"
    };
  }

  render() {
    return (
      <div className="App">
        <Route exact path="/" component={DrizzleAppContainer}/>
      </div>
    );
  }
//    return <MainScreen selectedTab={this.state.selectedTab} setSelectedTab={(i) => this.setState({selectedTab: i})} approvedDai={this.state.accountsApprovedDai}/>;

  getAccountsApprovedDai() {
    return "123";
  }
}

export default App
