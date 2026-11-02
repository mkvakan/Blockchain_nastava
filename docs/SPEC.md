# Specifikacija: ChainLab

## Opis

ChainLab je aplikacija studentske udruge s Vue sučeljem i spojem na MetaMask. Na Sepoliji korisnik drži i šalje ETH te sudjeluje u zajednici kroz token LabCoin (LBC) i jedno skupljanje ETH-a. Pravila u ovom dokumentu odnose se na ugovor. Sučelje samo pokreće te funkcije i ne uvodi dodatna pravila.

## Korisnici i uloge

- **Vlasnik:** adresa koja ugovor drži od objave. Izdaje LabCoin, upravlja administratorima, prenosi vlasništvo, otvara skupljanje i, kad su uvjeti ispunjeni, isplaćuje skupljeni ETH na svoj novčanik.
- **Administrator:** adresa koju je vlasnik dodao. Smije samo izdavati LabCoin, uz iste granice kao vlasnik. Ne upravlja administratorima, vlasništvom ni ETH-om.
- **Korisnik:** svaka druga adresa s novčanikom. Smije primiti i poslati vlastiti LabCoin, uplatiti ETH dok skupljanje traje i, ako akcija nije uspjela, nakon roka povući svoju uplatu.

Poseban popis članova ne postoji. «Član» u odlukama znači korisnika koji drži LabCoin ili šalje ETH.

## Odluke o tokenu

- Naziv je LabCoin, oznaka je LBC, decimala ima 6. Jedan LBC u pravilima ispod znači jedan cijeli token, ne najmanju jedinicu.
- Izdavati smiju vlasnik i administrator. Jedno izdavanje je najviše 100 LBC i veće od nule.
- Gornja granica ukupne količine je 10.000 LBC. Izdavanje i nagrada za uplatu koja bi tu granicu prešla odbijaju se.
- Korisnik smije poslati vlastiti LabCoin drugoj adresi. `transferFrom` nije dopušten, pa odobrenje tuđeg salda ne može pokrenuti prijenos.
- LabCoin se ne može spaliti niti potrošiti. Jednom izdan token ostaje u opticaju dok ga netko drži.
- Samo vlasnik dodaje i uklanja administratore. Administrator ne može ukloniti vlasnika.
- Dok vlasnik ima ključ, sam prenosi ulogu na novi novčanik. Ako je ključ već izgubljen, ulogu nitko ne preuzima. Postojeći administratori i dalje smiju izdavati do 10.000 LBC, ali popis administratora više se ne može mijenjati.

## Odluke o modulu

Modul je skupljanje sredstava u ETH-u, jedna akcija.

- Vlasnik jednom otvara skupljanje. Rok je 30 dana od tog trenutka, računato kao 30 puta 24 sata.
- Cilj je 0,5 ETH. Cilj je dosegnut kad je zbroj svih uplata na isteku roka najmanje 0,5 ETH. Uplate iznad cilja prije isteka roka i dalje su dopuštene.
- Najmanja uplata je 0,01 ETH. Svaka prihvaćena uplata, bez obzira na iznos iznad minimuma, dodijeli uplatitelju točno 1 LBC. Nagradu pokreće sama uplata. Ona ulazi u granicu od 10.000 LBC, ali ne prolazi kroz ručno izdavanje i ne vrijedi za nju ograničenje od 100 LBC po izdavanju.
- Prije isteka roka nitko ne povlači ETH: ni uplatitelj ni vlasnik, čak i ako je 0,5 ETH već skupljeno.
- Ako rok istekne ispod 0,5 ETH, akcija ne uspijeva. Udruga ne dobiva ETH. Svaki uplatitelj povlači zbroj svojih uplata. Tuđe uplate ne može povući.
- Ako je na isteku roka skupljeno najmanje 0,5 ETH, samo vlasnik isplaćuje cijeli saldo ugovora na adresu trenutnog vlasnika. Uplatitelj tada svoj ETH ne dobiva natrag. Administrator isplatu ne može pokrenuti.

## Funkcije

### Izdaj LabCoin

