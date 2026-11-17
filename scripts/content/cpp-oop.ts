/**
 * Exercises for the C++ object-oriented programming course: one quiz per
 * module. Every program in here is compiled and run by scripts/check-cpp.ts,
 * which compares what it prints with the answer written next to it — so an
 * answer key can't drift from the code it belongs to.
 *
 * The questions are written for this course; none is taken from the slides.
 */

/** Put in front of every program that doesn't bring its own includes. */
export const PRELUDE = "#include <iostream>\n#include <string>\nusing namespace std;\n\n";

type Base = { points: number; explanation: string };

export type CppQuestion =
  /** Concept check. `program` + `prints`, when given, back the claim the answer makes. */
  | (Base & { kind: "choice"; prompt: string; options: string[]; answer: "A" | "B" | "C" | "D"; program?: string; prints?: string })
  /** "What does this print?" — the answer is whatever the program really prints. */
  | (Base & { kind: "output"; prompt?: string; program: string; prints: string })
  /** One wrong line. `fix` replaces it; `harness` is appended so the class can be compiled and run. */
  | (Base & { kind: "mistake"; prompt: string; lines: string[]; wrongIndex: number; fix: string; harness?: string; prints?: string })
  /** A program to write, marked by the tutor. `files` is the model solution; `prints` its one line of output. */
  | (Base & { kind: "write"; prompt: string; files: Record<string, string>; prints: string; rubric: { point: string; marks: number }[] });

export type CppExercise = { moduleFile: string; title: string; questions: CppQuestion[] };

const OUTPUT_PROMPT = "What does this program print? Type the output exactly as it appears on screen.";
export const outputPrompt = (q: { prompt?: string }) => q.prompt ?? OUTPUT_PROMPT;

