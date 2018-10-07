import React, {Component} from 'react'
import PropTypes from 'prop-types'
/* import the MainScreen component drawn above in Pagedraw */
import MainScreen from '../../pagedraw/mainscreen'

var DaysEnum = Object.freeze({"intro": 1, "manageDai": 2, "create": 3, "ountgoing": 4, "incoming": 5})


class PaymentCycler {
    constructor(app) {
        this.app = app
        this.paymentsArray = []
        this.localIndex = -1  // the index relative to payments relevant to this account
        this.selectedIndex = -1  // the index used in the smart contract
        this.cyclePaymentIndex = this.cyclePaymentIndex.bind(this);
        this.updateIndices = this.updateIndices.bind(this);
    }

    setRelevantPayments(paymentsArray) {
        this.paymentsArray = Array.from(paymentsArray)
        this.updateIndices()

        console.log("lent set to " + this.paymentsArray.length)
    }

    updateIndices() {
        if (this.paymentsArray.length === 0) {
            this._invalidate()
        }
        else {
            // if payments have been removed change the index so the payment id selected is the same.
            let newLocalIndex = this.paymentsArray.indexOf(this.selectedIndex)
            if (newLocalIndex === -1) {
                // Previously selected payment is invalid or deleted, so go to the first.
                newLocalIndex = 0
            }
            this._setNewLocalIndex(newLocalIndex)
        }
    }

    cyclePaymentIndex(change) {
        if (this.paymentsArray.length === 0) {
            this._invalidate()
        }
        else {
            let newLocalIndex = this.localIndex + change;
            if (newLocalIndex < 0) {
                newLocalIndex = 0;
            }
            if (newLocalIndex >= this.paymentsArray.length) {
                newLocalIndex = this.paymentsArray.length - 1
            }
            this._setNewLocalIndex(newLocalIndex)
        }
        this.app.updatedSelection()
    }

    _invalidate(){
        this.localIndex = -1
        this.selectedIndex = -1
    }

    _setNewLocalIndex(newIndex) {
        this.localIndex = newIndex
        this.selectedIndex = this.paymentsArray[newIndex]
    }

    getLocalIndexString() {
        let numPayments = this.paymentsArray.length
        if (numPayments === 0) {
            return("No payments found for this address")
        }
        else {
            return((this.localIndex + 1).toString() + ' / ' + numPayments.toString())
        }
    }

    // The index of the selected payment
    getSelectedPaymentIndex() {
        return this.selectedIndex
    }

}


class DrizzleApp extends Component {
    constructor(props, context) {
        super(props);
        this.contracts = context.drizzle.contracts
        this.relevantPaymentsKey = this.contracts.ScorchablePayments.methods.getPaymentsForAccount.cacheCall(this.props.accounts[0])
        this.incomingPaymentCycler = new PaymentCycler(this)
        this.outgoingPaymentCycler = new PaymentCycler(this)
        this.state = {
            selectedTab: DaysEnum.intro,
            relevantPayments: [[], []],
            currentAddress: this.props.accounts[0]
        };
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
                           selectedAccount={this.state.currentAddress}
                           onChangeOutgoingIndex={this.outgoingPaymentCycler.cyclePaymentIndex}
                           outgoingPaymentIndex={this.outgoingPaymentCycler.getSelectedPaymentIndex()}
                           localOutgoingIndexString={this.outgoingPaymentCycler.getLocalIndexString()}
                           onChangeIncomingIndex={this.incomingPaymentCycler.cyclePaymentIndex}
                           incomingPaymentIndex={this.incomingPaymentCycler.getSelectedPaymentIndex()}
                           localIncomingIndexString={this.incomingPaymentCycler.getLocalIndexString()}/>;
    }

    componentDidUpdate() {
        let newRelevantPayments = this.props.ScorchablePayments.getPaymentsForAccount[this.relevantPaymentsKey].value
        if (! this.paymentArraysEqual(newRelevantPayments, this.state.relevantPayments)) {
            this.outgoingPaymentCycler.setRelevantPayments(newRelevantPayments[0])
            this.incomingPaymentCycler.setRelevantPayments(newRelevantPayments[1])
            this.setState({relevantPayments: newRelevantPayments})
        }

        if (this.state.currentAddress != this.props.accounts[0]) {
            window.location.reload()
        }
    }

    updatedSelection() {
        this.setState(this.state)
    }

    paymentArraysEqual(rp1, rp2) {
        let outgoingEqual = this.arraysEqual(rp1[0], rp2[0])
        let incomingEqual = this.arraysEqual(rp1[1], rp2[1])
        return (outgoingEqual && incomingEqual)
    }

    arraysEqual(arr1, arr2) {
        if(arr1.length !== arr2.length)
            return false;
        for(var i = arr1.length; i--;) {
            if(arr1[i] !== arr2[i])
                return false;
        }

        return true;
    }
}

DrizzleApp.contextTypes = {
    drizzle: PropTypes.object
}

export default DrizzleApp
