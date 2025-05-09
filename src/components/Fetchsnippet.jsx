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

	const MAX_RETRIES = 3;

	const fetchFileContent = async (file) => {
		const response = await fetch(file.download_url);
		if (!response.ok) {
			throw new Error(`Failed to fetch file content: ${response.status}`);
		}
		return response.text();
	};

	const processCodeContent = (rawCode) => {
		const lines = rawCode.split("\n").filter((line) => line.trim() !== "");
		const linesWithoutHeader = lines.slice(20); // Skip potential header comments
		return linesWithoutHeader.map((line) => line.trimStart());
	};

	const getRandomSnippet = (processedLines) => {
		if (processedLines.length > 10) {
			const startIndex = Math.floor(
				Math.random() * (processedLines.length - 10)
			);
			const selectedLines = processedLines.slice(startIndex, startIndex + 10);
			return selectedLines.join("\n");
		} else if (processedLines.length > 0) {
			return processedLines.join("\n");
		}
		return "";
	};

	const fetchRandomSnippet = async (retryCount = 0) => {
		try {
			if (language === "text") {
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
			const codeFiles = files.filter(
				(file) => file.type === "file" && file.name.endsWith(fileExtension)
			);

			if (codeFiles.length === 0) {
				throw new Error(`No ${language} files found in the repository`);
			}

			let finalSnippet = "";
			let attempts = 0;
			const maxAttempts = 3;

			while (finalSnippet.length < 500 && attempts < maxAttempts) {
				const randomFile =
					codeFiles[Math.floor(Math.random() * codeFiles.length)];
				const rawCode = await fetchFileContent(randomFile);
				const processedLines = processCodeContent(rawCode);

				if (processedLines.length > 0) {
					const snippet = getRandomSnippet(processedLines);
					if (snippet.length > 0) {
						finalSnippet += (finalSnippet ? "\n\n" : "") + snippet;
					}
				}

				attempts++;
			}

			if (finalSnippet.length === 0 && retryCount < MAX_RETRIES) {
				console.log(
					`No valid snippet found, retrying... (${
						retryCount + 1
					}/${MAX_RETRIES})`
				);
				return fetchRandomSnippet(retryCount + 1);
			}

			if (finalSnippet.length === 0) {
				throw new Error(
					"Could not find valid code snippets after multiple attempts"
				);
			}

			setSnippet(finalSnippet);
			setLoading(false);
			onSnippetFetched();
		} catch (error) {
			console.error(`Error fetching ${language} code:`, error);
			if (retryCount < MAX_RETRIES) {
				console.log(`Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
				return fetchRandomSnippet(retryCount + 1);
			}

			// Use fallback snippets if all retries fail
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

	useEffect(() => {
		fetchRandomSnippet();
	}, [setSnippet, onSnippetFetched, language]);

	if (loading) {
		return <div>Loading...</div>;
	}

	return null;
}

export default FetchRandomSnippet;
