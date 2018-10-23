import {drizzleConnect} from 'drizzle-react'
import React, {Component} from 'react'
import './ContractForm.css';
import './styles.css';
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
        this.processedFixedParams = []
        this.paramNamesToScale = this.props.paramNamesToScale;
        this.inputs = [];
        this.sendArgs = Object.assign({}, this.props.sendArgs);

        var initialState = {};

        this.processFixedParams()

        // Iterate over abi for correct function.
        for (let i = 0; i < abi.length; i++) {
            if (abi[i].name === this.props.method) {
                this.inputs = abi[i].inputs;
                for (let j = 0; j < this.inputs.length; j++) {
                    if (this.processedFixedParams[j] === -1) {
                        let initialValue = '';
                        if (this.translateType(this.inputs[j].type) === 'checkbox') {
                            initialValue = 1;
                        }
                        initialState[this.inputs[j].name] = initialValue;
                    } else {
                        initialState[this.inputs[j].name] = this.processedFixedParams[j];
                    }
                }
                break;
            }
        }
        this.state = initialState;
    }

    processFixedParams() {
        this.processedFixedParams = Array.from(this.fixedParams)
        // Replace placeholders in fixed params. Pagedraw files don't get context.
        for (let i = 0; i < this.fixedParams.length; i++) {
            if (typeof this.fixedParams[i] === 'string' && this.fixedParams[i].startsWith("contractPlaceholder:")) {
                let contractName = this.fixedParams[i].slice(20);
                this.processedFixedParams[i] = this.contracts[contractName].address;
            }
        }
    }

    handleSubmit() {
        let submitState = Object.assign({}, this.state);
        // scale token values from whole token to wei
        for (var i = 0; i < this.paramNamesToScale.length; i++) {
            submitState[this.paramNamesToScale[i]] = this.context.drizzle.web3.utils.toWei(submitState[this.paramNamesToScale[i]]);
        }
        this.addAmountSendArg(submitState);
        console.log("submitState = " + submitState)
        if (this.sendArgs) {
            return this.contracts[this.props.contract].methods[this.props.method].cacheSend(...Object.values(submitState), this.sendArgs);
        }
        this.contracts[this.props.contract].methods[this.props.method].cacheSend(...Object.values(submitState));
    }

    addAmountSendArg(submitState) {
        let sendAnyEth = false;
        let ethToSend = 0;
        if (this.props.amountInputs) {
            let conditionInput = this.props.amountInputs["conditional"]
            if (typeof(conditionInput) === "boolean") {
                sendAnyEth = conditionInput
            }
            else {
                sendAnyEth = submitState[conditionInput] > 0
            }
            if (sendAnyEth) {
                let valueInput = this.props.amountInputs["value"]
                ethToSend = parseInt(valueInput)
                if (isNaN(ethToSend)) {
                    ethToSend = submitState[valueInput]
                }
            }
        }
        if (ethToSend > 0) {
            this.sendArgs = {value: ethToSend};
        }
    }

    handleInputChange(event, name) {
        this.setState({[name]: event.target.value});
    }

    handleRadioInputClick(value, name) {
        this.setState({[name]: value});
    }

    translateType(type) {
        switch (true) {
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
            <div className="vertical-margins">
                <form>
                    {this.inputs.map((input, index) => {
                        if (this.fixedParams[index] === -1) {
                            let inputType = this.translateType(input.type)
                            let inputLabel = this.props.labels ? this.props.labels[index] : input.name
                            let inputPlaceholder = this.props.placeholders ? this.props.placeholders[index] : input.name
                            // check if input type is struct and if so loop out struct fields as well
                            return (
                                <div key={index + 32}>
                                    <InputComponent key={input.name} type={inputType} name={input.name}
                                                    value={this.state[input.name]} placeholder={inputPlaceholder}
                                                    onChange={this.handleInputChange}
                                                    onClick={this.handleRadioInputClick}
                                                    description={inputLabel}/>
                                    <SpacerFive key={index}/>
                                </div>)
                        }
                    })}
                    <div className="center-button-1">
                        <div className="center-button-2">
                            <Statelessbutton key={this.props.purpose} onClick={this.handleSubmit}
                                             buttonText={this.props.purpose}></Statelessbutton>
                        </div>
                    </div>
                </form>
            </div>
        )
    }

    componentDidUpdate() {
        if (this.fixedParams !== this.props.fixedParams) {
            this.fixedParams = this.props.fixedParams
            this.processFixedParams()
            let newState = Object.assign({}, this.state);
            for (let j = 0; j < this.inputs.length; j++) {
                if (this.processedFixedParams[j] !== -1) {
                    newState[this.inputs[j].name] = this.processedFixedParams[j]
                }
            }
            this.setState(newState);
        }
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