package ndfs.mcndfs_1_naive;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

import graph.Graph;
import graph.GraphFactory;
import graph.State;

/**
 * This is a straightforward implementation of Figure 1 of
 * <a href="http://www.cs.vu.nl/~tcs/cm/ndfs/laarman.pdf"> "the Laarman
 * paper"</a>.
 */
public class Worker {

    private final Graph graph;
    public ConcurrentHashMap crit_map; // points to critical section, threads will write their results into the map
    private final Colors colors = new Colors();
    private boolean result = false;
    

    // Throwing an exception is a convenient way to cut off the search in case a
    // cycle is found.
    private static class CycleFoundException extends Exception {
        private static final long serialVersionUID = 1L;
    }

    /**
     * Constructs a Worker object using the specified Promela file.
     *
     * @param promelaFile
     *            the Promela file.
     * @throws FileNotFoundException
     *             is thrown in case the file could not be read.
     */
    public Worker(File promelaFile) throws FileNotFoundException {

        this.graph = GraphFactory.createGraph(promelaFile);
    }

    /*second constructor which passes ConcurrentMap (critical section of program) **/
    public Worker(File promelaFile, ConcurrentHashMap crit_map) throws FileNotFoundException {

        this.graph = GraphFactory.createGraph(promelaFile);
        this.crit_map = crit_map;
    }

    private void dfsRed(State s) throws CycleFoundException {

        for (State t : graph.post(s)) {
            if (colors.hasColor(t, Color.CYAN)) {
                throw new CycleFoundException();
            } else if (colors.hasColor(t, Color.BLUE)) {
                colors.color(t, Color.RED);
                dfsRed(t);
            }
        }
    }

    private void dfsBlue(State s) throws CycleFoundException {

        colors.color(s, Color.CYAN);
        for (State t : graph.post(s)) {
            if (colors.hasColor(t, Color.WHITE)) {
                dfsBlue(t);
            }
        }
        if (s.isAccepting()) {
            dfsRed(s);
            colors.color(s, Color.RED);
        } else {
            colors.color(s, Color.BLUE);
        }
    }

    private void nndfs(State s) throws CycleFoundException {
        dfsBlue(s);
    }

    public void run() {
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