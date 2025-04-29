import hljs from "highlight.js";
import "highlight.js/styles/monokai.css";
import { useEffect, useRef } from "react";

function CodeDisplay({ code }) {
	const codeRef = useRef();

	useEffect(() => {
		hljs.highlightElement(codeRef.current);
	}, [code]);

	return (
		<pre>
			<code
				ref={codeRef}
				className='language-javascript'>
				{code}
			</code>
		</pre>
	);
}

export default CodeDisplay;
