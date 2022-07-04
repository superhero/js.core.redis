2.3.0
Added functionality to delete stream item by id.

2.2.3
set to terminate process on client error, in the future this solution will probably be more optional, but for now I need to rely on a process failure upon this event.

2.0.0
Started working with the npm redis version 4.X.X

1.2.0
Added a new aggregate: "ordered" which is an implementation of redis ordered set.

1.4.0
Changed the aggregate: "ordered" command: "read" to read the full ordered list if no score restriction is defined. This command previously failed by throwing an error.
- The side effect of this change causes a defintion of a max score to provide a full list, limited to the max score.
