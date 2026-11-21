/**
 * Guided exercises for the C++ course: one GUIDED_CODE block per lesson, a
 * single program built up over five steps. Each step carries a reference
 * `solution` (the whole program once the step is done) that never reaches the
 * page — scripts/check-cpp.ts compiles every one and confirms it prints the
 * step's expected output and passes its code checks, and that the previous
 * step's program does not already pass (so every step asks for something).
 *
 * Steps give the lines to add to main() word for word, so the expected output
 * is fixed; what the student writes is the class.
 */
import type { z } from "zod";
import type { guidedStepSchema } from "../../src/lib/blocks/guided";

export type GuidedStepSource = z.input<typeof guidedStepSchema> & { solution: string };

export type GuidedExerciseSource = {
  moduleFile: string;
  title: string;
  intro: string;
  starterCode: string;
  steps: GuidedStepSource[];
};

/** The steps as the block stores them — without the reference solutions. */
export function blockSteps(exercise: GuidedExerciseSource) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return exercise.steps.map(({ solution, ...step }) => step);
}

const md = (...lines: string[]) => lines.join("\n");
const code = (source: string) => "```cpp\n" + source.trim() + "\n```";

const STARTER = `#include <iostream>
#include <string>
using namespace std;

// Build the class here, one step at a time.

int main() {
    // The lines each step asks you to add go here.
    return 0;
}
`;

const INTRO_TAIL =
  "Each step tells you what to add. Press **Check step** when you think it's done: your program is compiled and run, and its output is compared with the step's expected output. Your code is saved as you go.";

// ─────────────────────────────────────────────────────────────── Module 1

const BANK_1 = `#include <iostream>
#include <string>
using namespace std;

class BankAccount {
public:
    BankAccount(string o, double b) : owner(o), balance(b) {}
    void print() { cout << owner << ": " << balance << endl; }

private:
    string owner;
    double balance;
};

int main() {
    BankAccount acc("Rina", 100);
    acc.print();
    return 0;
}
`;

const BANK_2 = BANK_1.replace(
  "    void print()",
  "    void deposit(double amount) { balance += amount; }\n    void print()"
).replace("    acc.print();\n", "    acc.print();\n    acc.deposit(50);\n    acc.print();\n");

const BANK_3 = BANK_2.replace(
  "    void print()",
  `    bool withdraw(double amount) {
        if (amount > balance) return false;
        balance -= amount;
        return true;
    }
    void print()`
).replace(
  "    acc.deposit(50);\n    acc.print();\n",
  `    acc.deposit(50);
    acc.print();
    if (!acc.withdraw(500)) cout << "Not enough money" << endl;
    if (acc.withdraw(30)) cout << "Withdrew 30" << endl;
    acc.print();
`
);

const BANK_4 = BANK_3.replace("BankAccount(string o, double b)", "BankAccount(string o, double b = 0)").replace(
  "    return 0;",
  `    BankAccount empty("Budi");
    empty.print();
    return 0;`
);

const BANK_5 = BANK_4.replace(
  "    void deposit",
  `    ~BankAccount() { cout << "Closing " << owner << "'s account" << endl; }
    void deposit`
);

// ─────────────────────────────────────────────────────────────── Module 2

const STUDENT_1 = `#include <iostream>
#include <string>
using namespace std;

class Student {
public:
    Student(string n, int s) : name(n), score(s) {}
    string getName() const { return name; }
    int getScore() const { return score; }

private:
    string name;
    int score;
};

int main() {
    const Student ana("Ana", 85);
    cout << ana.getName() << " " << ana.getScore() << endl;
    return 0;
}
`;

const STUDENT_2 = STUDENT_1.replace(
  "    int getScore() const { return score; }\n",
  `    int getScore() const { return score; }
    void setScore(int s) {
        if (s < 0 || s > 100) {
            cout << "Invalid score: " << s << endl;
            return;
        }
        score = s;
    }
`
).replace(
  "    return 0;",
  `    Student budi("Budi", 70);
    budi.setScore(120);
    budi.setScore(90);
    cout << budi.getName() << " " << budi.getScore() << endl;
    return 0;`
);

const STUDENT_3 = STUDENT_2.replace(
  "    Student(string n, int s) : name(n), score(s) {}",
  "    Student(string n, int s) : name(n), score(s) { count++; }\n    static int getCount() { return count; }"
)
  .replace("    int score;\n};", "    int score;\n    static int count;\n};\n\nint Student::count = 0;")
  .replace(
    "    return 0;",
    `    Student citra("Citra", 60);
    cout << "Students: " << Student::getCount() << endl;
    return 0;`
  );

const STUDENT_4 = STUDENT_3.replace(
  "    void setScore(int s) {",
  `    Student& addBonus(int points) {
        score += points;
        if (score > 100) score = 100;
        return *this;
    }
    void setScore(int s) {`
).replace(
  "    return 0;",
  `    budi.addBonus(5).addBonus(10);
    cout << budi.getName() << " " << budi.getScore() << endl;
    return 0;`
);

