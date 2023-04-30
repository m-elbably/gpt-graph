import {reactive} from 'vue'

export default reactive({
    api: 'https://api.openai.com/v1/chat/completions',
    apiKey: import.meta.env.DEV ? import.meta.env.VITE_OPENAI_KEY || '' : '',
    initialPrompt: '',
    minNodes: 1,
    generatePrompt(userPrompt: string): string {
        let additionalInstructions = [
            `- Show at least ${this.minNodes} children`
        ];

        let base = `
            Given the search query between square brackets: \n
            generate JSON object with the following keys:
            "title", 
            "description" (Show interesting information in a consistent tone), 
            "url" (Reference link if possible), 
            "children" (a list of other related information with the same structure as the main object), 
            "prompts" (a list of prompts to discover more about the title) \n
            Use the following instructions: \n
            - Prompt example "Given a+b=120, Solve for b" the prompts can be ("Linear Algebra", "Linear Equations in Algebra") \n
            - Prompts will be a standalone questions, so make it fully qualified \n
            - You may answer questions directly in the description with clear steps \n
            - Format the description in markdown \n
            ${additionalInstructions.length > 0 ? additionalInstructions.join('\n') : ''}
            Query: [${userPrompt}]
        `.trim().replace(/\s+/g, ' ');

        return base;
    },
    splashView: true,
    settingsView: false,
    githubUrl: 'https://github.com/m-elbably/gpt-graph'
})
