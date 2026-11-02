// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ILabCoinToken} from "./ILabCoin.sol";

/// @title LabCoin
/// @notice Argument `kolicina` je u cijelim LBC. Na lancu je 1 LBC = 10^6 najmanjih jedinica.
contract LabCoin is ERC20, Ownable, ILabCoinToken {
    uint8 private constant DECIMALA = 6;
    uint256 private constant JEDINICA = 10 ** uint256(DECIMALA);
    uint256 private constant MAX_IZDAVANJE = 100;
    uint256 private constant MAX_UKUPNO = 10_000;

    mapping(address => bool) private administratori;

    constructor() ERC20("LabCoin", "LBC") Ownable(msg.sender) {}

    function decimals() public pure override returns (uint8) {
        return DECIMALA;
    }

    /// Uloga: vlasnik ili administrator. SPEC: K1, K2, K3, K4, K5, K6, K7, K8
    function izdajLabCoin(address primatelj, uint256 kolicina) external override {
        require(msg.sender == owner() || administratori[msg.sender], "Samo vlasnik ili administrator smije izdati.");
        require(kolicina > 0, "Iznos izdavanja mora biti veci od nule.");
        require(kolicina <= MAX_IZDAVANJE, "Jedno izdavanje smije biti najvise 100 LBC.");
        uint256 iznos = kolicina * JEDINICA;
        require(totalSupply() + iznos <= MAX_UKUPNO * JEDINICA, "Ukupna kolicina ne smije prijeci 10000 LBC.");
        require(primatelj != address(0), "Primatelj ne moze biti nulta adresa.");
        _mint(primatelj, iznos);
    }

    /// Uloga: vlasnik, administrator ili korisnik s dovoljnim saldom. SPEC: K9, K10, K11
    function prenesiLabCoin(address primatelj, uint256 kolicina) external override {
        require(balanceOf(msg.sender) / JEDINICA >= kolicina, "Saldo nije dovoljan.");
        require(primatelj != address(0), "Primatelj ne moze biti nulta adresa.");
        require(kolicina > 0, "Iznos prijenosa mora biti veci od nule.");
        _transfer(msg.sender, primatelj, kolicina * JEDINICA);
    }

    /// Uloga: nitko. SPEC: K12
    function transferFrom() external pure override {
        revert("transferFrom nije dopusten.");
    }

    /// ERC20 potpis. Ista zabrana: poziv ne mice tokene. SPEC: K12
    function transferFrom(address, address, uint256) public pure override returns (bool) {
        revert("transferFrom nije dopusten.");
    }

    /// Uloga: nitko. SPEC: K13
    function spaliLabCoin() external pure override {
        revert("Spaljivanje nije dopusteno.");
    }

    /// Uloga: vlasnik. SPEC: K14, K15, K16, K17
    function dodajAdministratora(address administrator) external override {
        require(msg.sender == owner(), "Samo vlasnik smije dodati administratora.");
        require(administrator != address(0), "Administrator ne moze biti nulta adresa.");
        require(!administratori[administrator], "Adresa je vec administrator.");
        administratori[administrator] = true;
    }

    /// Uloga: vlasnik. SPEC: K18, K19, K20, K21
    function ukloniAdministratora(address administrator) external override {
        if (administrator == owner()) {
            revert("Administrator ne moze ukloniti vlasnika.");
        }
        require(msg.sender == owner(), "Samo vlasnik smije ukloniti administratora.");
        require(administratori[administrator], "Adresa nije administrator.");
        administratori[administrator] = false;
    }

    /// Uloga: trenutni vlasnik. SPEC: K22, K23, K24
    function prenesiVlasnistvo(address noviVlasnik) external override {
        require(msg.sender == owner(), "Samo vlasnik smije prenijeti vlasnistvo.");
        require(noviVlasnik != address(0), "Novi vlasnik ne moze biti nulta adresa.");
        _transferOwnership(noviVlasnik);
    }
}