const STUDENT_5 = STUDENT_4.replace(
  "    static int getCount()",
  "    ~Student() { count--; }\n    static int getCount()"
).replace(
  "    return 0;",
  `    Student* guest = new Student("Dewi", 50);
    cout << "Students: " << Student::getCount() << endl;
    delete guest;
    cout << "Students: " << Student::getCount() << endl;
    return 0;`
);

// ─────────────────────────────────────────────────────────────── Module 3

const EVENT_1 = `#include <iostream>
#include <string>
using namespace std;

class Date {
public:
    Date(int d, int m, int y) : day(d), month(m), year(y) {}
    void print() const { cout << day << "/" << month << "/" << year; }

private:
    int day, month, year;
};

int main() {
    Date d(17, 8, 2026);
    d.print();
    cout << endl;
    return 0;
}
`;

const EVENT_2 = EVENT_1.replace(
  "int main() {\n    Date d(17, 8, 2026);\n    d.print();\n    cout << endl;\n",
  `class Event {
public:
    Event(string n, int d, int m, int y) : name(n), date(d, m, y) {}
    void print() const {
        cout << name << " on ";
        date.print();
        cout << endl;
    }

private:
    string name;
    Date date;
};

int main() {
    Event concert("Concert", 17, 8, 2026);
    concert.print();
`
);

const EVENT_3 = EVENT_2.replace(
  '    void print() const { cout << day << "/"',
  '    void addDays(int n) { day += n; }\n    void print() const { cout << day << "/"'
)
  .replace("    void print() const {\n        cout << name", "    void postpone(int days) { date.addDays(days); }\n    void print() const {\n        cout << name")
  .replace("    concert.print();\n", "    concert.print();\n    concert.postpone(3);\n    concert.print();\n");

const EVENT_4 = EVENT_3.replace(
  "    void addDays(int n) { day += n; }",
  `    void addDays(int n) { day += n; }
    bool sameAs(const Date& other) const {
        return day == other.day && month == other.month && year == other.year;
    }`
)
  .replace("    string name;\n    Date date;\n};\n", `    string name;
    Date date;

    friend bool sameDay(const Event& a, const Event& b);
};

bool sameDay(const Event& a, const Event& b) {
    return a.date.sameAs(b.date);
}
`)
  .replace(
    "    return 0;",
    `    Event meeting("Meeting", 20, 8, 2026);
    Event party("Party", 21, 8, 2026);
    cout << (sameDay(concert, meeting) ? "Same day" : "Different days") << endl;
    cout << (sameDay(concert, party) ? "Same day" : "Different days") << endl;
    return 0;`
  );

const EVENT_5 = EVENT_4.replace(
  "    Date(int d, int m, int y) : day(d), month(m), year(y) {}",
  `    Date(int d, int m, int y) : day(d), month(m), year(y) { cout << "Date built" << endl; }
    ~Date() { cout << "Date destroyed" << endl; }`
).replace(
  "    Event(string n, int d, int m, int y) : name(n), date(d, m, y) {}",
  `    Event(string n, int d, int m, int y) : name(n), date(d, m, y) { cout << "Event built: " << name << endl; }
    ~Event() { cout << "Event destroyed: " << name << endl; }`
);

// ─────────────────────────────────────────────────────────────── Module 4

const FRACTION_1 = `#include <iostream>
#include <string>
using namespace std;

class Fraction {
public:
    Fraction(int n, int d) : num(n), den(d) {}
    void print() const { cout << num << "/" << den << endl; }

private:
    int num, den;
};

int main() {
    Fraction a(1, 2);
    Fraction b(1, 3);
    a.print();
    b.print();
    return 0;
}
`;

const FRACTION_2 = FRACTION_1.replace(
  "    void print() const",
  `    Fraction operator+(const Fraction& other) const {
        return Fraction(num * other.den + other.num * den, den * other.den);
    }
    void print() const`
).replace("    return 0;", "    Fraction c = a + b;\n    c.print();\n    return 0;");

const FRACTION_3 = FRACTION_2.replace(
  "    int num, den;\n};\n",
  `    int num, den;

    friend ostream& operator<<(ostream& out, const Fraction& f);
};

ostream& operator<<(ostream& out, const Fraction& f) {
    out << f.num << "/" << f.den;
    return out;
}
`
).replace("    return 0;", '    cout << a << " + " << b << " = " << c << endl;\n    return 0;');

const FRACTION_4 = FRACTION_3.replace(
  "    void print() const",
  `    bool operator==(const Fraction& other) const {
        return num * other.den == other.num * den;
    }
    void print() const`
).replace(
  "    return 0;",
  `    Fraction d(2, 4);
    cout << (a == d ? "1/2 equals 2/4" : "1/2 does not equal 2/4") << endl;
    cout << (a == b ? "1/2 equals 1/3" : "1/2 does not equal 1/3") << endl;
    return 0;`
);

const FRACTION_5 = FRACTION_4.replace(
  "    void print() const",
  `    Fraction& operator++() {
        num += den;
        return *this;
    }
    void print() const`
).replace(
  "    return 0;",
  `    ++a;
    cout << a << endl;
    cout << ++(++b) << endl;
    return 0;`
);

