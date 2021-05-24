pragma ton-solidity >=0.43.0;
pragma AbiHeader expire;
pragma AbiHeader time;

import "NFT.sol";
import "NftAcceptable.sol";

contract NftRoot {

    uint public static _collection_id;

    string public _colletion_name;
    bytes public _colletion_icon;

    mapping(uint256 => address) public newNft;

    TvmCell m_nft;
    mapping (uint256 => NftItem) public nftItems;

    modifier onlyOwner {
        require(msg.pubkey() == tvm.pubkey(), 100);
        _;
    }

    modifier acceptMsg() {
        tvm.accept();
        _;
    }

    constructor(TvmCell nft, string name, bytes icon) public onlyOwner acceptMsg {
		m_nft = nft;
        _colletion_name = name;
        _colletion_icon = icon;
    }

    function _prepareNFTCode(address addr) private inline view returns (TvmCell) {
        TvmCell code = m_nft.toSlice().loadRef();
        TvmBuilder salt;
        salt.store(addr);
        return tvm.setCodeSalt(code, salt.toCell());
    }

    function getNewAddress(uint256 pubkey) public returns (address) {
        address nftAddr = newNft[pubkey];
        delete newNft[pubkey];
        return nftAddr;
    }

    function deployNFT(uint256 pubkey, uint128 tons) public returns (address addr) {
        require(msg.pubkey() == tvm.pubkey() || msg.value >= 1 ton, 111);
        tvm.accept();
        TvmCell newCode = _prepareNFTCode(address(this));
        addr = new NFT{code: newCode, pubkey: pubkey, value: tons, bounce: true}();
        newNft[pubkey] = addr;
    }

    function mint(
        bytes data,
        string name,
        string linkToken
    ) public onlyOwner acceptMsg returns (uint256 itemHash) {
        NftItem item;
        item = NftItem(data, name, linkToken);
        TvmBuilder b;
        b.store(item);
        itemHash = tvm.hash(b.toCell());
        nftItems[itemHash] = item;
        return itemHash;
    }

    function grant(uint256 nftHash, address addr) public onlyOwner acceptMsg {
        // TODO: check that NFT exists.
        NftItem item = nftItems[nftHash];
        delete nftItems[nftHash];
        NftAcceptable(addr).accept{value: 1 ton, flag: 1}(item);
    }
}