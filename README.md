#My Money Controller
Thats a app to control all your expenses in the easiest way.

##How does it work
inicialyse with configuration: 
+ basic personal data
+ accounts plan
+ defaults to use like deafult account, default payment plan
##Developing Plan 
###Front End Web
Using React
###Front End Mobile
Using React Native
Top Tab Navigation
when opens the app, goes to a default operation that the users chose
check connectivity, 
  in async way, if connected, see if there is some pending post request to make
after send the operations, test if connected, is so, send to db and store locally.
sets some time to store locally, like 2 months.
from time to time update the local storage and erase the old registers.
have a local storage variable with a date and test if have to update to erase some storage. maybe it could be after a year..
in the test of authentification do the test of updating..

Operations 
  1st option: revenue, cost, receive, pay
  2nd option: a vista, prazo 1x, complex (prazo 2x, 2 costs)  
  Revenue:
    Select
      A vista
      A Prazo 1x
      A prazo more
    If Vista: select account
    If Prazo: select type of payment. 
      if more than 1x, choose parcs, dates and values
    Select 
      Income type 1
      Income type 2
      etc..
    if typeX has subtTime, select with subtype
    if subtypeX has subSubtType, select with subSubType
    Description
    Value
      
  Cost
  Receive
  Pay

Extracts (after clicking extracts, get all from db. if changes date, gets all again. Then work just in front)
  Accounts 
  costs
  incomes
Settings


###Back End
Node.js

###DataBase
mongo?!
starts with mongo and analyse if relational would be better
+ login (JWT)
+ configuration
+ accounts
{
  1(clientID): {
    CashAccounts: {
      BB: {

      },
      CEF Cris: {

      },
      wallet: {

      }
    },
    toReceve: {

    },
    toPay: {

    },
    expenses: {
      Diversão: [
        Viagens,
        Cerveja
      ]
    },
    revenues: {

    },
}

Gasto ou Recebimento
Tipo pagamento - a vista ou a prazo
  se a vista, qual conta
  se for a prazo vai direto pro a receber ou a pagar
Tipo do gasto ou do recebimento
  Subtipo do gasto ou recebimento (se existir)
    SubSubtipo do do gasto ou recebimento, se existir
Descrição
Valor

Exemplo:
Gasto
A vista
  BB
Diversão
  viagem
Rio Pomba
R$300,00


Sera q compensa ter apenas a estrutura para buscar os tipos de contas, e outro objeto com as operações?! provavelmente sim...


