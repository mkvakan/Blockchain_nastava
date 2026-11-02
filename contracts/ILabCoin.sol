// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

/// @title LabCoin: token, uloge i administracija
/// @notice Kolicina je u cijelim LBC. Specifikacija ne definira dogadaje.
interface ILabCoinToken {
    /// Uloga: vlasnik ili administrator. SPEC: K1, K2, K3, K4, K5, K6, K7, K8
    function izdajLabCoin(address primatelj, uint256 kolicina) external;

    /// Uloga: vlasnik, administrator ili korisnik s dovoljnim saldom. SPEC: K9, K10, K11
    function prenesiLabCoin(address primatelj, uint256 kolicina) external;

    /// Uloga: nitko. SPEC: K12
    function transferFrom() external;

    /// Uloga: nitko. SPEC: K13
    function spaliLabCoin() external;

    /// Uloga: vlasnik. SPEC: K14, K15, K16, K17
    function dodajAdministratora(address administrator) external;

    /// Uloga: vlasnik. SPEC: K18, K19, K20, K21
    function ukloniAdministratora(address administrator) external;

    /// Uloga: trenutni vlasnik. SPEC: K22, K23, K24
    function prenesiVlasnistvo(address noviVlasnik) external;
}

/// @title LabCoin: modul skupljanja ETH-a
/// @notice Specifikacija ne definira dogadaje.
interface ILabCoinModul {
    /// Uloga: vlasnik. SPEC: K25, K26, K27
    function otvoriSkupljanje() external;

    /// Uloga: bilo koja adresa. Iznos ETH-a ide uz poziv. SPEC: K28, K29, K30, K31, K32, K33
    function uplatiEth() external payable;

    /// Uloga: uplatitelj, samo svoju uplatu. SPEC: K34, K35, K36, K37, K40
    function povuciSvojuUplatu() external;

    /// Uloga: vlasnik. SPEC: K38, K39, K41, K42, K43
    function isplatiSkupljeniEth() external;
}
