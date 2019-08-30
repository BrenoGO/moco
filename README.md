
In Process of development...

# My Money Controller
Thats a app to control all your expenses in the easiest way.

## How does it work
inicialyse with configuration:
+ basic personal data
+ accounts plan
+ defaults to use like deafult account, default payment plan
## Developing Plan
### Front End Web
Using React
### Front End Mobile
Using React Native.
Top Tab Navigation
when opens the app, goes to a default operation that the users chose
check connectivity,
  in async way, if connected, see if there is some pending post request to make
after send the operations, test if connected, is so, send to db and store locally.
sets some time to store locally, like 2 months.
from time to time update the local storage and erase the old registers.
Gotta have a local storage variable with a date and test if have to update to erase some data. maybe it could be after a year..
in the test of authentification do the test of updating..

### Back End
Node.js
+ configuration
+ login (JWT)
### DataBase
mongo (starting with mongo and analyse if relational would be better)
+ users
+ accounts
+ registers
+ bills

