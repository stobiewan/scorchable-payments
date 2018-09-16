import React, {Component} from 'react'
/* import the MainScreen component drawn above in Pagedraw */
import MainScreen from '../../pagedraw/mainscreen'

var DaysEnum = Object.freeze({"intro": 1, "manageDai": 2, "create": 3, "ountgoing": 4, "incoming": 5})

class DrizzleApp extends Component {
    constructor(props, context) {
        super(props);
        this.changeOutgoingPaymentIndex = this.changeOutgoingPaymentIndex.bind(this);
        this.state = {
            selectedTab: DaysEnum.intro,
            selectedOutgoingIndex: 0
        };
    }

    changeOutgoingPaymentIndex(change) {
        console.log(change)
        let newIndex = this.state.selectedOutgoingIndex + change;
        if (newIndex < 0) {
            newIndex = 0;
        }
        this.setState({selectedOutgoingIndex: newIndex});
    }
    render() {
        return <MainScreen selectedTab={this.state.selectedTab}
                           setSelectedTab={(i) => this.setState({selectedTab: i})}
                           accounts={this.props.accounts}
                           onChangeOutgoingIndex={this.changeOutgoingPaymentIndex}
                           outgoingPaymentIndex={this.state.selectedOutgoingIndex}/>;
    }
}

export default DrizzleApp
