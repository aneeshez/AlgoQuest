from django.core.management.base import BaseCommand
from apps.curriculum.models import LearningModule, Lesson

MODULES = [
    ("programming-foundations", "Programming foundations", "Build a reliable base with values, decisions, loops, functions, and small problem-solving patterns.", ["Variables and values", "Conditions and decisions", "Loops and repetition", "Functions and decomposition", "Trace a small program"]),
    ("complexity-analysis", "Complexity analysis", "Describe how runtime and memory grow as an input grows, using Big O as a practical language.", ["Count the work", "Big O notation", "Time and space tradeoffs", "Best, average, and worst cases"]),
    ("arrays-strings", "Arrays and strings", "Work confidently with ordered data through traversal, searching, sorting, and reusable pointer patterns.", ["Array operations", "Linear and binary search", "Sorting fundamentals", "Two pointers", "Sliding window"]),
    ("hashing", "Hashing", "Use dictionaries and sets to turn repeated searches into fast lookups and frequency counts.", ["Dictionaries as lookup tables", "Set membership", "Frequency counting", "Hash maps and collisions"]),
    ("recursion-backtracking", "Recursion and backtracking", "Use base cases and smaller subproblems to explore choices without losing track of state.", ["Recursive thinking", "Base cases and call stack", "Backtracking choices", "Generate combinations"]),
    ("linked-lists", "Linked lists", "Follow node references to insert, remove, reverse, and detect cycles in linked structures.", ["Singly linked nodes", "Insert and delete", "Reverse a list", "Cycle detection"]),
    ("stacks-queues", "Stacks and queues", "Choose a structure based on the order in which work should be handled.", ["Stack and LIFO", "Queue and FIFO", "Monotonic stacks", "Deque and circular queue"]),
    ("trees", "Trees", "Represent hierarchies and traverse them using recursion, queues, and priority-based structures.", ["Binary tree anatomy", "Depth-first traversal", "Binary search trees", "Heaps and priority queues"]),
    ("graphs", "Graphs", "Model relationships as vertices and edges, then explore them and reason about paths.", ["Graph representations", "Breadth-first search", "Depth-first search", "Shortest paths and cycles"]),
    ("advanced-algorithms", "Advanced algorithms", "Recognize when local choices or reused subproblem answers can make a hard problem manageable.", ["Greedy choices", "Overlapping subproblems", "Memoization", "Tabulation"]),
]

LESSON_DETAILS = {
    "Variables and values": {
        "concept": "A variable is a name that refers to a value. In Python, assigning `score = 7` binds the name score to the integer 7. The type tells Python what operations make sense for that value: integers count, strings hold text, and booleans represent true or false.",
        "analogy": "Think of a labeled jar. The label is the variable name, and what you place inside is the current value. You can replace the contents while keeping the same label.",
        "demonstration": "Run the code and notice that updating score changes what the final print displays. Assignment reads the expression on the right first, then binds the resulting value to the name on the left.",
        "steps": ["Create score and bind it to 7.", "Add 3 to the current score and bind the result back to score.", "Print the new value: 10."],
        "python_code": "score = 7\nscore = score + 3\nprint(score)  # 10",
        "code_explanation": "The second line evaluates score + 3 using the old value, then assigns the result to score. `score += 3` is a shorter equivalent.",
        "dry_run": [{"line": 1, "score": "7"}, {"line": 2, "score": "10"}, {"line": 3, "output": "10"}],
        "experiment_prompt": "Change the starting score below. The increment stays at 3. Predict the printed value before you check it.",
        "check_question": "After `items = 4` and then `items = items * 2`, what is items?",
        "check_options": ["4", "6", "8", "It is undefined"], "check_answer": 2,
        "check_explanation": "The multiplication reads the old value (4), computes 8, and assigns 8 back to items.",
        "assignment_prompt": "Create variables `width = 8` and `height = 3`. Print their area and perimeter using the variables.",
    },
    "Loops and repetition": {
        "concept": "A loop repeats a block of instructions. A `for` loop is useful when iterating through a known sequence; a `while` loop repeats as long as a condition stays true. Every loop needs a clear way to make progress toward stopping.",
        "analogy": "A loop is a checklist: do the current item, move to the next, and stop when the list is finished.",
        "demonstration": "The loop visits each number in range(1, 5). The stop value 5 is excluded, so the printed values are 1 through 4.",
        "steps": ["Start at 1.", "Print the current number.", "Advance to the next number.", "Stop before 5."],
        "python_code": "total = 0\nfor number in range(1, 5):\n    total += number\nprint(total)  # 10",
        "code_explanation": "`range(1, 5)` produces 1, 2, 3, 4. The accumulator total keeps the sum after each pass.",
        "dry_run": [{"number": 1, "total": 1}, {"number": 2, "total": 3}, {"number": 3, "total": 6}, {"number": 4, "total": 10}],
        "experiment_prompt": "Change the range to `range(1, 6)`. Predict the new total, then verify it.",
        "check_question": "How many times does `for i in range(2, 6)` run?",
        "check_options": ["3", "4", "5", "6"], "check_answer": 1,
        "check_explanation": "The range includes 2, 3, 4, and 5: four values. The end value is excluded.",
        "assignment_prompt": "Write a loop that adds the integers from 1 through 20 and prints the result.",
    },
    "Big O notation": {
        "concept": "Big O describes how an algorithm's resource use grows with input size. It focuses on the dominant growth pattern: scanning every item is O(n), while repeatedly halving a sorted search range is O(log n). It helps compare approaches as inputs get large.",
        "analogy": "Imagine checking seats in a row. Looking at every seat scales with the number of seats. If the row is sorted and each check lets you discard half, the number of checks grows much more slowly.",
        "demonstration": "A single loop over n items performs n visits. Doubling the list roughly doubles its work, which is linear growth.",
        "steps": ["Let n be the number of list items.", "The loop body runs once per item.", "There are n visits, so the work is O(n).", "Ignore constant factors when describing growth."],
        "python_code": "def contains_zero(values):\n    for value in values:\n        if value == 0:\n            return True\n    return False",
        "code_explanation": "In the worst case, the loop examines every item. The function stores only a few extra variables, so its auxiliary space is O(1).",
        "dry_run": [{"input": "[3, 1, 0, 9]", "visits": 3, "result": True}],
        "experiment_prompt": "Count how many values are checked when the zero is first, last, or missing.",
        "check_question": "A loop examines each of n items once. What is its time complexity?",
        "check_options": ["O(1)", "O(log n)", "O(n)", "O(n²)"], "check_answer": 2,
        "check_explanation": "One visit per item means the work grows proportionally with n: O(n).",
        "assignment_prompt": "Given a list, count how many values are greater than 10. State its time and extra-space complexity.",
    },
}

