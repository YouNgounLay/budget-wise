# Budget-wise - Your account based budget planner application

# For rule section 

Please also adds in a section that allows the user to choose how often the rule should be trigger with 4 options weekly, fortnightly, monthly, annually. There should also be a section that clearly shows the next date that the rule will trigger.


# Tutorial Section

Since the nature of the app can be complicated. I want to create a short tutorial that introduce the user to the power of the budget app. When entering the tutorial mode, the user should have an option to opt out of tutorial mode at any time, just in case they accidentally clicked on it. There should be a tutorial button under a gear icon (setting, please merge this with the dark/light mode toggle and theme toggle, into one setting button). The tutorial should include the following:
1. At start up, let just creates 5 basic dummy accounts, grocery - 100$, rent - 500$, mortgage - 10,000$, Excess Saving - 500$, Emergency Fund - 3000$.
2. The system should teach the user on how to create a new account, let say "medical insurance" with a short description, and select appropriate icon, with blue color. 
3. The tutorial then show the user on where to find the newly created account, and how deposit/withdraw (let say 300 deposit and 100 withdraw) works. 
4. The tutorial then guide the user on how to create a new chain with the following order grocery - rent - mortgage - emergency fund - excess saving. It would also explain the benefit of the chain system. of how it automatically allocate the fund to each respective account under the limit rule for you, instead of you having to adjust them yourself.
5. The system then guide the user to the rule set. It should demonstrates how the user can set up an automatic transaction weekly.
6. The system then guide the user to the tag system, showcasing how tags are created, how they can be assigned and customise.

# Patching

I noticed that whenever I scroll up, the side bar seems to also be moving along the screen blocking the top navbar. and since the top navbar and side perform the same functinoality, we should just only keep the side bar, instead of having both. Replace the nav section on the navbar with a search feature that allows the user to fuzzy search for different accounts, chains, tags, based on which filter is selected (by default account name).


---
**Please follows all the rules in "rulesets" folder"**  
Please also update the import/export system accordingly if needed.