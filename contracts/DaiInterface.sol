pragma solidity ^0.4.24;

import "./SafeMath.sol";

contract DaiInterface {
    function transferFrom(address src, address dst, uint wad) public returns (bool);
}


contract DaiTransferrer {

    address daiAddress = 0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359;
    DaiInterface daiContract = DaiInterface(daiAddress);

    function transferDai(address _src, address _dst, uint _dai) internal {
        require(daiContract.transferFrom(_src, _dst, _dai));
    }
}