- Tko: vlasnik ili administrator.
- Ulaz: adresa primatelja, količina u LBC.
- Radi: povećava saldo primatelja i ukupnu količinu.
- Pada s porukom:
  - `Samo vlasnik ili administrator smije izdati.`
  - `Iznos izdavanja mora biti veci od nule.`
  - `Jedno izdavanje smije biti najvise 100 LBC.`
  - `Ukupna kolicina ne smije prijeci 10000 LBC.`
  - `Primatelj ne moze biti nulta adresa.`

### Prenesi LabCoin

- Tko: korisnik koji drži dovoljan saldo.
- Ulaz: adresa primatelja, količina u LBC.
- Radi: smanjuje saldo pošiljatelja i povećava saldo primatelja. Ukupna količina se ne mijenja.
- Pada s porukom:
  - `Saldo nije dovoljan.`
  - `Primatelj ne moze biti nulta adresa.`
  - `Iznos prijenosa mora biti veci od nule.`

### transferFrom

- Tko: nitko.
- Radi: ne miče tokene.
- Pada s porukom: `transferFrom nije dopusten.`

### Spali LabCoin

- Tko: nitko.
- Radi: ne smanjuje saldo ni ukupnu količinu.
- Pada s porukom: `Spaljivanje nije dopusteno.`

### Dodaj administratora

- Tko: vlasnik.
- Ulaz: adresa novog administratora.
- Radi: ta adresa smije izdavati LabCoin.
- Pada s porukom:
  - `Samo vlasnik smije dodati administratora.`
  - `Administrator ne moze biti nulta adresa.`
  - `Adresa je vec administrator.`

### Ukloni administratora

- Tko: vlasnik.
- Ulaz: adresa administratora.
- Radi: ta adresa više ne smije izdavati LabCoin. Vlasnik se ovime ne uklanja.
- Pada s porukom:
  - `Samo vlasnik smije ukloniti administratora.`
  - `Adresa nije administrator.`
  - `Administrator ne moze ukloniti vlasnika.`

### Prenesi vlasništvo

- Tko: trenutni vlasnik.
- Ulaz: adresa novog vlasnika.
- Radi: nova adresa postaje vlasnik. Stara gubi ovlasti vlasnika.
- Pada s porukom:
  - `Samo vlasnik smije prenijeti vlasnistvo.`
  - `Novi vlasnik ne moze biti nulta adresa.`

### Otvori skupljanje

- Tko: vlasnik.
- Ulaz: nema.
- Radi: bilježi trenutak otvaranja i rok 30 dana kasnije. Skupljanje se otvara jednom.
- Pada s porukom:
  - `Samo vlasnik smije otvoriti skupljanje.`
  - `Skupljanje je vec otvoreno.`

### Uplati ETH

- Tko: bilo koja adresa.
- Ulaz: iznos ETH-a uz poziv.
- Radi: pamti uplatu na adresi pošiljatelja, povećava zbroj skupljanja i dodjeljuje pošiljatelju 1 LBC.
- Pada s porukom:
  - `Skupljanje nije otvoreno.`
  - `Rok je istekao.`
  - `Uplata je ispod minimuma od 0.01 ETH.`
  - `Ukupna kolicina ne smije prijeci 10000 LBC.`

### Povuci svoju uplatu

- Tko: uplatitelj.
- Ulaz: nema.
- Radi: nakon roka, i samo ako je zbroj manji od 0,5 ETH, šalje uplatitelju zbroj njegovih uplata i briše taj dug ugovora prema njemu.
- Pada s porukom:
  - `Povlacenje prije roka nije dopusteno.`
  - `Cilj je dosegnut, uplatitelj ne moze povuci ETH.`
  - `Nema uplate za povlacenje.`
  - `Uplata je vec povucena.`

### Isplati skupljeni ETH

- Tko: vlasnik.
- Ulaz: nema.
- Radi: nakon roka, i samo ako je zbroj najmanje 0,5 ETH, šalje cijeli ETH saldo ugovora na adresu trenutnog vlasnika.
- Pada s porukom:
  - `Samo vlasnik smije isplatiti ETH.`
  - `Isplata prije roka nije dopustena.`
  - `Cilj nije dosegnut.`
  - `ETH je vec isplacen.`

