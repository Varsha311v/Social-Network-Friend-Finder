
#include <iostream>
#include <algorithm>
#include <map>
#include <queue>
#include <set>
#include <string>
#include <vector>

using namespace std;

class SocialNetwork {
    map<string, set<string>> graph;

    // Check whether a user exists
    bool exists(const string& u) const {
        return graph.count(u) > 0;
    }

    // DFS helper function
    void dfs(const string& node, set<string>& visited,
             vector<string>& order) {
        visited.insert(node);
        order.push_back(node);

        for (const string& nxt : graph.at(node)) {
            if (!visited.count(nxt)) {
                dfs(nxt, visited, order);
            }
        }
    }

    // Print a list of users
    static void printList(const vector<string>& v,
                          const string& sep) {
        for (size_t i = 0; i < v.size(); i++) {
            cout << (i ? sep : "") << v[i];
        }
        cout << "\n";
    }

public:

    // Add a new user
    void addUser(const string& name) {
        if (exists(name)) {
            cout << "'" << name << "' already exists.\n";
            return;
        }

        graph[name] = {};
        cout << "User '" << name << "' added.\n";
    }

    // Add friendship connection
    void addConnection(const string& a, const string& b) {
        if (!exists(a) || !exists(b)) {
            cout << "Both users must exist first.\n";
            return;
        }

        if (a == b) {
            cout << "A user cannot befriend themselves.\n";
            return;
        }

        if (graph[a].count(b)) {
            cout << a << " and " << b
                 << " are already friends.\n";
            return;
        }

        graph[a].insert(b);
        graph[b].insert(a);

        cout << a << " and " << b << " are now friends.\n";
    }

    // Display friends of a user
    void showFriends(const string& name) {
        if (!exists(name)) {
            cout << "User not found.\n";
            return;
        }

        cout << name << "'s friends: ";

        if (graph[name].empty()) {
            cout << "none\n";
            return;
        }

        printList(
            vector<string>(graph[name].begin(), graph[name].end()),
            ", "
        );
    }

    // Find mutual friends
    void mutualFriends(const string& a, const string& b) {
        if (!exists(a) || !exists(b)) {
            cout << "Both users must exist.\n";
            return;
        }

        vector<string> common;

        set_intersection(
            graph[a].begin(), graph[a].end(),
            graph[b].begin(), graph[b].end(),
            back_inserter(common)
        );

        cout << "Mutual friends of " << a << " and "
             << b << ": ";

        if (common.empty()) {
            cout << "none\n";
        } else {
            printList(common, ", ");
        }
    }

    // Find shortest connection path using BFS
    void bfsPath(const string& start, const string& target) {
        if (!exists(start) || !exists(target)) {
            cout << "Both users must exist.\n";
            return;
        }

        set<string> visited = {start};
        queue<vector<string>> q;

        q.push({start});

        while (!q.empty()) {
            vector<string> path = q.front();
            q.pop();

            string node = path.back();

            if (node == target) {
                cout << "Shortest connection: ";

                for (size_t i = 0; i < path.size(); i++) {
                    cout << (i ? " -> " : "") << path[i];
                }

                cout << "  (" << path.size() - 1
                     << " degree(s) apart)\n";
                return;
            }

            for (const string& nxt : graph[node]) {
                if (!visited.count(nxt)) {
                    visited.insert(nxt);

                    vector<string> newPath = path;
                    newPath.push_back(nxt);

                    q.push(newPath);
                }
            }
        }

        cout << "No connection between " << start
             << " and " << target << ".\n";
    }

    // Suggest friends using friends-of-friends
    void suggestFriends(const string& name) {
        if (!exists(name)) {
            cout << "User not found.\n";
            return;
        }

        set<string> suggestions;

        for (const string& f : graph[name]) {
            for (const string& fof : graph[f]) {
                if (fof != name && !graph[name].count(fof)) {
                    suggestions.insert(fof);
                }
            }
        }

        cout << "Suggestions for " << name << ": ";

        if (suggestions.empty()) {
            cout << "none\n";
        } else {
            printList(
                vector<string>(suggestions.begin(), suggestions.end()),
                ", "
            );
        }
    }

    // BFS traversal
    void bfsTraversal(const string& start) {
        if (!exists(start)) {
            cout << "User not found.\n";
            return;
        }

        set<string> visited = {start};
        queue<string> q;

        q.push(start);

        vector<string> order;

        while (!q.empty()) {
            string node = q.front();
            q.pop();

            order.push_back(node);

            for (const string& nxt : graph[node]) {
                if (!visited.count(nxt)) {
                    visited.insert(nxt);
                    q.push(nxt);
                }
            }
        }

        cout << "BFS from " << start << ": ";
        printList(order, " -> ");
    }

    // DFS traversal
    void dfsTraversal(const string& start) {
        if (!exists(start)) {
            cout << "User not found.\n";
            return;
        }

        set<string> visited;
        vector<string> order;

        dfs(start, visited, order);

        cout << "DFS from " << start << ": ";
        printList(order, " -> ");
    }

    // Load demo data
    void loadDemo() {
        for (string u : {
            "Alice", "Bob", "Charlie",
            "David", "Eve", "Frank"
        }) {
            graph[u];
        }

        vector<pair<string, string>> edges = {
            {"Alice", "Bob"},
            {"Alice", "Charlie"},
            {"Bob", "David"},
            {"Charlie", "David"},
            {"David", "Eve"}
        };

        for (auto& e : edges) {
            graph[e.first].insert(e.second);
            graph[e.second].insert(e.first);
        }

        cout << "Demo network loaded: Alice, Bob, Charlie, "
             << "David, Eve, Frank.\n";
    }
};

// Read input from user
static string readLine(const string& prompt) {
    cout << prompt;

    string s;
    getline(cin, s);

    return s;
}

// Main function
int main() {
    SocialNetwork net;

    while (true) {
        cout << "\n===== Social Network Friend Finder =====\n"
             << "1. Add user\n"
             << "2. Add connection\n"
             << "3. Show friends\n"
             << "4. Mutual friends\n"
             << "5. Shortest connection path (BFS)\n"
             << "6. Suggest friends\n"
             << "7. BFS traversal\n"
             << "8. DFS traversal\n"
             << "9. Load demo data\n"
             << "0. Exit\n";

        string choice = readLine("Choose: ");

        if (!cin) {
            break;
        }

        if (choice == "1") {
            net.addUser(readLine("Name: "));
        }
        else if (choice == "2") {
            string a = readLine("User 1: ");
            string b = readLine("User 2: ");
            net.addConnection(a, b);
        }
        else if (choice == "3") {
            net.showFriends(readLine("User: "));
        }
        else if (choice == "4") {
            string a = readLine("User 1: ");
            string b = readLine("User 2: ");
            net.mutualFriends(a, b);
        }
        else if (choice == "5") {
            string a = readLine("From: ");
            string b = readLine("To: ");
            net.bfsPath(a, b);
        }
        else if (choice == "6") {
            net.suggestFriends(readLine("User: "));
        }
        else if (choice == "7") {
            net.bfsTraversal(readLine("Start user: "));
        }
        else if (choice == "8") {
            net.dfsTraversal(readLine("Start user: "));
        }
        else if (choice == "9") {
            net.loadDemo();
        }
        else if (choice == "0") {
            cout << "Goodbye!\n";
            break;
        }
        else {
            cout << "Invalid choice.\n";
        }
    }

    return 0;
}