// ─────────────────────────────────────────────────────────────── Module 5

const STAFF_1 = `#include <iostream>
#include <string>
using namespace std;

class Employee {
public:
    Employee(string n, int s) : name(n), salary(s) {}
    void describe() const { cout << name << " earns " << salary << endl; }

protected:
    string name;
    int salary;
};

int main() {
    Employee sari("Sari", 5000);
    sari.describe();
    return 0;
}
`;

const STAFF_2 = STAFF_1.replace(
  "int main() {",
  `class Manager : public Employee {
public:
    Manager(string n, int s, int t) : Employee(n, s), teamSize(t) {}
    void describe() const {
        Employee::describe();
        cout << "Manages " << teamSize << " people" << endl;
    }

private:
    int teamSize;
};

int main() {`
).replace("    return 0;", '    Manager joko("Joko", 8000, 4);\n    joko.describe();\n    return 0;');

const STAFF_3 = STAFF_2.replace(
  "    void describe() const {\n        Employee::describe();",
  "    void addBonus(int amount) { salary += amount; }\n    void describe() const {\n        Employee::describe();"
).replace("    return 0;", "    joko.addBonus(1000);\n    joko.describe();\n    return 0;");

const STAFF_4 = STAFF_3.replace(
  "    Employee(string n, int s) : name(n), salary(s) {}",
  `    Employee(string n, int s) : name(n), salary(s) { cout << "Employee() for " << name << endl; }
    ~Employee() { cout << "~Employee() for " << name << endl; }`
).replace(
  "    Manager(string n, int s, int t) : Employee(n, s), teamSize(t) {}",
  `    Manager(string n, int s, int t) : Employee(n, s), teamSize(t) { cout << "Manager() for " << name << endl; }
    ~Manager() { cout << "~Manager() for " << name << endl; }`
);

const STAFF_5 = STAFF_4.replace(
  "int main() {",
  `class Director : public Manager {
public:
    Director(string n, int s, int t, string d) : Manager(n, s, t), division(d) { cout << "Director() for " << name << endl; }
    ~Director() { cout << "~Director() for " << name << endl; }
    void describe() const {
        Manager::describe();
        cout << "Leads the " << division << " division" << endl;
    }

private:
    string division;
};

int main() {`
).replace("    return 0;", '    Director rina("Rina", 12000, 20, "Engineering");\n    rina.describe();\n    return 0;');

// ─────────────────────────────────────────────────────────────── The exercises

