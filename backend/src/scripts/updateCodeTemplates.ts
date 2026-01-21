// Script to update code templates in MongoDB to include I/O boilerplate
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

const QuestionSchema = new mongoose.Schema({}, { strict: false });
const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);

const updatedTemplates: Record<string, { python: string; cpp: string; java?: string }> = {
    'isPrime': {
        python: `def isPrime(n):
    # Write your code here
    # Return True if n is prime, False otherwise
    pass

# Read input and call function
n = int(input())
result = isPrime(n)
print("true" if result else "false")`,
        cpp: `#include <iostream>
using namespace std;

bool isPrime(int n) {
    // Write your code here
    return false;
}

int main() {
    int n;
    cin >> n;
    cout << (isPrime(n) ? "true" : "false") << endl;
    return 0;
}`,
        java: `import java.util.Scanner;

public class Main {
    public static boolean isPrime(int n) {
        // Write your code here
        return false;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.println(isPrime(n) ? "true" : "false");
    }
}`
    },
    'secondLargest': {
        python: `def secondLargest(arr, size):
    # Write your code here
    # Return the second largest element, or -1 if not found
    pass

# Read input
line = input().strip()
# Parse array like "[5, 2, 8, 1, 9], 5"
arr_str, size_str = line.rsplit(',', 1)
arr = [int(x.strip()) for x in arr_str.strip('[]').split(',')]
size = int(size_str.strip())
print(secondLargest(arr, size))`,
        cpp: `#include <iostream>
#include <vector>
using namespace std;

int secondLargest(vector<int>& arr, int size) {
    // Write your code here
    return -1;
}

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for(int i = 0; i < n; i++) cin >> arr[i];
    cout << secondLargest(arr, n) << endl;
    return 0;
}`
    },
    'longestWord': {
        python: `def longestWord(s):
    # Write your code here
    # Return the longest word in the sentence
    pass

# Read input and call function
s = input()
print(longestWord(s))`,
        cpp: `#include <iostream>
#include <string>
#include <sstream>
using namespace std;

string longestWord(string s) {
    // Write your code here
    return "";
}

int main() {
    string s;
    getline(cin, s);
    cout << longestWord(s) << endl;
    return 0;
}`
    },
    'reverseArray': {
        python: `def reverseArray(arr):
    # Write your code here (modify arr in-place)
    pass

# Read input
arr = [int(x) for x in input().strip('[]').split(',')]
reverseArray(arr)
print(arr)`,
        cpp: `#include <iostream>
#include <vector>
using namespace std;

void reverseArray(vector<int>& arr, int size) {
    // Write your code here
}

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for(int i = 0; i < n; i++) cin >> arr[i];
    reverseArray(arr, n);
    cout << "[";
    for(int i = 0; i < n; i++) {
        cout << arr[i];
        if(i < n-1) cout << ", ";
    }
    cout << "]" << endl;
    return 0;
}`
    },
    'sumOfEvens': {
        python: `def sumOfEvens(arr):
    # Write your code here
    # Return the sum of all even numbers in arr
    pass

# Read input
arr = [int(x) for x in input().strip('[]').split(',')]
print(sumOfEvens(arr))`,
        cpp: `#include <iostream>
#include <vector>
using namespace std;

int sumOfEvens(vector<int>& arr, int size) {
    // Write your code here
    return 0;
}

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for(int i = 0; i < n; i++) cin >> arr[i];
    cout << sumOfEvens(arr, n) << endl;
    return 0;
}`
    },
    'isPalindrome': {
        python: `def isPalindrome(s):
    # Write your code here
    # Return True if s is a palindrome (case-insensitive), False otherwise
    pass

# Read input and call function
s = input()
result = isPalindrome(s)
print("true" if result else "false")`,
        cpp: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

bool isPalindrome(string s) {
    // Write your code here
    return false;
}

int main() {
    string s;
    getline(cin, s);
    cout << (isPalindrome(s) ? "true" : "false") << endl;
    return 0;
}`
    }
};

async function updateTemplates() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find all coding questions
        const codingQuestions = await Question.find({ isCoding: true });
        console.log(`Found ${codingQuestions.length} coding questions`);

        for (const q of codingQuestions) {
            // Detect which function this is for
            let functionName = '';
            for (const fname of Object.keys(updatedTemplates)) {
                if (q.questionText?.includes(fname) ||
                    q.codeTemplate?.some((t: any) => t.template?.includes(fname))) {
                    functionName = fname;
                    break;
                }
            }

            if (functionName && updatedTemplates[functionName]) {
                const newTemplates = updatedTemplates[functionName];
                const updatedCodeTemplate = [
                    { language: 'python', template: newTemplates.python },
                    { language: 'cpp', template: newTemplates.cpp }
                ];
                if (newTemplates.java) {
                    updatedCodeTemplate.push({ language: 'java', template: newTemplates.java });
                }

                await Question.updateOne(
                    { _id: q._id },
                    { $set: { codeTemplate: updatedCodeTemplate } }
                );
                console.log(`Updated templates for question ${q.questionNumber}: ${functionName}`);
            }
        }

        console.log('\\nTemplate update completed!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

updateTemplates();
