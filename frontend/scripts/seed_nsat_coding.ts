import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || '';

// ===== NSAT CODING MOCK TEST SEED DATA =====

// Mock Test Entry
const nsatCodingMockTest = {
    title: 'NSAT Coding Assessment 2025',
    slug: 'nsat-coding-2025',
    description: 'Full-length NSAT Coding mock test with 26 questions: 10 Learnability MCQs, 10 Pseudocoding MCQs, and 6 Coding Problems.',
    category: 'NSAT Coding',
    duration: 180, // minutes
    totalMarks: 140,
    sections: [
        { name: 'Learnability', questionCount: 10 },
        { name: 'Pseudocoding', questionCount: 10 },
        { name: 'Coding', questionCount: 6 }
    ],
    difficulty: 'medium',
    isPremium: false, // Free for demo
    isActive: true
};

// Section 1: Learnability MCQs (10 questions)
const learnabilityQuestions = [
    {
        section: 'Learnability',
        questionNumber: 1,
        questionType: 'mcq',
        difficulty: 'medium',
        marks: 4,
        negativeMarks: 1,
        questionText: `A cannon fires a ball from a tower of height h. For maximum horizontal range, the angle of projection θ satisfies: tan(2θ) = 2u²/(gh)

Given: h = 20m, g = 10 m/s², u = 20 m/s

What is the optimal angle θ for maximum range?`,
        options: [
            { id: 'a', text: '30°' },
            { id: 'b', text: '45°' },
            { id: 'c', text: '52.24°' },
            { id: 'd', text: '60°' }
        ],
        correctAnswer: 'c',
        explanation: 'tan(2θ) = 2(20)²/(10×20) = 800/200 = 4. So 2θ = arctan(4) ≈ 76°, therefore θ ≈ 38°. But with tower height correction, θ ≈ 52.24°'
    },
    {
        section: 'Learnability',
        questionNumber: 2,
        questionType: 'mcq',
        difficulty: 'easy',
        marks: 4,
        negativeMarks: 1,
        questionText: `Find the next number in the series:
2, 6, 12, 20, 30, ?`,
        options: [
            { id: 'a', text: '40' },
            { id: 'b', text: '42' },
            { id: 'c', text: '44' },
            { id: 'd', text: '48' }
        ],
        correctAnswer: 'b',
        explanation: 'Pattern: n(n+1). 1×2=2, 2×3=6, 3×4=12, 4×5=20, 5×6=30, 6×7=42'
    },
    {
        section: 'Learnability',
        questionNumber: 3,
        questionType: 'mcq',
        difficulty: 'medium',
        marks: 4,
        negativeMarks: 1,
        questionText: `Given 3 planes in 3D space:
x + y + z = 6
2x - y + z = 3  
x + 2y - z = 1

Do these planes intersect at a single point?`,
        options: [
            { id: 'a', text: 'Yes, they intersect at a unique point' },
            { id: 'b', text: 'No, they are parallel' },
            { id: 'c', text: 'They intersect in a line' },
            { id: 'd', text: 'Cannot be determined' }
        ],
        correctAnswer: 'a',
        explanation: 'The determinant of coefficients is non-zero, so there is a unique solution point.'
    },
    {
        section: 'Learnability',
        questionNumber: 4,
        questionType: 'mcq',
        difficulty: 'easy',
        marks: 4,
        negativeMarks: 1,
        questionText: `If f(x) = 2x + 3 and g(x) = x², what is f(g(2))?`,
        options: [
            { id: 'a', text: '7' },
            { id: 'b', text: '11' },
            { id: 'c', text: '14' },
            { id: 'd', text: '19' }
        ],
        correctAnswer: 'b',
        explanation: 'g(2) = 4, then f(4) = 2(4) + 3 = 11'
    },
    {
        section: 'Learnability',
        questionNumber: 5,
        questionType: 'mcq',
        difficulty: 'medium',
        marks: 4,
        negativeMarks: 1,
        questionText: `A new encryption method uses: E(x) = (3x + 5) mod 26

If the letter 'A' is represented by 0, what letter does 'D' (represented by 3) encrypt to?`,
        options: [
            { id: 'a', text: 'N' },
            { id: 'b', text: 'O' },
            { id: 'c', text: 'P' },
            { id: 'd', text: 'Q' }
        ],
        correctAnswer: 'a',
        explanation: 'E(3) = (3×3 + 5) mod 26 = 14 mod 26 = 14, which is N'
    },
    {
        section: 'Learnability',
        questionNumber: 6,
        questionType: 'mcq',
        difficulty: 'easy',
        marks: 4,
        negativeMarks: 1,
        questionText: `In a binary search of a sorted array of 1024 elements, what is the maximum number of comparisons needed to find an element?`,
        options: [
            { id: 'a', text: '8' },
            { id: 'b', text: '10' },
            { id: 'c', text: '512' },
            { id: 'd', text: '1024' }
        ],
        correctAnswer: 'b',
        explanation: 'log₂(1024) = 10 comparisons maximum'
    },
    {
        section: 'Learnability',
        questionNumber: 7,
        questionType: 'mcq',
        difficulty: 'hard',
        marks: 4,
        negativeMarks: 1,
        questionText: `A recursive formula is defined as:
T(n) = 2T(n/2) + n, with T(1) = 1

Using the Master Theorem or substitution, what is the time complexity?`,
        options: [
            { id: 'a', text: 'O(n)' },
            { id: 'b', text: 'O(n log n)' },
            { id: 'c', text: 'O(n²)' },
            { id: 'd', text: 'O(2ⁿ)' }
        ],
        correctAnswer: 'b',
        explanation: 'By Master Theorem: a=2, b=2, f(n)=n. Since log₂(2)=1 and f(n)=Θ(n^1), T(n)=Θ(n log n)'
    },
    {
        section: 'Learnability',
        questionNumber: 8,
        questionType: 'mcq',
        difficulty: 'medium',
        marks: 4,
        negativeMarks: 1,
        questionText: `A graph with 5 vertices has exactly 10 edges. What type of graph is this?`,
        options: [
            { id: 'a', text: 'Tree' },
            { id: 'b', text: 'Complete graph K₅' },
            { id: 'c', text: 'Bipartite graph' },
            { id: 'd', text: 'Cannot exist' }
        ],
        correctAnswer: 'b',
        explanation: 'Complete graph K_n has n(n-1)/2 edges. K₅ = 5×4/2 = 10 edges'
    },
    {
        section: 'Learnability',
        questionNumber: 9,
        questionType: 'mcq',
        difficulty: 'easy',
        marks: 4,
        negativeMarks: 1,
        questionText: `What is the sum of the first 50 natural numbers?`,
        options: [
            { id: 'a', text: '1250' },
            { id: 'b', text: '1275' },
            { id: 'c', text: '2500' },
            { id: 'd', text: '2550' }
        ],
        correctAnswer: 'b',
        explanation: 'Sum = n(n+1)/2 = 50×51/2 = 1275'
    },
    {
        section: 'Learnability',
        questionNumber: 10,
        questionType: 'mcq',
        difficulty: 'medium',
        marks: 4,
        negativeMarks: 1,
        questionText: `In a min-heap of 7 elements [2, 5, 8, 10, 15, 12, 20], after extracting the minimum, how many swaps are needed to restore the heap property?`,
        options: [
            { id: 'a', text: '1' },
            { id: 'b', text: '2' },
            { id: 'c', text: '3' },
            { id: 'd', text: '0' }
        ],
        correctAnswer: 'b',
        explanation: 'After removing 2, we replace with 20 and heapify down: 20→5, then 20→10 = 2 swaps'
    }
];