## Matrica ovlasti

| Radnja | Vlasnik | Administrator | Korisnik |
| --- | --- | --- | --- |
| Izdati LabCoin, do 100 LBC, unutar 10.000 | da | da | ne |
| Prenijeti vlastiti LabCoin | da | da | da |
| transferFrom ili spaljivanje | ne | ne | ne |
| Dodati ili ukloniti administratora | da | ne | ne |
| Ukloniti vlasnika | ne | ne | ne |
| Prenijeti vlasništvo | da | ne | ne |
| Otvoriti skupljanje | da | ne | ne |
| Uplatiti ETH i dobiti 1 LBC | da | da | da |
| Povući svoju uplatu prije roka | ne | ne | ne |
| Povući svoju uplatu nakon roka ako cilj nije dosegnut | da, samo svoju | da, samo svoju | da, samo svoju |
| Isplatiti cijeli ETH nakon roka ako je cilj dosegnut | da | ne | ne |

## Model podataka na lancu

- Naziv, oznaka i broj decimala tokena.
- Saldo LabCoina po adresi i ukupna izdana količina.
- Adresa vlasnika i skup adresa administratora.
- Je li skupljanje otvoreno, trenutak otvaranja i rok.
- Uplata ETH-a po adresi, zbroj svih uplata, je li uplata te adrese već povučena i je li vlasnik već isplatio saldo.

## Što se NE sprema na blockchain

- Privatni ključevi, lozinke i seed fraze.
- Imena, prezimena i drugi podaci o studentima.
- Stanje Vue sučelja i podatak je li MetaMask spojen u pregledniku.
- Razlozi poslovnih odluka, uključujući obrazloženje granice od 10.000 LBC.

## Kriteriji prihvaćanja

K1. **Zadano** vlasnik je postavljen i ukupna količina je 0 LBC. **Kada** vlasnik izda 100 LBC na adresu korisnika. **Tada** saldo korisnika je 100 LBC, a ukupna količina je 100 LBC.

K2. **Zadano** adresa je administrator i ukupna količina je 0 LBC. **Kada** administrator izda 1 LBC na svoju adresu. **Tada** saldo te adrese je 1 LBC.

K3. **Zadano** pozivatelj nije vlasnik ni administrator. **Kada** pozivatelj izda 1 LBC. **Tada** poziv je odbijen s porukom `Samo vlasnik ili administrator smije izdati.`

K4. **Zadano** vlasnik je postavljen i ukupna količina je 0 LBC. **Kada** vlasnik izda 0 LBC. **Tada** poziv je odbijen s porukom `Iznos izdavanja mora biti veci od nule.`

K5. **Zadano** vlasnik je postavljen i ukupna količina je 0 LBC. **Kada** vlasnik izda 100,000001 LBC. **Tada** poziv je odbijen s porukom `Jedno izdavanje smije biti najvise 100 LBC.`

K6. **Zadano** ukupna količina je 9.900 LBC. **Kada** vlasnik izda 100 LBC. **Tada** ukupna količina je 10.000 LBC.

K7. **Zadano** ukupna količina je 10.000 LBC. **Kada** administrator izda 1 LBC. **Tada** poziv je odbijen s porukom `Ukupna kolicina ne smije prijeci 10000 LBC.`

K8. **Zadano** vlasnik je postavljen. **Kada** vlasnik izda 1 LBC na nultu adresu. **Tada** poziv je odbijen s porukom `Primatelj ne moze biti nulta adresa.`

K9. **Zadano** korisnik drži 10 LBC. **Kada** korisnik pošalje 4 LBC drugom korisniku. **Tada** pošiljatelj drži 6 LBC, primatelj drži 4 LBC, a ukupna količina je nepromijenjena.

K10. **Zadano** korisnik drži 3 LBC. **Kada** korisnik pošalje 4 LBC. **Tada** poziv je odbijen s porukom `Saldo nije dovoljan.`

K11. **Zadano** korisnik drži 1 LBC. **Kada** korisnik pošalje 1 LBC na nultu adresu. **Tada** poziv je odbijen s porukom `Primatelj ne moze biti nulta adresa.`

