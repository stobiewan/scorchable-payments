pragma solidity ^0.4.24;

import "./SafeMath.sol";

contract DaiInterface {
    function transferFrom(address src, address dst, uint wad) public returns (bool);
}


contract DaiTransferrer {

    address daiAddress = 0x444254706E8F1FB62a6EC26A7FA2b942ef672495; // TODO Kovan, replace in drizzleOptions too
    DaiInterface daiContract = DaiInterface(daiAddress);

    function transferDai(address _src, address _dst, uint _dai) internal {
        require(daiContract.transferFrom(_src, _dst, _dai));
    }
}
