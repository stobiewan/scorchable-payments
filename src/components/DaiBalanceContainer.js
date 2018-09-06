import DaiBalance from './DaiBalance'
import { drizzleConnect } from 'drizzle-react'

// May still need this even with data function to refresh component on updates for this contract.
const mapStateToProps = state => {
    return {
        DSToken: state.contracts.DSToken,
        ScorchablePayments: state.contracts.ScorchablePayments,
    }
}

const DaiBalanceContainer = drizzleConnect(DaiBalance, mapStateToProps);

export default DaiBalanceContainer
