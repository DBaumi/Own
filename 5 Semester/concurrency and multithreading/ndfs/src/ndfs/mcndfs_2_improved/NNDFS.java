package ndfs.mcndfs_2_improved;


import java.io.File;
import java.io.FileNotFoundException;
import java.util.Stack;
import java.util.ArrayList;
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

    private final Worker[] workers;

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
        this.workers = new Worker[num_worker];
        for (int i=0; i< num_worker;i ++)
        {
            this.workers[i] = new Worker(promelaFile, red_states, thread_count);
        }
    }

    @Override
    public boolean ndfs() {
       for (Worker w: workers)
       {
           w.start();
       }
       ArrayList<Boolean> results = new ArrayList<>();
       for (Worker w: workers)
       {
           try{
            w.join();
            results.add(w.getResult());
           }
           catch (InterruptedException e)
           {
               System.err.println("thread " + w.getId() + " was interrupted");
           }
       }

       for (boolean r : results)
       {
           if (r)
            return true;
       }
       return false;
    }
}