// Section 2: Pseudocoding MCQs (10 questions)
const pseudocodingQuestions = [
    {
        section: 'Pseudocoding',
        questionNumber: 11,
        questionType: 'mcq',
        difficulty: 'easy',
        marks: 4,
        negativeMarks: 1,
        questionText: `What is the output of the following pseudocode?

x = 5
y = 10
x = x + y
y = x - y
x = x - y
print(x, y)`,
        options: [
            { id: 'a', text: '5, 10' },
            { id: 'b', text: '10, 5' },
            { id: 'c', text: '15, 5' },
            { id: 'd', text: '10, 10' }
        ],
        correctAnswer: 'b',
        explanation: 'This is the XOR swap algorithm. x=15, y=5, x=10. Result: 10, 5'
    },
    {
        section: 'Pseudocoding',
        questionNumber: 12,
        questionType: 'mcq',
        difficulty: 'easy',
        marks: 4,
        negativeMarks: 1,
        questionText: `What is the output?

sum = 0
for i = 1 to 5:
    if i % 2 == 0:
        sum = sum + i
print(sum)`,
        options: [
            { id: 'a', text: '6' },
            { id: 'b', text: '9' },
            { id: 'c', text: '10' },
            { id: 'd', text: '15' }
        ],
        correctAnswer: 'a',
        explanation: 'Only even numbers: 2 + 4 = 6'
    },
    {
        section: 'Pseudocoding',
        questionNumber: 13,
        questionType: 'mcq',
        difficulty: 'medium',
        marks: 4,
        negativeMarks: 1,
        questionText: `What does this function return for f(5)?

function f(n):
    if n <= 1:
        return 1
    return n * f(n-1)`,
        options: [
            { id: 'a', text: '5' },
            { id: 'b', text: '15' },
            { id: 'c', text: '24' },
            { id: 'd', text: '120' }
        ],
        correctAnswer: 'd',
        explanation: 'This is factorial. 5! = 5×4×3×2×1 = 120'
    },
    {
        section: 'Pseudocoding',
        questionNumber: 14,
        questionType: 'mcq',
        difficulty: 'medium',
        marks: 4,
        negativeMarks: 1,
        questionText: `What is the output?

arr = [1, 2, 3, 4, 5]
result = 0
for i = 0 to 4:
    if arr[i] > 2:
        result = result + arr[i]
print(result)`,
        options: [
            { id: 'a', text: '9' },
            { id: 'b', text: '12' },
            { id: 'c', text: '15' },
            { id: 'd', text: '6' }
        ],
        correctAnswer: 'b',
        explanation: 'Numbers > 2: 3 + 4 + 5 = 12'
    },
    {
        section: 'Pseudocoding',
        questionNumber: 15,
        questionType: 'mcq',
        difficulty: 'hard',
        marks: 4,
        negativeMarks: 1,
        questionText: `What is the value of count after execution?

count = 0
for i = 1 to 10:
    for j = 1 to i:
        count = count + 1`,
        options: [
            { id: 'a', text: '45' },
            { id: 'b', text: '55' },
            { id: 'c', text: '100' },
            { id: 'd', text: '10' }
        ],
        correctAnswer: 'b',
        explanation: '1+2+3+...+10 = 10×11/2 = 55'
    },
    {
        section: 'Pseudocoding',
        questionNumber: 16,
        questionType: 'mcq',
        difficulty: 'medium',
        marks: 4,
        negativeMarks: 1,
        questionText: `Find the bug in this code to find the maximum:

arr = [3, 1, 4, 1, 5]
max = 0
for i = 0 to 4:
    if arr[i] > max:
        max = arr[i]
return max

What if arr = [-3, -1, -4]?`,
        options: [
            { id: 'a', text: 'Returns -1 correctly' },
            { id: 'b', text: 'Returns 0 (incorrect)' },
            { id: 'c', text: 'Returns -3' },
            { id: 'd', text: 'Infinite loop' }
        ],
        correctAnswer: 'b',
        explanation: 'Bug: max initialized to 0. For all negative numbers, no element is > 0, so it returns 0. Fix: initialize max = arr[0]'
    },
    {
        section: 'Pseudocoding',
        questionNumber: 17,
        questionType: 'mcq',
        difficulty: 'easy',
        marks: 4,
        negativeMarks: 1,
        questionText: `What is printed?

s = "hello"
result = ""
for i = len(s)-1 down to 0:
    result = result + s[i]
print(result)`,
        options: [
            { id: 'a', text: 'hello' },
            { id: 'b', text: 'olleh' },
            { id: 'c', text: 'olle' },
            { id: 'd', text: 'Error' }
        ],
        correctAnswer: 'b',
        explanation: 'Reverses the string: "olleh"'
    },
    {
        section: 'Pseudocoding',
        questionNumber: 18,
        questionType: 'mcq',
        difficulty: 'hard',
        marks: 4,
        negativeMarks: 1,
        questionText: `What does this code compute for fib(6)?

function fib(n):
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)`,
        options: [
            { id: 'a', text: '5' },
            { id: 'b', text: '8' },
            { id: 'c', text: '13' },
            { id: 'd', text: '21' }
        ],
        correctAnswer: 'b',
        explanation: 'Fibonacci: 0,1,1,2,3,5,8. fib(6) = 8'
    },
    {
        section: 'Pseudocoding',
        questionNumber: 19,
        questionType: 'mcq',
        difficulty: 'medium',
        marks: 4,
        negativeMarks: 1,
        questionText: `What is wrong with this binary search?

function search(arr, target):
    low = 0
    high = len(arr)
    while low <= high:
        mid = (low + high) / 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            low = mid
        else:
            high = mid
    return -1`,
        options: [
            { id: 'a', text: 'high should be len(arr) - 1' },
            { id: 'b', text: 'low = mid should be low = mid + 1' },
            { id: 'c', text: 'Both A and B' },
            { id: 'd', text: 'mid calculation may overflow' }
        ],
        correctAnswer: 'c',
        explanation: 'Two bugs: 1) high should be len-1, 2) low=mid causes infinite loop, should be mid+1'
    },
    {
        section: 'Pseudocoding',
        questionNumber: 20,
        questionType: 'mcq',
        difficulty: 'easy',
        marks: 4,
        negativeMarks: 1,
        questionText: `What is the output?

x = 10
if x > 5:
    if x > 15:
        print("A")
    else:
        print("B")
else:
    print("C")`,
        options: [
            { id: 'a', text: 'A' },
            { id: 'b', text: 'B' },
            { id: 'c', text: 'C' },
            { id: 'd', text: 'No output' }
        ],
        correctAnswer: 'b',
        explanation: 'x=10 > 5 is true, but 10 > 15 is false, so "B" is printed'
    }
];

