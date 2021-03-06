import {drizzleConnect} from 'drizzle-react'
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import './styles.css';

/*
 * Create component.
 */

class ContractData extends Component {
    constructor(props, context) {
        super(props)

        this.contracts = context.drizzle.contracts

        var methodArgs = this.getMethodArgs()

        // Fetch initial value from chain and return cache key for reactive updates.
        this.dataKey = this.contracts[this.props.contract].methods[this.props.method].cacheCall(...methodArgs)

        this.onDataCallback = this.props.onDataCallback ? this.props.onDataCallback : null
        this.keysToExclude = this.props.keysToExclude ? this.props.keysToExclude : []
        this.keysToRename = this.props.keysToRename ? this.props.keysToRename : []

        // State method args has converted placeholders
        this.state = {
            stateMethodArgs: methodArgs
        };
    }

    render() {
        // Contract is not yet intialized.
        if (!this.props.contracts[this.props.contract].initialized) {
            return (
                <span>Initializing...</span>
            )
        }

        // If the cache key we received earlier isn't in the store yet; the initial value is still being fetched.
        if (!(this.dataKey in this.props.contracts[this.props.contract][this.props.method])) {
            return (
                <span>Fetching...</span>
            )
        }

        // Show a loading spinner for future updates.
        var pendingSpinner = this.props.contracts[this.props.contract].synced ? '' : ' 🔄'

        // Optionally hide loading spinner (EX: ERC20 token symbol).
        if (this.props.hideIndicator) {
            pendingSpinner = ''
        }

        var displayData = this.props.contracts[this.props.contract][this.props.method][this.dataKey].value
        if (this.onDataCallback !== null) {
            this.onDataCallback(displayData)
        }
        var prefix = this.props.prefix

        // Optionally scale result to show whole token values
        if (this.props.isTokenValue) {
            displayData = displayData / 10 ** 18
        }

        // Optionally convert to UTF8
        if (this.props.toUtf8) {
            displayData = this.context.drizzle.web3.utils.hexToUtf8(displayData)
        }

        // Optionally convert to Ascii
        if (this.props.toAscii) {
            displayData = this.context.drizzle.web3.utils.hexToAscii(displayData)
        }

        // If return value is an array
        if (Array.isArray(displayData)) {
            const displayListItems = displayData.map((datum, index) => {
                <li key={index}>{`${datum}`}{pendingSpinner}</li>
            })

            return (
                <ul>
                    {displayListItems}
                </ul>
            )
        }

        // If retun value is an object
        if (typeof displayData === 'object') {
            var i = 0
            const displayObjectProps = []

            Object.keys(displayData).forEach((key) => {
                if (i != key && !this.keysToExclude.includes(key)) {
                    let displayValue = displayData[key]
                    let keysToRename = this.props.keysToRename ? this.props.keysToRename : {}
                    if (this.props.keysToScale.includes(key)) {
                        displayValue /= 10 ** 18
                    }
                    let displayName = key
                    if (Object.keys(keysToRename).includes(key)) {
                        displayName = keysToRename[key]()
                    }
                    displayObjectProps.push(<li key={i}>
                        <strong>{displayName}</strong>: {`${displayValue}`} {pendingSpinner}
                    </li>)
                }
                i++
            })

            return (
                <div className="vertical-margins">
                    <div className="border-container">
                        <div className="data-border">
                            <div className="medium-text">
                                <ul>
                                    {displayObjectProps}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <div className="medium-text">
                <span>{prefix}{`${displayData}`}{pendingSpinner}</span>
            </div>
        )
    }

    componentDidUpdate() {
        let newMethodArgs = this.getMethodArgs()
        if (!this.arraysEqual(newMethodArgs, this.state.stateMethodArgs)) {
            this.dataKey = this.contracts[this.props.contract].methods[this.props.method].cacheCall(...newMethodArgs)
            this.setState({stateMethodArgs: newMethodArgs})
        }
    }

    getMethodArgs() {
        let methodArgs = this.props.methodArgs ? this.props.methodArgs : []

        // Replace placeholders in fixed params
        for (var i = 0; i < methodArgs.length; i++) {
            if (typeof methodArgs[i] === 'string' && methodArgs[i].startsWith("contractPlaceholder:")) {
                let contractName = methodArgs[i].slice(20);
                methodArgs[i] = this.contracts[contractName].address;
            }
        }
        return (methodArgs)
    }

    arraysEqual(arr1, arr2) {
        if (arr1.length !== arr2.length)
            return false;
        for (var i = arr1.length; i--;) {
            if (arr1[i] !== arr2[i])
                return false;
        }

        return true;
    }
}

ContractData.contextTypes = {
    drizzle: PropTypes.object
}

/*
 * Export connected component.
 */

const mapStateToProps = state => {
    return {
        contracts: state.contracts
    }
}

export default drizzleConnect(ContractData, mapStateToProps)