K12. **Zadano** korisnik drži 5 LBC. **Kada** bilo koja adresa pozove `transferFrom` nad tim saldom. **Tada** poziv je odbijen s porukom `transferFrom nije dopusten.` i saldo ostaje 5 LBC.

K13. **Zadano** korisnik drži 5 LBC. **Kada** korisnik, vlasnik ili administrator pokuša spaliti tokene. **Tada** poziv je odbijen s porukom `Spaljivanje nije dopusteno.` i ukupna količina se ne smanjuje.

K14. **Zadano** vlasnik je postavljen, a adresa A nije administrator. **Kada** vlasnik doda A. **Tada** A smije izdati LabCoin.

K15. **Zadano** pozivatelj nije vlasnik. **Kada** pozivatelj doda administratora. **Tada** poziv je odbijen s porukom `Samo vlasnik smije dodati administratora.`

K16. **Zadano** vlasnik je postavljen. **Kada** vlasnik doda nultu adresu kao administratora. **Tada** poziv je odbijen s porukom `Administrator ne moze biti nulta adresa.`

K17. **Zadano** adresa A je već administrator. **Kada** vlasnik ponovno doda A. **Tada** poziv je odbijen s porukom `Adresa je vec administrator.`

K18. **Zadano** adresa A je administrator. **Kada** vlasnik ukloni A. **Tada** A više ne smije izdati LabCoin.

K19. **Zadano** pozivatelj nije vlasnik. **Kada** pozivatelj ukloni administratora. **Tada** poziv je odbijen s porukom `Samo vlasnik smije ukloniti administratora.`

K20. **Zadano** adresa A nije administrator. **Kada** vlasnik ukloni A. **Tada** poziv je odbijen s porukom `Adresa nije administrator.`

K21. **Zadano** administrator je postavljen i vlasnik je poznata adresa. **Kada** administrator pokuša ukloniti vlasnika. **Tada** poziv je odbijen s porukom `Administrator ne moze ukloniti vlasnika.` i vlasnik ostaje isti.

K22. **Zadano** trenutni vlasnik ima pristup svom novčaniku. **Kada** prenese vlasništvo na novu adresu. **Tada** nova adresa smije dodati administratora, a stara ne smije.

K23. **Zadano** pozivatelj nije vlasnik. **Kada** pozivatelj prenese vlasništvo. **Tada** poziv je odbijen s porukom `Samo vlasnik smije prenijeti vlasnistvo.`

K24. **Zadano** vlasnik je postavljen. **Kada** vlasnik prenese vlasništvo na nultu adresu. **Tada** poziv je odbijen s porukom `Novi vlasnik ne moze biti nulta adresa.`

K25. **Zadano** skupljanje nije otvoreno. **Kada** vlasnik otvori skupljanje. **Tada** rok je 30 dana nakon tog poziva.

K26. **Zadano** pozivatelj nije vlasnik. **Kada** pozivatelj otvori skupljanje. **Tada** poziv je odbijen s porukom `Samo vlasnik smije otvoriti skupljanje.`

K27. **Zadano** skupljanje je već otvoreno. **Kada** vlasnik pokuša otvoriti skupljanje ponovno. **Tada** poziv je odbijen s porukom `Skupljanje je vec otvoreno.`

K28. **Zadano** skupljanje je otvoreno i rok nije istekao, a ukupna količina LBC je ispod 10.000. **Kada** korisnik uplati točno 0,01 ETH. **Tada** njegova zabilježena uplata je 0,01 ETH, zbroj skupljanja raste za 0,01 ETH, a saldo LBC mu raste za 1.

K29. **Zadano** isti uvjeti kao u K28. **Kada** korisnik u drugom pozivu uplati 0,2 ETH. **Tada** njegova zabilježena uplata je 0,21 ETH, a saldo LBC mu je veći za još točno 1, ne za iznos razmjeran ETH-u.

K30. **Zadano** skupljanje je otvoreno i rok nije istekao. **Kada** korisnik uplati manje od 0,01 ETH. **Tada** poziv je odbijen s porukom `Uplata je ispod minimuma od 0.01 ETH.` i LBC se ne dodjeljuje.