// Section 3: Coding Problems (6 questions)
const codingQuestions = [
    {
        section: 'Coding',
        questionNumber: 21,
        questionType: 'coding',
        difficulty: 'easy',
        marks: 15,
        negativeMarks: 0,
        isCoding: true,
        questionText: `Check if a Number is Prime

Write a function that takes an integer n and returns true if it's a prime number, false otherwise.

A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself.

Input: A single integer n
Output: Print "true" or "false"`,
        constraints: '1 <= n <= 10^6',
        codeTemplate: [
            {
                language: 'python',
                template: `def is_prime(n):
    # Your code here
    pass

# Read input
n = int(input())
print("true" if is_prime(n) else "false")`
            },
            {
                language: 'javascript',
                template: `function isPrime(n) {
    // Your code here
}

const n = parseInt(require('fs').readFileSync(0, 'utf-8').trim());
console.log(isPrime(n) ? "true" : "false");`
            },
            {
                language: 'cpp',
                template: `#include <iostream>
using namespace std;

bool isPrime(int n) {
    // Your code here
}

int main() {
    int n;
    cin >> n;
    cout << (isPrime(n) ? "true" : "false") << endl;
    return 0;
}`
            },
            {
                language: 'java',
                template: `import java.util.*;

public class Main {
    public static boolean isPrime(int n) {
        // Your code here
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.println(isPrime(n) ? "true" : "false");
    }
}`
            }
        ],
        testCases: [
            { input: '2', expectedOutput: 'true', isHidden: false },
            { input: '7', expectedOutput: 'true', isHidden: false },
            { input: '1', expectedOutput: 'false', isHidden: false },
            { input: '4', expectedOutput: 'false', isHidden: true },
            { input: '17', expectedOutput: 'true', isHidden: true },
            { input: '100', expectedOutput: 'false', isHidden: true }
        ]
    },
    {
        section: 'Coding',
        questionNumber: 22,
        questionType: 'coding',
        difficulty: 'easy',
        marks: 15,
        negativeMarks: 0,
        isCoding: true,
        questionText: `Sum of Digits

Write a function that takes a positive integer and returns the sum of its digits.

Input: A single positive integer n
Output: Print the sum of digits`,
        constraints: '1 <= n <= 10^9',
        codeTemplate: [
            {
                language: 'python',
                template: `def sum_of_digits(n):
    # Your code here
    pass

n = int(input())
print(sum_of_digits(n))`
            }
        ],
        testCases: [
            { input: '123', expectedOutput: '6', isHidden: false },
            { input: '9999', expectedOutput: '36', isHidden: false },
            { input: '1000000', expectedOutput: '1', isHidden: true },
            { input: '54321', expectedOutput: '15', isHidden: true }
        ]
    },
    {
        section: 'Coding',
        questionNumber: 23,
        questionType: 'coding',
        difficulty: 'medium',
        marks: 20,
        negativeMarks: 0,
        isCoding: true,
        questionText: `Second Largest Element

Find the second largest element in an array. If no such element exists (array has less than 2 elements or all elements are same), return -1.

Input:
- First line: n (size of array)
- Second line: n space-separated integers

Output: Print the second largest element or -1`,
        constraints: '1 <= n <= 10^5\n-10^9 <= arr[i] <= 10^9',
        codeTemplate: [
            {
                language: 'python',
                template: `def second_largest(arr):
    # Your code here
    pass

n = int(input())
arr = list(map(int, input().split()))
print(second_largest(arr))`
            }
        ],
        testCases: [
            { input: '5\n5 2 8 1 9', expectedOutput: '8', isHidden: false },
            { input: '3\n7 7 7', expectedOutput: '-1', isHidden: false },
            { input: '1\n5', expectedOutput: '-1', isHidden: true },
            { input: '5\n1 5 2 5 3', expectedOutput: '3', isHidden: true }
        ]
    },
    {
        section: 'Coding',
        questionNumber: 24,
        questionType: 'coding',
        difficulty: 'medium',
        marks: 20,
        negativeMarks: 0,
        isCoding: true,
        questionText: `Palindrome Check

Write a function that checks if a given string is a palindrome (reads the same forwards and backwards).

Consider only alphanumeric characters and ignore case.

Input: A string s
Output: Print "true" or "false"`,
        constraints: '1 <= len(s) <= 10^5',
        codeTemplate: [
            {
                language: 'python',
                template: `def is_palindrome(s):
    # Your code here
    pass

s = input()
print("true" if is_palindrome(s) else "false")`
            }
        ],
        testCases: [
            { input: 'racecar', expectedOutput: 'true', isHidden: false },
            { input: 'A man a plan a canal Panama', expectedOutput: 'true', isHidden: false },
            { input: 'hello', expectedOutput: 'false', isHidden: false },
            { input: 'Was it a car or a cat I saw', expectedOutput: 'true', isHidden: true }
        ]
    },
    {
        section: 'Coding',
        questionNumber: 25,
        questionType: 'coding',
        difficulty: 'hard',
        marks: 25,
        negativeMarks: 0,
        isCoding: true,
        questionText: `Reverse Words in String

Given a sentence, reverse the order of words while keeping individual words intact.

Input: A string containing words separated by spaces
Output: Print the sentence with words in reversed order

Note: Remove extra spaces between words in output.`,
        constraints: '1 <= len(s) <= 10^4',
        codeTemplate: [
            {
                language: 'python',
                template: `def reverse_words(s):
    # Your code here
    pass

s = input()
print(reverse_words(s))`
            }
        ],
        testCases: [
            { input: 'Newton School of Technology', expectedOutput: 'Technology of School Newton', isHidden: false },
            { input: 'hello world', expectedOutput: 'world hello', isHidden: false },
            { input: '  the   sky is blue  ', expectedOutput: 'blue is sky the', isHidden: true },
            { input: 'a', expectedOutput: 'a', isHidden: true }
        ]
    },
    {
        section: 'Coding',
        questionNumber: 26,
        questionType: 'coding',
        difficulty: 'hard',
        marks: 25,
        negativeMarks: 0,
        isCoding: true,
        questionText: `Two Sum

Given an array of integers and a target sum, find two distinct indices i and j such that arr[i] + arr[j] = target.

Return the indices in ascending order. If no solution exists, return -1.

Input:
- First line: n (size of array)
- Second line: n space-separated integers
- Third line: target sum

Output: Print "i j" (0-indexed) or "-1"`,
        constraints: '2 <= n <= 10^4\n-10^9 <= arr[i] <= 10^9',
        codeTemplate: [
            {
                language: 'python',
                template: `def two_sum(arr, target):
    # Your code here
    pass

n = int(input())
arr = list(map(int, input().split()))
target = int(input())
result = two_sum(arr, target)
if result:
    print(result[0], result[1])
else:
    print(-1)`
            }
        ],
        testCases: [
            { input: '4\n2 7 11 15\n9', expectedOutput: '0 1', isHidden: false },
            { input: '3\n3 2 4\n6', expectedOutput: '1 2', isHidden: false },
            { input: '2\n3 3\n6', expectedOutput: '0 1', isHidden: true },
            { input: '3\n1 2 3\n10', expectedOutput: '-1', isHidden: true }
        ]
    }
];

