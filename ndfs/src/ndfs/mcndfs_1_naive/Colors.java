package ndfs.mcndfs_1_naive;

import java.util.HashMap;
import java.util.Map;

import graph.State;

/**
 * This class provides a color map for graph states.
 */
public class Colors {

    private final Map<State, Color> map = new HashMap<State, Color>();
    /* map that indicates whether a state is pink*/
    private final Map<graph.State, Boolean> pink = new HashMap<graph.State, Boolean>();


    public Colors()
    {
        pink.keySet().forEach(x -> pink.put(x,false) ); // init all states as not pink
    }

    /**
     * Returns <code>true</code> if the specified state has the specified color,
     * <code>false</code> otherwise.
     *
     * @param state
     *            the state to examine.
     * @param color
     *            the color
     * @return whether the specified state has the specified color.
     */
    public boolean hasColor(State state, Color color) {

        // The initial color is white, and is not explicitly represented.
        if (color == Color.WHITE) {
            return map.get(state) == null;
        } else {
            return map.get(state) == color;
        }
    }

    /**
     * Gives the specified state the specified color.
     *
     * @param state
     *            the state to color.
     * @param color
     *            color to give to the state.
     */
    public void color(State state, Color color) {
        if (color == Color.WHITE) {
            map.remove(state);
        } else {
            map.put(state, color);
        }
    }

    public boolean isPink(State state)
    {
        return pink.get(state);
    }

    public void setPink(State state)
    {
        pink.put(state, true);
    }
}
