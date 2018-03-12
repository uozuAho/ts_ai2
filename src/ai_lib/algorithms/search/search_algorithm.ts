export interface SearchAlgorithm<TState, TAction> {
    isFinished : boolean;
    /** Get the current search state */
    getCurrentState() : TState;
    /** Get a list of actions from the initial state to the given state.
     *  Throws error if given state not explored */
    getSolutionTo(state: TState) : TAction[];
    isExplored(state: TState): boolean;
    /** Search next state */
    step() : void;
}