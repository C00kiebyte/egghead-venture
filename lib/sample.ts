export const SAMPLE_CS = `# Computer Science Basics

## Data Structures
- Array: A block of items stored side by side and read by index.
- Linked List: Nodes that each point to the next node in the chain.
- Stack: Last in, first out. The newest item leaves first.
- Queue: First in, first out. Items leave in arrival order.
- Hash Table: Stores key-value pairs and finds them by hashing the key.
- Binary Tree: A hierarchy where every node has at most two children.
- Graph: Nodes joined by edges, used to model relationships.

## Algorithms
- Recursion: A function that solves a problem by calling itself on a smaller one.
- Binary Search: Finds an item in sorted data by repeatedly halving the range.
- Sorting: Putting items into a defined order.
- Big O: Describes how running time grows with input size.
- Divide and Conquer: Split a problem, solve the parts, combine the results.
- Dynamic Programming: Reuse answers to overlapping subproblems.
- Greedy: Take the best local choice at every step.
- Graph: Nodes joined by edges, used to model relationships.

## Networking
- IP Address: A number that identifies a device on a network.
- DNS: Translates domain names into IP addresses.
- TCP: A protocol that delivers data reliably and in order.
- HTTP: The protocol browsers use to request web pages.
- Router: Forwards packets between networks.
- Packet: A small chunk of data sent across a network.
- Firewall: Filters traffic using security rules.

## Databases
- SQL: A language for querying relational databases.
- Primary Key: A column that uniquely identifies each row.
- Index: A lookup structure that makes queries faster.
- Transaction: A group of operations that succeed or fail together.
- Normalization: Organizing tables to reduce duplicated data.
- Join: Combines rows from two tables using a related column.
- Hash Table: Stores key-value pairs and finds them by hashing the key.

## Operating Systems
- Process: A running program with its own memory space.
- Thread: A unit of execution inside a process.
- Scheduler: Decides which process gets the CPU next.
- Deadlock: Two tasks wait on each other forever.
- Virtual Memory: Lets programs use more memory than physically exists.
- Kernel: The core of the OS that manages hardware.
- Mutex: A lock that lets only one thread in at a time.
- Queue: First in, first out. Items leave in arrival order.`;

export const SAMPLE_APP_DEV = `# Software Design Principles

## Software Design Architecture
- Software Architecture: The overall structure and design of a software development project[cite: 1].
- Source Code: The underlying instructions developers modify when changing project requirements[cite: 1].
- Design Principles: Guidelines helping developers arrange classes to easily adapt to requirement changes[cite: 1].
- Rigidity: The system is hard to change because modifications affect many parts[cite: 1].
- Fragility: Unexpected parts of the system break when applying new code changes[cite: 1].
- Immobility: Modules are hard to reuse because they cannot be easily extracted[cite: 1].

## The SOLID Principles
- SRP: Each software module or class should have only one reason to change[cite: 1].
- OCP: Classes should be open for extension but closed for modification[cite: 1, 3].
- LSP: Derived classes should be fully substitutable for their base classes without issues[cite: 1, 3].
- ISP: Clients should never be forced to implement interfaces they do not use[cite: 1, 4].
- DIP: High-level and low-level classes should both depend completely on abstractions[cite: 1, 5].

## Class Extensions
- Responsibility: A specific duty or reason to change assigned to a single class[cite: 1].
- Actor: A user whose needs dictate the reason a software class must change[cite: 1].
- Base Class: An original class from which new classes can be safely derived[cite: 1, 3].
- Derived Class: A new class created to extend functionality without modifying original code[cite: 3].
- Extension: Adding new behavior by deriving a new class without modifying existing ones[cite: 3].
- Modification: Changing existing tested code which might cause parts of the software to break[cite: 3].
- Unit Testing: A validation process that must be repeated if existing methods are modified[cite: 3].

## Interfaces And Dependencies
- High-Level Class: A class that does something significant in the main software application[cite: 5].
- Low-Level Class: A class that performs secondary or supporting work in the main application[cite: 5].
- Abstraction: A general concept like an interface that hides specific implementation details[cite: 5, 6].
- Concretion: The specific implementation details that should strictly depend on an abstraction[cite: 5].
- Big Interface: A poor design flaw where one structure handles too many distinct methods[cite: 4].
- Small Interface: A divided structure that serves only one submodule or specific client need[cite: 4].`;

