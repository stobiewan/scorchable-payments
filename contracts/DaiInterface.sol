pragma solidity ^0.4.24;

import "./SafeMath.sol";

contract DaiInterface {
    function transferFrom(address src, address dst, uint wad) public returns (bool);
}


contract DaiTransferrer {

    address daiAddress = 0xC4375B7De8af5a38a93548eb8453a498222C4fF2; // TODO Kovan, replace in drizzleOptions too. Mainnet is 0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359
    DaiInterface daiContract = DaiInterface(daiAddress);

    function transferDai(address _src, address _dst, uint _dai) internal {
        require(daiContract.transferFrom(_src, _dst, _dai));
    }
}