export const CPP_EXERCISES: CppExercise[] = [
  // ───────────────────────────────────────────────────────────── Module 1
  {
    moduleFile: "1_Intro to Classes.pdf",
    title: "Exercise 1 — Classes, Constructors and Destructors",
    questions: [
      {
        kind: "choice",
        points: 1,
        prompt: "In a C++ class, members declared before any access specifier (public, private, protected) are:",
        options: ["public", "private", "protected", "not allowed — the class will not compile"],
        answer: "B",
        explanation: "Members of a class are private by default. (For a struct the default is public.)",
      },
      {
        kind: "choice",
        points: 1,
        prompt: "Which statement about constructors is correct?",
        options: [
          "A constructor has the same name as the class and no return type, not even void",
          "A constructor must be called explicitly after the object is declared",
          "A class can have only one constructor",
          "A constructor must return the object it has just built",
        ],
        answer: "A",
        explanation:
          "A constructor is named after its class, has no return type, and runs automatically when an object is created. A class may overload several constructors.",
      },
      {
        kind: "choice",
        points: 1,
        prompt: "When is the destructor of a local (non-static) object called?",
        options: [
          "When the program starts",
          "Only when the programmer calls it by name",
          "When the object goes out of scope",
          "Immediately after its constructor finishes",
        ],
        answer: "C",
        explanation: "A destructor is called implicitly when the object is destroyed — for a local object, when execution leaves the block it was declared in.",
      },
      {
        kind: "choice",
        points: 1,
        prompt: "What does marking a single-argument constructor as explicit do?",
        options: [
          "It makes the constructor public",
          "It stops the compiler using that constructor for implicit type conversions",
          "It forces every object to be created with new",
          "It lets the constructor be called without any arguments",
        ],
        answer: "B",
        explanation:
          "Without explicit, a one-argument constructor doubles as a conversion: the compiler may quietly turn an int into an object. explicit forbids that, so the conversion has to be written out.",
      },
      {
        kind: "output",
        points: 2,
        program: `class Box {
public:
    Box(int w = 2, int h = 3) : width(w), height(h) {}
    int area() { return width * height; }
private:
    int width;
    int height;
};

int main() {
    Box a;
    Box b(5);
    Box c(4, 6);
    cout << a.area() << " " << b.area() << " " << c.area() << endl;
    return 0;
}`,
        prints: "6 15 24",
        explanation: "Default arguments fill in whatever is missing from the right: a is 2×3, b is 5×3, c is 4×6.",
      },
      {
        kind: "output",
        points: 2,
        program: `class Tracer {
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
        prints: "C1C2D2C3|D3D1",
        explanation:
          "b lives only inside the inner braces, so it is destroyed there (D2). At the end of main the remaining objects are destroyed in the reverse of the order they were created: c, then a.",
      },
      {
        kind: "mistake",
        points: 2,
        prompt: "This program does not compile. Which line causes the error?",
        lines: [
          "class Account {",
          "public:",
          "    Account(double b) : balance(b) {}",
          "    double getBalance() { return balance; }",
          "private:",
          "    double balance;",
          "};",
          "int main() {",
          "    Account acc(100.0);",
          "    cout << acc.balance << endl;",
          "    return 0;",
          "}",
        ],
        wrongIndex: 9,
        fix: "    cout << acc.getBalance() << endl;",
        prints: "100",
        explanation: "balance is private, so main cannot touch it. Code outside the class has to go through the public member function: acc.getBalance().",
      },
      {
        kind: "write",
        points: 6,
        prompt: `Write a class Rectangle.

• Private data members length and width, both double.
• A constructor taking length and width, each with a default argument of 1.0. Use a member initializer list.
• setLength and setWidth, which store the new value only if it is greater than 0 and otherwise leave the member unchanged.
• area() and perimeter(), each returning a double.

Run your class with the main below, then paste your whole program as your working and give the line it prints as your final answer.
\`\`\`cpp
int main() {
    Rectangle r(4, 6);
    r.setWidth(-2);
    r.setLength(5);
    cout << r.area() << " " << r.perimeter() << endl;
    return 0;
}
\`\`\``,
        files: {
          "main.cpp": `class Rectangle {
public:
    Rectangle(double l = 1.0, double w = 1.0) : length(l), width(w) {}

    void setLength(double l) {
        if (l > 0) length = l;
    }
    void setWidth(double w) {
        if (w > 0) width = w;
    }

    double area() { return length * width; }
    double perimeter() { return 2 * (length + width); }

private:
    double length;
    double width;
};

int main() {
    Rectangle r(4, 6);
    r.setWidth(-2);
    r.setLength(5);
    cout << r.area() << " " << r.perimeter() << endl;
    return 0;
}`,
        },
        prints: "30 22",
        rubric: [
          { point: "Data members are private; member functions are public", marks: 1 },
          { point: "Constructor has default arguments and uses a member initializer list", marks: 2 },
          { point: "Setters reject values that are not greater than 0 and leave the member unchanged", marks: 1 },
          { point: "area() and perimeter() are correct", marks: 1 },
        ],
        explanation: "setWidth(-2) is rejected, so the width stays 6; the length becomes 5. Area 5×6 = 30, perimeter 2×(5+6) = 22.",
      },
      {
        kind: "write",
        points: 7,
        prompt: `Write a class Student and use an array of its objects.

• Private data members name (string) and mark (int).
• A default constructor that sets name to "none" and mark to 0.
• setData(string, int), which sets both members, and getMark(), which returns the mark.
• Outside the class, write a function double average(Student list[], int size) that returns the average mark.

Run your code with the main below, then paste your whole program as your working and give the line it prints as your final answer.
\`\`\`cpp
int main() {
    Student group[4];
    group[0].setData("Aina", 72);
    group[1].setData("Ben", 85);
    group[2].setData("Chong", 90);
    cout << average(group, 4) << endl;
    return 0;
}
\`\`\``,
        files: {
          "main.cpp": `class Student {
public:
    Student() : name("none"), mark(0) {}

    void setData(string n, int m) {
        name = n;
        mark = m;
    }
    int getMark() { return mark; }

private:
    string name;
    int mark;
};

double average(Student list[], int size) {
    double total = 0;
    for (int i = 0; i < size; i++)
        total += list[i].getMark();
    return total / size;
}

int main() {
    Student group[4];
    group[0].setData("Aina", 72);
    group[1].setData("Ben", 85);
    group[2].setData("Chong", 90);
    cout << average(group, 4) << endl;
    return 0;
}`,
        },
        prints: "61.75",
        rubric: [
          { point: "Default constructor sets name to \"none\" and mark to 0", marks: 2 },
          { point: "setData and getMark are public and correct; data members are private", marks: 1 },
          { point: "average() loops over the array and reads marks through getMark()", marks: 2 },
          { point: "The division is done in double, not integer, arithmetic", marks: 1 },
        ],
        explanation:
          "The array holds four objects, and the default constructor runs for all of them — so group[3], never given data, still counts with a mark of 0. (72 + 85 + 90 + 0) ÷ 4 = 61.75.",
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── Module 2
  {
    moduleFile: "2_Classes Interface and Implementation.pdf",
    title: "Exercise 2 — Interface, const, static and Dynamic Memory",
    questions: [
      {
        kind: "choice",
        points: 1,
        prompt: "A class Time is split into Time.h and Time.cpp. What normally goes in Time.h?",
        options: [
          "The main function",
          "The bodies of all the member functions",
          "The class definition, with the prototypes of its member functions",
          "Nothing — a header file is optional documentation",
        ],
        answer: "C",
        explanation: "The header is the interface: the class definition and its function prototypes. The function bodies go in Time.cpp, hidden from client code.",
      },
      {
        kind: "choice",
        points: 1,
        prompt: "A member function is declared as  int getHour() const;  What does the const promise?",
        options: [
          "The function returns a constant",
          "The function does not modify the object it is called on",
          "The function can only be called once",
          "The function can only be called on const objects",
        ],
        answer: "B",
        explanation: "A const member function may not change the object's data members. It can be called on both const and non-const objects; a const object can call only const member functions.",
      },
      {
        kind: "choice",
        points: 1,
        prompt: "A class has a static data member count. Ten objects of the class are created. How many copies of count exist?",
        options: ["Ten — one per object", "One, shared by all the objects", "None until a member function is called", "Eleven"],
        answer: "B",
        explanation: "A static data member belongs to the class, not to any one object, so there is exactly one copy however many objects exist.",
      },
      {
        kind: "choice",
        points: 1,
        prompt: "Inside a non-static member function, what is this?",
        options: [
          "A copy of the object",
          "A reference to the class",
          "A pointer to the object the function was called on",
          "A pointer to the first data member",
        ],
        answer: "C",
        explanation: "this holds the address of the object the member function is working on, which is why *this is the object itself.",
      },
      {
        kind: "choice",
        points: 1,
        prompt: "Memory was allocated with  int* data = new int[20];  Which statement releases it correctly?",
        options: ["delete data;", "delete[] data;", "free(data);", "data = 0;"],
        answer: "B",
        explanation: "Memory from new[] must be released with delete[]. Setting the pointer to 0 only loses the address — the memory is leaked.",
      },
      {
        kind: "output",
        points: 2,
        program: `class Item {
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
        prints: "3 2",
        explanation: "Every constructor adds one to the shared counter and every destructor takes one away. c is destroyed at the closing brace, before the second cout.",
      },
      {
        kind: "output",
        points: 2,
        program: `class Counter {
public:
    Counter() : value(0) {}
    Counter& add(int n) {
        value += n;
        return *this;
    }
    int get() const { return value; }
private:
    int value;
};

int main() {
    Counter c;
    c.add(5).add(10).add(-3);
    cout << c.get() << endl;
    return 0;
}`,
        prints: "12",
        explanation: "add returns *this by reference, so each call in the chain works on the same object c: 0 + 5 + 10 − 3.",
      },
      {
        kind: "output",
        points: 2,
        program: `int main() {
    int* p = new int(7);
    int* q = p;
    *q = 20;
    cout << *p << endl;
    delete p;
    return 0;
}`,
        prints: "20",
        explanation: "q = p copies the address, not the int. Both pointers refer to the same piece of memory, so writing through q changes what p sees.",
      },
      {
        kind: "mistake",
        points: 2,
        prompt: "This class does not compile. Which line causes the error?",
        lines: [
          "class Clock {",
          "public:",
          "    Clock(int h) : hour(h) {}",
          "    int getHour() const { return hour; }",
          "    void tick() const { hour = hour + 1; }",
          "private:",
          "    int hour;",
          "};",
        ],
        wrongIndex: 4,
        fix: "    void tick() { hour = hour + 1; }",
        harness: "int main() {\n    Clock c(1);\n    c.tick();\n    cout << c.getHour() << endl;\n    return 0;\n}",
        prints: "2",
        explanation: "tick changes hour, so it cannot be a const member function. Remove const from tick; getHour only reads, so its const is correct.",
      },
      {
        kind: "write",
        points: 7,
        prompt: `Write a class Circle split across three files.

• Circle.h — the class definition, protected by an include guard. Private data member radius (double). Prototypes for a constructor Circle(double r = 1.0), setRadius, getRadius, and area. Mark every function that does not change the object as const.
• Circle.cpp — the definitions of the member functions, written with the scope resolution operator. setRadius stores the value only if it is greater than 0. Use 3.14 for pi.
• main.cpp — the main below.

Compile and run the three files together, then paste all three as your working (say which file each part is) and give the line the program prints as your final answer.
\`\`\`cpp
#include <iostream>
#include "Circle.h"
using namespace std;

int main() {
    Circle c(2);
    c.setRadius(-5);
    cout << c.area() << endl;
    c.setRadius(10);
    cout << c.getRadius() << endl;
    return 0;
}
\`\`\`
For the final answer, give the two lines separated by a single space.`,
        files: {
          "Circle.h": `#ifndef CIRCLE_H
#define CIRCLE_H

class Circle {
public:
    Circle(double r = 1.0);
    void setRadius(double r);
    double getRadius() const;
    double area() const;

private:
    double radius;
};

#endif`,
          "Circle.cpp": `#include "Circle.h"

Circle::Circle(double r) : radius(1.0) {
    setRadius(r);
}

void Circle::setRadius(double r) {
    if (r > 0) radius = r;
}

double Circle::getRadius() const {
    return radius;
}

double Circle::area() const {
    return 3.14 * radius * radius;
}`,
          "main.cpp": `#include <iostream>
#include "Circle.h"
using namespace std;

int main() {
    Circle c(2);
    c.setRadius(-5);
    cout << c.area() << endl;
    c.setRadius(10);
    cout << c.getRadius() << endl;
    return 0;
}`,
        },
        prints: "12.56 10",
        rubric: [
          { point: "Circle.h holds only the class definition and prototypes, inside an include guard", marks: 2 },
          { point: "Circle.cpp includes Circle.h and defines every member with Circle::", marks: 2 },
          { point: "getRadius and area are const; setRadius is not", marks: 1 },
          { point: "setRadius ignores values that are not greater than 0", marks: 1 },
        ],
        explanation:
          "setRadius(-5) is ignored, so the area is 3.14 × 2 × 2 = 12.56. The default argument is written once, in the prototype in Circle.h, and not repeated in Circle.cpp.",
      },
      {
        kind: "write",
        points: 7,
        prompt: `Write a class IntList that manages its own dynamic array.

• Private data members: int* data and int size.
• A constructor IntList(int n) that allocates an array of n ints with new and sets every element to 0.
• A destructor that releases the array.
• void set(int index, int value) and int get(int index) const. Both must do nothing harmful when index is out of range: set ignores the call, get returns 0.
• int sum() const, returning the total of all elements.

Run your class with the main below, then paste your whole program as your working and give the line it prints as your final answer.
\`\`\`cpp
int main() {
    IntList list(5);
    list.set(0, 4);
    list.set(2, 9);
    list.set(4, 7);
    list.set(5, 100);
    cout << list.sum() << " " << list.get(2) << " " << list.get(9) << endl;
    return 0;
}
\`\`\``,
        files: {
          "main.cpp": `class IntList {
public:
    IntList(int n) : data(new int[n]), size(n) {
        for (int i = 0; i < size; i++)
            data[i] = 0;
    }

    ~IntList() {
        delete[] data;
    }

    void set(int index, int value) {
        if (index >= 0 && index < size) data[index] = value;
    }

    int get(int index) const {
        if (index >= 0 && index < size) return data[index];
        return 0;
    }

    int sum() const {
        int total = 0;
        for (int i = 0; i < size; i++)
            total += data[i];
        return total;
    }

private:
    int* data;
    int size;
};

int main() {
    IntList list(5);
    list.set(0, 4);
    list.set(2, 9);
    list.set(4, 7);
    list.set(5, 100);
    cout << list.sum() << " " << list.get(2) << " " << list.get(9) << endl;
    return 0;
}`,
        },
        prints: "20 9 0",
        rubric: [
          { point: "Constructor allocates with new int[n] and zeroes every element", marks: 2 },
          { point: "Destructor releases the array with delete[] (not delete)", marks: 2 },
          { point: "set and get check the index against 0 and size", marks: 1 },
          { point: "get and sum are const and correct", marks: 1 },
        ],
        explanation: "Index 5 is outside a 5-element array (valid indices are 0 to 4), so set(5, 100) is ignored. 4 + 9 + 7 = 20, and get(9) is out of range, so it returns 0.",
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── Module 3
  {
    moduleFile: "3_Composition.pdf",
    title: "Exercise 3 — Composition, friend and Proxy Classes",
    questions: [
      {
        kind: "choice",
        points: 1,
        prompt: "Which pair is best modelled with composition?",
        options: ["A Car and its Engine", "A Car and a Vehicle", "A Student and a Person", "A Circle and a Shape"],
        answer: "A",
        explanation: "Composition is the “has-a” relationship: a car has an engine. The other three are “is-a” relationships, which call for inheritance.",
      },
      {
        kind: "choice",
        points: 1,
        prompt: "A class Car has a data member of class Engine. When a Car object is created, in what order do the constructors run?",
        options: [
          "Car's constructor body, then Engine's constructor",
          "Engine's constructor, then Car's constructor body",
          "Only Car's constructor runs",
          "The order is not defined",
        ],
        answer: "B",
        explanation: "Member objects are constructed before the body of the enclosing class's constructor runs. Destruction happens in the reverse order.",
      },
      {
        kind: "choice",
        points: 1,
        prompt: "Which statement about a friend function of a class is correct?",
        options: [
          "It is a member function of the class",
          "It is called with the dot operator on an object of the class",
          "It is not a member, but it can access the class's private members",
          "It can access only the public members of the class",
        ],
        answer: "C",
        explanation: "A friend function is defined outside the class and called like an ordinary function, yet the class grants it access to its private and protected members.",
      },
      {
        kind: "choice",
        points: 1,
        prompt: "Class A declares class B as a friend. Which statement is true?",
        options: [
          "A can also access the private members of B",
          "B can access the private members of A, but A gets no access to B",
          "Every class derived from B becomes a friend of A as well",
          "A and B must be defined in the same file",
        ],
        answer: "B",
        explanation: "Friendship is granted, not taken, and it runs one way only. It is not symmetric and it is not inherited.",
      },
      {
        kind: "choice",
        points: 1,
        prompt: "What is the main purpose of a proxy class?",
        options: [
          "To make a program run faster",
          "To hide a class's private data and implementation details from client code",
          "To let two classes share their static members",
          "To replace the need for constructors",
        ],
        answer: "B",
        explanation:
          "A proxy class exposes only the public interface and forwards the calls to the real class, so clients never see the private members or the implementation.",
      },
      {
        kind: "output",
        points: 2,
        program: `class Engine {
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
        prints: "EC|ce",
        explanation: "The member object is built first (E), then the Car body runs (C). Destruction is the mirror image: Car's destructor (c), then the member's (e).",
      },
      {
        kind: "output",
        points: 2,
        program: `class Point {
public:
    Point(int a, int b) : x(a), y(b) {}
    int getX() const { return x; }
    int getY() const { return y; }
private:
    int x;
    int y;
};

class Line {
public:
    Line(int x1, int y1, int x2, int y2) : start(x1, y1), end(x2, y2) {}
    int dx() const { return end.getX() - start.getX(); }
    int dy() const { return end.getY() - start.getY(); }
private:
    Point start;
    Point end;
};

int main() {
    Line line(1, 2, 6, 10);
    cout << line.dx() << " " << line.dy() << endl;
    return 0;
}`,
        prints: "5 8",
        explanation: "Line's member initializer list passes the arguments on to the two Point members. dx is 6 − 1 and dy is 10 − 2.",
      },
      {
        kind: "output",
        points: 2,
        program: `class Wallet {
    friend void spend(Wallet& w, int amount);
public:
    Wallet(int m) : money(m) {}
    int getMoney() const { return money; }
private:
    int money;
};

void spend(Wallet& w, int amount) {
    w.money -= amount;
}

int main() {
    Wallet w(50);
    spend(w, 15);
    spend(w, 5);
    cout << w.getMoney() << endl;
    return 0;
}`,
        prints: "30",
        explanation: "spend is a friend, so it may change the private member money directly. The wallet is passed by reference, so the changes stick: 50 − 15 − 5.",
      },
      {
        kind: "mistake",
        points: 2,
        prompt: "This program does not compile. Which line causes the error?",
        lines: [
          "class Date {",
          "public:",
          "    Date(int d, int m) : day(d), month(m) {}",
          "private:",
          "    int day, month;",
          "};",
          "class Event {",
          "public:",
          "    Event(int d, int m) { when = Date(d, m); }",
          "private:",
          "    Date when;",
          "};",
        ],
        wrongIndex: 8,
        fix: "    Event(int d, int m) : when(d, m) {}",
        harness: "int main() {\n    Event e(1, 2);\n    cout << \"ok\" << endl;\n    return 0;\n}",
        prints: "ok",
        explanation:
          "Date has no default constructor, so the member when cannot be created before the constructor body runs. A member object like this must be built in the member initializer list: Event(int d, int m) : when(d, m) {}",
      },
      {
        kind: "write",
        points: 7,
        prompt: `Use composition to model a book and its author.

• class Author — private name (string) and birthYear (int); a constructor taking both; getName() const.
• class Book — private title (string), price (double) and an Author object as a data member. Its constructor takes the title, the price, the author's name and the author's birth year, and builds the Author member in the member initializer list.
• Book::print() const prints  title by name  followed by a newline.
• Book::discount(double percent) reduces the price by that percentage; getPrice() const returns the price.

Run your classes with the main below, then paste your whole program as your working and give the two lines it prints, separated by a single space, as your final answer.
\`\`\`cpp
int main() {
    Book b("Dune", 80.0, "Herbert", 1920);
    b.discount(25);
    b.print();
    cout << b.getPrice() << endl;
    return 0;
}
\`\`\``,
        files: {
          "main.cpp": `class Author {
public:
    Author(string n, int y) : name(n), birthYear(y) {}
    string getName() const { return name; }

private:
    string name;
    int birthYear;
};

class Book {
public:
    Book(string t, double p, string authorName, int authorYear)
        : title(t), price(p), author(authorName, authorYear) {}

    void print() const {
        cout << title << " by " << author.getName() << endl;
    }
    void discount(double percent) {
        price = price - price * percent / 100;
    }
    double getPrice() const { return price; }

private:
    string title;
    double price;
    Author author;
};

int main() {
    Book b("Dune", 80.0, "Herbert", 1920);
    b.discount(25);
    b.print();
    cout << b.getPrice() << endl;
    return 0;
}`,
        },
        prints: "Dune by Herbert 60",
        rubric: [
          { point: "Book holds an Author object as a data member (composition, not inheritance)", marks: 2 },
          { point: "The Author member is built in Book's member initializer list", marks: 2 },
          { point: "print() reaches the author's name through getName(), not the private member", marks: 1 },
          { point: "discount() and the const functions are correct", marks: 1 },
        ],
        explanation: "Author has no default constructor, so Book must build it in the initializer list. 25% off 80 is 60.",
      },
      {
        kind: "write",
        points: 6,
        prompt: `Write a class Vector2D with a friend function.

• Private data members x and y (int) and a constructor taking both.
• A friend function int dot(const Vector2D& a, const Vector2D& b) that returns a.x × b.x + a.y × b.y, reading the private members directly.
• A friend function bool perpendicular(const Vector2D& a, const Vector2D& b) that returns true when the dot product is 0.

Neither function is a member of the class. Run your code with the main below, then paste your whole program as your working and give the line it prints as your final answer.
\`\`\`cpp
int main() {
    Vector2D a(3, 4), b(2, -5), c(4, -3);
    cout << dot(a, b) << " " << perpendicular(a, b) << " " << perpendicular(a, c) << endl;
    return 0;
}
\`\`\``,
        files: {
          "main.cpp": `class Vector2D {
    friend int dot(const Vector2D& a, const Vector2D& b);
    friend bool perpendicular(const Vector2D& a, const Vector2D& b);

public:
    Vector2D(int a, int b) : x(a), y(b) {}

private:
    int x;
    int y;
};

int dot(const Vector2D& a, const Vector2D& b) {
    return a.x * b.x + a.y * b.y;
}

bool perpendicular(const Vector2D& a, const Vector2D& b) {
    return dot(a, b) == 0;
}

int main() {
    Vector2D a(3, 4), b(2, -5), c(4, -3);
    cout << dot(a, b) << " " << perpendicular(a, b) << " " << perpendicular(a, c) << endl;
    return 0;
}`,
        },
        prints: "-14 0 1",
        rubric: [
          { point: "Both functions are declared friend inside the class", marks: 2 },
          { point: "Both are defined outside the class without Vector2D:: and without the friend keyword", marks: 2 },
          { point: "dot and perpendicular give the right results", marks: 1 },
        ],
        explanation: "3×2 + 4×(−5) = −14, which is not 0. For a and c: 3×4 + 4×(−3) = 0, so they are perpendicular. A bool prints as 0 or 1.",
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── Module 4
  {
    moduleFile: "4_Operator Overloading.pdf",
    title: "Exercise 4 — Operator Overloading",
    questions: [
      {
        kind: "choice",
        points: 1,
        prompt: "Which of these operators can NOT be overloaded in C++?",
        options: ["+", "<<", "::", "=="],
        answer: "C",
        explanation: "The scope resolution operator :: cannot be overloaded. Neither can the member access operator (.), the conditional operator (?:) or sizeof.",
      },
      {
        kind: "choice",
        points: 1,
        prompt: "Which statement about operator overloading is true?",
        options: [
          "You can create brand-new operators such as **",
          "You can change how many operands an operator takes",
          "You can change the precedence of an operator",
          "You can define what an existing operator does when used with objects of your class",
        ],
        answer: "D",
        explanation: "Overloading gives an existing operator a meaning for your class. Its number of operands, precedence and associativity stay exactly as they are.",
      },
      {
        kind: "choice",
        points: 1,
        prompt: "Why is operator<< for printing an object usually written as a non-member (often friend) function?",
        options: [
          "Because member functions cannot return a value",
          "Because the left operand is an ostream such as cout, not an object of your class",
          "Because friend functions run faster",
          "Because operator<< can never be overloaded as anything else",
        ],
        answer: "B",
        explanation:
          "For a member operator the left operand must be an object of the class. In cout << obj the left operand is cout, so the function has to be a non-member; making it a friend lets it read the private data.",
      },
      {
        kind: "choice",
        points: 1,
        prompt: "How does the compiler tell an overloaded postfix ++ from the prefix ++?",
        options: [
          "The postfix version takes a dummy int parameter",
          "The postfix version must be declared static",
          "The postfix version has a different name",
          "It cannot — only one of the two may be overloaded",
        ],
        answer: "A",
        explanation: "operator++() is the prefix form and operator++(int) the postfix form. The int is never used; it only makes the two signatures different.",
      },
      {
        kind: "output",
        points: 2,
        program: `class Vec {
public:
    Vec(int a = 0, int b = 0) : x(a), y(b) {}
    Vec operator+(const Vec& other) const {
        return Vec(x + other.x, y + other.y);
    }
    void print() const { cout << "(" << x << "," << y << ")" << endl; }
private:
    int x;
    int y;
};

int main() {
    Vec a(1, 2), b(3, 4);
    Vec c = a + b + a;
    c.print();
    return 0;
}`,
        prints: "(5,8)",
        explanation: "a + b gives (4,6); adding a again gives (5,8). Each + builds and returns a new Vec, leaving a and b untouched.",
      },
      {
        kind: "output",
        points: 2,
        program: `class Count {
public:
    Count(int v) : value(v) {}
    Count& operator++() {
        ++value;
        return *this;
    }
    Count operator++(int) {
        Count old(*this);
        ++value;
        return old;
    }
    int get() const { return value; }
private:
    int value;
};

int main() {
    Count c(5);
    Count a = c++;
    Count b = ++c;
    cout << a.get() << " " << b.get() << " " << c.get() << endl;
    return 0;
}`,
        prints: "5 7 7",
        explanation: "The postfix form returns a copy of the old value, so a is 5 while c becomes 6. The prefix form increments first and returns the object itself, so b and c are both 7.",
      },
      {
        kind: "output",
        points: 2,
        program: `class Fraction {
    friend ostream& operator<<(ostream& out, const Fraction& f);
public:
    Fraction(int n, int d) : num(n), den(d) {}
private:
    int num;
    int den;
};

ostream& operator<<(ostream& out, const Fraction& f) {
    out << f.num << "/" << f.den;
    return out;
}

int main() {
    Fraction a(1, 2), b(3, 4);
    cout << a << " and " << b << endl;
    return 0;
}`,
        prints: "1/2 and 3/4",
        explanation: "operator<< returns the stream it was given, which is what lets several << be chained in one statement.",
      },
      {
        kind: "mistake",
        points: 2,
        prompt: "operator+ should return the sum of two Money objects without changing either of them. The class does not compile. Which line is wrong?",
        lines: [
          "class Money {",
          "public:",
          "    Money(int r = 0) : ringgit(r) {}",
          "    Money operator+(const Money& other) const {",
          "        Money result;",
          "        ringgit = ringgit + other.ringgit;",
          "        return result;",
          "    }",
          "    int get() const { return ringgit; }",
          "private:",
          "    int ringgit;",
          "};",
        ],
        wrongIndex: 5,
        fix: "        result.ringgit = ringgit + other.ringgit;",
        harness: "int main() {\n    Money a(5), b(7);\n    cout << (a + b).get() << endl;\n    return 0;\n}",
        prints: "12",
        explanation:
          "The line assigns to the object's own ringgit, which a const member function is not allowed to do — and it would leave result at 0 anyway. The sum belongs in the new object: result.ringgit = ringgit + other.ringgit;",
      },
      {
        kind: "write",
        points: 8,
        prompt: `Write a class Fraction with overloaded operators.

• Private data members num and den (int) and a constructor taking both.
• operator+ as a member function. Add with a common denominator: a/b + c/d = (a×d + c×b)/(b×d). You do not need to simplify the result.
• operator== as a member function. Two fractions are equal when they have the same value, so 1/2 == 2/4 is true (compare by cross-multiplying).
• operator<< as a friend function, printing the fraction as num/den.

Run your class with the main below, then paste your whole program as your working and give the line it prints as your final answer.
\`\`\`cpp
int main() {
    Fraction a(1, 2), b(1, 3), c(2, 4);
    cout << a + b << " " << (a == c) << " " << (a == b) << endl;
    return 0;
}
\`\`\``,
        files: {
          "main.cpp": `class Fraction {
    friend ostream& operator<<(ostream& out, const Fraction& f);

public:
    Fraction(int n, int d) : num(n), den(d) {}

    Fraction operator+(const Fraction& other) const {
        return Fraction(num * other.den + other.num * den, den * other.den);
    }

    bool operator==(const Fraction& other) const {
        return num * other.den == other.num * den;
    }

private:
    int num;
    int den;
};

ostream& operator<<(ostream& out, const Fraction& f) {
    out << f.num << "/" << f.den;
    return out;
}

int main() {
    Fraction a(1, 2), b(1, 3), c(2, 4);
    cout << a + b << " " << (a == c) << " " << (a == b) << endl;
    return 0;
}`,
        },
        prints: "5/6 1 0",
        rubric: [
          { point: "operator+ is a const member that returns a new Fraction and changes neither operand", marks: 2 },
          { point: "operator== compares by value (cross-multiplication), not member by member", marks: 2 },
          { point: "operator<< is a friend non-member taking and returning ostream&", marks: 2 },
          { point: "Parameters are passed by const reference", marks: 1 },
        ],
        explanation: "1/2 + 1/3 = (1×3 + 1×2)/(2×3) = 5/6. 1/2 and 2/4 have the same value (1×4 = 2×2), so == gives 1; 1/2 and 1/3 do not, so it gives 0.",
      },
      {
        kind: "write",
        points: 8,
        prompt: `Write a class Clock that counts hours and minutes.

• Private data members hour and minute (int) and a constructor taking both.
• Prefix operator++ adds one minute and returns the updated object by reference.
• Postfix operator++ adds one minute and returns a copy of the clock as it was before.
• When the minute passes 59 it goes back to 0 and the hour goes up by one; when the hour passes 23 it goes back to 0.
• operator<< as a friend function, printing hour:minute with the minute always as two digits (for example 9:05).

Run your class with the main below, then paste your whole program as your working and give the line it prints as your final answer.
\`\`\`cpp
int main() {
    Clock c(23, 58);
    Clock before = c++;
    ++c;
    cout << before << " " << c << endl;
    return 0;
}
\`\`\``,
        files: {
          "main.cpp": `class Clock {
    friend ostream& operator<<(ostream& out, const Clock& c);

public:
    Clock(int h, int m) : hour(h), minute(m) {}

    Clock& operator++() {
        tick();
        return *this;
    }

    Clock operator++(int) {
        Clock old(*this);
        tick();
        return old;
    }

private:
    void tick() {
        minute++;
        if (minute > 59) {
            minute = 0;
            hour++;
            if (hour > 23) hour = 0;
        }
    }

    int hour;
    int minute;
};

ostream& operator<<(ostream& out, const Clock& c) {
    out << c.hour << ":" << (c.minute < 10 ? "0" : "") << c.minute;
    return out;
}

int main() {
    Clock c(23, 58);
    Clock before = c++;
    ++c;
    cout << before << " " << c << endl;
    return 0;
}`,
        },
        prints: "23:58 0:00",
        rubric: [
          { point: "Prefix ++ returns Clock& (the object itself)", marks: 2 },
          { point: "Postfix ++ takes a dummy int and returns a copy made before the change", marks: 2 },
          { point: "Minute and hour wrap around correctly", marks: 2 },
          { point: "operator<< is a friend and pads the minute to two digits", marks: 1 },
        ],
        explanation: "c++ hands back the old clock (23:58) and moves c to 23:59. ++c then takes it past the last minute of the day, so both parts wrap: 0:00.",
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── Module 5
  {
    moduleFile: "5_Inheritance.pdf",
    title: "Exercise 5 — Inheritance",
    questions: [
      {
        kind: "choice",
        points: 1,
        prompt: "Which relationship is a good candidate for public inheritance?",
        options: ["A House has a Door", "A Manager is an Employee", "A Car has an Engine", "A Library has Books"],
        answer: "B",
        explanation: "Inheritance models “is-a”: a manager is an employee. The other three are “has-a” relationships, which are modelled with composition.",
      },
      {
        kind: "choice",
        points: 1,
        prompt: "A base class has a private data member secret. A class is derived from it with public inheritance. Which statement is true?",
        options: [
          "The derived class does not contain secret at all",
          "The derived class contains secret and its member functions can use it directly",
          "The derived class contains secret, but can reach it only through the base class's public or protected member functions",
          "secret becomes public in the derived class",
        ],
        answer: "C",
        explanation: "Private members are inherited — they are part of every derived object — but they stay private to the base class. The derived class has to go through the base class's interface.",
      },
      {
        kind: "choice",
        points: 1,
        prompt: "A protected member of a base class can be accessed:",
        options: [
          "From anywhere in the program",
          "Only by member functions of the base class",
          "By member functions of the base class and of its derived classes, but not by outside code",
          "Only by friend functions",
        ],
        answer: "C",
        explanation: "protected sits between private and public: derived classes may use the member directly, while code outside the hierarchy may not.",
      },
      {
        kind: "choice",
        points: 1,
        prompt: "Classes B and C both inherit from A, and class D inherits from both B and C. What is the standard way to make sure a D object contains only one copy of A's members?",
        options: [
          "Declare A's members static",
          "Make B and C inherit from A using virtual inheritance",
          "Make D a friend of A",
          "Use private inheritance in D",
        ],
        answer: "B",
        explanation: "This is the diamond problem. With class B : virtual public A and class C : virtual public A, D shares a single A subobject.",
      },
      {
        kind: "choice",
        points: 1,
        prompt: "What does this program print?\n```cpp\n#include <iostream>\nusing namespace std;\n\nclass A { public: A() { cout << \"A\"; } };\nclass B : public A { public: B() { cout << \"B\"; } };\nclass C : public A { public: C() { cout << \"C\"; } };\nclass D : public B, public C { public: D() { cout << \"D\"; } };\n\nint main() {\n    D d;\n    cout << endl;\n    return 0;\n}\n```",
        options: ["ABCD", "ABACD", "DBCA", "AABCD"],
        answer: "B",
        program: `#include <iostream>
using namespace std;

class A { public: A() { cout << "A"; } };
class B : public A { public: B() { cout << "B"; } };
class C : public A { public: C() { cout << "C"; } };
class D : public B, public C { public: D() { cout << "D"; } };

int main() {
    D d;
    cout << endl;
    return 0;
}`,
        prints: "ABACD",
        explanation: "Without virtual inheritance, B and C each carry their own A. Building D therefore builds A then B, then A again then C, and finally D.",
      },
      {
        kind: "output",
        points: 2,
        program: `class Base {
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
        prints: "BD|db",
        explanation: "The base part is constructed first, then the derived part. Destructors run in the opposite order: derived first, then base.",
      },
      {
        kind: "output",
        points: 2,
        program: `class Shape {
public:
    Shape(int s) : side(s) {}
    int area() const { return side * side; }
protected:
    int side;
};

class Box : public Shape {
public:
    Box(int s, int h) : Shape(s), height(h) {}
    int volume() const { return area() * height; }
private:
    int height;
};

int main() {
    Box b(3, 4);
    cout << b.area() << " " << b.volume() << endl;
    return 0;
}`,
        prints: "9 36",
        explanation: "Box passes s up to the Shape constructor in its initializer list, inherits area(), and reuses it: 3×3 = 9, then 9×4 = 36.",
      },
      {
        kind: "output",
        points: 2,
        program: `class A {
public:
    A() { cout << "A"; }
};

class B : virtual public A {
public:
    B() { cout << "B"; }
};

class C : virtual public A {
public:
    C() { cout << "C"; }
};

class D : public B, public C {
public:
    D() { cout << "D"; }
};

int main() {
    D d;
    cout << endl;
    return 0;
}`,
        prints: "ABCD",
        explanation: "With virtual inheritance there is one shared A, and it is constructed once, before B and C.",
      },
      {
        kind: "mistake",
        points: 2,
        prompt:
          "The designer wants name hidden from code outside these classes but usable inside derived classes, and Student::print() must stay exactly as written. The program does not compile. Which one line has to change?",
        lines: [
          "class Person {",
          "public:",
          "    Person(string n) : name(n) {}",
          "private:",
          "    string name;",
          "};",
          "class Student : public Person {",
          "public:",
          "    Student(string n) : Person(n) {}",
          "    void print() const { cout << name << endl; }",
          "};",
        ],
        wrongIndex: 3,
        fix: "protected:",
        harness: "int main() {\n    Student s(\"Mei\");\n    s.print();\n    return 0;\n}",
        prints: "Mei",
        explanation: "A private member cannot be used by a derived class. Changing private: to protected: lets Student::print() read name while still keeping it out of reach of outside code.",
      },
      {
        kind: "write",
        points: 8,
        prompt: `Build a small class hierarchy.

• class Employee — protected data members name (string) and salary (double); a constructor taking both; double pay() const returning the salary; void print() const printing  name pay()  followed by a newline.
• class Manager, derived publicly from Employee — one extra private data member bonus (double). Its constructor takes a name, a salary and a bonus, and passes the first two to the Employee constructor. It defines its own double pay() const, returning salary plus bonus, and its own void print() const, printing  name pay() (manager)  followed by a newline.

Run your classes with the main below, then paste your whole program as your working and give the two lines it prints, separated by a single space, as your final answer.
\`\`\`cpp
int main() {
    Employee e("Farah", 3000);
    Manager m("Gopal", 5000, 1200);
    e.print();
    m.print();
    return 0;
}
\`\`\``,
        files: {
          "main.cpp": `class Employee {
public:
    Employee(string n, double s) : name(n), salary(s) {}

    double pay() const { return salary; }
    void print() const {
        cout << name << " " << pay() << endl;
    }

protected:
    string name;
    double salary;
};

class Manager : public Employee {
public:
    Manager(string n, double s, double b) : Employee(n, s), bonus(b) {}

    double pay() const { return salary + bonus; }
    void print() const {
        cout << name << " " << pay() << " (manager)" << endl;
    }

private:
    double bonus;
};

int main() {
    Employee e("Farah", 3000);
    Manager m("Gopal", 5000, 1200);
    e.print();
    m.print();
    return 0;
}`,
        },
        prints: "Farah 3000 Gopal 6200 (manager)",
        rubric: [
          { point: "Manager is derived with public inheritance", marks: 1 },
          { point: "Manager's constructor calls Employee's constructor in its initializer list", marks: 2 },
          { point: "name and salary are protected, and Manager uses them directly", marks: 2 },
          { point: "Manager redefines pay() and print() correctly", marks: 2 },
        ],
        explanation: "The manager's pay is 5000 + 1200 = 6200. Manager has to initialise its Employee part through the Employee constructor — there is no default one.",
      },
      {
        kind: "write",
        points: 8,
        prompt: `Solve the diamond problem with virtual inheritance.

• class Person — protected name (string); a constructor taking the name.
• class Student, derived from Person — protected matric (int); a constructor taking a name and a matric number.
• class Staff, derived from Person — protected salary (double); a constructor taking a name and a salary.
• class Tutor, derived from both Student and Staff — a constructor taking a name, a matric number and a salary, and void print() const printing  name matric salary  followed by a newline.

A Tutor is one person, so it must contain only one name: print() has to be able to write name without any ambiguity. Run your classes with the main below, then paste your whole program as your working and give the line it prints as your final answer.
\`\`\`cpp
int main() {
    Tutor t("Hana", 2210, 1500);
    t.print();
    return 0;
}
\`\`\``,
        files: {
          "main.cpp": `class Person {
public:
    Person(string n) : name(n) {}

protected:
    string name;
};

class Student : virtual public Person {
public:
    Student(string n, int m) : Person(n), matric(m) {}

protected:
    int matric;
};

class Staff : virtual public Person {
public:
    Staff(string n, double s) : Person(n), salary(s) {}

protected:
    double salary;
};

class Tutor : public Student, public Staff {
public:
    Tutor(string n, int m, double s) : Person(n), Student(n, m), Staff(n, s) {}

    void print() const {
        cout << name << " " << matric << " " << salary << endl;
    }
};

int main() {
    Tutor t("Hana", 2210, 1500);
    t.print();
    return 0;
}`,
        },
        prints: "Hana 2210 1500",
        rubric: [
          { point: "Student and Staff both inherit from Person with virtual inheritance", marks: 3 },
          { point: "Tutor inherits publicly from both Student and Staff", marks: 1 },
          { point: "Tutor's constructor initialises the shared Person itself, as well as Student and Staff", marks: 2 },
          { point: "print() uses name, matric and salary with no ambiguity", marks: 1 },
        ],
        explanation:
          "With virtual inheritance the shared Person is built by the most derived class, so Tutor's initializer list must call Person(n) itself. Without virtual, a Tutor would hold two names and print() would not compile.",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────── Hands-on practice
//
// Small programs to finish inside the lesson itself, in the C++ editor block.
// Each has the output the finished program should print; the editor compares
// every run with it. They are practice, not graded, and deliberately different
// from the "write a program" questions in the exercises above.

export type CppTask = {
  title: string;
  /** Markdown, shown above the editor. */
  instructions: string;
  /** What the student starts from. It may not compile until the TODOs are done. */
  starter: string;
  /** A finished version — never shown; check-cpp.ts runs it to confirm `prints`. */
  solution: string;
  prints: string;
};

export const CPP_PRACTICE: { moduleFile: string; tasks: CppTask[] }[] = [
  {
    moduleFile: "1_Intro to Classes.pdf",
    tasks: [
      {
        title: "Finish the Counter class",
        instructions: "The class has a data member but no member functions yet. Add a constructor that starts `count` at 0, `increment()` that adds 1, and `get()` that returns the count. Do not change `main`.",
        starter: `#include <iostream>
using namespace std;

class Counter {
public:
    // TODO: a constructor that starts count at 0
    // TODO: void increment() - adds 1 to count
    // TODO: int get() - returns count

private:
    int count;
};

int main() {
    Counter c;
    c.increment();
    c.increment();
    c.increment();
    cout << "Count: " << c.get() << endl;
    return 0;
}`,
        solution: `#include <iostream>
using namespace std;

class Counter {
public:
    Counter() : count(0) {}
    void increment() { count++; }
    int get() { return count; }

private:
    int count;
};

int main() {
    Counter c;
    c.increment();
    c.increment();
    c.increment();
    cout << "Count: " << c.get() << endl;
    return 0;
}`,
        prints: "Count: 3",
      },
      {
        title: "A Temperature class that protects its data",
        instructions:
          "Write the class `Temperature` so that `main` works. It stores a temperature in Celsius.\n\n- A constructor taking the temperature, with a default argument of 0.\n- `setCelsius(double)` stores the new value **only if** it is not below −273.15 (absolute zero); otherwise it leaves the old value alone.\n- `getCelsius()` returns the stored value.\n- `toFahrenheit()` returns `celsius * 9 / 5 + 32`.",
        starter: `#include <iostream>
using namespace std;

// TODO: write class Temperature here

int main() {
    Temperature t(25);
    cout << t.toFahrenheit() << endl;

    t.setCelsius(-300);            // impossible: must be ignored
    cout << t.getCelsius() << endl;

    t.setCelsius(100);
    cout << t.toFahrenheit() << endl;
    return 0;
}`,
        solution: `#include <iostream>
using namespace std;

class Temperature {
public:
    Temperature(double c = 0) : celsius(c) {}
    void setCelsius(double c) {
        if (c >= -273.15) celsius = c;
    }
    double getCelsius() { return celsius; }
    double toFahrenheit() { return celsius * 9 / 5 + 32; }

private:
    double celsius;
};

int main() {
    Temperature t(25);
    cout << t.toFahrenheit() << endl;

    t.setCelsius(-300);            // impossible: must be ignored
    cout << t.getCelsius() << endl;

    t.setCelsius(100);
    cout << t.toFahrenheit() << endl;
    return 0;
}`,
        prints: "77\n25\n212",
      },
    ],
  },
  {
    moduleFile: "2_Classes Interface and Implementation.pdf",
    tasks: [
      {
        title: "Count the objects with a static member",
        instructions:
          "Make `Player` keep track of how many `Player` objects currently exist.\n\n- Add a `static int` data member and define it outside the class, starting at 0.\n- The constructor adds 1 to it; the destructor takes 1 away.\n- Add a `static` member function `getCount()` that returns it.",
        starter: `#include <iostream>
using namespace std;

class Player {
public:
    Player() {
        // TODO: one more player exists
    }
    ~Player() {
        // TODO: one player fewer
    }
    // TODO: static int getCount()

private:
    // TODO: the static data member
};

// TODO: define the static data member here, starting at 0

int main() {
    Player a;
    Player b;
    cout << "Players: " << Player::getCount() << endl;
    {
        Player c;
        cout << "Players: " << Player::getCount() << endl;
    }
    cout << "Players: " << Player::getCount() << endl;
    return 0;
}`,
        solution: `#include <iostream>
using namespace std;

class Player {
public:
    Player() { count++; }
    ~Player() { count--; }
    static int getCount() { return count; }

private:
    static int count;
};

int Player::count = 0;

int main() {
    Player a;
    Player b;
    cout << "Players: " << Player::getCount() << endl;
    {
        Player c;
        cout << "Players: " << Player::getCount() << endl;
    }
    cout << "Players: " << Player::getCount() << endl;
    return 0;
}`,
        prints: "Players: 2\nPlayers: 3\nPlayers: 2",
      },
      {
        title: "A class that owns a dynamic array",
        instructions:
          "`Scores` should allocate its own array and clean up after itself.\n\n- The constructor allocates `n` ints with `new` and sets them all to 0.\n- The destructor releases the array — with the right form of `delete`.\n- `highest()` is a `const` member function that returns the largest value.",
        starter: `#include <iostream>
using namespace std;

class Scores {
public:
    Scores(int n) {
        // TODO: remember the size, allocate the array, set every element to 0
    }
    ~Scores() {
        // TODO: release the array
    }
    void set(int index, int value) {
        if (index >= 0 && index < size) data[index] = value;
    }
    // TODO: int highest() const

private:
    int* data;
    int size;
};

int main() {
    Scores s(4);
    s.set(0, 67);
    s.set(1, 91);
    s.set(2, 78);
    cout << "Highest: " << s.highest() << endl;
    return 0;
}`,
        solution: `#include <iostream>
using namespace std;

class Scores {
public:
    Scores(int n) : data(new int[n]), size(n) {
        for (int i = 0; i < size; i++) data[i] = 0;
    }
    ~Scores() {
        delete[] data;
    }
    void set(int index, int value) {
        if (index >= 0 && index < size) data[index] = value;
    }
    int highest() const {
        int best = data[0];
        for (int i = 1; i < size; i++)
            if (data[i] > best) best = data[i];
        return best;
    }

private:
    int* data;
    int size;
};

int main() {
    Scores s(4);
    s.set(0, 67);
    s.set(1, 91);
    s.set(2, 78);
    cout << "Highest: " << s.highest() << endl;
    return 0;
}`,
        prints: "Highest: 91",
      },
    ],
  },
  {
    moduleFile: "3_Composition.pdf",
    tasks: [
      {
        title: "A Person has an Address",
        instructions:
          "`Address` is finished. Complete `Person`, which **has an** `Address` as a data member.\n\n- The constructor takes a name and a city and builds the `Address` member in the **member initializer list** (`Address` has no default constructor, so there is no other way).\n- `print()` writes `name lives in city`.",
        starter: `#include <iostream>
#include <string>
using namespace std;

class Address {
public:
    Address(string c) : city(c) {}
    string getCity() const { return city; }

private:
    string city;
};

class Person {
public:
    // TODO: Person(string n, string c) with a member initializer list
    // TODO: void print() const

private:
    string name;
    Address home;
};

int main() {
    Person p("Lina", "Johor");
    p.print();
    return 0;
}`,
        solution: `#include <iostream>
#include <string>
using namespace std;

class Address {
public:
    Address(string c) : city(c) {}
    string getCity() const { return city; }

private:
    string city;
};

class Person {
public:
    Person(string n, string c) : name(n), home(c) {}
    void print() const { cout << name << " lives in " << home.getCity() << endl; }

private:
    string name;
    Address home;
};

int main() {
    Person p("Lina", "Johor");
    p.print();
    return 0;
}`,
        prints: "Lina lives in Johor",
      },
      {
        title: "A friend function that compares two objects",
        instructions:
          "Write the function `sameArea`, which returns `true` when two rectangles have the same area. It is **not** a member of `Rectangle`, but it needs the private `width` and `height` — so declare it a `friend` inside the class, then define it below the class.",
        starter: `#include <iostream>
using namespace std;

class Rectangle {
    // TODO: declare sameArea as a friend

public:
    Rectangle(int w, int h) : width(w), height(h) {}

private:
    int width;
    int height;
};

// TODO: define  bool sameArea(const Rectangle& a, const Rectangle& b)

int main() {
    Rectangle a(4, 6), b(3, 8), c(5, 5);
    cout << sameArea(a, b) << endl;
    cout << sameArea(a, c) << endl;
    return 0;
}`,
        solution: `#include <iostream>
using namespace std;

class Rectangle {
    friend bool sameArea(const Rectangle& a, const Rectangle& b);

public:
    Rectangle(int w, int h) : width(w), height(h) {}

private:
    int width;
    int height;
};

bool sameArea(const Rectangle& a, const Rectangle& b) {
    return a.width * a.height == b.width * b.height;
}

int main() {
    Rectangle a(4, 6), b(3, 8), c(5, 5);
    cout << sameArea(a, b) << endl;
    cout << sameArea(a, c) << endl;
    return 0;
}`,
        prints: "1\n0",
      },
    ],
  },
  {
    moduleFile: "4_Operator Overloading.pdf",
    tasks: [
      {
        title: "Add two Money objects with +",
        instructions:
          "Overload `operator+` as a member function so two `Money` objects can be added. When the sen reach 100 or more, carry into the ringgit. The operator must not change either of the objects being added.",
        starter: `#include <iostream>
using namespace std;

class Money {
public:
    Money(int r, int s) : ringgit(r), sen(s) {}

    // TODO: Money operator+(const Money& other) const

    void print() const {
        cout << "RM" << ringgit << "." << (sen < 10 ? "0" : "") << sen << endl;
    }

private:
    int ringgit;
    int sen;
};

int main() {
    Money a(3, 80), b(2, 45);
    Money total = a + b;
    total.print();
    a.print();
    return 0;
}`,
        solution: `#include <iostream>
using namespace std;

class Money {
public:
    Money(int r, int s) : ringgit(r), sen(s) {}

    Money operator+(const Money& other) const {
        int totalSen = sen + other.sen;
        return Money(ringgit + other.ringgit + totalSen / 100, totalSen % 100);
    }

    void print() const {
        cout << "RM" << ringgit << "." << (sen < 10 ? "0" : "") << sen << endl;
    }

private:
    int ringgit;
    int sen;
};

int main() {
    Money a(3, 80), b(2, 45);
    Money total = a + b;
    total.print();
    a.print();
    return 0;
}`,
        prints: "RM6.25\nRM3.80",
      },
      {
        title: "Print an object with <<",
        instructions:
          "Make `cout << p` work for a `Point`, printing it as `(x, y)`. Overload `operator<<` as a `friend` function. It takes the stream and the point, and must **return the stream** so that several `<<` can be chained.",
        starter: `#include <iostream>
using namespace std;

class Point {
    // TODO: declare operator<< as a friend

public:
    Point(int a, int b) : x(a), y(b) {}

private:
    int x;
    int y;
};

// TODO: define operator<< here

int main() {
    Point p(3, 7), q(-1, 4);
    cout << p << " to " << q << endl;
    return 0;
}`,
        solution: `#include <iostream>
using namespace std;

class Point {
    friend ostream& operator<<(ostream& out, const Point& p);

public:
    Point(int a, int b) : x(a), y(b) {}

private:
    int x;
    int y;
};

ostream& operator<<(ostream& out, const Point& p) {
    out << "(" << p.x << ", " << p.y << ")";
    return out;
}

int main() {
    Point p(3, 7), q(-1, 4);
    cout << p << " to " << q << endl;
    return 0;
}`,
        prints: "(3, 7) to (-1, 4)",
      },
    ],
  },
  {
    moduleFile: "5_Inheritance.pdf",
    tasks: [
      {
        title: "Derive Dog from Animal",
        instructions:
          "`Animal` is finished. Write `Dog` so that it **is an** `Animal`.\n\n- Use public inheritance.\n- `Dog`'s constructor takes a name and passes it to the `Animal` constructor in its initializer list.\n- Add `speak()`, which prints `name says Woof`. `name` is `protected`, so `Dog` may use it directly.",
        starter: `#include <iostream>
#include <string>
using namespace std;

class Animal {
public:
    Animal(string n) : name(n) {}
    void describe() const { cout << name << " is an animal" << endl; }

protected:
    string name;
};

// TODO: write class Dog here

int main() {
    Dog d("Rex");
    d.describe();
    d.speak();
    return 0;
}`,
        solution: `#include <iostream>
#include <string>
using namespace std;

class Animal {
public:
    Animal(string n) : name(n) {}
    void describe() const { cout << name << " is an animal" << endl; }

protected:
    string name;
};

class Dog : public Animal {
public:
    Dog(string n) : Animal(n) {}
    void speak() const { cout << name << " says Woof" << endl; }
};

int main() {
    Dog d("Rex");
    d.describe();
    d.speak();
    return 0;
}`,
        prints: "Rex is an animal\nRex says Woof",
      },
      {
        title: "Three levels: Shape, Rectangle, Square",
        instructions:
          "Build a multilevel hierarchy.\n\n- `Rectangle` is derived from `Shape`. Its constructor takes a width and a height and passes the name `\"Rectangle\"` up to `Shape`. Add `area()`.\n- `Square` is derived from `Rectangle`. Its constructor takes one side and reuses the `Rectangle` constructor. A square should describe itself as a `Square`: set the inherited `name` in the constructor body.",
        starter: `#include <iostream>
#include <string>
using namespace std;

class Shape {
public:
    Shape(string n) : name(n) {}
    string getName() const { return name; }

protected:
    string name;
};

// TODO: class Rectangle, derived from Shape
// TODO: class Square, derived from Rectangle

int main() {
    Rectangle r(3, 5);
    Square s(4);
    cout << r.getName() << " " << r.area() << endl;
    cout << s.getName() << " " << s.area() << endl;
    return 0;
}`,
        solution: `#include <iostream>
#include <string>
using namespace std;

class Shape {
public:
    Shape(string n) : name(n) {}
    string getName() const { return name; }

protected:
    string name;
};

class Rectangle : public Shape {
public:
    Rectangle(int w, int h) : Shape("Rectangle"), width(w), height(h) {}
    int area() const { return width * height; }

private:
    int width;
    int height;
};

class Square : public Rectangle {
public:
    Square(int side) : Rectangle(side, side) { name = "Square"; }
};

int main() {
    Rectangle r(3, 5);
    Square s(4);
    cout << r.getName() << " " << r.area() << endl;
    cout << s.getName() << " " << s.area() << endl;
    return 0;
}`,
        prints: "Rectangle 15\nSquare 16",
      },
    ],
  },
];
