package ndfs.mcndfs_1_naive;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import graph.Graph;
import graph.GraphFactory;
import graph.State;

/**
 * This is a straightforward implementation of Figure 1 of
 * <a href="http://www.cs.vu.nl/~tcs/cm/ndfs/laarman.pdf"> "the Laarman
 * paper"</a>.
 */
public class Worker extends Thread{

    private final Graph graph;
    private final Colors colors = new Colors();
    private boolean result = false;

    // map of red states shared between threads
    public ConcurrentHashMap<graph.State, Boolean> red_states;

    //number of threads that called dfsRed() on the state; also shared
    public ConcurrentHashMap<graph.State, AtomicInteger> thread_count;

    // Throwing an exception is a convenient way to cut off the search in case a
    // cycle is found.
    private static class CycleFoundException extends Exception {
        private static final long serialVersionUID = 1L;
    }

    /**
     * Constructs a Worker object using the specified Promela file.
     *
     * @param promelaFile the Promela file.
     * @throws FileNotFoundException is thrown in case the file could not be read.
     */
    public Worker(File promelaFile, ConcurrentHashMap red_states, ConcurrentHashMap thread_count) throws FileNotFoundException {

        this.graph = GraphFactory.createGraph(promelaFile);
        this.red_states = red_states;
        this.thread_count = thread_count;
    }

    private void dfsRed(graph.State s) throws CycleFoundException {

        colors.setPink(s,true);
        for (graph.State t : graph.post(s)) {
            if (colors.hasColor(t, Color.CYAN)) {
                throw new CycleFoundException();
            } else if (!colors.isPink(s) && !red_states.get(s)) { // if state isnt red or pink
                
                dfsRed(t);
            }
        }

        if (s.isAccepting()){
            thread_count.get(s).decrementAndGet();
            while (thread_count.get(s).get() > 0 ){} // wait until value is 0 again before continuing

        }
        red_states.put(s, true);
        colors.setPink(s,false);
    }

    private void dfsBlue(graph.State s) throws CycleFoundException {

        colors.color(s, Color.CYAN);
        for (graph.State t : graph.post(s)) {
            if (colors.hasColor(t, Color.WHITE) && !red_states.get(t)) { // if state is locally white and no other marked it red
                dfsBlue(t);
            }
        }
        if (s.isAccepting()) {
            thread_count.get(s).addAndGet(1);
            dfsRed(s);
        } 
        colors.color(s, Color.BLUE);
        
    }

    private void nndfs(graph.State s) throws CycleFoundException {
        dfsBlue(s);
    }

    @Override
    public void run() {
        System.out.println("Thread running");
        try {
            nndfs(graph.getInitialState());
        } catch (CycleFoundException e) {
            result = true;
        }
    }

    public boolean getResult() {
        return result;
    }
}