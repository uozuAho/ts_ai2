# TSP todo

1. Create a graph G

2. Compute an MST of G

3. Compute, for each city A ∈ G, the degree d(A) of A in MST

4. Let S = {A ∈ G : d(A) is odd}

5. Compute a minimum weight perfect matching M on the vertices in S (using the dis­tances d(·,·) as weights).
    - Use hungarian alg for this (O^4): https://www.topcoder.com/community
      /data-science/data-science-tutorials/assignment-problem-and-hungarian-
      algorithm/
      NOTE: this assumes we know which vertices are 'workers' and 'jobs'.
      In our case, we don't. Let's assume it can be done anyway, by assuming
      any node can be either a worker or a job.
    - Hungarian algorithm steps:
        + for each 'worker' vertex, find the minimum weight edge, and
          subtract this value from all other edges
        + do step 0a for 'job' vertices
        + find a maximum matching using 0-weight edges
            * up to here. use max flow to get max matching on 0-weight edges
            * ARGH need to separate nodes into sets X, Y and find a matching of them (assume bipartite)
        + if perfect, then we're done. Otherwise find the minimum vertex
          cover V (for the subgraph with 0-weight edges only), the best way
          to do this is to use [Köning’s graph theorem]()

6. Compute a new set of edges E � = M ∪ MST . Note that the resulting graph G � = (V, E � )
is not necessarily a simple graph since it might contain multiple edges.

7. Take the subgraph G � = (V, E � ), and compute an Euler circuit on it.

8. Use the Euler circuit to give an induced ordering of the vertices (i.e., the order in which
the vertices appear for the first time), and do a TSP tour on this order.