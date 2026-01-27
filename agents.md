# Budget-wise - Your account based budget planner application

This is a budget planner application that allows the user to CRUD various account representing different entity (car, grocery, etc...), tailoring to their needs and circumstances. Every account that the user created should have a unique ID, the name of the account, a short description of what the accound used for, and the currend amount of money is currently in that account. 

Outside of using account, the system also supports a virtual chain deposit/withdrawal system. In which the user can create a chain, comprised of various accounts, in a particular order. An example of a chain could be ( Grocery -> Car -> Excess Saving ). Every time, the user makes a deposit to the chain, the system could try to deposit the amount from left to right, only moving along the chain when a certain limit set by the user it met (default: 2000). The user should also be able to add more accounts to the chain, considering that they haven't existed in the chain already (no duplicate). The user also has the option to rearrange the chain as it goes. Many chains can be created, and one account can be associated with many chains.

## Customisation option

1. When displaying account, the user should be able to select from a list of custom ICONs that we created, as well as any colorscheme. 
2. When displaying the chain of accounts should be able see clearly the order of chains. If there are too many accounts in the chain, any overflow just move to the next row.



---
**Please follows all the rules in "rulesets" folder"** 
