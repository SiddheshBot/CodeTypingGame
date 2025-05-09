import { useState, useEffect } from "react";
import { faker } from "@faker-js/faker";

function FetchRandomSnippet({ setSnippet, onSnippetFetched, language }) {
	const [loading, setLoading] = useState(true);

	const getRepoUrl = (lang) => {
		switch (lang) {
			case "python":
				return "https://api.github.com/repos/bukeme/social-network/contents/chats";
			case "javascript":
				return "https://api.github.com/repos/nodejs/nodejs.org/contents/apps/site/components";
			case "java":
				return "https://api.github.com/repos/jpcsp/jpcsp/contents/src/com/twilight/h264/util";
			case "text":
				return null; // For text mode, we don't need a repo URL
			default:
				return "https://api.github.com/repos/bukeme/social-network/contents/chats";
		}
	};

	const getFileExtension = (lang) => {
		switch (lang) {
			case "python":
				return ".py";
			case "javascript":
				return ".tsx";
			case "java":
				return ".java";
			case "text":
				return null; // For text mode, we don't need a file extension
			default:
				return ".py";
		}
	};

	const generateRandomParagraph = () => {
		// Generate 3-5 paragraphs of text
		const numParagraphs = Math.floor(Math.random() * 3) + 3;
		const paragraphs = [];

		for (let i = 0; i < numParagraphs; i++) {
			paragraphs.push(faker.lorem.paragraph());
		}

		return paragraphs.join("\n\n");
	};

	useEffect(() => {
		const fetchRandomSnippet = async () => {
			try {
				if (language === "text") {
					// Generate random paragraphs for text mode
					const paragraphs = generateRandomParagraph();
					setSnippet(paragraphs);
					setLoading(false);
					onSnippetFetched();
					return;
				}

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

				let finalSnippet = "";
				if (processedLines.length > 10) {
					const startIndex = Math.floor(
						Math.random() * (processedLines.length - 10)
					);
					const selectedLines = processedLines.slice(
						startIndex,
						startIndex + 10
					);
					finalSnippet = selectedLines.join("\n");
				} else if (processedLines.length > 0) {
					finalSnippet = processedLines.join("\n");
				} else {
					throw new Error("No valid code after skipping header");
				}

				// If snippet is less than 500 characters, fetch another snippet
				if (finalSnippet.length < 500) {
					console.log("Snippet too short, fetching additional snippet...");
					console.log("Current snippet length:", finalSnippet.length);
					console.log("Available files:", codeFiles.length);

					// Get a different random file from the repository
					const availableFiles = codeFiles.filter(
						(file) => file.name !== randomFile.name
					);
					console.log("Available different files:", availableFiles.length);

					if (availableFiles.length > 0) {
						const anotherRandomFile =
							availableFiles[Math.floor(Math.random() * availableFiles.length)];
						console.log("Selected another file:", anotherRandomFile.name);

						const anotherRawResponse = await fetch(
							anotherRandomFile.download_url
						);
						if (anotherRawResponse.ok) {
							const anotherRawCode = await anotherRawResponse.text();
							const anotherLines = anotherRawCode
								.split("\n")
								.filter((line) => line.trim() !== "")
								.slice(20)
								.map((line) => line.trimStart());

							if (anotherLines.length > 0) {
								const anotherStartIndex = Math.floor(
									Math.random() * (anotherLines.length - 10)
								);
								const anotherSelectedLines = anotherLines.slice(
									anotherStartIndex,
									anotherStartIndex + 10
								);
								const additionalSnippet = anotherSelectedLines.join("\n");
								console.log(
									"Additional snippet length:",
									additionalSnippet.length
								);
								finalSnippet += "\n\n" + additionalSnippet;
							} else {
								console.log("No valid lines found in additional file");
							}
						} else {
							console.log("Failed to fetch additional file content");
						}
					} else {
						console.log("No other files available in the repository");
					}
				}

				setSnippet(finalSnippet);
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
					text: generateRandomParagraph(),
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
