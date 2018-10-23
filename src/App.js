import React, {Component} from 'react'
import {Route} from 'react-router'

import DrizzleAppContainer from './layouts/drizzle_app/DrizzleAppContainer'

// Styles
import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
    constructor() {
        super();
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