class Command(BaseCommand):
    help = "Create the ordered ten-world AlgoQuest curriculum and introductory lessons."

    def handle(self, *args, **options):
        for number, (slug, title, summary, lesson_titles) in enumerate(MODULES, start=1):
            section = LearningModule.Section.BASICS if number <= 3 else LearningModule.Section.MEDIUM if number <= 7 else LearningModule.Section.ADVANCED
            module, _ = LearningModule.objects.update_or_create(slug=slug, defaults={"number": number, "section": section, "title": title, "summary": summary, "difficulty": "beginner" if number < 5 else "intermediate"})
            for order, lesson_title in enumerate(lesson_titles, start=1):
                details = LESSON_DETAILS.get(lesson_title, {})
                defaults = {
                    "title": lesson_title, "order": order, "duration_minutes": 8 + order * 2,
                    "concept": details.get("concept", f"{lesson_title} is a core idea in {title.lower()}. Start by identifying the data involved, what one operation does, and how the state changes after each step. Then compare a simple approach with one that uses this structure or pattern to reduce repeated work."),
                    "analogy": details.get("analogy", f"Think of {lesson_title.lower()} as a tool in a problem-solving workshop. The tool is useful when its rules match the shape of the task; first identify the rule, then practice applying it to a small example."),
                    "demonstration": details.get("demonstration", f"We will trace a tiny example of {lesson_title.lower()} by hand, naming the state before each operation and checking the result after it."),
                    "steps": details.get("steps", [f"Identify the input and the goal for {lesson_title.lower()}.", "Trace one small example by hand.", "Apply the operation and check the updated state."]),
                    "python_code": details.get("python_code", "# Start with a tiny example\nvalues = [3, 1, 4]\nprint(values)"),
                    "code_explanation": details.get("code_explanation", "Use a small input first. Read each line in order and track which values or references change."),
                    "dry_run": details.get("dry_run", [{"step": 1, "state": "Start with a small input"}, {"step": 2, "state": "Apply one operation"}, {"step": 3, "state": "Check the result"}]),
                    "experiment_prompt": details.get("experiment_prompt", "Change one value in the example. Predict the result before you run it, then explain why it changed."),
                    "check_question": details.get("check_question", f"What should you identify first when using {lesson_title.lower()}?"),
                    "check_options": details.get("check_options", ["The input and the desired result", "A random variable name", "The color of the output", "Only the final line of code"]),
                    "check_answer": details.get("check_answer", 0),
                    "check_explanation": details.get("check_explanation", "Knowing the input and goal lets you trace each operation and judge whether the result is correct."),
                    "assignment_prompt": details.get("assignment_prompt", f"Create a tiny Python example that demonstrates {lesson_title.lower()}. Include an input, perform the core operation, and print a result you can verify."),
                    "xp_reward": 20,
                }
                Lesson.objects.update_or_create(module=module, slug=f"{order}-{lesson_title.lower().replace(' ', '-').replace('&', 'and')}", defaults=defaults)
        self.stdout.write(self.style.SUCCESS(f"Seeded {LearningModule.objects.count()} modules and {Lesson.objects.count()} lessons."))
