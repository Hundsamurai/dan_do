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
	},

	socraticQuestions: (sourceText: string, userNotes: string): string => {
		return `You are a Socratic questioning coach. Your task is to generate provocative, challenging questions that push the user to think beyond what's explicitly stated in their notes and the source material.

SOURCE TEXT:
${sourceText}

USER'S NOTES:
${userNotes}

Generate 5-8 provocative Socratic questions that:
1. Challenge assumptions made in the source or notes
2. Explore contradictions or tensions not explicitly addressed
3. Ask "what if" scenarios that test the limits of the ideas
4. Question the implications and consequences not covered
5. Probe gaps between what's stated and what's implied
6. Challenge the reader to reconcile different viewpoints

IMPORTANT: These should NOT be quiz questions testing what the user knows. Instead, they should be questions that:
- The notes don't directly answer
- Challenge the underlying premises
- Force critical thinking about unstated assumptions
- Explore edge cases and counterexamples

Example format:
"You wrote X, but how does this reconcile with Y mentioned in section 4?"
"What happens if the author's assumption about Z turns out to be false?"
"The source claims A, but doesn't address B - how might B change the conclusion?"

Respond in the same language as the source text and notes. Format as a numbered list of thought-provoking questions.`;
	}
};
