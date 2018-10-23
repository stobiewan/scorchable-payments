import ScorchablePayments from './../build/contracts/ScorchablePayments.json'
import DSToken from './../build/contracts/DSToken.json'

const drizzleOptions = {
    web3: {
        block: false,
        fallback: {
            type: 'ws',
            url: 'ws://127.0.0.1:8545'
        }
    },
    contracts: [
        ScorchablePayments,
        DSToken,
    ],
    events: {
        DSToken: ['Approval', 'Transfer'],
    },
    polls: {
        accounts: 1500
    }
}

export default drizzleOptions
