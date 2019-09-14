package ndfs.mcndfs_1_naive;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import graph.State;

import ndfs.NDFS;

/**
 * Implements the {@link ndfs.NDFS} interface, mostly delegating the work to a
 * worker class. 
 */
public class NNDFS implements NDFS {

    private final Worker worker;

    // map of red states shared between threads
    public ConcurrentHashMap<State, Boolean> red_states = new ConcurrentHashMap<>();
    // number of threads that called dfsRed() on the state; also shared
    public ConcurrentHashMap<State, AtomicInteger> thread_count = new ConcurrentHashMap<>();

    /**
     * Constructs an NDFS object using the specified Promela file.
     *
     * @param promelaFile the Promela file.
     * @throws FileNotFoundException is thrown in case the file could not be read.
     */
    public NNDFS(File promelaFile, int num_worker) throws FileNotFoundException {

        /**TODO initalization is incorrect, we need to map the states; keyset is empty right now */
        red_states.keySet().forEach(x -> red_states.put(x, false)); // no state is red at start
        thread_count.keySet().forEach(x -> thread_count.put(x, new AtomicInteger(0))); // counters start at 0
        this.worker = new Worker(promelaFile, red_states, thread_count);
    }

    @Override
    public boolean ndfs() {
        worker.run();
        return worker.getResult();
    }
}
