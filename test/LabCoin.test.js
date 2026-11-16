import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

const JEDINICA = 10n ** 6n;

function lbc(kolicina) {
  return BigInt(kolicina) * JEDINICA;
}

async function izdajCijelih(ugovor, vlasnik, primatelj, kolicina) {
  let preostalo = kolicina;
  while (preostalo > 0) {
    const komad = preostalo > 100 ? 100 : preostalo;
    await ugovor.connect(vlasnik).izdajLabCoin(primatelj.address, komad);
    preostalo -= komad;
  }
}

describe("LabCoin", function () {
  let vlasnik;
  let administrator;
  let korisnik;
  let drugi;
  let labCoin;

  beforeEach(async function () {
    [vlasnik, administrator, korisnik, drugi] = await ethers.getSigners();
    labCoin = await ethers.deployContract("LabCoin", vlasnik);
  });

  it("K1: vlasnik izdaje 100 LBC korisniku", async function () {
    await expect(labCoin.connect(vlasnik).izdajLabCoin(korisnik.address, 100))
      .to.emit(labCoin, "Transfer")
      .withArgs(ethers.ZeroAddress, korisnik.address, lbc(100));

    expect(await labCoin.balanceOf(korisnik.address)).to.equal(lbc(100));
    expect(await labCoin.totalSupply()).to.equal(lbc(100));
  });

  describe("K2", function () {
    beforeEach(async function () {
      await labCoin.connect(vlasnik).dodajAdministratora(administrator.address);
    });

    it("K2: administrator izdaje 1 LBC sebi", async function () {
      await expect(labCoin.connect(administrator).izdajLabCoin(administrator.address, 1))
        .to.emit(labCoin, "Transfer")
        .withArgs(ethers.ZeroAddress, administrator.address, lbc(1));

      expect(await labCoin.balanceOf(administrator.address)).to.equal(lbc(1));
    });
  });

  it("K3: obican korisnik ne smije izdati", async function () {
    await expect(labCoin.connect(korisnik).izdajLabCoin(korisnik.address, 1)).to.be.revertedWith(
      "Samo vlasnik ili administrator smije izdati.",
    );
  });

  it("K4: izdavanje nule je odbijeno", async function () {
    await expect(labCoin.connect(vlasnik).izdajLabCoin(korisnik.address, 0)).to.be.revertedWith(
      "Iznos izdavanja mora biti veci od nule.",
    );
  });

  // K5 trazi 100,000001 LBC. Argument izdajLabCoin je uint256 u cijelim LBC,
  // pa se razlomak ne moze poslati. Isti require odbija svaki iznos veci od 100,
  // zato test koristi 101.
  it("K5: izdavanje iznad 100 LBC je odbijeno", async function () {
    await expect(labCoin.connect(vlasnik).izdajLabCoin(korisnik.address, 101)).to.be.revertedWith(
      "Jedno izdavanje smije biti najvise 100 LBC.",
    );
  });

  describe("K6", function () {
    beforeEach(async function () {
      await izdajCijelih(labCoin, vlasnik, korisnik, 9900);
    });

    it("K6: izdavanje do granice od 10000 LBC prolazi", async function () {
      await expect(labCoin.connect(vlasnik).izdajLabCoin(korisnik.address, 100))
        .to.emit(labCoin, "Transfer")
        .withArgs(ethers.ZeroAddress, korisnik.address, lbc(100));

      expect(await labCoin.totalSupply()).to.equal(lbc(10000));
    });
  });

  describe("K7", function () {
    beforeEach(async function () {
      await labCoin.connect(vlasnik).dodajAdministratora(administrator.address);
      await izdajCijelih(labCoin, vlasnik, korisnik, 10000);
    });

    it("K7: izdavanje preko 10000 LBC je odbijeno", async function () {
      await expect(labCoin.connect(administrator).izdajLabCoin(administrator.address, 1)).to.be.revertedWith(
        "Ukupna kolicina ne smije prijeci 10000 LBC.",
      );
    });
  });

  it("K8: izdavanje na nultu adresu je odbijeno", async function () {
    await expect(labCoin.connect(vlasnik).izdajLabCoin(ethers.ZeroAddress, 1)).to.be.revertedWith(
      "Primatelj ne moze biti nulta adresa.",
    );
  });

  describe("K9", function () {
    beforeEach(async function () {
      await labCoin.connect(vlasnik).izdajLabCoin(korisnik.address, 10);
    });

    it("K9: korisnik salje 4 LBC drugom korisniku", async function () {
      const ukupno = await labCoin.totalSupply();

      await expect(labCoin.connect(korisnik).prenesiLabCoin(drugi.address, 4))
        .to.emit(labCoin, "Transfer")
        .withArgs(korisnik.address, drugi.address, lbc(4));

      expect(await labCoin.balanceOf(korisnik.address)).to.equal(lbc(6));
      expect(await labCoin.balanceOf(drugi.address)).to.equal(lbc(4));
      expect(await labCoin.totalSupply()).to.equal(ukupno);
    });
  });

  describe("K10", function () {
    beforeEach(async function () {
      await labCoin.connect(vlasnik).izdajLabCoin(korisnik.address, 3);
    });

    it("K10: prijenos veci od salda je odbijen", async function () {
      await expect(labCoin.connect(korisnik).prenesiLabCoin(drugi.address, 4)).to.be.revertedWith(
        "Saldo nije dovoljan.",
      );
    });
  });

  describe("K11", function () {
    beforeEach(async function () {
      await labCoin.connect(vlasnik).izdajLabCoin(korisnik.address, 1);
    });

    it("K11: prijenos na nultu adresu je odbijen", async function () {
      await expect(labCoin.connect(korisnik).prenesiLabCoin(ethers.ZeroAddress, 1)).to.be.revertedWith(
        "Primatelj ne moze biti nulta adresa.",
      );
    });
  });

  describe("K12", function () {
    beforeEach(async function () {
      await labCoin.connect(vlasnik).izdajLabCoin(korisnik.address, 5);
    });

    it("K12: transferFrom ne mice tokene", async function () {
      await expect(labCoin.connect(drugi)["transferFrom()"]()).to.be.revertedWith(
        "transferFrom nije dopusten.",
      );
      await expect(
        labCoin.connect(drugi)["transferFrom(address,address,uint256)"](
          korisnik.address,
          drugi.address,
          lbc(5),
        ),
      ).to.be.revertedWith("transferFrom nije dopusten.");

      expect(await labCoin.balanceOf(korisnik.address)).to.equal(lbc(5));
    });
  });

  describe("K13", function () {
    beforeEach(async function () {
      await labCoin.connect(vlasnik).dodajAdministratora(administrator.address);
      await labCoin.connect(vlasnik).izdajLabCoin(korisnik.address, 5);
    });

    it("K13: spaljivanje nije dopusteno", async function () {
      const ukupno = await labCoin.totalSupply();

      await expect(labCoin.connect(korisnik).spaliLabCoin()).to.be.revertedWith(
        "Spaljivanje nije dopusteno.",
      );
      await expect(labCoin.connect(vlasnik).spaliLabCoin()).to.be.revertedWith(
        "Spaljivanje nije dopusteno.",
      );
      await expect(labCoin.connect(administrator).spaliLabCoin()).to.be.revertedWith(
        "Spaljivanje nije dopusteno.",
      );

      expect(await labCoin.totalSupply()).to.equal(ukupno);
    });
  });

  it("K14: dodani administrator smije izdati", async function () {
    await labCoin.connect(vlasnik).dodajAdministratora(administrator.address);

    await expect(labCoin.connect(administrator).izdajLabCoin(administrator.address, 1))
      .to.emit(labCoin, "Transfer")
      .withArgs(ethers.ZeroAddress, administrator.address, lbc(1));
  });

  it("K15: korisnik ne smije dodati administratora", async function () {
    await expect(labCoin.connect(korisnik).dodajAdministratora(drugi.address)).to.be.revertedWith(
      "Samo vlasnik smije dodati administratora.",
    );
  });

  it("K16: administrator ne moze biti nulta adresa", async function () {
    await expect(labCoin.connect(vlasnik).dodajAdministratora(ethers.ZeroAddress)).to.be.revertedWith(
      "Administrator ne moze biti nulta adresa.",
    );
  });

  describe("K17", function () {
    beforeEach(async function () {
      await labCoin.connect(vlasnik).dodajAdministratora(administrator.address);
    });

    it("K17: ista adresa ne moze biti administrator dvaput", async function () {
      await expect(labCoin.connect(vlasnik).dodajAdministratora(administrator.address)).to.be.revertedWith(
        "Adresa je vec administrator.",
      );
    });
  });

  describe("K18", function () {
    beforeEach(async function () {
      await labCoin.connect(vlasnik).dodajAdministratora(administrator.address);
    });

    it("K18: uklonjeni administrator vise ne smije izdati", async function () {
      await labCoin.connect(vlasnik).ukloniAdministratora(administrator.address);

      await expect(labCoin.connect(administrator).izdajLabCoin(administrator.address, 1)).to.be.revertedWith(
        "Samo vlasnik ili administrator smije izdati.",
      );
    });
  });

  it("K19: korisnik ne smije ukloniti administratora", async function () {
    await expect(labCoin.connect(korisnik).ukloniAdministratora(administrator.address)).to.be.revertedWith(
      "Samo vlasnik smije ukloniti administratora.",
    );
  });

  it("K20: uklanjanje adrese koja nije administrator je odbijeno", async function () {
    await expect(labCoin.connect(vlasnik).ukloniAdministratora(administrator.address)).to.be.revertedWith(
      "Adresa nije administrator.",
    );
  });

  describe("K21", function () {
    beforeEach(async function () {
      await labCoin.connect(vlasnik).dodajAdministratora(administrator.address);
    });

    it("K21: administrator ne moze ukloniti vlasnika", async function () {
      await expect(labCoin.connect(administrator).ukloniAdministratora(vlasnik.address)).to.be.revertedWith(
        "Administrator ne moze ukloniti vlasnika.",
      );

      expect(await labCoin.owner()).to.equal(vlasnik.address);
    });
  });

  it("K22: vlasnik prenosi vlasnistvo", async function () {
    await expect(labCoin.connect(vlasnik).prenesiVlasnistvo(drugi.address))
      .to.emit(labCoin, "OwnershipTransferred")
      .withArgs(vlasnik.address, drugi.address);

    await labCoin.connect(drugi).dodajAdministratora(administrator.address);
    await expect(labCoin.connect(vlasnik).dodajAdministratora(korisnik.address)).to.be.revertedWith(
      "Samo vlasnik smije dodati administratora.",
    );
  });

  it("K23: korisnik ne smije prenijeti vlasnistvo", async function () {
    await expect(labCoin.connect(korisnik).prenesiVlasnistvo(drugi.address)).to.be.revertedWith(
      "Samo vlasnik smije prenijeti vlasnistvo.",
    );
  });

  it("K24: vlasnistvo se ne moze prenijeti na nultu adresu", async function () {
    await expect(labCoin.connect(vlasnik).prenesiVlasnistvo(ethers.ZeroAddress)).to.be.revertedWith(
      "Novi vlasnik ne moze biti nulta adresa.",
    );
  });
});
