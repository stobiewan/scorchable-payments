import React, { Component } from 'react'
import { Route } from 'react-router'

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
      selectedTab: DaysEnum.intro
    };
  }

  render() {
    return (
      <div className="App">
        <Route exact path="/" component={DrizzleAppContainer}/>
      </div>
    );
  }
}

export default App
