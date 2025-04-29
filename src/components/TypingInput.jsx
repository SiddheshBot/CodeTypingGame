function TypingInput({ value, onChange, snippet }) {
	const getTextColor = (char, index) => {
		if (index >= value.length) return "#eee";
		const snippetChar = snippet[index];
		return char === snippetChar ? "#4CAF50" : "#f44336";
	};

	const renderColoredText = () => {
		return value.split("").map((char, index) => (
			<span
				key={index}
				style={{ color: getTextColor(char, index) }}>
				{char}
			</span>
		));
	};

	return (
		<div
			style={{
				position: "relative",
				textAlign: "left",
				width: "100%",
				maxWidth: "1500px",
				margin: "0 auto",
				fontFamily: "Fira Code, monospace",
				fontSize: "1rem",
				lineHeight: "1.5",
			}}>
			<textarea
				value={value}
				onChange={(e) => onChange(e.target.value)}
				rows='6'
				placeholder='Start typing here...'
				autoFocus
				spellCheck='false'
				style={{
					width: "100%",
					fontFamily: "Fira Code, monospace",
					fontSize: "1rem",
					lineHeight: "1.5",
					color: "transparent",
					caretColor: "#eee",
					background: "transparent",
					position: "relative",
					zIndex: 1,
					textAlign: "left",
					padding: "10px",
					boxSizing: "border-box",
					border: "none",
					resize: "none",
					overflow: "hidden",
				}}
			/>
			<div
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					padding: "10px",
					fontFamily: "Fira Code, monospace",
					fontSize: "1rem",
					lineHeight: "1.5",
					whiteSpace: "pre-wrap",
					pointerEvents: "none",
					zIndex: 0,
					textAlign: "left",
					boxSizing: "border-box",
				}}>
				{renderColoredText()}
			</div>
		</div>
	);
}

export default TypingInput;
