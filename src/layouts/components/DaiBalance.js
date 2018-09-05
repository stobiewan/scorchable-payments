import React, { Component } from 'react'
import PropTypes from 'prop-types'

import styles from "./styles.css";

class DaiBalance extends Component {
    constructor(props, context) {
        super(props);
        this.contracts = context.drizzle.contracts
        this.balanceKey = this.contracts.DSToken.methods.balanceOf.cacheCall(this.props.account)
        this.approvedKey = this.contracts.DSToken.methods.allowance.cacheCall(
            this.props.account, this.contracts.ScorchablePayments.address)
    }
    render() {
        // If the data isn't here yet, show loading
        if(!((this.balanceKey in this.props.DSToken.balanceOf) && (this.approvedKey in this.props.DSToken.allowance))){
            return (
                <span>Loading...</span>
            )
        }

        // If the data is here, get it and display it
        var balance = this.props.DSToken.balanceOf[this.balanceKey].value / 10 ** 18
        var approved = this.props.DSToken.allowance[this.approvedKey].value / 10 ** 18

        return (
            <div className="medium-text">
                <div>Your Dai Balance: {balance}</div>
                <br/>
                <div>Dai approved for contract: {approved}</div>
            </div>
        )
    }
}

DaiBalance.contextTypes = {
    drizzle: PropTypes.object
}

export default DaiBalance;
