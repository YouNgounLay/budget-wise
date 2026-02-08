# Budget-wise - Your account based budget planner application

## Feature - Custom Rules For Each Account

Add in an additional section that allows the user to add in special limited ruleset to account. This rulesets include:
- By setting the day of the week: DOW as the baseline, the user can set X amount to an account. Every week after the DOW has passed, and the amount of money in the account exceed the X amount, the system would then automatically allocate the exceeding fund to a list of account/s based on some % assigned by the user. 
- It is important to note that if a ruleset has been allocated to from account A to B. There should not be another ruleset for the same two accounts.

## Feature - Modify Chained Account

Right now, the chained deposit system allows the user to deposit X amount of money to the chain. The system then deposit the money from left to right like a linked list, moving to the next account after a certain limit has been reached. There should be a toggle option that allows the user to instead, the user could assign a percentage to all account in the chain, and when the user deposit money into the chain, the system would automatically allocate the money into each respective account based on the %. 

---
**Please follows all the rules in "rulesets" folder"**  