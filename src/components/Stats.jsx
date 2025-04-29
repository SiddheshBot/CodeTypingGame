function Stats({ wpm, accuracy }) {
	return (
		<div className='stats'>
			<p>
				<strong>WPM:</strong> {wpm}
			</p>
			<p>
				<strong>Accuracy:</strong> {accuracy}%
			</p>
		</div>
	);
}

export default Stats;