K31. **Zadano** skupljanje nije otvoreno. **Kada** korisnik uplati 0,01 ETH. **Tada** poziv je odbijen s porukom `Skupljanje nije otvoreno.`

K32. **Zadano** skupljanje je otvoreno i prošlo je više od 30 dana. **Kada** korisnik uplati 0,01 ETH. **Tada** poziv je odbijen s porukom `Rok je istekao.`

K33. **Zadano** skupljanje je otvoreno, rok nije istekao, a do granice od 10.000 LBC nedostaje manje od 1 LBC. **Kada** korisnik uplati 0,01 ETH. **Tada** poziv je odbijen s porukom `Ukupna kolicina ne smije prijeci 10000 LBC.` i ETH ostaje uplatitelju.

K34. **Zadano** korisnik ima zabilježenu uplatu, a rok nije istekao. **Kada** korisnik povuče uplatu. **Tada** poziv je odbijen s porukom `Povlacenje prije roka nije dopusteno.`

K35. **Zadano** rok je istekao, zbroj uplata je manji od 0,5 ETH, a korisnik je uplatio 0,21 ETH. **Kada** korisnik povuče uplatu. **Tada** korisnik prima natrag 0,21 ETH.

K36. **Zadano** korisnik je već povukao svoju uplatu nakon neuspjeha akcije. **Kada** korisnik povuče uplatu ponovno. **Tada** poziv je odbijen s porukom `Uplata je vec povucena.`

K37. **Zadano** rok je istekao, zbroj je manji od 0,5 ETH, a adresa nema uplatu. **Kada** ta adresa povuče uplatu. **Tada** poziv je odbijen s porukom `Nema uplate za povlacenje.`

K38. **Zadano** rok je istekao i zbroj je manji od 0,5 ETH. **Kada** vlasnik isplati skupljeni ETH. **Tada** poziv je odbijen s porukom `Cilj nije dosegnut.`

K39. **Zadano** rok je istekao i zbroj uplata je najmanje 0,5 ETH. **Kada** vlasnik isplati skupljeni ETH. **Tada** cijeli ETH saldo ugovora stiže na adresu vlasnika.

K40. **Zadano** rok je istekao i zbroj je najmanje 0,5 ETH. **Kada** uplatitelj povuče svoju uplatu. **Tada** poziv je odbijen s porukom `Cilj je dosegnut, uplatitelj ne moze povuci ETH.`

K41. **Zadano** rok nije istekao, a zbroj je već najmanje 0,5 ETH. **Kada** vlasnik isplati skupljeni ETH. **Tada** poziv je odbijen s porukom `Isplata prije roka nije dopustena.`

K42. **Zadano** rok je istekao, zbroj je najmanje 0,5 ETH, a pozivatelj je administrator koji nije vlasnik. **Kada** administrator isplati skupljeni ETH. **Tada** poziv je odbijen s porukom `Samo vlasnik smije isplatiti ETH.`

K43. **Zadano** vlasnik je već isplatio ETH nakon uspjeha akcije. **Kada** vlasnik isplati ponovno. **Tada** poziv je odbijen s porukom `ETH je vec isplacen.`

## Izvan opsega

- Odobrenje da netko drugi troši LabCoin, jer `transferFrom` nije dopušten.
- Spaljivanje i svaki drugi način smanjenja ukupne količine.
- Oporavak vlasništva nakon gubitka ključa.
- Povlačenje ETH-a prije roka i isplata udruzi prije roka.
- Isplata udruzi ako cilj nije dosegnut.
- Ovlast administratora nad ETH-om, vlasništvom ili popisom administratora.
- Registar članova, glasanje, zamjena LBC za ETH i druga skupljanja osim ove jedne akcije.

## Otvorena pitanja

Nema. Količine koje nisu bile zadane u razgovoru, a trebale su konkretan broj, uzete su ovako: ukupno najviše 10.000 LBC, cilj 0,5 ETH, rok 30 dana, minimalna uplata 0,01 ETH, nagrada 1 LBC po prihvaćenoj uplati.

## Sljedivost

Popunjava se u Dijelu 4.
