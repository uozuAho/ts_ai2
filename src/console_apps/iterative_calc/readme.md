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

# Implementations

- cycle_calc got most of the way there, but sometimes has errors ordering cycles
- scc_calc isn't quite finished, I got bored, but the idea is mostly there. Same
  idea as cycle_calc, but this time I knew about 'strongly connected components' (SCC).
  A graph of SCCs is constructed from the input graph, and a topological order of the
  new graph is established. Orders of nodes within each SCC is determined by incrementally
  removing edges from cycles until no cycles exist, then finding a topological order.
  I don't think I proved that this would preserve the order of the nodes within the SCC,
  but it sounds reasonable :P