export const SAMPLE_CYBERSEC = `# Threats And Vulnerabilities

## Threat Categories
- Threat: A potential occurrence that can damage or disrupt organizational operations[cite: 7].
- Natural Threats: Environmental events like floods or earthquakes that cause physical damage[cite: 7].
- Unintentional Threats: Accidental errors or negligence by employees causing severe security breaches[cite: 7].
- Intentional Threats: Deliberate actions taken to harm or exploit a target organization[cite: 8].
- Internal Threats: Insider attacks performed by employees familiar with local network architecture[cite: 8].
- External Threats: Attacks executed by outsiders exploiting weaknesses in a target network[cite: 8].
- Structured Threats: Sophisticated attacks planned by highly skilled individuals using specialized tools[cite: 8].
- Unstructured Threats: Basic attacks performed mostly by unskilled individuals out of curiosity[cite: 8].

## Malware Types
- Malware: Malicious software designed to perform unauthorized activities on a computer system[cite: 9].
- Trojan: Harmful malicious code hidden inside a seemingly safe program or file[cite: 9].
- Virus: A self-replicating malicious program that attaches itself to other executable files[cite: 9].
- Computer Worms: Independent malicious programs that replicate across networks without human intervention[cite: 9].
- Ransomware: Malware that restricts system access until a monetary payment is made[cite: 10].
- Rootkit: Hidden software designed to gain undetected root privileges over operating systems[cite: 10].
- Spyware: Stealthy monitoring software that secretly records all your daily computer activities[cite: 10].
- Grayware: Potentially unwanted applications that pose major risks to privacy and performance[cite: 11].
- Keylogger: Secret software or hardware that directly records every struck keyboard key[cite: 11].
- Botnets: A massive network of compromised computers controlled remotely for automated tasks[cite: 11].
- Fileless Malware: Memory-based malicious code that infects legitimate software without leaving files[cite: 12].

## System Vulnerabilities
- Vulnerability: A major weakness in a system design that external attackers can exploit[cite: 12].
- Misconfiguration: Incorrect system settings that accidentally allow external attackers unauthorized internal access[cite: 12].
- Default Installations: Standard setup configurations that external hackers can easily guess to break inside[cite: 13].
- Buffer Overflows: Severe coding errors causing application data to spill into adjacent memory locations[cite: 13].
- Unpatched Servers: Outdated infrastructure network components missing critical security updates and software fixes[cite: 13].
- Design Flaws: Major logical errors in system functionality like poor incoming data validation methods[cite: 13].
- Open Services: Unsecured open network ports that allow attackers to perform further network attacks[cite: 13].
- Zero-Day: Unknown software weaknesses successfully exploited before developers can release a security patch[cite: 14].

## Assessment Methods
- Active Scanning: Interacting directly with the target network to actively uncover hidden security vulnerabilities[cite: 14].
- Passive Scanning: Identifying network weaknesses by secretly monitoring normal communication traffic network patterns[cite: 14].
- External Assessment: Evaluating enterprise network security from an outsider perspective to find network exploits[cite: 15].
- Internal Assessment: Scrutinizing the local organizational internal network to clearly find exploits and vulnerabilities[cite: 15].
- Host-Based Assessment: Examining specific local system configurations and user directories for potential system compromise[cite: 15].
- Network Assessment: Discovering active network resources and successfully mapping open ports for security gaps[cite: 15].
- Credentialed Assessment: Scanning a system using valid administrative logins to deeply find hidden flaws[cite: 16].
- Manual Assessment: Security professionals manually ranking detected flaws using databases like the common CVE[cite: 16].

## Management Lifecycle
- Baseline Creation: Identifying all critical assets to properly establish a standard for regular configurations[cite: 16, 17].
- Vulnerability Scan: Using proper automated tools to detect known infrastructure weaknesses against compliance guidelines[cite: 17].
- Risk Assessment: Evaluating and deeply prioritizing system uncertainties to determine appropriate organizational remediation plans[cite: 17].
- Remediation: Applying specific internal technical fixes to vulnerable computing systems to reduce potential impacts[cite: 17].
- Verification: Rescanning the managed environment to successfully confirm that all individual fixes were applied[cite: 17].
- Continuous Monitor: Using network firewalls and intrusion systems to successfully identify newly evolved network threats[cite: 17].`;

export const SAMPLE_AUTOMATA = `# Automata Theory Basics

## History And Core Concepts
- Turing Machine: An abstract machine model capable of performing any computational process[cite: 18].
- Automata Theory: The formal study of computation logic using simple abstract machines[cite: 18].
- Automaton: A logically defined system operating without direct human participation[cite: 18].
- Mealy And Moore Machine: A finite state machine structure finalized around the year 1960[cite: 18].
- Formal Languages: A distinct hierarchy structured by Noam Chomsky based on required grammar properties[cite: 18].

## Real World Applications
- Compiler Design: The main software application area that heavily uses automata theory[cite: 18].
- Lexical Analyzer: The initial compiler phase specifically designed by applying finite automata[cite: 18].
- Syntax Error: A common programming mistake checked using context-free grammar rules[cite: 18].
- NLP Software: Technology dealing with human language that utilizes automata software principles[cite: 18].

## Automata Characteristics
- Clock Pulse: A specific time instance when an automaton receives new external inputs[cite: 18].
- Input Alphabet: The finite set containing all valid input signals for a machine[cite: 18].
- Output Alphabet: The predefined set containing all possible outputs generated by an automaton[cite: 18].
- Discrete State: A specific condition an automaton resides in at any time instance[cite: 18].
- State Transition: A formal functional relation producing the next state from current inputs[cite: 18].
- Output Relation: The functional rule determining output based on current state and optional inputs[cite: 18].

## Finite Automata Structure
- Finite Automata: Abstract machine formats that correspond directly to type 3 grammar languages[cite: 18].
- Initial State: The specific starting condition assigned to a finite automaton machine[cite: 19].
- Final State: The distinct concluding condition an automaton reaches for a successful operation[cite: 19].
- Transitional Function: The mathematical rule defining exactly how machine states change during processing[cite: 19].
- Input Tape: A divided strip containing sequence characters and required end markers[cite: 19].
- Reading Head: The mechanical component that directly scans symbols from the input tape[cite: 19].
- Finite Control: The active central unit deciding subsequent states based on read inputs[cite: 19].

## String Processing
- Traversed String: An input sequence that has been completely read by the machine[cite: 20].
- Accepted String: An input sequence successfully reaching a final state after full traversal[cite: 20].
- Rejected String: An input sequence ending in a non-final state after full processing[cite: 20].
- Tabular Representation: A strict matrix format displaying present states alongside their possible next transitions[cite: 20].
- Graphical Diagram: A distinct visual representation mapping the exact transitions between all finite states[cite: 19, 20].`;
