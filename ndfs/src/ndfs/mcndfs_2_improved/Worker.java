package ndfs.mcndfs_2_improved;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.Collections;
import java.util.List;
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
    public volatile static boolean terminate= false; //defined for class should be visible to all threads

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

    private void dfsRed(graph.State s) throws CycleFoundException,InterruptedException {
        if (terminate)
        {
            throw new InterruptedException(); // stop looking if another thread found a solution
        }
        if (thread_count.get(s)==null)
        {
            thread_count.put(s,new AtomicInteger(0));
        }
            colors.setPink(s,true);
            List<graph.State> post_states = graph.post(s); 
            Collections.shuffle(post_states); // get next nodes and randomize for different thread paths
            for (graph.State t : post_states) {
                if (colors.hasColor(t, Color.CYAN)) {
                    System.out.println("Cycle found in thread: " + this.getId());
                    terminate = true; // let other threads know that we found a solution
                    throw new CycleFoundException();
                } else if (!colors.isPink(t) && red_states.get(t)==null) { // if state isnt red or pink
                    
                    dfsRed(t);
                }
            }

            if (s.isAccepting())
            {
                
                thread_count.get(s).decrementAndGet();
                synchronized (thread_count.get(s)) {
                if (thread_count.get(s).get() <= 0) {
                    try
                    {
                        thread_count.get(s).notifyAll();
                    // System.out.println("Thread " +this.getId() + ": thread_count is 0");
                    }
                    catch(IllegalMonitorStateException e)
                    {
                        System.out.println("monitorexception in thread: " + this.getId());
                    }
                    
                } 
                else {
                    // System.out.println("Thread "+ this.getId()+ " is waiting on thread_count");
                    thread_count.get(s).wait();
                }
            }
                //while (thread_count.get(s).get() > 0 ){} wait until value is 0 again before continuing
                
            }
            red_states.put(s, true);
            colors.setPink(s,false);
        
    }
        
    

    private void dfsBlue(graph.State s) throws CycleFoundException, InterruptedException{
        if(terminate)
        {
            throw new InterruptedException(); // stop looking if another thread found a solution
        }
        if (thread_count.get(s)==null)
        {
             thread_count.put(s,new AtomicInteger(0));
        }
            colors.color(s, Color.CYAN);
            List<graph.State> post_states = graph.post(s); 
            Collections.shuffle(post_states); // get next nodes and randomize for different thread paths
            for (graph.State t :post_states) {
                if (colors.hasColor(t, Color.WHITE) && red_states.get(t)==null) { // if state is locally white and no other marked it red
                    dfsBlue(t);
                }
            }
            if (s.isAccepting()) 
            {
                thread_count.get(s).incrementAndGet();
                dfsRed(s);
            } 
            colors.color(s, Color.BLUE);
        
    }
        
    

    private void nndfs(graph.State s) throws CycleFoundException,InterruptedException {
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
        catch (InterruptedException e)
        {
            System.out.println("Thread " + this.getId() + " was terminated");
        }
        terminate = true;
    }

    public boolean getResult() {
        return result;
    }
}