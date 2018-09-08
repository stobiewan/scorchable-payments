import { drizzleConnect } from 'drizzle-react'
import React, { Component } from 'react'
import PropTypes from 'prop-types'

/*
 * Create component.
 */

class ContractForm extends Component {
    constructor(props, context) {
        super(props);

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.contracts = context.drizzle.contracts;

        // Get the contract ABI
        const abi = this.contracts[this.props.contract].abi;

        this.fixedParams = this.props.fixedParams;
        this.paramNamesToScale = this.props.paramNamesToScale;
        this.inputs = [];
        var initialState = {};

        // Replace placeholders in fixed params
        for (var i = 0; i < this.fixedParams.length; i++) {
            if (typeof this.fixedParams[i] === 'string' && this.fixedParams[i].startsWith("contractPlaceholder:")) {
                let contractName = this.fixedParams[i].slice(20);
                this.fixedParams[i] = this.contracts[contractName].address;
            }
        }

        // Iterate over abi for correct function.
        for (var i = 0; i < abi.length; i++) {
            if (abi[i].name === this.props.method) {
                this.inputs = abi[i].inputs;

                for (var i = 0; i < this.inputs.length; i++) {
                    if (this.fixedParams[i] === -1) {
                        initialState[this.inputs[i].name] = '';
                    } else {
                        initialState[this.inputs[i].name] = this.fixedParams[i];
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

        if (this.props.sendArgs) {
            return this.contracts[this.props.contract].methods[this.props.method].cacheSend(...Object.values(submitState), this.props.sendArgs);
        }

        this.contracts[this.props.contract].methods[this.props.method].cacheSend(...Object.values(submitState));
    }

    handleInputChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    }

    translateType(type) {
        switch(true) {
            case /^uint/.test(type):
                return 'number'
                break
            case /^string/.test(type) || /^bytes/.test(type):
                return 'text'
                break
            case /^bool/.test(type):
                return 'checkbox'
                break
            default:
                return 'text'
        }
    }

    render() {
        return (
            <form className="pure-form pure-form-stacked">
                {this.inputs.map((input, index) => {
                    if (this.fixedParams[index] === -1) {
                        var inputType = this.translateType(input.type)
                        var inputLabel = this.props.labels ? this.props.labels[index] : input.name
                        // check if input type is struct and if so loop out struct fields as well
                        return (
                            <input key={input.name} type={inputType} name={input.name} value={this.state[input.name]}
                                   placeholder={inputLabel} onChange={this.handleInputChange}/>)
                    }
                })}
                <button key="submit" className="pure-button" type="button" onClick={this.handleSubmit}>Submit</button>
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