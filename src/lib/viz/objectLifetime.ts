/**
 * Scenarios for the object-lifetime stepper: a short C++ program and a
 * hand-written trace of what happens as it runs — which line is executing,
 * which objects come to life or are destroyed, and what reaches the screen.
 *
 * The traces are data, not a simulation, so they can't drift silently:
 * scripts/check-cpp.ts compiles every program and checks that the output in
 * the trace, step by step, adds up to exactly what the program prints.
 *
 * Server-safe (no React), like the rest of src/lib/viz.
 */

export type LifetimeObject = {
  id: string;
  /** As shown on its box, e.g. "a : Tracer". */
  label: string;
  /** Set for a member object or a base-class part: it is drawn inside this one. */
  parent?: string;
  /** How the part relates to its parent; shown as a small tag. */
  role?: "member" | "base part";
};

export type LifetimeOp =
  /** The object exists but its constructor body hasn't finished (its parts are still being built). */
  | { do: "begin"; id: string }
  /** The constructor has finished: the object is fully alive. */
  | { do: "construct"; id: string }
  /** Its destructor body is running; its parts still exist. */
  | { do: "end"; id: string }
  /** It is gone. */
  | { do: "destroy"; id: string };

export type LifetimeStep = {
  /** 1-based line of `program` being executed. */
  line: number;
  ops?: LifetimeOp[];
  /** Text the program prints at this step, exactly as cout writes it. */
  out?: string;
  /** Values that belong to the class rather than an object, e.g. a static counter. */
  vars?: Record<string, string | number>;
  /** What is happening, in a sentence or two. */
  note: string;
};

export type LifetimeScenario = {
  title: string;
  objects: LifetimeObject[];
  program: string;
  steps: LifetimeStep[];
};

