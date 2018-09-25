import { drizzleConnect } from 'drizzle-react'
import React, { Component } from 'react'
import './ContractForm.css';
import PropTypes from 'prop-types'
import InputComponent from '../pagedraw/inputcomponent'
import SpacerFive from '../pagedraw/spacerfive'
import Statelessbutton from '../pagedraw/statelessbutton'

/*
 * Create component.
 */

class ContractForm extends Component {
    constructor(props, context) {
        super(props);

        this.addAmountSendArg = this.addAmountSendArg.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleRadioInputClick = this.handleRadioInputClick.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.contracts = context.drizzle.contracts;

        // Get the contract ABI
        const abi = this.contracts[this.props.contract].abi;

        this.fixedParams = this.props.fixedParams;
        this.paramNamesToScale = this.props.paramNamesToScale;
        this.inputs = [];
        this.sendArgs = Object.assign({}, this.props.sendArgs);

        var initialState = {};

        // Replace placeholders in fixed params. Pagedraw files don't get context.
        for (let i = 0; i < this.fixedParams.length; i++) {
            if (typeof this.fixedParams[i] === 'string' && this.fixedParams[i].startsWith("contractPlaceholder:")) {
                let contractName = this.fixedParams[i].slice(20);
                this.fixedParams[i] = this.contracts[contractName].address;
            }
        }

        // Iterate over abi for correct function.
        for (let i = 0; i < abi.length; i++) {
            if (abi[i].name === this.props.method) {
                this.inputs = abi[i].inputs;
                for (let j = 0; j < this.inputs.length; j++) {
                    if (this.fixedParams[j] === -1) {
                        let initialValue = '';
                        if (this.translateType(this.inputs[j].type) === 'checkbox') {
                            initialValue = 1;
                        }
                        initialState[this.inputs[j].name] = initialValue;
                    } else {
                        initialState[this.inputs[j].name] = this.fixedParams[j];
                    }
                }

                break;
            }
        }

        this.state = initialState;
    }

    handleSubmit() {
        let submitState = Object.assign({}, this.state);
        // scale token values from whole token to wei
        for (var i = 0; i < this.paramNamesToScale.length; i++) {
            submitState[this.paramNamesToScale[i]] = submitState[this.paramNamesToScale[i]] * 10 ** 18;
        }
        this.addAmountSendArg(submitState);
        if (this.sendArgs) {
            return this.contracts[this.props.contract].methods[this.props.method].cacheSend(...Object.values(submitState), this.sendArgs);
        }
        this.contracts[this.props.contract].methods[this.props.method].cacheSend(...Object.values(submitState));
    }

    addAmountSendArg(submitState) {
        let ethToSend = 0;
        console.log(this.sendArgs)
        if (this.props.amountInputs && submitState[this.props.amountInputs["conditional"]] > 0) {
            ethToSend = submitState[this.props.amountInputs["value"]];
        }
        if (ethToSend > 0) {
            this.sendArgs = {value: ethToSend};
        }
        console.log(this.sendArgs)
    }

    handleInputChange(event, name) {
        this.setState({ [name]: event.target.value });
    }

    handleRadioInputClick(value, name) {
        console.log("val and name is " + value + ",  " + name)
        this.setState({ [name]: value });
    }

    translateType(type) {
        switch(true) {
            case /^uint/.test(type):
                return 'number'
            case /^string/.test(type) || /^bytes/.test(type):
                return 'text'
            case /^bool/.test(type):
                return 'checkbox'
            default:
                return 'text'
        }
    }

    render() {
        return (
            <form>
                {this.inputs.map((input, index) => {
                    if (this.fixedParams[index] === -1) {
                        let inputType = this.translateType(input.type)
                        let inputLabel = this.props.labels ? this.props.labels[index] : input.name
                        let inputPlaceholder = this.props.placeholders ? this.props.placeholders[index] : input.name
                        // check if input type is struct and if so loop out struct fields as well
                        return (
                            <div>
                                <InputComponent key={input.name} type={inputType} name={input.name}
                                                value={this.state[input.name]} placeholder={inputPlaceholder}
                                                onChange={this.handleInputChange} onClick={this.handleRadioInputClick}
                                                description={inputLabel}/>
                                <SpacerFive/>
                            </div>)
                    }
                })}
                <div className="center-button-1">
                    <div className="center-button-2">
                        <Statelessbutton key={this.props.purpose} onClick={this.handleSubmit} buttonText={this.props.purpose} ></Statelessbutton>
                    </div>
                </div>
            </form>
        )
    }
}

ContractForm.contextTypes = {
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

export default drizzleConnect(ContractForm, mapStateToProps)