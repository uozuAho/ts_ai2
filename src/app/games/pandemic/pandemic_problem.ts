import { InfectionCard } from './infection_card';
import { Hashable } from '../../ai_lib/structures/hash_set';
import { City, PandemicBoard } from './pandemic_board';
import { SearchProblem } from '../../ai_lib/algorithms/search/search_problem';

export class PlayerState {
    id: number;
    name: string;
    location: City;

    public constructor(id: number, name: string, location: City) {
        this.id = id;
        this.name = name;
        this.location = location;
    }

    public clone() : PlayerState {
        return new PlayerState(this.id, this.name, this.location);
    }
}

export class PandemicState implements Hashable {
    playerStates: PlayerState[];
    cityStates: CityState[];
    infectionDeck: InfectionCard[];

    public static createNew(board: PandemicBoard, start_city: City = null) : PandemicState {
        let state = new PandemicState();
        if (start_city === null) start_city = board.getCity("Atlanta");
        state.playerStates = [new PlayerState(0, "bert", start_city)];
        state.cityStates = board.getCities().map(c => new CityState(c));
        state.infectionDeck = board.getCities().map(c => new InfectionCard(c));
        return state;
    }

    public hash() : string {
        return 'hmm how to hash this';
    }

    /** Deep copy of this state */
    public clone() : PandemicState {
        let copy = new PandemicState();
        copy.playerStates = this.playerStates.map(p => p.clone());
        return copy;
    }
}

class CityState {
    city: City;
    cubes: Map<string, number>;

    constructor(city: City) {
        this.city = city;
        this.cubes = new Map();
        this.cubes.set("red", 0);
        this.cubes.set("yellow", 0);
        this.cubes.set("blue", 0);
        this.cubes.set("black", 0);
    }

    public clone(): CityState {
        let copy = new CityState(this.city);
        ['red', 'yellow', 'blue', 'black'].forEach(colour => {
            copy.cubes.set(colour, this.cubes.get(colour));
        });
        return copy;
    }
}

export class PandemicAction {
    playerId: number;
    goto: City;
}

export class PandemicProblem implements SearchProblem<PandemicState, PandemicAction> {
    public initial_state: PandemicState;
    private _board: PandemicBoard;

    constructor(board: PandemicBoard, initial_state: PandemicState) {
        this._board = board;
        this.initial_state = initial_state;
    }

    public getActions(state: PandemicState): PandemicAction[] {
        let actions: PandemicAction[] = [];
        let _this = this;
        state.playerStates.forEach(p => {
            _this._board.getAdjacentCities(p.location).forEach(city => {
                actions.push({playerId: p.id, goto: city});
            });
        });
        return actions;
    }

    public doAction(state: PandemicState, action: PandemicAction): PandemicState {
        let newState = state.clone();
        newState.playerStates[action.playerId].location = action.goto;
        return newState;
    }

    public isGoal(state: PandemicState): boolean {
        throw new Error('Not implemented yet.');
    }

    public getGoalState(): PandemicState {
        throw new Error('Not implemented yet.');
    }

    public pathCost(state: PandemicState, action: PandemicAction): number {
        return 1;
    }
}