export const CPP_GUIDED: GuidedExerciseSource[] = [
  {
    moduleFile: "1_Intro to Classes.pdf",
    title: "Build a BankAccount class",
    intro: md(
      "Build a small bank account class from nothing: data members, a constructor, member functions, a default argument and a destructor.",
      "",
      INTRO_TAIL
    ),
    starterCode: STARTER,
    steps: [
      {
        title: "A class with a constructor",
        instructions: md(
          "Define a class `BankAccount` with two **private** data members, `string owner` and `double balance`.",
          "",
          "Give it a **public** constructor `BankAccount(string o, double b)` that sets both with a **member initializer list**, and a public member function `void print()` that prints the owner, a colon and a space, the balance, and a new line.",
          "",
          "Then put these lines in `main`:",
          code(`
BankAccount acc("Rina", 100);
acc.print();`)
        ),
        expectedOutput: "Rina: 100",
        hints: [
          "A member initializer list goes between the constructor's `)` and its body: `BankAccount(string o, double b) : owner(o), balance(b) {}`",
          "`print` is one line: `cout << owner << \": \" << balance << endl;`",
        ],
        codeChecks: [
          { pattern: String.raw`class\s+BankAccount`, message: "Define a class named BankAccount." },
          { pattern: String.raw`private\s*:`, message: "Put owner and balance under private:." },
          { pattern: String.raw`BankAccount\s*\([^)]*\)\s*:\s*\w+\s*\(`, message: "Set the data members with a member initializer list: BankAccount(string o, double b) : owner(o), balance(b) {}" },
        ],
        solution: BANK_1,
      },
      {
        title: "Deposit money",
        instructions: md(
          "Add a public member function `void deposit(double amount)` that adds `amount` to the balance.",
          "",
          "Then add these lines to the end of `main` (before `return 0;`):",
          code(`
acc.deposit(50);
acc.print();`)
        ),
        expectedOutput: "Rina: 100\nRina: 150",
        hints: ["A member function can change the object's private data members directly: `balance += amount;`"],
        codeChecks: [{ pattern: String.raw`void\s+deposit\s*\(\s*double`, message: "Add a member function void deposit(double amount)." }],
        solution: BANK_2,
      },
      {
        title: "Withdraw — but not too much",
        instructions: md(
          "Add `bool withdraw(double amount)`. If `amount` is more than the balance, it changes nothing and returns `false`. Otherwise it subtracts `amount` and returns `true`.",
          "",
          "Add to `main`:",
          code(`
if (!acc.withdraw(500)) cout << "Not enough money" << endl;
if (acc.withdraw(30)) cout << "Withdrew 30" << endl;
acc.print();`)
        ),
        expectedOutput: "Rina: 100\nRina: 150\nNot enough money\nWithdrew 30\nRina: 120",
        hints: [
          "Check first and leave early: `if (amount > balance) return false;`",
          "After the check: `balance -= amount; return true;`",
        ],
        codeChecks: [{ pattern: String.raw`bool\s+withdraw\s*\(\s*double`, message: "Add a member function bool withdraw(double amount)." }],
        solution: BANK_3,
      },
      {
        title: "A default argument",
        instructions: md(
          "A new account usually starts empty. Give the constructor's balance parameter a **default argument** of `0`, so an account can be created with just a name.",
          "",
          "Add to `main`:",
          code(`
BankAccount empty("Budi");
empty.print();`)
        ),
        expectedOutput: "Rina: 100\nRina: 150\nNot enough money\nWithdrew 30\nRina: 120\nBudi: 0",
        hints: ["Only the declaration changes: `BankAccount(string o, double b = 0)`. No second constructor is needed."],
        codeChecks: [{ pattern: String.raw`double\s+\w+\s*=\s*0`, message: "Give the balance parameter a default argument: double b = 0." }],
        solution: BANK_4,
      },
      {
        title: "Say goodbye with a destructor",
        instructions: md(
          "Add a destructor that prints `Closing <owner>'s account` on its own line. Don't change `main` — destructors run by themselves when `main` ends.",
          "",
          "Look at the expected output: which account closes first, and why?"
        ),
        expectedOutput: "Rina: 100\nRina: 150\nNot enough money\nWithdrew 30\nRina: 120\nBudi: 0\nClosing Budi's account\nClosing Rina's account",
        hints: [
          "A destructor is named after the class with a `~` in front, and takes no parameters: `~BankAccount() { ... }`",
          "Objects are destroyed in the reverse order they were created, which is why Budi's account closes first.",
        ],
        codeChecks: [{ pattern: String.raw`~\s*BankAccount\s*\(\s*\)`, message: "Add a destructor: ~BankAccount()." }],
        solution: BANK_5,
      },
    ],
  },
  {
    moduleFile: "2_Classes Interface and Implementation.pdf",
    title: "Student records: const, static and this",
    intro: md(
      "Build a `Student` class that protects its data: `const` member functions, a set function that checks its input, a `static` counter, call chaining with `this`, and objects made with `new`.",
      "",
      INTRO_TAIL
    ),
    starterCode: STARTER,
    steps: [
      {
        title: "Get functions on a const object",
        instructions: md(
          "Define a class `Student` with private `string name` and `int score`, a constructor `Student(string n, int s)`, and two get functions: `getName()` returns the name, `getScore()` returns the score.",
          "",
          "Put these lines in `main`. Notice that `ana` is a **const** object:",
          code(`
const Student ana("Ana", 85);
cout << ana.getName() << " " << ana.getScore() << endl;`)
        ),
        expectedOutput: "Ana 85",
        hints: [
          "If the compiler complains that it is \"passing const Student as this argument\", your get functions aren't `const` yet.",
          "Write `const` after the parameter list: `string getName() const { return name; }`",
        ],
        codeChecks: [
          { pattern: String.raw`getName\s*\(\s*\)\s*const`, message: "Make getName a const member function: string getName() const." },
          { pattern: String.raw`getScore\s*\(\s*\)\s*const`, message: "Make getScore a const member function: int getScore() const." },
        ],
        solution: STUDENT_1,
      },
      {
        title: "A set function that checks",
        instructions: md(
          "Add `void setScore(int s)`. A score must be from 0 to 100: if `s` is outside that range, print `Invalid score: <s>` and keep the old score. Otherwise store it.",
          "",
          "Add to `main`:",
          code(`
Student budi("Budi", 70);
budi.setScore(120);
budi.setScore(90);
cout << budi.getName() << " " << budi.getScore() << endl;`)
        ),
        expectedOutput: "Ana 85\nInvalid score: 120\nBudi 90",
        hints: ["This is what set functions are for: the class decides what a valid value is, so nobody outside can store a score of 120."],
        codeChecks: [{ pattern: String.raw`void\s+setScore\s*\(\s*int`, message: "Add void setScore(int s)." }],
        solution: STUDENT_2,
      },
      {
        title: "Count the students with static",
        instructions: md(
          "Count how many `Student` objects exist. Add a private `static int count;`, define it outside the class with `int Student::count = 0;`, add 1 in the constructor, and add a public `static int getCount()` that returns it.",
          "",
          "Add to `main`:",
          code(`
Student citra("Citra", 60);
cout << "Students: " << Student::getCount() << endl;`)
        ),
        expectedOutput: "Ana 85\nInvalid score: 120\nBudi 90\nStudents: 3",
        hints: [
          "A static data member belongs to the class, not to each object — there is one `count` shared by all students.",
          "Without the definition `int Student::count = 0;` outside the class, the linker reports an \"undefined reference\" to `Student::count`.",
        ],
        codeChecks: [
          { pattern: String.raw`static\s+int\s+count`, message: "Add a static data member: static int count;" },
          { pattern: String.raw`int\s+Student\s*::\s*count\s*=\s*0`, message: "Define the static member outside the class: int Student::count = 0;" },
          { pattern: String.raw`static\s+int\s+getCount\s*\(`, message: "Add static int getCount()." },
        ],
        solution: STUDENT_3,
      },
      {
        title: "Chain calls with this",
        instructions: md(
          "Add `Student& addBonus(int points)`. It adds `points` to the score — but a score never goes above 100 — and returns `*this`, so calls can be chained.",
          "",
          "Add to `main`:",
          code(`
budi.addBonus(5).addBonus(10);
cout << budi.getName() << " " << budi.getScore() << endl;`)
        ),
        expectedOutput: "Ana 85\nInvalid score: 120\nBudi 90\nStudents: 3\nBudi 100",
        hints: [
          "`this` is a pointer to the object the function was called on, so `*this` is the object itself.",
          "Return it by reference (`Student&`), or the second `addBonus` changes a copy instead of `budi`.",
        ],
        codeChecks: [
          { pattern: String.raw`Student\s*&\s*addBonus\s*\(`, message: "addBonus should return a reference: Student& addBonus(int points)." },
          { pattern: String.raw`return\s*\*\s*this`, message: "Return the object itself: return *this;" },
        ],
        solution: STUDENT_4,
      },
      {
        title: "Objects made with new",
        instructions: md(
          "Add a destructor that takes 1 off `count`, so the count goes down when a student is destroyed.",
          "",
          "Add to `main`:",
          code(`
Student* guest = new Student("Dewi", 50);
cout << "Students: " << Student::getCount() << endl;
delete guest;
cout << "Students: " << Student::getCount() << endl;`)
        ),
        expectedOutput: "Ana 85\nInvalid score: 120\nBudi 90\nStudents: 3\nBudi 100\nStudents: 4\nStudents: 3",
        hints: [
          "`new` runs the constructor and `delete` runs the destructor — at exactly the line where you write them.",
          "The destructor is one line: `~Student() { count--; }`",
        ],
        codeChecks: [{ pattern: String.raw`~\s*Student\s*\(\s*\)`, message: "Add a destructor: ~Student()." }],
        solution: STUDENT_5,
      },
    ],
  },
  {
    moduleFile: "3_Composition.pdf",
    title: "An Event has a Date: composition",
    intro: md(
      "Build two classes where one contains the other — an `Event` *has a* `Date` — then add a friend function and watch the order objects are built and destroyed in.",
      "",
      INTRO_TAIL
    ),
    starterCode: STARTER,
    steps: [
      {
        title: "A Date class",
        instructions: md(
          "Define a class `Date` with private `int day, month, year`, a constructor `Date(int d, int m, int y)`, and `void print() const` that prints the date as `day/month/year` — **without** a new line at the end.",
          "",
          "Put these lines in `main`:",
          code(`
Date d(17, 8, 2026);
d.print();
cout << endl;`)
        ),
        expectedOutput: "17/8/2026",
        hints: ["`cout << day << \"/\" << month << \"/\" << year;` — the new line is left to whoever calls `print`."],
        codeChecks: [
          { pattern: String.raw`class\s+Date`, message: "Define a class named Date." },
          { pattern: String.raw`void\s+print\s*\(\s*\)\s*const`, message: "Make print a const member function: void print() const." },
        ],
        solution: EVENT_1,
      },
      {
        title: "An Event has a Date",
        instructions: md(
          "Define a class `Event` with private `string name` and a `Date date` — a data member that is an object of another class. That's **composition**.",
          "",
          "Its constructor `Event(string n, int d, int m, int y)` must build the date in the **member initializer list**. Add `void print() const` that prints the name, ` on `, the date, and a new line.",
          "",
          "**Replace** the lines in `main` with:",
          code(`
Event concert("Concert", 17, 8, 2026);
concert.print();`)
        ),
        expectedOutput: "Concert on 17/8/2026",
        hints: [
          "`Date` has no default constructor, so the date can only be made in the initializer list: `: name(n), date(d, m, y)`.",
          "`Event::print` can't read the date's private members, but it can call `date.print();`",
        ],
        codeChecks: [
          { pattern: String.raw`class\s+Event`, message: "Define a class named Event." },
          { pattern: String.raw`\bDate\s+\w+\s*;`, message: "Give Event a data member of type Date." },
          { pattern: String.raw`Event\s*\([^)]*\)\s*:[^{;]*\b\w+\s*\(\s*\w+\s*,\s*\w+\s*,\s*\w+\s*\)`, message: "Build the Date member in the constructor's member initializer list: : name(n), date(d, m, y)" },
        ],
        solution: EVENT_2,
      },
      {
        title: "Postpone the event",
        instructions: md(
          "Add `void addDays(int n)` to `Date`, which adds `n` to the day (you don't need to handle the end of a month). Then add `void postpone(int days)` to `Event`, which moves its date.",
          "",
          "Add to `main`:",
          code(`
concert.postpone(3);
concert.print();`)
        ),
        expectedOutput: "Concert on 17/8/2026\nConcert on 20/8/2026",
        hints: ["`day` is private to `Date`, so `Event` can't change it directly — `postpone` asks the date to do it: `date.addDays(days);`"],
        codeChecks: [
          { pattern: String.raw`void\s+addDays\s*\(`, message: "Add void addDays(int n) to Date." },
          { pattern: String.raw`void\s+postpone\s*\(`, message: "Add void postpone(int days) to Event." },
          { pattern: String.raw`\.\s*addDays\s*\(`, message: "Let postpone call the Date's addDays." },
        ],
        solution: EVENT_3,
      },
      {
        title: "A friend function",
        instructions: md(
          "Add `bool sameAs(const Date& other) const` to `Date`: true when day, month and year are all equal.",
          "",
          "Then write a function **outside** the classes, `bool sameDay(const Event& a, const Event& b)`, that uses `a.date` and `b.date`. Those are private, so declare it a **friend** inside `Event`.",
          "",
          "Add to `main`:",
          code(`
Event meeting("Meeting", 20, 8, 2026);
Event party("Party", 21, 8, 2026);
cout << (sameDay(concert, meeting) ? "Same day" : "Different days") << endl;
cout << (sameDay(concert, party) ? "Same day" : "Different days") << endl;`)
        ),
        expectedOutput: "Concert on 17/8/2026\nConcert on 20/8/2026\nSame day\nDifferent days",
        hints: [
          "Inside `Event`: `friend bool sameDay(const Event& a, const Event& b);` — then define it after the class without the word `friend`.",
          "The body is one line: `return a.date.sameAs(b.date);`",
        ],
        codeChecks: [
          { pattern: String.raw`friend\s+bool\s+sameDay\s*\(`, message: "Declare sameDay as a friend inside Event: friend bool sameDay(const Event& a, const Event& b);" },
          { pattern: String.raw`bool\s+sameAs\s*\(`, message: "Add bool sameAs(const Date& other) const to Date." },
        ],
        solution: EVENT_4,
      },
      {
        title: "Which is built first?",
        instructions: md(
          "Make the objects announce themselves:",
          "",
          "- `Date`'s constructor prints `Date built`, and a destructor `~Date()` prints `Date destroyed`.",
          "- `Event`'s constructor prints `Event built: <name>`, and a destructor `~Event()` prints `Event destroyed: <name>`.",
          "",
          "Each on its own line. Don't change `main`. Then study the expected output: the member is built before the object that contains it, and destroyed after it."
        ),
        expectedOutput: [
          "Date built",
          "Event built: Concert",
          "Concert on 17/8/2026",
          "Concert on 20/8/2026",
          "Date built",
          "Event built: Meeting",
          "Date built",
          "Event built: Party",
          "Same day",
          "Different days",
          "Event destroyed: Party",
          "Date destroyed",
          "Event destroyed: Meeting",
          "Date destroyed",
          "Event destroyed: Concert",
          "Date destroyed",
        ].join("\n"),
        hints: [
          "Put the `cout` in the constructor's body — the `{ }` after the initializer list.",
          "The members of an object are built before its constructor's body runs, so `Date built` comes before `Event built`.",
        ],
        codeChecks: [
          { pattern: String.raw`~\s*Date\s*\(\s*\)`, message: "Add a destructor ~Date()." },
          { pattern: String.raw`~\s*Event\s*\(\s*\)`, message: "Add a destructor ~Event()." },
        ],
        solution: EVENT_5,
      },
    ],
  },
  {
    moduleFile: "4_Operator Overloading.pdf",
    title: "A Fraction class with operators",
    intro: md(
      "Build a `Fraction` class and teach C++ to use it with ordinary operators: `+`, `<<`, `==` and prefix `++`.",
      "",
      INTRO_TAIL
    ),
    starterCode: STARTER,
    steps: [
      {
        title: "A Fraction class",
        instructions: md(
          "Define a class `Fraction` with private `int num, den` (numerator and denominator), a constructor `Fraction(int n, int d)`, and `void print() const` that prints `num/den` and a new line.",
          "",
          "Put these lines in `main`:",
          code(`
Fraction a(1, 2);
Fraction b(1, 3);
a.print();
b.print();`)
        ),
        expectedOutput: "1/2\n1/3",
        hints: ["`cout << num << \"/\" << den << endl;`"],
        codeChecks: [{ pattern: String.raw`class\s+Fraction`, message: "Define a class named Fraction." }],
        solution: FRACTION_1,
      },
      {
        title: "Add with +",
        instructions: md(
          "Overload `+` as a member function: `Fraction operator+(const Fraction& other) const`. It returns a new fraction — `a/b + c/d = (a·d + c·b) / (b·d)`. Don't simplify the result.",
          "",
          "Add to `main`:",
          code(`
Fraction c = a + b;
c.print();`)
        ),
        expectedOutput: "1/2\n1/3\n5/6",
        hints: [
          "`a + b` calls `a.operator+(b)`: inside, `num` and `den` are `a`'s and `other` is `b`.",
          "`return Fraction(num * other.den + other.num * den, den * other.den);`",
        ],
        codeChecks: [{ pattern: String.raw`operator\s*\+\s*\(`, message: "Overload operator+." }],
        solution: FRACTION_2,
      },
      {
        title: "Print with <<",
        instructions: md(
          "Make `cout << f` work. Overload `<<` as a **friend** function: `ostream& operator<<(ostream& out, const Fraction& f)`. It writes `num/den` (no new line) to `out` and returns `out`.",
          "",
          "Add to `main`:",
          code(`
cout << a << " + " << b << " = " << c << endl;`)
        ),
        expectedOutput: "1/2\n1/3\n5/6\n1/2 + 1/3 = 5/6",
        hints: [
          "`<<` can't be a member of `Fraction`, because its left side is `cout`, not a fraction. That's why it's a friend: it needs `num` and `den`.",
          "Returning `out` is what lets `cout << a << \" + \" << b` keep going.",
        ],
        codeChecks: [
          { pattern: String.raw`ostream\s*&\s*operator\s*<<`, message: "Overload ostream& operator<<(ostream& out, const Fraction& f)." },
          { pattern: String.raw`friend\s+ostream`, message: "Declare operator<< as a friend inside the class." },
        ],
        solution: FRACTION_3,
      },
      {
        title: "Compare with ==",
        instructions: md(
          "Overload `==`: `bool operator==(const Fraction& other) const`. Two fractions are equal when `num · other.den == other.num · den` — so `1/2 == 2/4`.",
          "",
          "Add to `main`:",
          code(`
Fraction d(2, 4);
cout << (a == d ? "1/2 equals 2/4" : "1/2 does not equal 2/4") << endl;
cout << (a == b ? "1/2 equals 1/3" : "1/2 does not equal 1/3") << endl;`)
        ),
        expectedOutput: "1/2\n1/3\n5/6\n1/2 + 1/3 = 5/6\n1/2 equals 2/4\n1/2 does not equal 1/3",
        hints: ["Comparing `num` and `den` directly would say `1/2` and `2/4` are different — cross-multiply instead."],
        codeChecks: [{ pattern: String.raw`operator\s*==\s*\(`, message: "Overload operator==." }],
        solution: FRACTION_4,
      },
      {
        title: "Prefix ++",
        instructions: md(
          "Overload prefix `++` to add 1 to the fraction: `Fraction& operator++()`. Adding 1 to `num/den` gives `(num + den)/den`. Return the object itself.",
          "",
          "Add to `main`:",
          code(`
++a;
cout << a << endl;
cout << ++(++b) << endl;`)
        ),
        expectedOutput: "1/2\n1/3\n5/6\n1/2 + 1/3 = 5/6\n1/2 equals 2/4\n1/2 does not equal 1/3\n3/2\n7/3",
        hints: [
          "Prefix `++` has no parameter (the postfix version is the one with a dummy `int`).",
          "`num += den; return *this;` — returning a reference is why `++(++b)` adds 2 to `b` itself.",
        ],
        codeChecks: [{ pattern: String.raw`Fraction\s*&\s*operator\s*\+\+\s*\(\s*\)`, message: "Overload prefix ++ returning a reference: Fraction& operator++()." }],
        solution: FRACTION_5,
      },
    ],
  },
  {
    moduleFile: "5_Inheritance.pdf",
    title: "Employees, Managers and Directors: inheritance",
    intro: md(
      "Build a small class hierarchy — `Employee`, then `Manager` derived from it, then `Director` derived from that — and see which constructors and destructors run, in what order.",
      "",
      INTRO_TAIL
    ),
    starterCode: STARTER,
    steps: [
      {
        title: "The base class",
        instructions: md(
          "Define a class `Employee` with **protected** data members `string name` and `int salary`, a constructor `Employee(string n, int s)`, and `void describe() const` that prints `<name> earns <salary>` and a new line.",
          "",
          "Put these lines in `main`:",
          code(`
Employee sari("Sari", 5000);
sari.describe();`)
        ),
        expectedOutput: "Sari earns 5000",
        hints: ["`protected` is like `private` for everyone outside, but classes derived from `Employee` will be able to use the members."],
        codeChecks: [
          { pattern: String.raw`class\s+Employee`, message: "Define a class named Employee." },
          { pattern: String.raw`protected\s*:`, message: "Put name and salary under protected:." },
        ],
        solution: STAFF_1,
      },
      {
        title: "Derive Manager",
        instructions: md(
          "Define `class Manager : public Employee` with a private `int teamSize`. Its constructor `Manager(string n, int s, int t)` passes the name and salary to the **base class constructor** in its initializer list.",
          "",
          "Give `Manager` its own `void describe() const` that first calls `Employee`'s version, then prints `Manages <teamSize> people` and a new line.",
          "",
          "Add to `main`:",
          code(`
Manager joko("Joko", 8000, 4);
joko.describe();`)
        ),
        expectedOutput: "Sari earns 5000\nJoko earns 8000\nManages 4 people",
        hints: [
          "The base part is built first, by name: `Manager(string n, int s, int t) : Employee(n, s), teamSize(t) {}`",
          "Inside `Manager::describe`, write `Employee::describe();` — just `describe();` would call itself forever.",
        ],
        codeChecks: [
          { pattern: String.raw`class\s+Manager\s*:\s*public\s+Employee`, message: "Derive Manager publicly from Employee: class Manager : public Employee" },
          { pattern: String.raw`:\s*Employee\s*\(`, message: "Call the base class constructor in the initializer list: : Employee(n, s), teamSize(t)" },
          { pattern: String.raw`Employee\s*::\s*describe\s*\(\s*\)`, message: "Reuse the base version: call Employee::describe(); inside Manager's describe." },
        ],
        solution: STAFF_2,
      },
      {
        title: "A bonus uses protected data",
        instructions: md(
          "Add `void addBonus(int amount)` to `Manager` that adds `amount` to the salary. `salary` belongs to the `Employee` part, but it is **protected**, so `Manager` may change it directly.",
          "",
          "Add to `main`:",
          code(`
joko.addBonus(1000);
joko.describe();`)
        ),
        expectedOutput: "Sari earns 5000\nJoko earns 8000\nManages 4 people\nJoko earns 9000\nManages 4 people",
        hints: ["`salary += amount;` — try making `salary` private for a moment and read the compiler's error."],
        codeChecks: [{ pattern: String.raw`void\s+addBonus\s*\(\s*int`, message: "Add void addBonus(int amount) to Manager." }],
        solution: STAFF_3,
      },
      {
        title: "Constructor and destructor order",
        instructions: md(
          "Make every constructor and destructor announce itself, each on its own line:",
          "",
          "- `Employee`'s constructor prints `Employee() for <name>`; add `~Employee()` printing `~Employee() for <name>`.",
          "- `Manager`'s constructor prints `Manager() for <name>`; add `~Manager()` printing `~Manager() for <name>`.",
          "",
          "Don't change `main`. Which part of `joko` is built first, and which is destroyed first?"
        ),
        expectedOutput: [
          "Employee() for Sari",
          "Sari earns 5000",
          "Employee() for Joko",
          "Manager() for Joko",
          "Joko earns 8000",
          "Manages 4 people",
          "Joko earns 9000",
          "Manages 4 people",
          "~Manager() for Joko",
          "~Employee() for Joko",
          "~Employee() for Sari",
        ].join("\n"),
        hints: [
          "`Manager` can print `name` because it is protected in `Employee`.",
          "The base part is built first and destroyed last — like the walls of a house: up first, down last.",
        ],
        codeChecks: [
          { pattern: String.raw`~\s*Employee\s*\(\s*\)`, message: "Add a destructor ~Employee()." },
          { pattern: String.raw`~\s*Manager\s*\(\s*\)`, message: "Add a destructor ~Manager()." },
        ],
        solution: STAFF_4,
      },
      {
        title: "Three levels: Director",
        instructions: md(
          "Add `class Director : public Manager` with a private `string division`. Its constructor `Director(string n, int s, int t, string d)` passes the first three to `Manager`'s constructor and prints `Director() for <name>`; its destructor prints `~Director() for <name>`.",
          "",
          "Its `describe() const` calls `Manager`'s version, then prints `Leads the <division> division`.",
          "",
          "Add to `main`:",
          code(`
Director rina("Rina", 12000, 20, "Engineering");
rina.describe();`)
        ),
        expectedOutput: [
          "Employee() for Sari",
          "Sari earns 5000",
          "Employee() for Joko",
          "Manager() for Joko",
          "Joko earns 8000",
          "Manages 4 people",
          "Joko earns 9000",
          "Manages 4 people",
          "Employee() for Rina",
          "Manager() for Rina",
          "Director() for Rina",
          "Rina earns 12000",
          "Manages 20 people",
          "Leads the Engineering division",
          "~Director() for Rina",
          "~Manager() for Rina",
          "~Employee() for Rina",
          "~Manager() for Joko",
          "~Employee() for Joko",
          "~Employee() for Sari",
        ].join("\n"),
        hints: [
          "`Director` only calls `Manager`'s constructor — `Manager` calls `Employee`'s. Each class builds the level directly below it.",
          "`Director(string n, int s, int t, string d) : Manager(n, s, t), division(d) { ... }`",
        ],
        codeChecks: [
          { pattern: String.raw`class\s+Director\s*:\s*public\s+Manager`, message: "Derive Director publicly from Manager: class Director : public Manager" },
          { pattern: String.raw`Manager\s*::\s*describe\s*\(\s*\)`, message: "Reuse Manager's version: call Manager::describe(); inside Director's describe." },
        ],
        solution: STAFF_5,
      },
    ],
  },
];
