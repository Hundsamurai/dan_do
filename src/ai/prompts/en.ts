export const PromptsEN = {
	depthCheck: (sourceText: string, userNotes: string): string => {
		return `You are a reading comprehension coach. Analyze the user's notes against the source text and provide a depth analysis.

SOURCE TEXT:
${sourceText}

USER'S NOTES:
${userNotes}

Analyze the depth of understanding demonstrated in the notes. Provide:
1. Overall comprehension level (surface/moderate/deep)
2. Key concepts captured vs missed
3. Areas needing deeper exploration
4. Specific suggestions for improvement

Respond in the same language as the source text and notes. Format your response as a structured analysis.`;
	},

	connectionFinder: (sourceText: string, userNotes: string, vaultNotes: string[]): string => {
		return `You are a reading comprehension coach. Find connections between the user's current notes and their existing vault notes.

SOURCE TEXT:
${sourceText}

USER'S CURRENT NOTES:
${userNotes}

EXISTING VAULT NOTES (titles):
${vaultNotes.join('\n')}

Identify:
1. Related notes in the vault that connect to this topic
2. Potential knowledge gaps that could be filled by linking notes
3. Suggestions for creating new connections
4. Conceptual bridges between current and existing knowledge

Respond in the same language as the source text and notes. Format your response as a connection map.`;
	}
};
