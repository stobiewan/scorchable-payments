import React, {Component} from 'react'
import PropTypes from 'prop-types'
/* import the MainScreen component drawn above in Pagedraw */
import MainScreen from '../../pagedraw/mainscreen'

var DaysEnum = Object.freeze({"intro": 1, "manageDai": 2, "create": 3, "ountgoing": 4, "incoming": 5})

class DrizzleApp extends Component {
    constructor(props, context) {
        super(props);
        this.contracts = context.drizzle.contracts
        this.relevantPaymentsKey = this.contracts.ScorchablePayments.methods.getPaymentsForAccount.cacheCall(this.props.accounts[0])
        this.relevantPayments = [[], []]
        this.changeOutgoingPaymentIndex = this.changeOutgoingPaymentIndex.bind(this);
        this.updateOutgoingIndices = this.updateOutgoingIndices.bind(this);
        this.state = {
            selectedTab: DaysEnum.intro,
            localOutgoingIndex: -1,
            selectedOutgoingPaymentId: -1
        };
    }

    updateOutgoingIndices() {
        let outgoing = this.relevantPayments[0]
        if (outgoing.length === 0) {
            this.setState({localOutgoingIndex: -1})
            this.setState({selectedOutgoingPaymentId: -1})
        }
        else {
            let newLocalIndex = 0
            if (this.state.localOutgoingIndex === -1) {
                // There are payments so select the first
                this.changeOutgoingPaymentIndex(1)
            }
            else {
                // if payments have been removed change the index so the payment id selected is the same.
                newLocalIndex = outgoing.indexOf(this.state.selectedOutgoingPaymentId)
            }
            this.setState({localOutgoingIndex: newLocalIndex})
            if (newLocalIndex === -1) {
                this.setState({selectedOutgoingPaymentId: -1})
            }
        }
    }

    changeOutgoingPaymentIndex(change) {
        let outgoing = this.relevantPayments[0]
        if (outgoing.length === 0) {
            this.setState({localOutgoingIndex: -1})
            this.setState({selectedOutgoingPaymentId: -1})
        }
        else {
            let newIndex = this.state.localOutgoingIndex + change;
            if (newIndex < 0) {
                newIndex = 0;
            }
            if (newIndex >= outgoing.length) {
                newIndex = outgoing.length - 1
            }
            this.setState({localOutgoingIndex: newIndex});
            this.setState({selectedOutgoingPaymentId: outgoing[newIndex]})
        }
    }

    getLocalOutgoingIndexString() {
        let numOutgoingPayments = this.relevantPayments[0].length
        if (numOutgoingPayments === 0) {
            return("You have zero outgoing payments")
        }
        else {
            return((this.state.localOutgoingIndex + 1).toString() + ' / ' + numOutgoingPayments.toString())
        }
    }

    render() {
        // If the cache key we received earlier isn't in the store yet; the initial value is still being fetched.
        if(!(this.relevantPaymentsKey in this.props.ScorchablePayments.getPaymentsForAccount)) {
            return (
                <span>Fetching...</span>
            )
        }

        return <MainScreen selectedTab={this.state.selectedTab}
                           setSelectedTab={(i) => this.setState({selectedTab: i})}
                           accounts={this.props.accounts}
                           onChangeOutgoingIndex={this.changeOutgoingPaymentIndex}
                           outgoingPaymentIndex={this.state.selectedOutgoingPaymentId}
                           localOutgoingIndexString={this.getLocalOutgoingIndexString()}/>;
    }

    componentDidUpdate() {
        let newRelevantPayments = this.props.ScorchablePayments.getPaymentsForAccount[this.relevantPaymentsKey].value
        if (newRelevantPayments !== this.relevantPayments) {
            this.relevantPayments = newRelevantPayments
            this.updateOutgoingIndices();
        }
    }
}

DrizzleApp.contextTypes = {
    drizzle: PropTypes.object
}

export default DrizzleApp
