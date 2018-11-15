import {drizzleConnect} from 'drizzle-react'
import React, {Children, Component} from 'react'
import PropTypes from 'prop-types'

/*
 * Create component.
 */

class LoadingContainer extends Component {
    constructor(props, context) {
        super(props)

        // Errors occur on first tx after signing in if app is loaded with no metamask account and standard loading
        // container. Use these to force a refresh in that case.
        this.needsRefresh = false;
        this.hasSuceeded = false;
    }

    render() {
        if (this.props.web3.status === 'failed') {

            if (this.props.drizzleStatus.initialized){
                this.needsRefresh = true;
            }

            if (this.props.errorComp) {
                return this.props.errorComp
            }

            return (
                <main className="container loading-screen">
                    <div className="medium-black-text">
                        <h1>⚠️</h1>
                        <p>This browser has no connection to the Ethereum network. Please use the Brave/Chrome/FireFox
                            extension MetaMask, or dedicated Ethereum browsers Mist or Parity.</p>
                    </div>
                </main>
            )
        }

        if (this.props.web3.status === 'initialized' && Object.keys(this.props.accounts).length === 0) {

            if (this.props.drizzleStatus.initialized){
                this.needsRefresh = true;
            }

            return (
                <main className="container loading-screen">
                    <div className="medium-black-text">
                        <h1>🦊</h1>
                        <p><strong>We can't find any Ethereum accounts!</strong> Please check and make sure Metamask
                            or your browser are pointed at the correct network and your account is unlocked.</p>
                        <p>
                            <a href="https://brave.com/sto522">Try Brave Browser with Metamask</a>
                        </p>
                    </div>
                </main>
            )
        }
        if (this.props.drizzleStatus.initialized) {
            this.hasSuceeded = true;
            return Children.only(this.props.children)
        }
        if (this.props.loadingComp) {
            return this.props.loadingComp
        }
        return (
            <main className="container loading-screen">
                <div className="medium-black-text">
                    <h1>⚙️</h1>
                    <p>Loading dapp...</p>
                </div>
            </main>
        )
    }

    componentDidUpdate() {
        //Force refresh now that user has an account.
        if (this.needsRefresh && this.hasSuceeded) {
            window.location.reload()
        }
    }
}

LoadingContainer.contextTypes = {
    drizzle: PropTypes.object
}
/*
 * Export connected component.
 */
const mapStateToProps = state => {
    return {
        accounts: state.accounts,
        drizzleStatus: state.drizzleStatus,
        web3: state.web3
    }
}
export default drizzleConnect(LoadingContainer, mapStateToProps)