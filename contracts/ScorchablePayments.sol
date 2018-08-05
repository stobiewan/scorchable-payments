pragma solidity ^0.4.24;


import "./Ownable.sol";
import "./SafeMath.sol";
import "./DaiInterface.sol";


contract ScorchablePayments is DaiTransferrer {

    using SafeMath for uint256;

    event NewPayment();
    event BondPaid();
    event PaymentDeleted();

    struct Payment {
        address payer;
        address payee;
        uint ethPaid;
        uint daiPaid;
        uint8 bondPercentageRequired;
        bool bondPaid;
        uint listIndex;
        // TODO add lazy release
    }

    uint64[] public paymentIds;
    uint64 public currentId = 1;
    mapping(uint64 => Payment) public payments;
    address scorch = 0x300afbE08EE4619EC93524f9255CE59a013a5b63;

    /*  @param payee - the only address allowed to pay the bond and receive the payment.
        @param dai - quantity of dai in payment, can be 0.
        @param bondPercentageRequired - payee must contribute this % of paid dai and eth as bond to lock in payment.
    */
    function createPayment(
        address payee,
        uint dai,
        uint8 bondPercentageRequired
    )
    external
    payable
    {
        require(dai > 0 || msg.value > 0);
        if (dai > 0) {
            transferDai(msg.sender, address(this), dai);
        }

        payments[currentId] = Payment(
            msg.sender,
            payee,
            msg.value,
            dai,
            bondPercentageRequired,
            paymentIds.push(currentId) - 1
        );
        currentId++;
        emit NewPayment();
    }

    function cancelPayment(uint64 paymentId) external {
        require(msg.sender == payments[offerId].payer);
        require(payments[offerId].bondPaid == false);
        msg.sender.transfer(payments[offerId].ethPaid);
        transferDai(address(this), msg.sender, payments[offerId].daiPaid);
        _deletePayment(paymentId);
    }

    // TODO look up solidity 4.24 rational handling after tests are used.
    function getEthForBond(uint64 paymentId) public view returns (uint ethForBond) {
        return payments(paymentId).ethPaid * payments(paymentId).bondPercentageRequired / 100;
    }

    function getDaiForBond(uint64 paymentId) public view returns (uint daiForBond) {
        return payments(paymentId).daiPaid * payments(paymentId).bondPercentageRequired / 100;
    }

    function getTotalPaymentValues(uint64 paymentId) internal view returns (uint totalEth, uint totalDai) {
        uint256 totalEth = payments[paymentId].ethPaid;
        uint256 totalDai = payments[paymentId].daiPaid;
        if (payments[paymentId].bondPaid) {
            totalEth += getEthForBond(paymentId);
            totalDai += getDaiForBond(paymentId);
        }
        return (totalEth, totalDai);
    }

    function payBond(
        uint64 paymentId
    )
    external
    payable
    {
        require(msg.value == getEthForBond(paymentId));
        transferDai(msg.sender, address(this), getDaiForBond(paymentId));
        payments[paymentId].bondPaid = true;
        emit BondPaid();
    }

    function releasePayment(uint64 paymentId) external {
        require(msg.sender == payments[paymentId].payer);
        uint ethToRelease = 0;
        uint daiToRelease = 0;
        (ethToRelease, daiToRelease) = getTotalPaymentValues(paymentId);
        payments[paymentId].payee.transfer(ethToRelease);
        transferDai(address(this), payments[paymentId].payee, daiToRelease);
        _deletePayment(paymentId);
    }

    function scorchPayment(uint64 paymentId) external {
        require(msg.sender == payments[paymentId].payer);
        uint ethToScorch = 0;
        uint daiToScorch = 0;
        (ethToScorch, daiToScorch) = getTotalPaymentValues(paymentId);
        scorch.transfer(ethToScorch);
        transferDai(address(this), scorch, daiToScorch);
        _deletePayment(paymentId);
    }

    function partialScorchPayment(uint64 paymentId, uint256 ethToScorch, uint256 daiToScorch) external {
        require(msg.sender == payments[paymentId].payer);
        // TODO tests must cover underflow throws, using safemath
        payments[paymentId].ethPaid -= ethToScorch;
        payments[paymentId].daiPaid -= daiToScorch;
        scorch.transfer(ethToScorch);
        transferDai(address(this), scorch, daiToScorch);
    }

    function _deletePayment(uint64 paymentId) internal {
        uint listIndex = payments[paymentId].listIndex;
        paymentIds[listIndex] = paymentIds[paymentIds.length - 1];
        payments[paymentIds[listIndex]].listIndex = listIndex;
        delete payments[paymentId];
        paymentIds.length --;
        emit PaymentDeleted();
    }
}