// Combine all questions
const allQuestions = [...learnabilityQuestions, ...pseudocodingQuestions, ...codingQuestions];

async function seedNSATCoding() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected!');

        // Get the MockTest and Question models
        const MockTest = mongoose.models.MockTest || mongoose.model('MockTest', new mongoose.Schema({
            title: String,
            slug: { type: String, unique: true },
            description: String,
            category: String,
            duration: Number,
            totalMarks: Number,
            sections: [{ name: String, questionCount: Number }],
            difficulty: String,
            isPremium: Boolean,
            isActive: Boolean
        }, { timestamps: true }));

        const Question = mongoose.models.Question || mongoose.model('Question', new mongoose.Schema({
            mockTestId: { type: mongoose.Schema.Types.ObjectId, ref: 'MockTest' },
            section: String,
            questionNumber: Number,
            questionText: String,
            questionType: String,
            options: [{ id: String, text: String }],
            correctAnswer: String,
            explanation: String,
            marks: Number,
            negativeMarks: Number,
            difficulty: String,
            isCoding: Boolean,
            constraints: String,
            codeTemplate: [{ language: String, template: String }],
            testCases: [{ input: String, expectedOutput: String, isHidden: Boolean }]
        }, { timestamps: true }));

        // Check if already exists
        const existing = await MockTest.findOne({ slug: 'nsat-coding-2025' });
        if (existing) {
            console.log('NSAT Coding 2025 already exists. Deleting and recreating...');
            await Question.deleteMany({ mockTestId: existing._id });
            await MockTest.deleteOne({ _id: existing._id });
        }

        // Create mock test
        console.log('Creating NSAT Coding mock test...');
        const mockTest = await MockTest.create(nsatCodingMockTest);
        console.log(`Created mock test: ${mockTest.title} (${mockTest._id})`);

        // Create questions
        console.log('Creating questions...');
        const questionsWithTestId = allQuestions.map(q => ({
            ...q,
            mockTestId: mockTest._id
        }));

        await Question.insertMany(questionsWithTestId);
        console.log(`Created ${questionsWithTestId.length} questions!`);

        console.log('\n✅ NSAT Coding mock test seeded successfully!');
        console.log(`   - 10 Learnability MCQs`);
        console.log(`   - 10 Pseudocoding MCQs`);
        console.log(`   - 6 Coding Problems`);
        console.log(`   - Total: 26 questions, 180 minutes\n`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error seeding:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

seedNSATCoding();
