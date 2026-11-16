# AI dnevnik

## T1 — Postavljanje projekta 19.10.2026.
- Cilj termina: Vidjeti kako agent funkcionira i što će napraviti
- Najkorisniji prompt (kopiran u cijelosti):
/plan Napravi mi app sa Fontend, pomoću vue 3 za neku studentsku udrugu. Stavi naziv udruge, i gumb spoji novčanik. Također napravi stranicu o nama.
- Što je AI napravio dobro:
postavio je to-do listu tako da sam vidio što će napraviti i mogao sam promjeniti plan
- Što je AI napravio drugačije nego što sam očekivao: mislio sam da će ga staviti gum spoji novčanik negdje u sredinu, ali to je bila greška sa moje strane kad nisam naveo točno kamo da ga stavi.
- Što sam dodao u AGENTS.md:
- Provjera: Projevu sam napravio tako da sam pregledao što je sve dodao.
- Commit: 8122886cfc2aeba923fb8271c62b2b519d557688

## T2 - Kreiranje MetaMask wallet-a i dorada frontenda 26.10.2026.
- Cilj termina: Napraviti MetaMask wallet i doraditi frontend tako da se spojimo s wallet-om.
- Najkorisniji prompt: "napravi mi da se na svome frontend-u mogu spojiti sa svojim metamask wallet-om, i da mogu slati"
- Što je AI napravio dobro: kada je transakcija prošla, stavio je link za etherscan tako da se može vidjeti transakcija koju smo napravili
- Što je AI napravio drugačije nego što sam očekivao: -------------
- Što sam dodao u AGENT.md: 
- Provjera: Projevu sam napravio tako da sam pregledao što je sve dodao.
- Commit: c4b6f79c085015726ee3ec337b5b7500e823eca7

## T3 -  Specifikacija prije koda 2.11.2026.

Odluke o nalazima recenzije specifikacije. U specifikaciju ulaze samo proturječja i kriteriji koji nedostaju uz već zapisana pravila.

