import { GraphT, EdgeT } from '../../../ai_lib/structures/graphT';
import { Point2d } from '../../../ai_lib/structures/point2d';
import { PandemicMapData } from './map';

type Colour = string;

/**
 * Reads and converts map.ts for easy usage.
 */
export class PandemicBoard {

  public static readonly RED: Colour = 'red';
  public static readonly BLUE: Colour = 'blue';
  public static readonly BLACK: Colour = 'black';
  public static readonly YELLOW: Colour = 'yellow';

  private readonly _cities: City[];
  private readonly _cityGraph: GraphT<City>;

  /** city name: city */
  private readonly _nameToCityLookup: Map<string, City>;
  /** city name: idx in graph nodes[] */
  private readonly _nameToIdxLookup: Map<string, number>;

  constructor() {
    this._cityGraph = new GraphT<City>();
    this._nameToCityLookup = new Map<string, City>();
    this._nameToIdxLookup = new Map<string, number>();
    // temp map of city ids to idx in node array. Ids are not used after construction
    const cityIdIdxMap = new Map<string, number>();
    let idx = 0;
    PandemicMapData.cities.forEach(city => {
      const cityObj = new City(city.name, new Point2d(city.x, city.y), city.colour);
      this._nameToCityLookup.set(city.name, cityObj);
      this._nameToIdxLookup.set(city.name, idx);
      this._cityGraph.add_node(cityObj);
      cityIdIdxMap.set(city.id, idx);
      idx++;
    });
    this._cities = this._cityGraph.get_nodes();
    PandemicMapData.edges.forEach(edge => {
      const cityIdxFrom = cityIdIdxMap.get(edge[0]);
      const cityIdxTo = cityIdIdxMap.get(edge[1]);
      this._cityGraph.add_edge(cityIdxFrom, cityIdxTo);
    });
    // invert city y coords for canvas drawing
    this.invertY();
  }

  public getCities(): City[] {
    return this._cityGraph.get_nodes();
  }

  public getEdges(): EdgeT<City>[] {
    return this._cityGraph.get_edgesT();
  }

  public getCity(name: string): City {
    return this._nameToCityLookup.get(name);
  }

  public getAdjacentCities(city: City): City[] {
    const idx = this._nameToIdxLookup.get(city.name);
    return this._cityGraph.adjacent(idx)
      .map(adj => adj.other(idx))
      .map(i => this._cities[i]);
  }

  /** Invert city y coords (since +y is down on canvas).
   */
  private invertY() {
    // mirror around mid point: (x - mid) * -1 + mid
    //                        = 2mid - x
    const allPts = this._cities.map(c => c.location.y);
    const miny = Math.min(...allPts);
    const maxy = Math.max(...allPts);
    const mid2 = miny + maxy;
    this._cities.forEach(c => c.location.y = mid2 - c.location.y);
  }
}

export class City {
  name: string;
  location: Point2d;
  colour: Colour;
  constructor(name: string, location: Point2d, colour: Colour) {
    this.name = name;
    this.location = location;
    this.colour = colour;
  }
}
