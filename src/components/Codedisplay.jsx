import hljs from "highlight.js";
import "highlight.js/styles/monokai.css";
import { useEffect, useRef, useState } from "react";
import "./CodeDisplay.css";

function CodeDisplay({ code, userInput = "", currentPosition = 0 }) {
	const codeRef = useRef();
	const containerRef = useRef();
	const [highlightedCode, setHighlightedCode] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [countdown, setCountdown] = useState(3);
	const [showCode, setShowCode] = useState(false);

	useEffect(() => {
		setIsLoading(false);
	}, [code]);

	useEffect(() => {
		if (!isLoading) {
			const timer = setInterval(() => {
				setCountdown((prev) => {
					if (prev <= 1) {
						clearInterval(timer);
						setShowCode(true);
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
			return () => clearInterval(timer);
		}
	}, [isLoading]);

	useEffect(() => {
		if (showCode && codeRef.current) {
			hljs.highlightElement(codeRef.current);
		}
	}, [showCode]);

	useEffect(() => {
		if (!showCode) return;

		// Split the code into words, preserving newlines
		const words = code.split(/(\s+|\n+)/);
		let currentWordIndex = 0;
		let charCount = 0;

		for (let i = 0; i < words.length; i++) {
			charCount += words[i].length;
			if (charCount > currentPosition) {
				currentWordIndex = i;
				break;
			}
		}

		const newHighlightedCode = words.map((word, index) => {
			// Handle newlines separately
			if (word === "\n") {
				return { text: word, status: "pending" };
			}

			if (!word.trim() && word !== "") {
				return { text: word, status: "pending" };
			}

			if (index < currentWordIndex) {
				let wordStart = 0;
				for (let i = 0; i < index; i++) {
					wordStart += words[i].length;
				}
				const wordEnd = wordStart + word.length;
				const userInputForWord = userInput.slice(wordStart, wordEnd);

				if (
					userInputForWord.length < word.length ||
					userInputForWord !== word
				) {
					return { text: word, status: "incorrect" };
				}
				return { text: word, status: "correct" };
			}

			if (index === currentWordIndex) {
				let wordStart = 0;
				for (let i = 0; i < index; i++) {
					wordStart += words[i].length;
				}
				const currentWordInput = userInput.slice(wordStart, currentPosition);
				const currentWordPart = word.slice(0, currentWordInput.length);

				if (currentWordInput === word) {
					return { text: word, status: "correct" };
				}

				if (currentWordInput === currentWordPart) {
					return { text: word, status: "typing" };
				}

				return { text: word, status: "incorrect" };
			}

			return { text: word, status: "pending" };
		});

		setHighlightedCode(newHighlightedCode);
	}, [code, userInput, currentPosition, showCode]);

	// Scroll to current position
	useEffect(() => {
		if (containerRef.current && currentPosition > 0) {
			const lineHeight = 24; // Approximate line height
			const linesToScroll = Math.floor(currentPosition / 80); // Approximate characters per line
			const scrollPosition = linesToScroll * lineHeight;

			containerRef.current.scrollTo({
				top: scrollPosition,
				behavior: "smooth",
			});
		}
	}, [currentPosition]);

	if (isLoading) {
		return <div className='loading'>Loading code snippet...</div>;
	}

	if (!showCode) {
		return <div className='countdown'>Starting in {countdown}...</div>;
	}

	return (
		<pre
			ref={containerRef}
			className='code-container'>
			<code
				ref={codeRef}
				className='language-javascript'>
				{highlightedCode.map((word, index) => (
					<span
						key={index}
						className={`word-block ${word.status}`}>
						{word.text}
					</span>
				))}
			</code>
		</pre>
	);
}

export default CodeDisplay;
