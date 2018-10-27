pragma solidity ^0.4.24;


import "./Ownable.sol";
import "./SafeMath.sol";
import "./DaiInterface.sol";


contract ScorchablePayments is DaiTransferrer {

    using SafeMath for uint256;
    using SafeMath64 for uint64;

    event NewPayment();
    event PayeeBondPaid();
    event PaymentDeleted();

    struct Payment {
        address payer;
        address payee;
        uint amount;
        uint payeeBondAmount;
        uint payerInactionTimeout;
        uint listIndex;
        bool payeeBondPaid;
        bool isEthPayment;
    }

    uint64[] public paymentIds;
    uint64 public currentId = 1;
    mapping(uint64 => Payment) public payments;
    address public scorch = 0x300afbE08EE4619EC93524f9255CE59a013a5b63;

    modifier onlyPayer(uint64 paymentId) {
        require(msg.sender == payments[paymentId].payer);
        _;
    }

    modifier onlyPayee(uint64 paymentId) {
        require(msg.sender == payments[paymentId].payee);
        _;
    }

    function createPayment(
        address payee,
        uint amountToPay,
        uint payeeBondAmount,
        uint payerInactionTimeout,
        bool isEthPayment
    )
    external
    payable
    {
        transferTokens(msg.sender, address(this), amountToPay, isEthPayment);
        require(payerInactionTimeout < now.add(27 weeks));
        payments[currentId] = Payment(
            msg.sender,
            payee,
            amountToPay,
            payeeBondAmount,
            payerInactionTimeout,
            paymentIds.push(currentId).sub(1),
            payeeBondAmount == 0,
            isEthPayment
        );
        currentId = currentId.add(1);
        emit NewPayment();
    }

    function cancelPayment(uint64 paymentId) external onlyPayer(paymentId) {
        require(payments[paymentId].payeeBondPaid == false);
        transferTokens(
            address(this),
            msg.sender,
            payments[paymentId].amount,
            payments[paymentId].isEthPayment
        );
        _deletePayment(paymentId);
    }

    function payBond(
        uint64 paymentId
    )
    external
    payable
    {
        require(payments[paymentId].payeeBondPaid == false);
        transferTokens(
            msg.sender,
            address(this),
            payments[paymentId].payeeBondAmount,
            payments[paymentId].isEthPayment
        );
        payments[paymentId].amount = payments[paymentId].amount.add(payments[paymentId].payeeBondAmount);
        payments[paymentId].payeeBondPaid = true;
        emit PayeeBondPaid();
    }

    function returnTokensToSender(uint64 paymentId, uint amount) external onlyPayee(paymentId) {
        require(amount <= payments[paymentId].amount);
        transferTokens(address(this), payments[paymentId].payer, amount, payments[paymentId].isEthPayment);
        if (amount == payments[paymentId].amount) {
            _deletePayment(paymentId);
        }
        else {
            payments[paymentId].amount = payments[paymentId].amount.sub(amount);
        }
    }

    function topUp(uint64 paymentId, uint amount) external payable {
        transferTokens(msg.sender, address(this), amount, payments[paymentId].isEthPayment);
        payments[paymentId].amount = payments[paymentId].amount.add(amount);
    }

    function releasePayment(uint64 paymentId, uint amount) external onlyPayer(paymentId) {
        require(amount <= payments[paymentId].amount);
        payments[paymentId].amount = payments[paymentId].amount.sub(amount);
        transferTokens(address(this), payments[paymentId].payee, amount, payments[paymentId].isEthPayment);
        if (payments[paymentId].amount == 0) {
            _deletePayment(paymentId);
        }
    }

    function scorchPayment(uint64 paymentId, uint256 amountToScorch) external onlyPayer(paymentId) {
        payments[paymentId].amount = payments[paymentId].amount.sub(amountToScorch);
        transferTokens(address(this), scorch, amountToScorch, payments[paymentId].isEthPayment);
        if (payments[paymentId].amount == 0) {
            _deletePayment(paymentId);
        }
    }

    function claimTimedOutPayment(uint64 paymentId) external onlyPayee(paymentId) {
        require(now > payments[paymentId].payerInactionTimeout);
        transferTokens(
            address(this),
            payments[paymentId].payee,
            payments[paymentId].amount,
            payments[paymentId].isEthPayment
        );
        _deletePayment(paymentId);
    }

    function getNumPayments() external view returns (uint length) {
        return paymentIds.length;
    }

    function getPaymentsForAccount(address account) external view returns (uint64[], uint64[]) {
        uint64[] memory outgoingIds = new uint64[](paymentIds.length);
        uint64[] memory incomingIds = new uint64[](paymentIds.length);
        uint outgoingReturnLength = 0;
        uint incomingReturnLength = 0;

        for (uint i=0; i < paymentIds.length; i = i.add(1)) {
            if (payments[paymentIds[i]].payer == account) {
                outgoingIds[outgoingReturnLength] = paymentIds[i];
                outgoingReturnLength = outgoingReturnLength.add(1);
            }
            if (payments[paymentIds[i]].payee == account) {
                incomingIds[incomingReturnLength] = paymentIds[i];
                incomingReturnLength = incomingReturnLength.add(1);
            }
        }

        uint64[] memory returnOutgoingIds = new uint64[](outgoingReturnLength);
        uint64[] memory returnIncomingIds = new uint64[](incomingReturnLength);

        for (uint j=0; j < outgoingReturnLength; j = j.add(1)) {
            returnOutgoingIds[j] = outgoingIds[j];
        }
        for (uint k=0; k < incomingReturnLength; k = k.add(1)) {
            returnIncomingIds[k] = incomingIds[k];
        }
        return (returnOutgoingIds, returnIncomingIds);
    }

    function extendInactionTimeout(uint64 paymentId) public onlyPayer(paymentId) {
        payments[paymentId].payerInactionTimeout = now.add(5 weeks);
    }

    function transferTokens(address source, address dest, uint amount, bool isEthPayment) internal {
        if (isEthPayment) {
            if (dest == address(this)) {
                require(msg.value == amount);
            }
            else {
                dest.transfer(amount);
            }
        }
        else {
            transferDai(source, dest, amount);
        }
    }

    function _deletePayment(uint64 paymentId) internal {
        uint listIndex = payments[paymentId].listIndex;
        paymentIds[listIndex] = paymentIds[paymentIds.length.sub(1)];
        payments[paymentIds[listIndex]].listIndex = listIndex;
        delete payments[paymentId];
        paymentIds.length = paymentIds.length.sub(1);
        emit PaymentDeleted();
    }
}
