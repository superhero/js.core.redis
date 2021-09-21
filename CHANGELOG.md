1.2.0
Added a new aggregate: "ordered" which is an implementation of redis ordered set.

1.4.0
Changed the aggregate: "ordered" command: "read" to read the full ordered list if no score restriction is defined. This command previously failed by throwing an error.
- The side effect of this change causes a defintion of a max score to provide a full list, limited to the max score.
