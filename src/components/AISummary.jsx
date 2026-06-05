function AISummary({ summary, issues }) {
  return (
    <section className="ai-summary">
      <p className="section-label">AI-generated summary</p>
      <p>{summary}</p>

      <div className="issue-tags">
        {issues.map((issue) => (
          <span key={issue}>{issue}</span>
        ))}
      </div>
    </section>
  );
}

export default AISummary;