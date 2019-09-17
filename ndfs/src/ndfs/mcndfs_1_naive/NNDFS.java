package ndfs.mcndfs_1_naive;


import java.io.File;
import java.io.FileNotFoundException;
import java.util.Stack;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import graph.*;

import ndfs.NDFS;

/**
 * Implements the {@link ndfs.NDFS} interface, mostly delegating the work to a
 * worker class.
 */
public class NNDFS implements NDFS {

    private final Worker worker;

    // map of red states shared between threads
    public ConcurrentHashMap<graph.State, Boolean> red_states = new ConcurrentHashMap<>();
    // number of threads that called dfsRed() on the state; also shared
    public ConcurrentHashMap<graph.State, AtomicInteger> thread_count = new ConcurrentHashMap<>();

    /**
     * Constructs an NDFS object using the specified Promela file.
     *
     * @param promelaFile the Promela file.
     * @throws FileNotFoundException is thrown in case the file could not be read.
     */
    public NNDFS(File promelaFile, int num_worker) throws FileNotFoundException {

        /**init hashmaps with default values by iterating over the graph with a stack */
        Graph myGraph = GraphFactory.createGraph(promelaFile);
        State s = myGraph.getInitialState();
        Stack<State> stack = new Stack<State>();
        stack.push(s);
        while (!stack.empty())
        {
            State current = stack.pop();
            red_states.put(current, false);
            thread_count.put(current, new AtomicInteger(0));
            List<graph.State> next_states = myGraph.post(current);
            for (State next : next_states)
            {
                stack.push(next);
            }
        }

        this.worker = new Worker(promelaFile, red_states, thread_count);
    }

    @Override
    public boolean ndfs() {
        worker.run();
        return worker.getResult();
    }
}
