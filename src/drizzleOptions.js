import ScorchablePayments from './../build/contracts/ScorchablePayments.json'
import DSToken from './../build/contracts/DSToken.json'
import web3 from 'web3'

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
        {
            contractName: 'DSToken',
            web3Contract: new web3.eth.Contract(DSToken.abi, "0x444254706E8F1FB62a6EC26A7FA2b942ef672495", {data: 'deployedBytecode'})
        }
    ],
    events: {},
    polls: {
        accounts: 1500
    }
}

export default drizzleOptions
