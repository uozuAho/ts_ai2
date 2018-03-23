# TSP todo

1. Create a graph G

2. Compute an MST of G

3. Compute, for each city A ∈ G, the degree d(A) of A in MST

4. Let S = {A ∈ G : d(A) is odd}

5. Compute a minimum weight perfect matching M on the vertices in S (using the dis­tances d(·,·) as weights).

6. Compute a new set of edges E � = M ∪ MST . Note that the resulting graph G � = (V, E � )
is not necessarily a simple graph since it might contain multiple edges.

7. Take the subgraph G � = (V, E � ), and compute an Euler circuit on it.

8. Use the Euler circuit to give an induced ordering of the vertices (i.e., the order in which
the vertices appear for the first time), and do a TSP tour on this order.