// Simple in-memory store (Simulated Database)
// Warning: Data is lost when the server restarts or function container cycles.

const reports = [
    {
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        internName: "Alice Johnson",
        internEmail: "alice@example.com",
        summary: "Completed the React component for the login page.",
        conversation: []
    },
    {
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        internName: "Bob Smith",
        internEmail: "bob@example.com",
        summary: "Struggled with CSS Grid but fixed the layout issues.",
        conversation: []
    }
];

module.exports = {
    getReports: () => reports,
    addReport: (report) => reports.unshift(report)
};