export const LIFETIME_SCENARIOS = {
  scope: {
    title: "Scope: when constructors and destructors run",
    objects: [
      { id: "a", label: "a : Tracer" },
      { id: "b", label: "b : Tracer" },
      { id: "c", label: "c : Tracer" },
    ],
    program: `#include <iostream>
using namespace std;

class Tracer {
public:
    Tracer(char c) : id(c) { cout << "C" << id; }
    ~Tracer() { cout << "D" << id; }
private:
    char id;
};

int main() {
    Tracer a('1');
    {
        Tracer b('2');
    }
    Tracer c('3');
    cout << "|";
    return 0;
}`,
    steps: [
      { line: 12, note: "main starts. No Tracer objects exist yet." },
      { line: 13, note: "Declaring a creates an object, so its constructor is called with '1'." },
      { line: 6, ops: [{ do: "construct", id: "a" }], out: "C1", note: "The constructor runs and prints C1. a now lives until the end of main." },
      { line: 14, note: "An opening brace starts a new, inner scope." },
      { line: 15, note: "b is declared inside the inner scope." },
      { line: 6, ops: [{ do: "construct", id: "b" }], out: "C2", note: "b's constructor prints C2." },
      { line: 16, note: "The inner scope closes here. Every object declared inside it goes out of scope…" },
      { line: 7, ops: [{ do: "destroy", id: "b" }], out: "D2", note: "…so b's destructor runs immediately and prints D2. b no longer exists." },
      { line: 17, note: "c is declared back in main's scope." },
      { line: 6, ops: [{ do: "construct", id: "c" }], out: "C3", note: "c's constructor prints C3." },
      { line: 18, out: "|", note: "An ordinary print. Notice that a and c are both still alive." },
      { line: 20, note: "main ends. The objects still alive are destroyed in the reverse of the order they were created: c first, then a." },
      { line: 7, ops: [{ do: "destroy", id: "c" }], out: "D3", note: "c was created last, so it is destroyed first: D3." },
      { line: 7, ops: [{ do: "destroy", id: "a" }], out: "D1", note: "a was created first, so it is destroyed last: D1. The full output is C1C2D2C3|D3D1." },
    ],
  },

  static_count: {
    title: "A static member: one counter shared by every object",
    objects: [
      { id: "a", label: "a : Item" },
      { id: "b", label: "b : Item" },
      { id: "c", label: "c : Item" },
    ],
    program: `#include <iostream>
using namespace std;

class Item {
public:
    Item() { ++count; }
    ~Item() { --count; }
    static int getCount() { return count; }
private:
    static int count;
};

int Item::count = 0;

int main() {
    Item a;
    Item b;
    {
        Item c;
        cout << Item::getCount() << " ";
    }
    cout << Item::getCount() << endl;
    return 0;
}`,
    steps: [
      { line: 13, vars: { "Item::count": 0 }, note: "The static member is defined once, outside the class. It belongs to the class itself and exists before any Item object does." },
      { line: 16, note: "main creates its first Item." },
      { line: 6, ops: [{ do: "construct", id: "a" }], vars: { "Item::count": 1 }, note: "The constructor adds one to the shared count." },
      { line: 17, note: "A second Item…" },
      { line: 6, ops: [{ do: "construct", id: "b" }], vars: { "Item::count": 2 }, note: "…adds one to the same count. There is still only one count, not one per object." },
      { line: 19, note: "c is created inside an inner block." },
      { line: 6, ops: [{ do: "construct", id: "c" }], vars: { "Item::count": 3 }, note: "Three objects, one shared counter: 3." },
      { line: 20, out: "3 ", note: "getCount() is static, so it is called on the class (Item::getCount()), not on an object. It prints 3." },
      { line: 21, note: "The inner block ends, so c goes out of scope." },
      { line: 7, ops: [{ do: "destroy", id: "c" }], vars: { "Item::count": 2 }, note: "c's destructor takes one away from the count." },
      { line: 22, out: "2\n", note: "Back in main, the count is 2." },
      { line: 24, note: "main ends: b and a are destroyed, newest first." },
      { line: 7, ops: [{ do: "destroy", id: "b" }], vars: { "Item::count": 1 }, note: "b's destructor: the count drops to 1." },
      { line: 7, ops: [{ do: "destroy", id: "a" }], vars: { "Item::count": 0 }, note: "a's destructor: 0. The objects are gone, but Item::count itself still exists — it belongs to the class." },
    ],
  },

  composition: {
    title: "Composition: an object built from member objects",
    objects: [
      { id: "car", label: "car : Car" },
      { id: "engine", label: "engine : Engine", parent: "car", role: "member" },
    ],
    program: `#include <iostream>
using namespace std;

class Engine {
public:
    Engine() { cout << "E"; }
    ~Engine() { cout << "e"; }
};

class Car {
public:
    Car() { cout << "C"; }
    ~Car() { cout << "c"; }
private:
    Engine engine;
};

int main() {
    Car car;
    cout << "|";
    return 0;
}`,
    steps: [
      { line: 18, note: "main starts." },
      { line: 19, ops: [{ do: "begin", id: "car" }], note: "Creating car starts here. But a Car has an Engine inside it (line 15), and that member has to exist before Car's constructor body can run." },
      { line: 15, note: "So the member objects are built first, in the order they are declared in the class." },
      { line: 6, ops: [{ do: "construct", id: "engine" }], out: "E", note: "Engine's constructor runs and prints E. The engine now exists, inside the car." },
      { line: 12, ops: [{ do: "construct", id: "car" }], out: "C", note: "Only now does the body of Car's constructor run: C. The car is complete." },
      { line: 20, out: "|", note: "An ordinary print while the car (and its engine) are alive." },
      { line: 22, note: "main ends and car goes out of scope. Destruction is the mirror image of construction." },
      { line: 13, ops: [{ do: "end", id: "car" }], out: "c", note: "Car's destructor body runs first, and prints c. Its engine still exists, so the destructor could still use it." },
      { line: 7, ops: [{ do: "destroy", id: "engine" }], out: "e", note: "After the Car destructor body, the members are destroyed: Engine's destructor prints e." },
      { line: 22, ops: [{ do: "destroy", id: "car" }], note: "Now the whole car is gone. Order: members built first, destroyed last — EC|ce." },
    ],
  },

  inheritance: {
    title: "Inheritance: the base part is built first",
    objects: [
      { id: "d", label: "d : Derived" },
      { id: "base", label: "Base", parent: "d", role: "base part" },
    ],
    program: `#include <iostream>
using namespace std;

class Base {
public:
    Base() { cout << "B"; }
    ~Base() { cout << "b"; }
};

class Derived : public Base {
public:
    Derived() { cout << "D"; }
    ~Derived() { cout << "d"; }
};

int main() {
    Derived d;
    cout << "|";
    return 0;
}`,
    steps: [
      { line: 16, note: "main starts." },
      { line: 17, ops: [{ do: "begin", id: "d" }], note: "Creating d starts here. A Derived object is a Base object with more added, so it contains a whole Base part." },
      { line: 10, note: "Because Derived inherits from Base, the Base part has to be built before anything of Derived's own." },
      { line: 6, ops: [{ do: "construct", id: "base" }], out: "B", note: "Base's constructor runs first and prints B." },
      { line: 12, ops: [{ do: "construct", id: "d" }], out: "D", note: "Then Derived's constructor body runs and prints D. d is complete." },
      { line: 18, out: "|", note: "An ordinary print. d is one object, with a Base part inside it." },
      { line: 20, note: "main ends and d goes out of scope. Destruction runs in the opposite order." },
      { line: 13, ops: [{ do: "end", id: "d" }], out: "d", note: "Derived's destructor runs first and prints d — while the Base part still exists." },
      { line: 7, ops: [{ do: "destroy", id: "base" }], out: "b", note: "Then Base's destructor runs and prints b." },
      { line: 20, ops: [{ do: "destroy", id: "d" }], note: "d is gone. Built base-first, destroyed derived-first: BD|db." },
    ],
  },
} satisfies Record<string, LifetimeScenario>;

export type LifetimeScenarioName = keyof typeof LIFETIME_SCENARIOS;
export const LIFETIME_SCENARIO_NAMES = Object.keys(LIFETIME_SCENARIOS) as [LifetimeScenarioName, ...LifetimeScenarioName[]];

export type ObjectStatus = "building" | "alive" | "ending";

export type LifetimeFrame = {
  line: number;
  note: string;
  status: Map<string, ObjectStatus>;
  /** Objects whose state changed at this step, for highlighting. */
  changed: Set<string>;
  output: string;
  vars: Record<string, string | number>;
};

/** Replays the steps into the state the screen shows after each one. */
export function lifetimeFrames(scenario: LifetimeScenario): LifetimeFrame[] {
  const status = new Map<string, ObjectStatus>();
  let output = "";
  let vars: Record<string, string | number> = {};
  return scenario.steps.map((step) => {
    const changed = new Set<string>();
    for (const op of step.ops ?? []) {
      changed.add(op.id);
      if (op.do === "begin") status.set(op.id, "building");
      else if (op.do === "construct") status.set(op.id, "alive");
      else if (op.do === "end") status.set(op.id, "ending");
      else status.delete(op.id);
    }
    output += step.out ?? "";
    if (step.vars) vars = { ...vars, ...step.vars };
    return { line: step.line, note: step.note, status: new Map(status), changed, output, vars };
  });
}
