import { useState, useEffect } from "react";

function FetchRandomSnippet({ setSnippet, onSnippetFetched, language }) {
	const [loading, setLoading] = useState(true);

	const getRepoUrl = (lang) => {
		switch (lang) {
			case "python":
				return "https://api.github.com/repos/bukeme/social-network/contents/chats";
			case "javascript":
				return "https://api.github.com/repos/Vasu7389/react-project-ideas/contents/day010/personal-portfolio/src/components";
			case "java":
				return "https://api.github.com/repos/kishanrajput23/Java-Projects-Collections/contents/Admission-counselling-system/src/student/information/system";
			default:
				return "https://api.github.com/repos/bukeme/social-network/contents/chats";
		}
	};

	const getFileExtension = (lang) => {
		switch (lang) {
			case "python":
				return ".py";
			case "javascript":
				return ".js";
			case "java":
				return ".java";
			default:
				return ".py";
		}
	};

	useEffect(() => {
		const fetchRandomSnippet = async () => {
			try {
				const repoUrl = getRepoUrl(language);
				const fileExtension = getFileExtension(language);

				console.log(`Fetching ${language} code from:`, repoUrl);

				const response = await fetch(repoUrl);
				if (!response.ok) {
					throw new Error(`GitHub API error: ${response.status}`);
				}

				const files = await response.json();
				console.log("Files found:", files);

				const codeFiles = files.filter(
					(file) => file.type === "file" && file.name.endsWith(fileExtension)
				);

				console.log(`Filtered ${language} files:`, codeFiles);

				if (codeFiles.length === 0) {
					throw new Error(`No ${language} files found in the repository`);
				}

				const randomFile =
					codeFiles[Math.floor(Math.random() * codeFiles.length)];

				console.log("Selected file:", randomFile);

				const rawResponse = await fetch(randomFile.download_url);
				if (!rawResponse.ok) {
					throw new Error(
						`Failed to fetch file content: ${rawResponse.status}`
					);
				}

				const rawCode = await rawResponse.text();
				console.log("Raw code fetched successfully");

				const lines = rawCode.split("\n").filter((line) => line.trim() !== "");

				const linesWithoutHeader = lines.slice(20);

				const processedLines = linesWithoutHeader.map((line) =>
					line.trimStart()
				);

				if (processedLines.length > 10) {
					const startIndex = Math.floor(
						Math.random() * (processedLines.length - 10)
					);
					const selectedLines = processedLines.slice(
						startIndex,
						startIndex + 10
					);
					setSnippet(selectedLines.join("\n"));
				} else if (processedLines.length > 0) {
					setSnippet(processedLines.join("\n"));
				} else {
					throw new Error("No valid code after skipping header");
				}

				setLoading(false);
				onSnippetFetched();
			} catch (error) {
				console.error(`Error fetching ${language} code:`, error);
				const fallbackSnippets = {
					python: `def hello_world():
print("Hello, World!")
return True

def calculate_sum(a, b):
return a + b

def is_even(num):
return num % 2 == 0

def factorial(n):
if n == 0:
return 1
return n * factorial(n-1)`,
					javascript: `function helloWorld() {
console.log("Hello, World!");
return true;
}

function calculateSum(a, b) {
return a + b;
}

function isEven(num) {
return num % 2 === 0;
}

function factorial(n) {
if (n === 0) return 1;
return n * factorial(n - 1);
}`,
					java: `public class HelloWorld {
public static void main(String[] args) {
System.out.println("Hello, World!");
}

public static int calculateSum(int a, int b) {
return a + b;
}

public static boolean isEven(int num) {
return num % 2 == 0;
}

public static int factorial(int n) {
if (n == 0) return 1;
return n * factorial(n - 1);
}
}`,
				};

				setSnippet(fallbackSnippets[language] || fallbackSnippets.python);
				setLoading(false);
				onSnippetFetched();
			}
		};

		fetchRandomSnippet();
	}, [setSnippet, onSnippetFetched, language]);

	if (loading) {
		return <div>Loading...</div>;
	}

	return null;
}

export default FetchRandomSnippet;
