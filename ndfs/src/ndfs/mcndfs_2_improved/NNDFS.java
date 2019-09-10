package ndfs.mcndfs_1_naive;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.concurrent.ConcurrentHashMap;

import ndfs.NDFS;
import graph.Graph;
import graph.GraphFactory;
import graph.State;

import java.util.Stack;

/**
 * Implements the {@link ndfs.NDFS} interface, mostly delegating the work to a
 * worker class. 
 */
public class NNDFS implements NDFS {

    private final Worker worker;

    /**
     * Constructs an NDFS object using the specified Promela file.
     *
     * @param promelaFile
     *            the Promela file.
     * @throws FileNotFoundException
     *             is thrown in case the file could not be read.
     */
    public NNDFS(File promelaFile) throws FileNotFoundException {

        this.worker = new Worker(promelaFile, initMap(promelaFile)); // pass map to each thread
    }

    //initializes the hashmap with values
    public ConcurrentHashMap initMap(File promelaFile)
    {
        ConcurrentHashMap<Integer, Color> map = new ConcurrentHashMap<>();
        Graph graph =GraphFactory.createGraph(promelaFile);
        
        //iterate over graph with a Stack
        Stack<java.lang.Thread.State> stack = new Stack<>();
        stack.push(graph.getInitialState());
        while (stack.isEmpty() == false)
        {
            java.lang.Thread.State curr = stack.pop();
            if (map.containsKey(curr.hashCode()))
                continue; // skip over states we already visited
            map.put(curr.hashCode(), Color.WHITE); // init map with all white values
            List<State> new_states = graph.post(curr);
            for (State s : new_states)
            {
                stack.push(s);
            }
        }


        return map;
    }

    @Override
    public boolean ndfs() {
        worker.run();
        return worker.getResult();
    }
}
