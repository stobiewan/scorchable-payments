import Mainscreen from '../../pagedraw/mainscreen'
import { drizzleConnect } from 'drizzle-react'

// May still need this even with data function to refresh component on updates for this contract.
const mapStateToProps = state => {
  return {
    accounts: state.accounts,
    ScorchablePayments: state.contracts.ScorchablePayments,
    DSToken: state.contracts.DSToken,
    drizzleStatus: state.drizzleStatus,
    selectedTab: this.props.selectedTab,
    setSelectedTab: this.props.setSelectedTab
  }
}

const HomeContainer = drizzleConnect(Mainscreen, mapStateToProps);

export default HomeContainer
