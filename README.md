# lrnr_assignment
Recommender system to analyse our next predicate (vertex) in DAG.

How to use it?
A file named "Report & Manual.pdf" is included to guide through steps on how to use it.In the report I forgot to mention, PLEASE REFRESH THE PAGE WHEN YOU WANT TO REUSE THE RECOMMENDER SYSTEM (Sorry, for the bug.)

How good is this?
Truly speaking, the performance has not been tested on any dataset. Only analysis of how the parameters (weights in case of SGD, probabilities in case of NB and growth of trees) are manually analysed. It seems to pick up my interests in predicates really well.

Like when you start preferring travelling in depth in the graph, it will soon adapt to your taste and recommend deeper predicates, and also it cuts this process of going in depth when it feels you have travelled to much depth and you generally do not prefer to go beyond this depth.

Are there bugs?
Yes, this project was done in very short time. All codes are original work by me and without using any libraries. There are bugs related to stitching different parts of project together. But this bugs do not hamper the performance of recommender system as machine learning algorithms coded are bug-free to the best of my knowledge.

Why SGD, NB and Random Forest?
Because, these are the algorithms which work best in online mode with less-time complexity as compared to ANN.

Are details of features shared?
No, but will be shared if you ask so.

Can this be made better?
Oh hell yeah! This is just to start the job running! There are better ideas that can be implemented well in online mode.Like I haven't made any feature which takes into account the adversary of among the predicates present in the set of possible next predicates.

Did I like this assignment?
Yeah really, it kept me involved for 2 days. I would like to do similar and far too much better work.bnm 
