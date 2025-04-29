import hljs from "highlight.js";
import "highlight.js/styles/monokai.css";
import { useEffect, useRef, useState } from "react";
import "./CodeDisplay.css";

function CodeDisplay({ code, userInput = "", currentPosition = 0 }) {
	const codeRef = useRef();
	const [highlightedCode, setHighlightedCode] = useState([]);

	useEffect(() => {
		hljs.highlightElement(codeRef.current);
	}, [code]);

	useEffect(() => {
		const words = code.split(/(\s+)/);
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
			if (!word.trim() && word !== "") {
				return { text: word, status: "pending" };
			}

			if (index < currentWordIndex) {
				return { text: word, status: "correct" };
			}

			if (index === currentWordIndex) {
				const wordStart = charCount - word.length;
				const currentWordInput = userInput.slice(wordStart, currentPosition);

				if (currentWordInput === word.slice(0, currentWordInput.length)) {
					return { text: word, status: "typing" };
				} else {
					return { text: word, status: "incorrect" };
				}
			}

			return { text: word, status: "pending" };
		});

		setHighlightedCode(newHighlightedCode);
	}, [code, userInput, currentPosition]);

	return (
		<pre>
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
