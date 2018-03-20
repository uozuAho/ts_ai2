# TSP todo

1. Create a graph G

2. Compute an MST T of G

3. Compute, for each city A ∈ G, the degree d(A) of A in T

4. Let S = {A ∈ G : d(A) is odd}

5. Compute a minimum weight perfect matching M on the vertices in S (using the dis­
tances d(·, · ) as weights).
    a. Use hungarian alg for this (O^4): https://www.topcoder.com/community
       /data-science/data-science-tutorials/assignment-problem-and-hungarian-
       algorithm/
        NOTE: this assumes we know which vertices are 'workers' and 'jobs'.
        In our case, we don't. Let's assume it can be done anyway, by assuming
        any node can be either a worker or a job.
        step 0a for each 'worker' vertex, find the minimum weight edge, and
                subtract this value from all other edges. I think this should
                ensure that there is at least one 0-weight edge between all
                vertices.
             0b do step 0a for 'job' vertices
        step 1a find a maximum matching using on 0-weight edges.
            ~~TODO: up to here. Need to implement max flow. Use ford-fulkerson:~~
                        https://algs4.cs.princeton.edu/code/edu/princeton/cs/algs4/FordFulkerson.java.html
            ~~TODO: add ability to get edges from MaxFlow~~
            TODO: up to here. use max flow to get max matching on 0-weight edges
             1b if perfect, then we're done. Otherwise find the minimum vertex
             cover V (for the subgraph with 0-weight edges only), the best way
             to do this is to use [Köning’s graph theorem]()

6. Compute a new set of edges E � = M ∪ T . Note that the resulting graph G � = (V, E � )
is not necessarily a simple graph since it might contain multiple edges.

7. Take the subgraph G � = (V, E � ), and compute an Euler circuit on it.

8. Use the Euler circuit to give an induced ordering of the vertices (i.e., the order in which
the vertices appear for the first time), and do a TSP tour on this order.