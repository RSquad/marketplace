pragma ton-solidity >=0.43.0;

struct NftItem {
    bytes data;
    string name;
    string linkToken;
}

abstract contract NftBase {
    mapping (uint256 => NftItem) public nftItems;

    modifier onlyRoot {
        require(_getRoot() == msg.sender, 102);
        _;
    }

    modifier onlyOwner {
        require(msg.pubkey() == tvm.pubkey(), 100);
        _;
    }

    modifier acceptMsg() {
        tvm.accept();
        _;
    }

    modifier nftExists(uint256 hash) {
        require(nftItems.exists(hash), 103);
        _;
    }
    
    function _getRoot() private inline pure returns (address) {
        optional(TvmCell) optSalt = tvm.codeSalt(tvm.code());
        require(optSalt.hasValue(), 101);
        return optSalt.get().toSlice().decode(address);
    }

    constructor() public onlyRoot {
    }

    receive() external pure {
        revert(104);
    }

    fallback() external pure {
        revert(105);
    }
}