import DrizzleApp from './DrizzleApp'
import {drizzleConnect} from 'drizzle-react'

// May still need this even with data function to refresh component on updates for this contract.
const mapStateToProps = state => {
    return {
        accounts: state.accounts,
        ScorchablePayments: state.contracts.ScorchablePayments,
        drizzleStatus: state.drizzleStatus,
    }
}

const DrizzleAppContainer = drizzleConnect(DrizzleApp, mapStateToProps);

export default DrizzleAppContainer
