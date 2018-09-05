import React, { Component } from 'react'
/* import the MainScreen component drawn above in Pagedraw */
import MainScreen from '../../pagedraw/mainscreen'

var DaysEnum = Object.freeze({"intro" : 1, "manageDai" : 2, "create" : 3, "ountgoing" : 4, "incoming" : 5})

class DrizzleApp extends Component {
  constructor(props, context) {
    super(props);
    this.state = {
      selectedTab: DaysEnum.intro,
      accountsApprovedDai: "123"
    };
  }

  onApproveDai(quantity) {
    this.setState({selectedTab: 3})
  }

  render() {
    return <MainScreen selectedTab={this.state.selectedTab}
                       setSelectedTab={(i) => this.setState({selectedTab: i})}
                       accounts={this.props.accounts}
                       onApproveDai={(i) => this.onApproveDai(i)}/>;
  }
}

export default DrizzleApp
