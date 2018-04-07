# Iterative calculation

In the case of iterative calculation, such as in a spreadsheet that
contains formulas that form circular references, in what order do we
calculate cell values to minimise the total number of calculations?

If no cycles exist, the order is trivial - topological order. When cycles
exist, no topological order exists.


# Topological sort with cycles

Can't do a topological sort with cycles, so the idea is:

- turn all cycles into 'super' nodes, keeping track of original nodes within cycle
- topological sort on resultant DAG
- resolve individual cycles in topological order

# Cycle resolution

A traversal (?) of a directed graph with cycles will never terminate,
unless some cycle termination criteria is specified, eg. each node
in the cycle is visited 3 times.


# todo:
- create a calculator that does better than naive even when dependency
  cycles exist
