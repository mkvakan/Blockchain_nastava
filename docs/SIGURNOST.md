# Sigurnosni pregled: [LabCoin]
| # | Provjera | Rezultat | Napomena |
|---|---|---|---|
| P1 | Za svaku funkciju koja mijenja stanje: tko je smije pozvati? Odgovara
li to matrici ovlasti u SPEC-u? | Problem |  |
| P2 | Postoji li funkcija koja mijenja stanje, a nema nikakvu provjeru
pozivatelja? Je li to namjerno? | U redu |  |
| P3 | Koristi li ugovor igdje tx.origin? | U redu |  |
| P4 | Provjeravaju li se svi ulazi: nulta adresa, 0, najveći iznos, duljina
teksta? | U redu |  |
| P5 | Može li netko zaobići pravilo preko naslijeđene funkcije (npr.
transfer, transferFrom, approve, renounceOwnership)? | Problem |  |
| P6 | Ima li blok unchecked ili verziju Solidityja ispod 0.8? | U redu |  |
| P7 | Ima li petlju preko niza koji raste? | U redu |  |
| P8 | Ima li ugovor tajnu ili osobni podatak u varijabli? | U redu |  |
| P9 | Emitira li svaka promjena ovlasti događaj? | Problem |  |
| P10 | Što se dogodi ako vlasnik izgubi ključ ili pozove renounceOwnership? | Problem |  |


## Nalazi AI pregledavača
| # | Nalaz | Ozbiljnost (AI) | Odluka | Razlog | Test |
|---|---|---|---|---|---|
| N1 | Vlasnik može ugasiti ulogu dok ključ još potpisuje | Ozbiljnost: srednja | Prihvaćen / Odbijen | | S1 / - |
| N2 | Naslijeđeni transfer pomiče najmanje jedinice i kvari provjeru salda | Ozbiljnost: niska | Prihvaćen / Odbijen | | S2 / - |
| N3 | Vlasnik ne može skinuti administratorsku zastavicu sa svoje adrese | Ozbiljnost: niska | Prihvaćen / Odbijen | | S3 / - |
| N4 | Pravila skupljanja ETH-a nemaju kod | Ozbiljnost: visoka | Prihvaćen / Odbijen | | S4 / - |

