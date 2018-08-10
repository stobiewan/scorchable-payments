pragma solidity ^0.4.24;


import "./Ownable.sol";
import "./SafeMath.sol";
import "./DaiInterface.sol";


// TODO combine eth and dai methods
// TODO add extend timeout
// TODO add top up
// TODO add tests
// TODO tests must cover underflow throws, using safemath
// TODO update migration
// TODO frontend


contract ScorchablePayments is DaiTransferrer {

    using SafeMath for uint256;

    event NewPayment();
    event PayeeBondPaid();
    event PaymentDeleted();

    struct EthPayment {
        address payer;
        address payee;
        uint ethInPayment;
        uint payeeEthBond;
        uint payerInactionTimeout;
        uint listIndex;
        bool payeeBondPaid;
    }

    struct DaiPayment {
        address payer;
        address payee;
        uint daiInPayment;
        uint payeeDaiBond;
        uint payerInactionTimeout;
        uint listIndex;
        bool payeeBondPaid;
    }

    uint64[] public ethPaymentIds;
    uint64[] public daiPaymentIds;
    uint64 public currentId = 1;
    mapping(uint64 => EthPayment) public ethPayments;
    mapping(uint64 => DaiPayment) public daiPayments;
    address private scorch = 0x300afbE08EE4619EC93524f9255CE59a013a5b63;

    function createEthPayment(
        address payee,
        uint payeeEthBond,
        uint payerInactionTimeout
    )
    external
    payable
    {
        require(msg.value > 0);
        ethPayments[currentId] = EthPayment(
            msg.sender,
            payee,
            msg.value,
            payeeEthBond,
            payerInactionTimeout,
            ethPaymentIds.push(currentId) - 1,
            false
        );
        currentId++;
        emit NewPayment();
    }

    function createDaiPayment(
        address payee,
        uint daiToPay,
        uint payeeDaiBond,
        uint payerInactionTimeout
    )
    external
    payable
    {
        require(daiToPay > 0);
        transferDai(msg.sender, address(this), daiToPay);
        daiPayments[currentId] = DaiPayment(
            msg.sender,
            payee,
            daiToPay,
            payeeDaiBond,
            payerInactionTimeout,
            daiPaymentIds.push(currentId) - 1,
            false
        );
        currentId++;
        emit NewPayment();
    }

    function cancelEthPayment(uint64 paymentId) external {
        require(msg.sender == ethPayments[paymentId].payer);
        require(ethPayments[paymentId].payeeBondPaid == false);
        msg.sender.transfer(ethPayments[paymentId].ethInPayment);
        _deleteEthPayment(paymentId);
    }
    
    function cancelDaiPayment(uint64 paymentId) external {
        require(msg.sender == daiPayments[paymentId].payer);
        require(daiPayments[paymentId].payeeBondPaid == false);
        transferDai(address(this), msg.sender, daiPayments[paymentId].daiInPayment);
        _deleteDaiPayment(paymentId);
    }

    function payEthBond(
        uint64 paymentId
    )
    external
    payable
    {
        require(msg.value == ethPayments[paymentId].payeeEthBond);
        ethPayments[paymentId].ethInPayment += msg.value;
        ethPayments[paymentId].payeeBondPaid = true;
        emit PayeeBondPaid();
    }

    function payDaiBond(
        uint64 paymentId
    )
    external
    payable
    {
        transferDai(msg.sender, address(this), daiPayments[paymentId].payeeDaiBond);
        daiPayments[paymentId].daiInPayment += daiPayments[paymentId].payeeDaiBond;
        daiPayments[paymentId].payeeBondPaid = true;
        emit PayeeBondPaid();
    }

    function returnEthToSender(uint64 paymentId, uint amount) external {
        require(msg.sender == ethPayments[paymentId].payee);
        require(amount <= ethPayments[paymentId].ethInPayment);
        ethPayments[paymentId].payer.transfer(amount);
        if (amount == ethPayments[paymentId].ethInPayment) {
            _deleteEthPayment(paymentId);
        }
        else {
            ethPayments[paymentId].ethInPayment -= amount;
        }
    }

    function returnDaiToSender(uint64 paymentId, uint amount) external {
        require(msg.sender == daiPayments[paymentId].payee);
        require(amount <= daiPayments[paymentId].daiInPayment);
        transferDai(address(this), daiPayments[paymentId].payer, amount);
        if (amount == daiPayments[paymentId].daiInPayment) {
            _deleteDaiPayment(paymentId);
        }
        else {
            daiPayments[paymentId].daiInPayment -= amount;
        }
    }

    function releaseEthPayment(uint64 paymentId, uint amount) external {
        require(msg.sender == ethPayments[paymentId].payer);
        require(amount <= ethPayments[paymentId].ethInPayment);
        ethPayments[paymentId].ethInPayment -= amount;
        ethPayments[paymentId].payee.transfer(amount);
        if (ethPayments[paymentId].ethInPayment == 0) {
            _deleteEthPayment(paymentId);
        }
    }

    function releaseDaiPayment(uint64 paymentId, uint amount) external {
        require(msg.sender == daiPayments[paymentId].payer);
        require(amount <= daiPayments[paymentId].daiInPayment);
        daiPayments[paymentId].daiInPayment -= amount;
        transferDai(address(this), daiPayments[paymentId].payee, amount);
        if (daiPayments[paymentId].daiInPayment == 0) {
            _deleteDaiPayment(paymentId);
        }
    }

    function scorchEthPayment(uint64 paymentId, uint256 ethToScorch) external {
        require(msg.sender == ethPayments[paymentId].payer);
        ethPayments[paymentId].ethInPayment -= ethToScorch;
        scorch.transfer(ethToScorch);
        if (ethPayments[paymentId].ethInPayment == 0) {
            _deleteEthPayment(paymentId);
        }
    }

    function scorchDaiPayment(uint64 paymentId, uint256 daiToScorch) external {
        require(msg.sender == daiPayments[paymentId].payer);
        daiPayments[paymentId].daiInPayment -= daiToScorch;
        transferDai(address(this), scorch, daiToScorch);
        if (daiPayments[paymentId].daiInPayment == 0) {
            _deleteDaiPayment(paymentId);
        }
    }

    function _deleteEthPayment(uint64 paymentId) internal {
        uint listIndex = ethPayments[paymentId].listIndex;
        ethPaymentIds[listIndex] = ethPaymentIds[ethPaymentIds.length - 1];
        ethPayments[ethPaymentIds[listIndex]].listIndex = listIndex;
        delete ethPayments[paymentId];
        ethPaymentIds.length --;
        emit PaymentDeleted();
    }
    
    function _deleteDaiPayment(uint64 paymentId) internal {
        uint listIndex = daiPayments[paymentId].listIndex;
        daiPaymentIds[listIndex] = daiPaymentIds[daiPaymentIds.length - 1];
        daiPayments[daiPaymentIds[listIndex]].listIndex = listIndex;
        delete daiPayments[paymentId];
        daiPaymentIds.length --;
        emit PaymentDeleted();
    }
}