| Nalaz | Odluka (prihvaćeno / odbijeno) | Obrazloženje |
| --- | --- | --- |
| 1. Uklanjanje vlasnika: K19 traži `Samo vlasnik smije ukloniti administratora.`, K21 za administratora koji uklanja vlasnika traži `Administrator ne moze ukloniti vlasnika.`, a K20 za adresu koja nije administrator traži `Adresa nije administrator.` Funkcija „Ukloni administratora“ dopušta poziv samo vlasniku. Matrica ima zasebnu radnju „Ukloniti vlasnika“ koje nema u katalogu funkcija. | prihvaćeno | Isti poziv ne može završiti trima porukama. U specifikaciji ostaje jedna funkcija, uklanjanje administratora. Provjera pozivatelja ide prva: tko nije vlasnik dobiva `Samo vlasnik smije ukloniti administratora.` Ako vlasnik uklanja adresu koja nije administrator, poruka je `Adresa nije administrator.` Ako vlasnik ukloni samoga sebe iz skupa administratora, gubi samo tu ulogu i i dalje smije izdavati. Vlasništvo se tim pozivom ne mijenja. |
| 3. „Prenesi LabCoin“ i odluke o tokenu prijenos daju korisniku, a korisnik je definiran kao svaka adresa osim vlasnika i administratora. Matrica prijenos vlastitog LabCoina dopušta sve tri uloge. K2 administratoru ostavlja 1 LBC na vlastitoj adresi bez pravila za daljnji prijenos. | prihvaćeno | Matrica je konkretnija od definicije uloge. Vlasnik i administrator smiju prenijeti vlastiti saldo pod istim uvjetima kao korisnik: dovoljan saldo, iznos veći od nule, primatelj nije nulta adresa. Ukupna količina se ne mijenja. |
| 5. Rok je „30 puta 24 sata“, cilj se gleda „na isteku“, a povlačenje i isplata rade „nakon roka“. K25 kaže samo „30 dana“. K32 odbija uplatu tek kad je prošlo „više od 30 dana“, pa u sekundi isteka uplata, povrat i isplata nemaju ishod. | prihvaćeno | Rok je `trenutakOtvaranja + 2_592_000` sekundi. U sekundi prije toga uplata od 0,01 ETH prolazi, a povlačenje i isplata padaju zbog prijevremenog poziva. U sekundi roka i poslije nje uplata pada s `Rok je istekao.`, a povlačenje i isplata ovise samo o zbroju. |
| 7. K6 pokriva 9.900 + 100 = 10.000 LBC, K7 pokriva izdavanje kad je količina već 10.000 LBC. Izdavanje koje granicu prijeđe iz sredine, na primjer 9.950 + 100, nema kriterij. | prihvaćeno | Pravilo „ukupna količina ne smije prijeći 10.000 LBC“ već postoji. Dodaje se kriterij: pri ukupnoj količini 9.950 LBC izdavanje 100 LBC pada s `Ukupna kolicina ne smije prijeci 10000 LBC.` i količina ostaje 9.950 LBC, a izdavanje 50 LBC prolazi i količina postaje 10.000 LBC. |
| 12. K35 i K39 imaju jednog uplatitelja. Pravilo „tuđe uplate ne može povući“ nema kriterij, pa povrat cijelog salda jedinom uplatitelju i dalje prolazi K35. | prihvaćeno | Dodaje se kriterij s dva uplatitelja. Nakon roka i zbroja 0,4 ETH prvi povlači svojih 0,2 ETH, zapis drugog ostaje 0,2 ETH, a isplata vlasniku i dalje pada s `Cilj nije dosegnut.` Pri zbroju 0,6 ETH vlasnik prima oba iznosa, a uplatitelj svoje ne može povući. |
| 19. „Povuci svoju uplatu“ prvo šalje ETH pa briše dug. Ugovor-uplatitelj može u istom pozivu ući ponovno i povući iznos iz tuđeg dijela salda. Predloženi kriterij traži da drugi poziv u istom lancu padne s `Uplata je vec povucena.` i da tuđi zapis ostane netaknut. | odbijeno | Ovo je ispod razine T3, specifikacije prije koda. Specifikacija već fiksira ishod: uplatitelj povlači zbroj svojih uplata i tuđu ne može povući. Redoslijed slanja i brisanja duga te zaštita od ponovnog ulaska pripadaju implementaciji ugovora, ne novom poslovnom pravilu. |

Cilj termina: napisati specifikaciju svog tokena i modula koja je dovoljno precizna da AI iz nje može napisati
pametni ugovor bez nagađanja. Specifikaciju ćeš provjeriti uz AI kritičara, a iz nje izvesti sučelje
ugovora koje se kompajlira. Zatim ćeš uz AI napisati svoj prvi pametni ugovor, token, objaviti ga u
Remix VM-u i klikanjem provjeriti tri kriterija iz specifikacije. Modul dolazi na idućoj vježbi, ali su sve
odluke o njemu već donesene. Pregled specifikacije u paru je domaća zadaća do iduće vježbe.

Najkorisniji prompt (kopiran u cijelosti): objasni pitanje (pitanj koje postavljao za ugovor)
Što je AI napravio dobro: sve je napravio kako je zamišljeno
Što je AI napravio drugačije nego što sam očekivao: ----------
Što sam dodao u AGENTS.md: ---------
Provjera: pregled koda
Commit:

## T3 - Hardhat, testovi i lokalna mreža
Cilj termina: Na prošloj vježbi napisao si token i ručno ga provjerio u Remixu. Ručna provjera ne može se
ponoviti, ne ulazi u Git i lako je zaboraviti jedan slučaj. Danas token seliš u Hardhat, alat u
kojem se pametni ugovori razvijaju profesionalno: kod se kompajlira, testira automatski i
objavljuje jednom naredbom.

Najkorisniji prompt(kopiran u cijelosti):
Što je AI napravio dobro:
Što je AI napravio drugačije nego što sam očekivao:
Što sam dodao u Agents.md:
Provjera:
Commit:

## T4 - 
cilj Termina: 
Najkorisniji prompt(kopiran u cijelosti):
Što je AI napravio dobro:
Što je AI napravio drugačije nego što sam očekivao:
Što sam dodao u Agents.md:
Provjera:
Commit: