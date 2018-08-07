pragma solidity ^0.4.24;


import "./Ownable.sol";
import "./SafeMath.sol";
import "./DaiInterface.sol";


contract ScorchablePayments is DaiTransferrer {

    using SafeMath for uint256;

    event NewPayment();
    event PayeeBondPaid();
    event PaymentDeleted();

    struct EthPayment {
        address payer;
        address payee;
        uint ethPaid;
        uint payeeEthBond;
        uint payerInactionTimeout;
        uint listIndex;
        bool payeeBondPaid;
    }

    struct DaiPayment {
        address payer;
        address payee;
        uint daiPaid;
        uint payeeDaiBond;
        uint payerInactionTimeout;
        uint listIndex;
        bool payeeBondPaid;
    }

    uint64[] public ethPaymentIds;
    uint64[] public daiPaymentIds;
    uint64 public currentId = 1;
    mapping(uint64 => Payment) public ethPayments;
    mapping(uint64 => Payment) public daiPayments;
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
        require(msg.sender == ethPayments[offerId].payer);
        require(ethPayments[offerId].payeeBondPaid == false);
        msg.sender.transfer(ethPayments[offerId].ethPaid);
        _deleteEthPayment(paymentId);
    }
    
    function cancelDaiPayment(uint64 paymentId) external {
        require(msg.sender == daiPayments[offerId].payer);
        require(daiPayments[offerId].payeeBondPaid == false);
        transferDai(address(this), msg.sender, daiPayments[offerId].daiPaid);
        _deleteDaiPayment(paymentId);
    }

    function payEthBond(
        uint64 paymentId
    )
    external
    payable
    {
        require(msg.value == ethPayments[paymentId].payeeEthBond);
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
        daiPayments[paymentId].payeeBondPaid = true;
        emit PayeeBondPaid();
    }

    function resignAsEthPayee(uint64 paymentId) external {
        require(msg.sender == ethPayments[paymentId].payee);


    }

    function resignAsDaiPayee(uint64 paymentId) external {
        require(msg.sender == daiPayments[paymentId].payee);

        
    }

    function getTotalEthInPayment(uint64 paymentId) internal view returns (uint totalEth) {
        uint totalEth = ethPayments[paymentId].ethPaid;
        if (ethPayments[paymentId].payeeBondPaid) {
            totalEth += ethPayments[paymentId].payeeEthBond;
        }
        return totalEth;
    }

    function getTotalDaiInPayment(uint64 paymentId) internal view returns (uint totalDai) {
        uint totalDai = daiPayments[paymentId].daiPaid;
        if (daiPayments[paymentId].payeeBondPaid) {
            totalDai += daiPayments[paymentId].payeeDaiBond;
        }
        return totalDai;
    }

    function releaseEthPayment(uint64 paymentId) external {
        require(msg.sender == ethPayments[paymentId].payer);
        uint ethToRelease = getTotalEthInPayment(paymentId);
        ethPayments[paymentId].payee.transfer(ethToRelease);
        _deleteEthPayment(paymentId);
    }

    function releaseDaiPayment(uint64 paymentId) external {
        require(msg.sender == daiPayments[paymentId].payer);
        uint daiToRelease = getTotalDaiInPayment(paymentId);
        transferDai(address(this), daiPayments[paymentId].payee, daiToRelease);
        _deleteDaiPayment(paymentId);
    }

    function scorchEthPayment(uint64 paymentId) external {
        require(msg.sender == ethPayments[paymentId].payer);
        uint ethToScorch = getTotalEthInPayment(paymentId);
        scorch.transfer(ethToScorch);
        _deletePayment(paymentId);
    }

    function scorchDaiPayment(uint64 paymentId) external {
        require(msg.sender == daiPayments[paymentId].payer);
        uint daiToScorch = getTotalDaiInPayment(paymentId);
        transferDai(address(this), scorch, daiToScorch);
        _deletePayment(paymentId);
    }

    function partialScorchEthPayment(uint64 paymentId, uint256 ethToScorch) external {
        require(msg.sender == ethPayments[paymentId].payer);
        // TODO tests must cover underflow throws, using safemath
        ethPayments[paymentId].ethPaid -= ethToScorch;
        scorch.transfer(ethToScorch);
    }

    function partialScorchDaiPayment(uint64 paymentId, uint256 daiToScorch) external {
        require(msg.sender == daiPayments[paymentId].payer);
        // TODO tests must cover underflow throws, using safemath
        daiPayments[paymentId].daiPaid -= daiToScorch;
        transferDai(address(this), scorch, daiToScorch);
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
