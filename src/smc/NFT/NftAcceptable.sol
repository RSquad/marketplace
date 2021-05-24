pragma ton-solidity >=0.43.0;

import "NftBase.sol";

abstract contract NftAcceptable is NftBase {
    function accept(NftItem item) public onlyRoot {
        TvmBuilder b;
        b.store(item);
        nftItems[tvm.hash(b.toCell())] = item;
        msg.sender.transfer({value: 0, flag: 64, bounce: false});
    }
}